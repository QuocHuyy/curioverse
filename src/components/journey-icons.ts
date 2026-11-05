import type { IconName } from './Icon.astro';
import type { JourneyKind } from '~/lib/content';

export const JOURNEY_ICONS: Record<JourneyKind, IconName> = {
  'hoc-tap': 'graduation',
  'cong-viec': 'briefcase',
  'cuoc-thi': 'trophy',
  'chung-chi': 'certificate',
  'du-an': 'rocket',
  'cot-moc': 'flag',
};
