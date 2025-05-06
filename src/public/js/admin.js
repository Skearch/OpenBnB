document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('admin-property-list');
    const addPropertyForm = document.getElementById('addPropertyForm');
    const accountList = document.getElementById('account-list');

    if (propertyList) {
        try {
            const response = await fetch('/api/admin/properties');
            const properties = await response.json();
            properties.forEach(property => {
                const row = `
            <tr>
              <td>${property.name}</td>
              <td>${property.description}</td>
              <td>${property.currencysymbol} ${property.price}</td>
            </tr>`;
                propertyList.innerHTML += row;
            });
        } catch (error) {
            alert('Error loading properties');
        }
    }

    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(addPropertyForm);

            try {
                const response = await fetch('/api/admin/listings', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Error adding property');
            }
        });
    }

    if (accountList) {
        try {
            const response = await fetch('/api/admin/accounts');
            const accounts = await response.json();
            accounts.forEach(account => {
                const row = `
            <tr>
              <td>${account.name}</td>
              <td>${account.email}</td>
              <td>
                <select class="role-select" data-id="${account.id}">
                  <option value="guest" ${account.role === 'guest' ? 'selected' : ''}>Guest</option>
                  <option value="staff" ${account.role === 'staff' ? 'selected' : ''}>Staff</option>
                  <option value="owner" ${account.role === 'owner' ? 'selected' : ''}>Owner</option>
                </select>
              </td>
              <td><button class="btn update-role-btn" data-id="${account.id}">Update Role</button></td>
            </tr>`;
                accountList.innerHTML += row;
            });

            document.querySelectorAll('.update-role-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.getAttribute('data-id');
                    const role = document.querySelector(`.role-select[data-id="${userId}"]`).value;

                    try {
                        const response = await fetch(`/api/admin/accounts/${userId}/role`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role }),
                        });
                        const data = await response.json();
                        if (response.ok) {
                            alert('Role updated successfully');
                        } else {
                            alert(data.message);
                        }
                    } catch (error) {
                        alert('Error updating role');
                    }
                });
            });
        } catch (error) {
            alert('Error loading accounts');
        }
    }
});