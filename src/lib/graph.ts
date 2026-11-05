/**
 * Đồ thị tri thức của Curioverse — dữ liệu cho Bản đồ sao và chòm sao ở trang chủ.
 * Vị trí các ngôi sao được tính sẵn lúc build bằng d3-force (có seed → luôn giống nhau).
 */
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { getMergedItems, outgoingKeys, type Item, type Kind, type Stage } from './content';
import { hash, mulberry32 } from './sigil';
import { tagSlug, type Lang } from '~/i18n/utils';

export interface GNode {
  id: string;
  kind: Kind;
  title: string;
  description: string;
  url: string;
  date: string;
  datePrecision: 'day' | 'month' | 'year';
  lang: Lang;
  stage?: Stage;
  tags: string[];
  draft: boolean;
  featured: boolean;
  cluster: string;
  degree: number;
  x: number;
  y: number;
  r: number;
}
export interface GEdge {
  source: string;
  target: string;
  strong: boolean;
}
export interface GCluster {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
}
export interface Graph {
  nodes: GNode[];
  edges: GEdge[];
  clusters: GCluster[];
  width: number;
  height: number;
}

export const EDGE_CLUSTER = '__edge__';
const W = 1000;
const H = 640;
const PAD = 70;

const cache = new Map<Lang, Promise<Graph>>();
export function getGraph(lang: Lang): Promise<Graph> {
  if (!cache.has(lang)) cache.set(lang, buildGraph(lang));
  return cache.get(lang)!;
}

