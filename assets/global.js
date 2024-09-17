class NavBar extends HTMLElement {
  constructor() {
    super();

    this.searchActivate = this.querySelector(".icon-search-before");
    this.searchButton = this.querySelector("#searchInput");
    this.inputElement = this.querySelector("#Search-In-Modal");
    this.menu = this.querySelector(".header__nav");
    // this.searchActivate.addEventListener("click", this.onClick.bind(this));
    // this.clickEvent = new Event('click', {bubbles: true})
  }

  onClick(e) {
    const inputElement = this.inputElement;
    const searchButton = this.searchButton;
    const menu = this.menu;
    console.log(e, inputElement);
    // inputElement.classList.toggle("closed");
    // e.currentTarget.classList.toggle("hide");
    // searchButton.classList.toggle("hide");
    // menu.classList.toggle("hide");
  }
}
customElements.define("nav-bar", NavBar);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" || event.currentTarget.name === "plus"
      ? this.input.stepUp()
      : this.input.stepDown();
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }
}
customElements.define("quantity-input", QuantityInput);

function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`,
    },
  };
}

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, "", false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll("select"),
      (select) => select.value
    );
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const slidesImgSrcs = Array.from(
      document.querySelectorAll(".glide__slide img")
    ).map((el) => el.src);

    const selectedImgIndex = slidesImgSrcs.findIndex((src) =>
      src.includes(this.currentVariant.featured_media.preview_image.src)
    );

    const selectedSlide = document.querySelector(
      `.go_to_image_${selectedImgIndex}`
    );

    if (selectedSlide) {
      selectedSlide.click();
    }

    if (!selectedSlide) {
      const firstSlide = document.querySelector(".go_to_image_1");
      firstSlide.click();
    }

    const mediaGalleries = document.querySelectorAll(
      `[id^="MediaGallery-${this.dataset.section}"]`
    );
    mediaGalleries.forEach((mediaGallery) =>
      mediaGallery.setActiveMedia(
        `${this.dataset.section}-${this.currentVariant.featured_media.id}`,
        true
      )
    );

    const modalContent = document.querySelector(
      `#ProductModal-${this.dataset.section} .product-media-modal__content`
    );
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector(
      `[data-media-id="${this.currentVariant.featured_media.id}"]`
    );
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateShareUrl() {
    const shareButton = document.getElementById(
      `Share-${this.dataset.section}`
    );
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(
      `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  removeErrorMessage() {
    const section = this.closest("section");
    if (!section) return;

    const productForm = section.querySelector("product-form");
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(
      `${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    )
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        const destination = document.getElementById(
          `price-${this.dataset.section}`
        );
        const destination2 = document.getElementById(
          `compare-price-${this.dataset.section}`
        );
        console.log(
          `compare-price-${this.dataset.section}`,
          this.dataset.section
        );
        const source = html.getElementById(
          `price-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const source2 = html.getElementById(
          `compare-price-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (source2 && destination2) destination2.innerHTML = source2.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);
        const compareprice = document.getElementById(
          `price-${this.dataset.section}`
        );

        if (price) price.classList.remove("visibility-hidden");
        if (compareprice) price.classList.remove("visibility-hidden");
        this.toggleAddButton(
          !this.currentVariant.available,
          window.variantStrings.soldOut
        );
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute("disabled", "disabled");
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute("disabled");
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add("visibility-hidden");
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);

    return this.variantData;
  }
}

customElements.define("variant-selects", VariantSelects);

const editButton = document.querySelectorAll(".edit");

editButton.forEach((button) => {
  button.addEventListener("click", handleEditClick.bind(this));
});

function handleEditClick(e) {
  const saveButton = e.target.nextElementSibling.nextElementSibling;
  saveButton.classList.remove("hidden");
  saveButton.addEventListener("click", handleSave.bind(this));
  e.target.classList.add("hidden");
  console.log(e.target, saveButton);
}

