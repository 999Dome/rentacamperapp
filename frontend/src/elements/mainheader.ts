class mainHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const response = await fetch("/components/mainheader/mainheader.html");
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    while (doc.body.firstChild) {
      this.shadowRoot!.appendChild(doc.body.firstChild);
    }

    while (doc.head.firstChild) {
      this.shadowRoot!.appendChild(doc.head.firstChild);
    }

    window.addEventListener("load", () => {
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.remove();
      }
    });
  }
}

customElements.define("main-header", mainHeader);