function baseRadius(item: Item): number {
  if (item.kind === 'work') return 6.5;
  if (item.kind === 'stories') return 6;
  return item.stage === 'star' ? 5.5 : item.stage === 'protostar' ? 4.5 : 3.6;
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

async function buildGraph(lang: Lang): Promise<Graph> {
  const items = await getMergedItems(lang);
  const byKey = new Map(items.map((i) => [i.key, i]));
  const edges = new Map<string, GEdge>();

  // 1) Liên kết rõ ràng: link trong bài + trường `related`
  for (const item of items) {
    for (const target of await outgoingKeys(item)) {
      if (!byKey.has(target) || target === item.key) continue;
      edges.set(pairKey(item.key, target), { source: item.key, target, strong: true });
    }
  }

  // 2) Chủ đề chung: mỗi bài nối tối đa 3 bài giống nhất (Jaccard theo tag)
  const tagSets = new Map(items.map((i) => [i.key, new Set(i.tags.map(tagSlug))]));
  for (const a of items) {
    const ta = tagSets.get(a.key)!;
    if (!ta.size) continue;
    const scored = items
      .filter((b) => b.key !== a.key)
      .map((b) => {
        const tb = tagSets.get(b.key)!;
        const inter = [...ta].filter((x) => tb.has(x)).length;
        const union = new Set([...ta, ...tb]).size;
        return { b, sim: union ? inter / union : 0 };
      })
      .filter((x) => x.sim > 0)
      .sort((x, y) => y.sim - x.sim)
      .slice(0, 3);
    for (const { b } of scored) {
      const k = pairKey(a.key, b.key);
      if (!edges.has(k)) edges.set(k, { source: a.key, target: b.key, strong: false });
    }
  }

  // 3) Chòm sao = chủ đề phổ biến nhất của mỗi bài (cần ít nhất 2 bài)
  const freq = new Map<string, { label: string; count: number }>();
  for (const i of items) {
    for (const tag of i.tags) {
      const s = tagSlug(tag);
      const e = freq.get(s) ?? { label: tag, count: 0 };
      e.count++;
      if (i.lang === lang) e.label = tag;
      freq.set(s, e);
    }
  }
  const clusterOf = new Map<string, string>();
  for (const i of items) {
    let best = EDGE_CLUSTER;
    let bestCount = 1;
    for (const tag of i.tags) {
      const c = freq.get(tagSlug(tag))?.count ?? 0;
      if (c > bestCount) {
        best = tagSlug(tag);
        bestCount = c;
      }
    }
    clusterOf.set(i.key, best);
  }
  const clusterIds = [...new Set(clusterOf.values())]
    .filter((c) => c !== EDGE_CLUSTER)
    .sort((a, b) => (freq.get(b)?.count ?? 0) - (freq.get(a)?.count ?? 0));

  // Tâm các chòm sao xếp trên một vòng tròn
  const centers = new Map<string, { x: number; y: number }>();
  const R = clusterIds.length > 1 ? 210 : 0;
  clusterIds.forEach((c, i) => {
    const angle = -Math.PI / 2 + (i / clusterIds.length) * Math.PI * 2;
    centers.set(c, { x: Math.cos(angle) * R * 1.35, y: Math.sin(angle) * R * 0.85 });
  });
  centers.set(EDGE_CLUSTER, { x: 0, y: 0 });

  // 4) Mô phỏng lực
  type SimNode = SimulationNodeDatum & { id: string; r: number; cluster: string };
  const rand = mulberry32(hash(`curioverse-${lang}`));
  const simNodes: SimNode[] = items.map((i) => {
    const c = centers.get(clusterOf.get(i.key)!)!;
    const jitter = mulberry32(hash(i.key));
    return {
      id: i.key,
      r: baseRadius(i),
      cluster: clusterOf.get(i.key)!,
      x: c.x + (jitter() - 0.5) * 60,
      y: c.y + (jitter() - 0.5) * 60,
    };
  });
  const simLinks: (SimulationLinkDatum<SimNode> & { strong: boolean })[] = [...edges.values()].map((e) => ({
    source: e.source,
    target: e.target,
    strong: e.strong,
  }));

  const degree = new Map<string, number>();
  for (const e of edges.values()) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  for (const n of simNodes) n.r += Math.min(degree.get(n.id) ?? 0, 6) * 0.45;

  if (simNodes.length > 1) {
    const sim = forceSimulation(simNodes)
      .randomSource(rand)
      .force(
        'link',
        forceLink<SimNode, (typeof simLinks)[number]>(simLinks)
          .id((d) => d.id)
          .distance((l) => (l.strong ? 92 : 130))
          .strength((l) => (l.strong ? 0.55 : 0.12)),
      )
      .force('charge', forceManyBody<SimNode>().strength(-230).distanceMax(460))
      .force('collide', forceCollide<SimNode>().radius((d) => d.r + 24).iterations(3))
      .force('x', forceX<SimNode>((d) => centers.get(d.cluster)!.x).strength((d) => (d.cluster === EDGE_CLUSTER ? 0.02 : 0.09)))
      .force('y', forceY<SimNode>((d) => centers.get(d.cluster)!.y).strength((d) => (d.cluster === EDGE_CLUSTER ? 0.02 : 0.09)))
      .stop();
    for (let i = 0; i < 400; i++) sim.tick();
  }

  // 5) Chuẩn hoá vào khung W×H
  const xs = simNodes.map((n) => n.x ?? 0);
  const ys = simNodes.map((n) => n.y ?? 0);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 0);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const bw = Math.max(maxX - minX, 1);
  const bh = Math.max(maxY - minY, 1);
  const scale = Math.min((W - 2 * PAD) / bw, (H - 2 * PAD) / bh, 1.8);
  const ox = W / 2 - ((minX + maxX) / 2) * scale;
  const oy = H / 2 - ((minY + maxY) / 2) * scale;

  const nodes: GNode[] = simNodes.map((n) => {
    const item = byKey.get(n.id)!;
    return {
      id: n.id,
      kind: item.kind,
      title: item.title,
      description: item.description,
      url: item.url,
      date: item.date.toISOString(),
      datePrecision: item.kind === 'work' ? ((item.entry.data as any).periodPrecision ?? 'month') : 'day',
      lang: item.lang,
      stage: item.stage,
      tags: item.tags,
      draft: item.draft,
      featured: item.featured,
      cluster: n.cluster,
      degree: degree.get(n.id) ?? 0,
      x: +((n.x ?? 0) * scale + ox).toFixed(1),
      y: +((n.y ?? 0) * scale + oy).toFixed(1),
      r: +n.r.toFixed(2),
    };
  });

  const clusters: GCluster[] = clusterIds.map((id) => {
    const members = nodes.filter((n) => n.cluster === id);
    const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
    const top = Math.min(...members.map((n) => n.y - n.r));
    return { id, label: freq.get(id)?.label ?? id, x: +cx.toFixed(1), y: +(top - 22).toFixed(1), size: members.length };
  });

  return { nodes, edges: [...edges.values()], clusters, width: W, height: H };
}
