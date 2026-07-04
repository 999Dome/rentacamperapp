export const Fragment = Symbol('Fragment') as unknown as (
  attrs: Record<string, unknown> | null,
  ...children: unknown[]
) => HTMLElement;

type Attrs = Record<string, unknown> | null;

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
      if (value === undefined || value === null || (typeof value === 'boolean' && value === false))
        return;

      if (key === 'className') {
        if (isSvg) {
          el.setAttribute('class', String(value));
        } else {
          (el as HTMLElement).className = String(value);
        }
        return;
      }

      if (key === 'style' && typeof value === 'object') {
        Object.assign((el as HTMLElement).style, value);
        return;
      }

      if (key.startsWith('on') && typeof value === 'function') {
        const e = key.slice(2).toLowerCase();
        el.addEventListener(e, value as EventListener);
        return;
      }

      if (typeof value === 'boolean') {
        if (value) el.setAttribute(key, '');
        return;
      }

      el.setAttribute(key, String(value));
    });
  }

  children.forEach((c) => appendChild(el, c));

  return el;
}

function appendChild(parent: Node, child: unknown) {
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

export function createSVGElement(tag: string, attrs: Attrs, ...children: unknown[]) {
  const svgAttrs = Object.assign({ xmlns: 'http://www.w3.org/2000/svg' }, attrs || {});
  return createElement(tag, svgAttrs, ...children);
}
