document.addEventListener('DOMContentLoaded', async () => {
    const listingsTitle = document.getElementById('listings-title');
    const listingsContainer = document.getElementById('listings-container');

    try {
        const response = await fetch('/api/property/listall');
        const properties = await response.json();

        if (properties.length === 0) {
            listingsTitle.textContent = 'No Listings Available';
            return;
        }

        listingsTitle.textContent = 'Browse All Listings';

        properties.forEach(property => {
            const propertyCard = `
                <div class="bg-white shadow-lg rounded-lg overflow-hidden h-100 w-80">
                    <img src="${property.featuredImage ? `data:image/jpeg;base64,${property.featuredImage}` : 'https://placehold.co/300x200'}"
                        alt="${property.name}" class="w-full h-48 object-cover" />
                    <div class="p-4">
                        <h4 class="text-lg font-semibold">${property.name}</h4>
                        <p class="text-gray-600">${property.currencySymbol} ${property.price} per night</p>
                    </div>
                </div>
            `;
            listingsContainer.innerHTML += propertyCard;
        });
    } catch (error) {
        console.error('Error loading properties:', error);
        listingsTitle.textContent = 'Failed to load listings. Please try again later.';
    }
});