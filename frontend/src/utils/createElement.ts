/**
 * This file is the hand-rolled equivalent of React's `createElement`/JSX
 * runtime. It's what the TypeScript compiler actually calls for every bit
 * of JSX markup (`<div>...</div>`) written elsewhere in this codebase,
 * because there is no React here — just plain DOM APIs (`document.createElement`,
 * `element.appendChild`, etc.) wrapped so JSX syntax keeps working.
 *
 * There is no virtual DOM and no diffing: every call directly creates real
 * DOM nodes and attaches attributes/children to them immediately.
 */

/**
 * Special marker used as the `tag` for JSX fragments (`<>...</>`), i.e.
 * "render these children with no wrapping element". It's a unique `Symbol`
 * rather than a string so it can never collide with a real HTML tag name.
 *
 * It's typed as a fake function (`as unknown as (...) => HTMLElement`)
 * purely so the JSX pragma/type-checker accepts `<>...</>` the same way it
 * accepts a component function — `Fragment` itself is never actually called
 * as a function, it's only ever compared against with `===` in
 * {@link createElement}.
 */
export const Fragment = Symbol('Fragment') as unknown as (
  attrs: Record<string, unknown> | null,
  ...children: unknown[]
) => HTMLElement;

/** Attributes/props object passed to a JSX element, or `null` if none were given. */
type Attrs = Record<string, unknown> | null;

/**
 * The JSX factory function (configured as the JSX pragma for this project).
 * For every JSX tag the compiler sees, it generates a call to this function
 * instead of `React.createElement`.
 *
 * Behavior depends on `tag`:
 * - If `tag` is a function (i.e. a component like `SkeletonCard`), it's
 *   simply called with the given attrs/children and its result is returned.
 * - If `tag` is {@link Fragment}, a `DocumentFragment` is created and all
 *   children are appended to it directly (no wrapper element).
 * - Otherwise `tag` is a plain HTML/SVG tag name (e.g. `"div"`), and a real
 *   element is created, attributes are applied to it, and children are
 *   appended.
 *
 * @param tag HTML tag name, {@link Fragment}, or a component function.
 * @param attrs Attributes/props for the element, or `null`.
 * @param children Child nodes/values (elements, strings, numbers, arrays, etc.).
 * @returns The created DOM element, or a `DocumentFragment` for fragments/components that return one.
 */
export function createElement(
  tag:
    | string
    | typeof Fragment
    | ((attrs: Attrs, ...children: unknown[]) => Element | DocumentFragment),
  attrs: Attrs,
  ...children: unknown[]
): Element | DocumentFragment {
  if (typeof tag === 'function') {
    return tag(attrs, ...children);
  }

  if ((tag as unknown) === Fragment) {
    const frag = document.createDocumentFragment();
    children.forEach((c) => appendChild(frag, c));
    return frag;
  }

  const isSvg =
    attrs && (attrs.xmlns === 'http://www.w3.org/2000/svg' || String(tag).toLowerCase() === 'svg');
  const el: Element = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', String(tag))
    : document.createElement(String(tag));

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      // `undefined`/`null`/`false` attributes are treated as "not set" so
      // JSX like `disabled={someCondition}` can omit the attribute entirely.
      if (value === undefined || value === null || (typeof value === 'boolean' && value === false))
        return;

      if (key === 'className') {
        // SVG elements don't have a `.className` string property (theirs is
        // an SVGAnimatedString), so it has to be set via `setAttribute` instead.
        if (isSvg) {
          el.setAttribute('class', String(value));
        } else {
          (el as HTMLElement).className = String(value);
        }
        return;
      }

      if (key === 'style' && typeof value === 'object') {
        // Supports the React-like `style={{ color: 'red' }}` object syntax
        // by copying its properties onto the element's live CSSStyleDeclaration.
        Object.assign((el as HTMLElement).style, value);
        return;
      }

      if (key.startsWith('on') && typeof value === 'function') {
        // `onClick={...}` -> addEventListener('click', ...); JSX event props
        // are wired up as native DOM event listeners rather than a synthetic
        // event system.
        const e = key.slice(2).toLowerCase();
        el.addEventListener(e, value as EventListener);
        return;
      }

      if (typeof value === 'boolean') {
        // A `true` boolean attribute (e.g. `checked`) is rendered as a
        // valueless HTML attribute, matching standard boolean-attribute semantics.
        if (value) el.setAttribute(key, '');
        return;
      }

      el.setAttribute(key, String(value));
    });
  }

  children.forEach((c) => appendChild(el, c));

  return el;
}

/**
 * Appends a single JSX child value to a DOM node, normalizing the various
 * shapes a child can take:
 * - `null`/`undefined`/`boolean` children are skipped (this is what makes
 *   `{condition && <span/>}`-style conditional JSX work — a `false` result
 *   renders nothing).
 * - Arrays are flattened by appending each item in turn (so `{items.map(...)}` works).
 * - Strings/numbers become text nodes.
 * - Anything else that is already a DOM `Node` is appended as-is.
 *
 * @param parent The DOM node to append into.
 * @param child The JSX child value to normalize and append.
 */
function appendChild(parent: Node, child: unknown): void {
  if (child === undefined || child === null || typeof child === 'boolean') return;

  if (Array.isArray(child)) {
    child.forEach((c) => appendChild(parent, c));
    return;
  }

  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)));
    return;
  }

  if (child instanceof Node) {
    parent.appendChild(child);
  }
}

/**
 * Convenience wrapper around {@link createElement} for building SVG
 * elements. It's identical to `createElement`, except it automatically adds
 * the SVG XML namespace attribute so the tag is created with
 * `document.createElementNS` instead of `document.createElement` (SVG tags
 * need the `xmlns` namespace to render correctly).
 *
 * @param tag SVG tag name (e.g. `"path"`, `"circle"`).
 * @param attrs Attributes/props for the element, or `null`.
 * @param children Child nodes/values.
 * @returns The created SVG element.
 */
export function createSVGElement(tag: string, attrs: Attrs, ...children: unknown[]): Element | DocumentFragment {
  const svgAttrs = Object.assign({ xmlns: 'http://www.w3.org/2000/svg' }, attrs || {});
  return createElement(tag, svgAttrs, ...children);
}
