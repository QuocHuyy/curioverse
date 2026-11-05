/** Các component dùng được trực tiếp trong MDX mà không cần import. */
import Callout from './Callout.astro';
import Figure from './Figure.astro';
import Sidenote from './Sidenote.astro';
import Prompt from './Prompt.astro';

export const mdxComponents = { Callout, Figure, Sidenote, Prompt };
