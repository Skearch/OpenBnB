class ShowcaseRenderer {
  constructor(container) {
    this.container = container;
  }

  render(properties) {
    this.container.innerHTML = "";
    properties.forEach((property) => {
      const formattedPrice = property.price
        ? Number(property.price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00";
      const propertyCard = `
        <div class="bg-white shadow rounded-lg overflow-hidden w-80 transition-shadow duration-700 hover:shadow-2xl">
          <img src="${
            property.featuredImage
              ? `data:image/jpeg;base64,${property.featuredImage}`
              : "https://placehold.co/300x200"
          }"
            alt="${property.name}" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h4 class="text-lg font-semibold">${property.name}</h4>
            <p class="text-gray-600">${
              property.currencySymbol || "$"
            } ${formattedPrice} per night</p>
          </div>
        </div>
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
    const response = await fetch("/api/property/listshowcase");
    const showcasedProperties = await response.json();
    showcaseRenderer.render(showcasedProperties);
  } catch {
    showcaseRenderer.renderError("Failed to load showcased properties.");
  }
});
