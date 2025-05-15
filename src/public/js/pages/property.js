class PropertyDetailsRenderer {
  constructor(container) {
    this.container = container;
    this.propertyId = container?.dataset.propertyId;
    this.init();
  }

  init() {
    if (!this.container) return;
    if (!this.propertyId) {
      this.renderError("Invalid property ID.");
      return;
    }
    this.loadProperty();
  }

  async loadProperty() {
    try {
      const res = await fetch(`/api/property/get/${this.propertyId}`);
      const data = await res.json();
      if (!data.success || !data.property) {
        this.renderError("Property not found.");
        return;
      }
      this.renderProperty(data.property);
    } catch {
      this.renderError("Failed to load property details.");
    }
  }

  renderCarousel(images, propertyName) {
    if (!images.length) {
      return `<img src="https://placehold.co/300x400" class="d-block w-100 h-100 rounded mb-4" alt="No image" style="width:300px; height:400px; object-fit:cover;">`;
    }
    const carouselItems = images
      .map(
        (img, idx) => `
        <div class="carousel-item${idx === 0 ? " active" : ""}">
          <img src="${img}" class="d-block w-100 h-100 object-fit-cover rounded" alt="${propertyName} image ${
          idx + 1
        }" style="width:300px; height:400px; object-fit:cover;">
        </div>
      `
      )
      .join("");
    const controls =
      images.length > 1
        ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#propertyCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#propertyCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      `
        : "";
    return `
    <div id="propertyCarousel" class="carousel slide mb-4" data-bs-ride="carousel" style="width:300px; height:400px; margin:auto;">
      <div class="carousel-inner" style="width:300px; height:400px;">
        ${carouselItems}
      </div>
      ${controls}
    </div>
  `;
  }

  renderProperty(property) {
    const images = [property.featuredImage, ...(property.images || [])].filter(
      Boolean
    );
    this.container.innerHTML = `
      <div class="flex-1 flex flex-col align-items-center">
        ${this.renderCarousel(images, property.name)}
      </div>
      <div class="flex-1">
        <h2 class="fs-2 fw-bold mb-4">${property.name}</h2>
        <p class="mb-4 text-secondary">${property.description}</p>
        <p class="mb-2 fs-5 fw-semibold">
          ${property.currencySymbol} ${Number(
      property.price
    ).toLocaleString()} per ${property.checkInOutTitle}
        </p>
        <p class="mb-2"><strong>Address:</strong> ${property.address}</p>
        <p class="mb-2"><strong>Check-in:</strong> ${
          property.checkInTime
        } | <strong>Check-out:</strong> ${property.checkOutTime}</p>
        <p class="mb-2"><strong>Showcase:</strong> ${
          property.showcase ? "Yes" : "No"
        }</p>
      </div>
    `;
  }

  renderError(message) {
    this.container.innerHTML = `<div class="w-full text-center text-danger">${message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("property-details");
  new PropertyDetailsRenderer(container);
});
