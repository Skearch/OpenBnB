document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('admin-property-list');
    const editPropertyModal = document.getElementById('editPropertyModal');
    const editPropertyForm = document.getElementById('editPropertyForm');

    if (propertyList) {
        try {
            const response = await fetch('/api/property/listall');
            const properties = await response.json();

            properties.forEach(property => {
                const row = `
                    <tr>
                        <td>${property.name}</td>
                        <td>${property.description}</td>
                        <td>${property.currencySymbol} ${property.price}</td>
                        <td>
                            <button class="edit-btn bg-blue-500 text-white px-4 py-2 rounded" data-id="${property.id}" data-name="${property.name}" data-description="${property.description}" data-price="${property.price}" data-currency-symbol="${property.currencySymbol}" data-address="${property.address}">Edit</button>
                        </td>
                    </tr>`;
                propertyList.innerHTML += row;
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const property = e.target.dataset;
                    document.getElementById('editPropertyId').value = property.id;
                    document.getElementById('editName').value = property.name;
                    document.getElementById('editDescription').value = property.description;
                    document.getElementById('editPrice').value = property.price;
                    document.getElementById('editCurrencySymbol').value = property.currencySymbol;
                    document.getElementById('editAddress').value = property.address || '';
                    editPropertyModal.classList.remove('hidden');
                });
            });
        } catch (error) {
            alert('Error loading properties');
        }
    }

    editPropertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        print('Submitting form...');
        const formData = new FormData(editPropertyForm);
        const propertyId = formData.get('id');

        try {
            const response = await fetch(`/api/property/update/${propertyId}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                alert('Property updated successfully');
                window.location.reload();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update property');
            }
        } catch (error) {
            alert('Error updating property');
        }
    });
});