function handleSave(e) {
  const editButton = e.target.previousElementSibling.previousElementSibling;

  editButton.classList.remove("hidden");
  e.target.classList.add("hidden");
}
const removeButton = document.querySelectorAll(".remove");

removeButton.forEach((button) => {
  button.addEventListener("click", handleRemoveClick.bind(this));
});
const sectionsToRender = "?sections=cart,header";

function handleRemoveClick(e) {
  const productId = e.target.dataset.productid;
  const body = { [productId]: 0 };
  const bodyFormatted = JSON.stringify(body);
  const formData = new FormData();
  formData.append("updates", bodyFormatted);

  const config = fetchConfig("javascript");
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  delete config.headers["Content-Type"];
  // console.log(bodyFormatted);
  config.body = formData;
  const query = `?updates[${productId}]=1`;
  updateCart(config, query);
}

async function updateCart(config, query) {
  console.log(
    window.Shopify.routes.root,
    window.routes.cart_update_url + sectionsToRender + query
  );
  // console.log(body);
  const data = await fetch(
    window.routes.cart_update_url + sectionsToRender + query,
    config
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));
  console.log(data);
}

// class VariantRadios extends VariantSelects {
//   constructor() {
//     super();
//   }

//   updateOptions() {
//     const fieldsets = Array.from(this.querySelectorAll("fieldset"));
//     this.options = fieldsets.map((fieldset) => {
//       return Array.from(fieldset.querySelectorAll("input")).find(
//         (radio) => radio.checked
//       ).value;
//     });
//   }
// }

// customElements.define("variant-radios", VariantRadios);

// if (!Shopify.designMode) {
let animatedOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.05,
};

let sectionsObserver = new IntersectionObserver(
  handleAnimations,
  animatedOptions
);

function handleAnimations(entries, observer) {
  // console.log(...entries);
  for (let i = 0; i < entries.length; i++) {
    entries[i].isIntersecting &&
    entries[i].target.classList.contains("hero") === false
      ? checkData(entries)
      : console.log("not intersecting");
  }

  checkData(...entries, [...entries]);
}
const allSections = document.querySelectorAll("[data-animate]");
allSections.forEach((section) => {
  if (
    section.id === "shopify-section-header" ||
    section.id === "shopify-section-footer"
  ) {
    return;
  } else {
    sectionsObserver.observe(section);
  }
});

function checkData(entry, entries) {
  const section = entry.target;
  // console.log(section);
  if (!section) return;

  let image = section.querySelector("[data-animate-img]");
  let title = section.querySelector("[data-animate-text]");
  let delay =
    (image && image.dataset.animateDelay) ||
    (title && title.dataset.animateDelay);
  let imgAnimationClass = image && image.dataset.animateImg;
  let textAnimationClass = title && title.dataset.animateText;

  // console.log(image);
  // let elements = [image, title];

  if (imgAnimationClass === "fadeIn" || textAnimationClass === "fadeIn") {
    animateFadeIn(elements, entry);
  }

  if (imgAnimationClass === "fadeRight") {
    animateFadeRight(image, entry);
  }
  if (textAnimationClass === "fadeRight") {
    animateFadeRight(title, entry);
  }
  if (imgAnimationClass === "fadeLeft") {
    animateFadeLeft(image, entry);
  }
  if (textAnimationClass === "fadeLeft") {
    animateFadeLeft(title, entry);
  }

  if (imgAnimationClass === "fadeUp") {
    animateFadeUp(image, entry);
  }
  if (textAnimationClass === "fadeUp") {
    animateFadeUp(title, entry);
  }
  if (imgAnimationClass === "fadeDown" || textAnimationClass === "fadeDown") {
    animateFadeDown(elements, entry);
  }
  if (imgAnimationClass === "none" || textAnimationClass === "none") {
    animateNone(elements, entry);
  }
}

