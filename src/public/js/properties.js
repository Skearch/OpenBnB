document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('admin-property-list');
    const editPropertyModal = document.getElementById('editPropertyModal');
    const editPropertyForm = document.getElementById('editPropertyForm');
    const addPropertyForm = document.getElementById('addPropertyForm');
    const closeEditModal = document.getElementById('closeEditModal');

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
                            <button 
                                class="edit-btn flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                                data-id="${property.id}" 
                                data-name="${property.name}" 
                                data-description="${property.description}" 
                                data-price="${property.price}" 
                                data-currency-symbol="${property.currencySymbol}" 
                                data-address="${property.address || ''}">
                                Edit
                            </button>
                        </td>
                    </tr>
                `;
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

    if (editPropertyForm) {
        editPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(editPropertyForm);
            const propertyId = formData.get('id');

            try {
                const response = await fetch(`/api/property/update/${propertyId}`, {
                    method: 'PUT',
                    body: formData,
                });

                if (response.ok) {
                    alert('Property updated successfully');
                    location.reload();
                } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to update property');
                }
            } catch (error) {
                alert('Error updating property');
            }
        });
    }

    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(addPropertyForm);

            try {
                const response = await fetch('/api/property/create', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    alert('Property created successfully');
                    location.reload();
                } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to create property');
                }
            } catch (error) {
                alert('Error creating property');
            }
        });
    }

    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editPropertyModal.classList.add('hidden');
        });
    }
});