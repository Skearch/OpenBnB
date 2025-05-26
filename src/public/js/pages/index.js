class ShowcaseRenderer {
  constructor(container) {
    this.container = container;
  }

  render(properties) {
    if (!this.container) return;
    this.container.innerHTML = "";
    properties.forEach((property) => {
      const formattedPrice = property.price
        ? Number(property.price).toLocaleString(undefined, { maximumFractionDigits: 0 })
        : "0";
      const propertyCard = this.createPropertyCard(property, formattedPrice);
      this.container.insertAdjacentHTML("beforeend", propertyCard);
    });
  }

  createPropertyCard(property, formattedPrice) {
    const imageSrc = property.featuredImage || "https://placehold.co/300x200";
    const name = property.name || "Untitled";
    const currency = property.currencySymbol || "$";
    const checkInOutTitle = property.checkInOutTitle || "stay";
    return `
      <a href="/property/${property.id}" class="block group">
        <div class="bg-white shadow rounded-lg overflow-hidden w-80 transition-shadow duration-700 hover:shadow-2xl">
          <img src="${imageSrc}"
            alt="${name}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
          <div class="p-4">
            <h4 class="text-lg font-semibold truncate">${name}</h4>
            <p class="text-gray-600">
              ${currency} ${formattedPrice} per ${checkInOutTitle}
            </p>
          </div>
        </div>
      </a>
    `;
  }

  renderError(message) {
    if (this.container) {
      this.container.innerHTML = `<p class="text-center text-red-500">${message}</p>`;
    }
  }
}

class EmailSubscriptionForm {
  #form;
  #emailInput;

  constructor(form, emailInput) {
    this.#form = form;
    this.#emailInput = emailInput;
    this.#bindEvents();
  }

  #bindEvents() {
    if (this.#form) {
      this.#form.addEventListener("submit", (e) => this.#handleSubmit(e));
    }
  }

  async #handleSubmit(e) {
    e.preventDefault();
    const email = this.#emailInput.value.trim();
    if (!email) return;

    try {
      const res = await fetch("/api/email-subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.#onSuccess();
      } else {
        this.#onError(data.message || "Subscription failed.");
      }
    } catch {
      this.#onError("Error subscribing.");
    }
  }

  #onSuccess() {
    alert("Subscribed successfully!");
    this.#emailInput.value = "";
  }

  #onError(message) {
    alert(message);
  }
}

class ReviewMarqueeManager {
  constructor(marqueeSelector = '.reviews-marquee', cardSelector = '.bg-white.rounded-lg') {
    this.marquee = document.querySelector(marqueeSelector);
    this.cardSelector = cardSelector;
    this.#bindEvents();
  }

  #bindEvents() {
    if (!this.marquee) return;
    this.marquee.addEventListener('mouseover', (e) => {
      if (e.target.closest(this.cardSelector)) {
        this.marquee.classList.add('paused');
      }
    });
    this.marquee.addEventListener('mouseout', (e) => {
      if (e.target.closest(this.cardSelector)) {
        this.marquee.classList.remove('paused');
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const showcaseContainer = document.getElementById("showcase-container");
  if (showcaseContainer) {
    const renderer = new ShowcaseRenderer(showcaseContainer);
    try {
      const res = await fetch("/api/property/listshowcase?limit=3&page=1");
      const data = await res.json();
      if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
        renderer.render(data.properties);
      } else {
        renderer.renderError("No showcase properties found.");
      }
    } catch {
      renderer.renderError("Failed to load showcase properties.");
    }
  }

  const subscriptionForm = document.querySelector("form[action='/api/email-subscription/subscribe'], form#subscribe-form");
  const emailInput = document.querySelector("input[type='email'][name='email'], #subscribe-email");
  if (subscriptionForm && emailInput) {
    new EmailSubscriptionForm(subscriptionForm, emailInput);
  }

  new ReviewMarqueeManager();
});