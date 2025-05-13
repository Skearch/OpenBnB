document.addEventListener("DOMContentLoaded", async () => {
  const showcaseContainer = document.getElementById("showcase-container");
  const reviewsContainer = document.getElementById("reviews-container");

  try {
    const response = await fetch("/api/property/listshowcase");
    const showcasedProperties = await response.json();

    showcasedProperties.forEach((property) => {
      const propertyCard = `
                <div class="bg-white shadow-lg rounded-lg overflow-hidden w-80">
                    <img src="${
                      property.featuredImage
                        ? `data:image/jpeg;base64,${property.featuredImage}`
                        : "https://placehold.co/300x200"
                    }"
                        alt="${
                          property.name
                        }" class="w-full h-48 object-cover" />
                    <div class="p-4">
                        <h4 class="text-lg font-semibold">${property.name}</h4>
                        <p class="text-gray-600">${property.currencySymbol} ${
        property.price
      } per night</p>
                    </div>
                </div>
            `;
      showcaseContainer.innerHTML += propertyCard;
    });
  } catch (error) {
    console.error("Error loading showcased properties:", error);
    showcaseContainer.innerHTML =
      '<p class="text-center text-red-500">Failed to load showcased properties.</p>';
  }

  try {
    const reviews = config.Website.Reviews.List;
    reviews.forEach((review) => {
      const reviewCard = `
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <p class="text-gray-600">"${review.Review}"</p>
                    <p class="mt-4 font-semibold">${review.Name}</p>
                </div>
            `;
      reviewsContainer.innerHTML += reviewCard;
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsContainer.innerHTML =
      '<p class="text-center text-red-500">Failed to load reviews.</p>';
  }
});
