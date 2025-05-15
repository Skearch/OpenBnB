class ShowcaseRenderer {
  constructor(container) {
    this.container = container;
  }

  render(properties) {
    this.container.innerHTML = "";
    properties.forEach((property) => {
      const formattedPrice = property.price
        ? Number(property.price).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        : "0";
      const propertyCard = `
        <a href="/property/${property.id}" class="block">
          <div class="bg-white shadow rounded-lg overflow-hidden w-80 transition-shadow duration-700 hover:shadow-2xl">
            <img src="${
              property.featuredImage
                ? property.featuredImage
                : "https://placehold.co/300x200"
            }"
              alt="${property.name}" class="w-full h-48 object-cover" />
            <div class="p-4">
              <h4 class="text-lg font-semibold">${property.name}</h4>
              <p class="text-gray-600">${
                property.currencySymbol || "$"
              } ${formattedPrice} per ${property.checkInOutTitle}</p>
            </div>
          </div>
        </a>
      `;
      this.container.insertAdjacentHTML("beforeend", propertyCard);
    });
  }

  renderError(message) {
    this.container.innerHTML = `<p class="text-center text-red-500">${message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const showcaseContainer = document.getElementById("showcase-container");
  const showcaseRenderer = new ShowcaseRenderer(showcaseContainer);

  try {
    const response = await fetch(`/api/property/listshowcase?limit=3&page=1`);
    const data = await response.json();
    if (!data.success || data.properties.length === 0) {
      showcaseRenderer.renderError("No showcased properties available.");
      return;
    }
    showcaseRenderer.render(data.properties);
  } catch {
    showcaseRenderer.renderError("Failed to load showcased properties.");
  }
});
