import footerHTML from "./mainfooter.html?raw";

class mainFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = footerHTML;
  }
}

customElements.define("main-footer", mainFooter);

