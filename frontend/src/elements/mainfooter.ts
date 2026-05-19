class mainFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const response = await fetch("/components/mainfooter/mainfooter.html");
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    while (doc.body.firstChild) {
      this.shadowRoot!.appendChild(doc.body.firstChild);
    }

    while (doc.head.firstChild) {
      this.shadowRoot!.appendChild(doc.head.firstChild);
    }
  }
}

customElements.define("main-footer", mainFooter);
