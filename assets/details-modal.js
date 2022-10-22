class DetailsModal extends HTMLElement {
  constructor() {
    super();
    this.detailsContainer = this.querySelector("details");
    this.summaryToggle = this.querySelector("summary");

    this.summaryToggle.addEventListener(
      "click",
      this.onSummaryClick.bind(this)
    );
    this.summaryToggle.setAttribute("role", "button");
  }

  isOpen() {
    return this.detailsContainer.hasAttribute("open");
  }

  onSummaryClick(event) {
    event.preventDefault();
    event.target.closest("details").hasAttribute("open")
      ? this.close()
      : this.open(event);
  }

  open(event) {
    console.log(event, "details");
    this.onBodyClickEvent =
      this.onBodyClickEvent || this.onBodyClick.bind(this);
    event.target.closest("details").setAttribute("open", true);
    document.body.addEventListener("click", this.onBodyClickEvent);
    document.body.classList.add("overflow-hidden");

    trapFocus(
      this.detailsContainer.querySelector('[tabindex="-1"]'),
      this.detailsContainer.querySelector('input:not([type="hidden"])')
    );
  }
  close(focusToggle = true) {
    removeTrapFocus(focusToggle ? this.summaryToggle : null);
    this.detailsContainer.removeAttribute("open");
    document.body.removeEventListener("click", this.onBodyClickEvent);
    document.body.classList.remove("overflow-hidden");
  }
}

customElements.define("details-modal", DetailsModal);
