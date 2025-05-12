document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('admin-property-list');
    const editPropertyModal = document.getElementById('editPropertyModal');
    const editPropertyForm = document.getElementById('editPropertyForm');
    const addPropertyForm = document.getElementById('addPropertyForm');
    const closeEditModal = document.getElementById('closeEditModal');
    const editButton = document.getElementById('edit-button');
    const deleteButton = document.getElementById('delete-button');

    let selectedProperties = [];

    if (propertyList) {
        try {
            const response = await fetch('/api/property/listall');
            const properties = await response.json();

            properties.forEach(property => {
                const row = `
                    <tr>
                        <td>
                            <input type="checkbox" class="property-checkbox" data-id="${property.id}" />
                        </td>
                        <td>${property.name}</td>
                        <td>${property.description}</td>
                        <td>${property.currencySymbol} ${property.price}</td>
                        <td>${property.showcase ? 'Yes' : 'No'}</td>
                    </tr>
                `;
                propertyList.innerHTML += row;
            });

            document.querySelectorAll('.property-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const propertyId = e.target.dataset.id;

                    if (e.target.checked) {
                        selectedProperties.push(propertyId);
                    } else {
                        selectedProperties = selectedProperties.filter(id => id !== propertyId);
                    }

                    updateButtonStates();
                });
            });
        } catch (error) {
            alert('Error loading properties');
        }
    }

    function updateButtonStates() {
        if (selectedProperties.length === 0) {
            editButton.disabled = true;
            deleteButton.disabled = true;
        } else if (selectedProperties.length === 1) {
            editButton.disabled = false;
            deleteButton.disabled = false;
        } else {
            editButton.disabled = true;
            deleteButton.disabled = false;
        }
    }

    if (editButton) {
        editButton.addEventListener('click', async () => {
            if (selectedProperties.length === 1) {
                const propertyId = selectedProperties[0];
                try {
                    const response = await fetch(`/api/property/listall`);
                    const properties = await response.json();
                    const property = properties.find(p => p.id === parseInt(propertyId));

                    if (property) {
                        document.getElementById('editPropertyId').value = property.id;
                        document.getElementById('editName').value = property.name;
                        document.getElementById('editDescription').value = property.description;
                        document.getElementById('editPrice').value = property.price;
                        document.getElementById('editCurrencySymbol').value = property.currencySymbol;
                        document.getElementById('editAddress').value = property.address || '';
                        document.getElementById('editShowcase').checked = property.showcase;
                        document.getElementById('editPropertyModal').classList.remove('hidden');
                    }
                } catch (error) {
                    alert('Error fetching property details');
                }
            }
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            if (selectedProperties.length > 0) {
                if (confirm('Are you sure you want to delete the selected properties?')) {
                    try {
                        for (const propertyId of selectedProperties) {
                            await fetch(`/api/property/delete/${propertyId}`, {
                                method: 'DELETE',
                            });
                        }
                        alert('Selected properties deleted successfully');
                        location.reload();
                    } catch (error) {
                        alert('Error deleting properties');
                    }
                }
            }
        });
    }

    if (editPropertyForm) {
        editPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(editPropertyForm);
            const propertyId = formData.get('id');
            const showcase = document.getElementById('editShowcase').checked;

            formData.set('showcase', showcase);

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