function animateFadeIn(section, entry, delay) {
  if (entry.isIntersecting) {
    section[0] && section[0].classList.toggle("fadeIn");
    section[1] && section[1].classList.toggle("fadeIn");
  }
}
function animateFadeRight(section, entry, delay) {
  if (entry.isIntersecting) {
    section && section.classList.add("fadeRight");
  }
  if (!entry.isIntersecting) {
    section && section.classList.remove("fadeRight");
  }
}

function animateFadeLeft(section, entry, delay) {
  if (entry.isIntersecting) {
    section && section.classList.add("fadeLeft");
  }
  if (!entry.isIntersecting) {
    section && section.classList.remove("fadeLeft");
  }
}

function animateFadeUp(section, entry, delay) {
  if (entry.isIntersecting) {
    section && section.classList.add("fadeUp");
  }
  if (!entry.isIntersecting) {
    section && section.classList.remove("fadeUp");
  }
}
function animateNone(section, entry, delay) {
  section[0] && section[0].classList.toggle("show");
  section[1] && section[1].classList.toggle("show");
}

function animateFadeDown(section, entry, delay) {
  if (entry.isIntersecting) {
    section && section.classList.add("fadeDown");
  }
  if (!entry.isIntersecting) {
    section && section.classList.remove("fadeDown");
  }
}
// } else {
// const allAnimatedSections = document.querySelectorAll("[data-animate]");

// // console.log(allAnimatedSections);
// allAnimatedSections.forEach((section) => {
//   section.style = "opacity: 1; transform: translateX(0px) translateY(0px)";
// });
// }

//   let animatedOptions = {
//     root: null,
//     rootMargin: "0px",
//     threshold: 0.05,
//   };

// let sectionsObserver = new IntersectionObserver(
//   handleAnimations,
//   animatedOptions
// );

window.addEventListener("scroll", function () {
  const allAnimatedSections = document.querySelectorAll("[data-animate]");
  allAnimatedSections.forEach((section) => {
    let position = section.getBoundingClientRect();
    let image = section.querySelector("[data-animate-img]");
    let title = section.querySelector("[data-animate-text]");
    let positionImage = image && image.getBoundingClientRect();
    let positionText = title && title.getBoundingClientRect();

    let imgAnimationClass = image && image.dataset.animateImg;
    let textAnimationClass = title && title.dataset.animateText;

    // checking whether fully visible
    if (
      positionText &&
      positionText.top >= 0 &&
      positionText &&
      positionText.bottom <= window.innerHeight
    ) {
      setTimeout(() => {
        title &&
          (title.style =
            "opacity: 1; transform: translateX(0px) translateY(0px); transition: transform opacity 0.5s ease-in-out 0.4s;");
      }, 500);
    }
    if (
      positionImage &&
      positionImage.top >= 0 &&
      positionImage &&
      positionImage.bottom <= window.innerHeight
    ) {
      setTimeout(() => {
        image &&
          (image.style =
            "opacity: 1; transform: translateX(0px) translateY(0px); transition: transform opacity 0.5s ease-in-out 0.4s;");
      }, 500);
    }
    // } else {
    //   setTimeout(() => {
    //     image && (image.style = "");
    //     title && (title.style = "");
    //   }, 500);
    // }

    // checking for partial visibility
    if (
      positionImage &&
      positionImage.top < window.innerHeight &&
      positionImage &&
      positionImage.bottom >= 0
    ) {
      // console.log(image, positionImage.bottom);
      setTimeout(() => {
        image &&
          (image.style =
            "opacity: 1; transform: translateX(0px) translateY(0px); transition: transform opacity 0.5s ease-in-out 0.4s;");
      }, 500);
    }
    if (
      positionText &&
      positionText.top < window.innerHeight &&
      positionText &&
      positionText.bottom >= 0
    ) {
      setTimeout(() => {
        title &&
          (title.style =
            "opacity: 1; transform: translateX(0px) translateY(0px); transition: transform opacity 0.5s ease-in-out 0.4s;");
      }, 500);
    }
    // } else {
    //   setTimeout(() => {
    //     image && (image.style = "");
    //     title && (title.style = "");
    //   }, 500);
    // }
  });
});
