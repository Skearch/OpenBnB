document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('admin-property-list');
    const addPropertyForm = document.getElementById('addPropertyForm');
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
        editButton.addEventListener('click', () => {
            if (selectedProperties.length === 1) {
                const propertyId = selectedProperties[0];
                window.location.href = `/dashboard/properties/edit?id=${propertyId}`;
            } else {
                alert('Please select exactly one property to edit.');
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
});