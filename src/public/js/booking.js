document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('property-list');
    const bookingForm = document.getElementById('bookingForm');

    if (propertyList) {
        try {
            const response = await fetch('/api/bookings/properties');
            const properties = await response.json();
            properties.forEach(property => {
                const card = `
            <div class="col s12 m6">
              <div class="card">
                <div class="card-content">
                  <span class="card-title">${property.name}</span>
                  <p>${property.description}</p>
                  <p>Price: ${property.price}</p>
                </div>
                <div class="card-action">
                  <a href="/booking.html?id=${property.id}">Book Now</a>
                </div>
              </div>
            </div>`;
                propertyList.innerHTML += card;
            });
        } catch (error) {
            alert('Error loading properties');
        }
    }

    if (bookingForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ propertyId: Number(propertyId), startDate, endDate }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Booking successful');
                    window.location.href = '/';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Error booking property');
            }
        });
    }
});