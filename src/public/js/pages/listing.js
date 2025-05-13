document.addEventListener("DOMContentLoaded", async () => {
  const listingsTitle = document.getElementById("listings-title");
  const listingsContainer = document.getElementById("listings-container");

  try {
    const response = await fetch("/api/property/listall");
    const data = await response.json();

    if (!data.success || data.properties.length === 0) {
      listingsTitle.textContent = "No Listings Available";
      return;
    }

    listingsTitle.textContent = "Browse All Listings";

    data.properties.forEach((property) => {
      const formattedPrice = property.price
        ? Number(property.price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00";
      const propertyCard = `
        <div class="bg-white shadow rounded-lg overflow-hidden h-100 w-80 p-4 transition-shadow duration-700 hover:shadow-2xl">
          <img src="${
            property.featuredImage
              ? `data:image/jpeg;base64,${property.featuredImage}`
              : "https://placehold.co/300x200"
          }"
            alt="${
              property.name
            }" class="w-full h-48 object-cover rounded-md" />
          <div class="p-4">
            <h4 class="text-lg font-semibold">${property.name}</h4>
            <p class="text-gray-600">${
              property.currencySymbol
            } ${formattedPrice} per night</p>
          </div>
        </div>
      `;
      listingsContainer.insertAdjacentHTML("beforeend", propertyCard);
    });
  } catch {
    listingsTitle.textContent =
      "Failed to load listings. Please try again later.";
  }
});
