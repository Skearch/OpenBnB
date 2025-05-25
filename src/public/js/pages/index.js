class ShowcaseRenderer {
  constructor(container) {
    this.container = container;
  }

  render(properties) {
    if (!this.container) return;
    this.container.innerHTML = "";
    properties.forEach((property) => {
      const formattedPrice = property.price
        ? Number(property.price).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })
        : "0";
      const propertyCard = `
        <a href="/property/${property.id}" class="block group">
          <div class="bg-white shadow rounded-lg overflow-hidden w-80 transition-shadow duration-700 hover:shadow-2xl">
            <img src="${property.featuredImage
          ? property.featuredImage
          : "https://placehold.co/300x200"
        }"
              alt="${property.name || "Property"}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="p-4">
              <h4 class="text-lg font-semibold truncate">${property.name || "Untitled"}</h4>
              <p class="text-gray-600">
                ${(property.currencySymbol || "$")} ${formattedPrice} per ${property.checkInOutTitle || "stay"}
              </p>
            </div>
          </div>
        </a>
      `;
      this.container.insertAdjacentHTML("beforeend", propertyCard);
    });
  }

  renderError(message) {
    if (this.container)
      this.container.innerHTML = `<p class="text-center text-red-500">${message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const showcaseContainer = document.getElementById("showcase-container");
  if (!showcaseContainer) return;
  const showcaseRenderer = new ShowcaseRenderer(showcaseContainer);

  try {
    const response = await fetch(`/api/property/listshowcase?limit=3&page=1`);
    const data = await response.json();
    if (!data.success || !Array.isArray(data.properties) || data.properties.length === 0) {
      showcaseRenderer.renderError("No showcased properties available.");
      return;
    }
    showcaseRenderer.render(data.properties);
  } catch {
    showcaseRenderer.renderError("Failed to load showcased properties.");
  }
});