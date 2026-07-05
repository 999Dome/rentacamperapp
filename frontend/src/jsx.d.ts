/**
 * Type declarations for this project's custom JSX runtime (see
 * `utils/createElement.ts`). Since there's no React, `JSX.Element` is just a
 * real `HTMLElement`, and any tag/attribute name is allowed on
 * `IntrinsicElements` (there's no per-tag attribute checking, unlike
 * `@types/react`'s generated intrinsic element types).
 */
declare namespace JSX {
  interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [elemName: string]: any;
  }
  type Element = HTMLElement;
}
