document.addEventListener("DOMContentLoaded", async () => {
  const accountList = document.getElementById("admin-account-list");
  const editAccountModal = document.getElementById("editAccountModal");
  const editAccountForm = document.getElementById("editAccountForm");
  const addAccountForm = document.getElementById("addAccountForm");
  const closeEditModal = document.getElementById("closeEditModal");
  const editButton = document.getElementById("edit-button");
  const deleteButton = document.getElementById("delete-button");

  let selectedAccounts = [];

  async function loadAccounts() {
    if (!accountList) return;
    accountList.innerHTML = "";
    try {
      const response = await fetch("/api/account/listall");
      const accounts = await response.json();

      accounts.forEach((account) => {
        const row = `
          <tr>
            <td>
              <input type="checkbox" class="account-checkbox" data-id="${account.id}" />
            </td>
            <td>${account.name}</td>
            <td>${account.email}</td>
            <td>${account.role}</td>
          </tr>
        `;
        accountList.innerHTML += row;
      });

      document.querySelectorAll(".account-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const accountId = e.target.dataset.id;
          if (e.target.checked) {
            selectedAccounts.push(accountId);
          } else {
            selectedAccounts = selectedAccounts.filter((id) => id !== accountId);
          }
          updateButtonStates();
        });
      });
    } catch (error) {
      alert("Error loading accounts");
    }
  }

  function updateButtonStates() {
    if (selectedAccounts.length === 0) {
      editButton.disabled = true;
      deleteButton.disabled = true;
    } else if (selectedAccounts.length === 1) {
      editButton.disabled = false;
      deleteButton.disabled = false;
    } else {
      editButton.disabled = true;
      deleteButton.disabled = false;
    }
  }

  if (editButton) {
    editButton.addEventListener("click", async () => {
      if (selectedAccounts.length === 1) {
        const accountId = selectedAccounts[0];
        try {
          const response = await fetch(`/api/account/listall`);
          const accounts = await response.json();
          const account = accounts.find((a) => a.id === parseInt(accountId));
          if (account) {
            document.getElementById("editAccountId").value = account.id;
            document.getElementById("editName").value = account.name;
            document.getElementById("editEmail").value = account.email;
            document.getElementById("editRole").value = account.role;
            editAccountModal.classList.remove("hidden");
          }
        } catch (error) {
          alert("Error fetching account details");
        }
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener("click", async () => {
      if (selectedAccounts.length > 0) {
        if (confirm("Are you sure you want to delete the selected accounts?")) {
          try {
            for (const accountId of selectedAccounts) {
              await fetch(`/api/account/delete/${accountId}`, {
                method: "DELETE",
              });
            }
            alert("Selected accounts deleted successfully");
            location.reload();
          } catch (error) {
            alert("Error deleting accounts");
          }
        }
      }
    });
  }

  if (editAccountForm) {
    editAccountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(editAccountForm);
      const accountId = formData.get("id");
      try {
        const response = await fetch(`/api/account/update/${accountId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
        });
        if (response.ok) {
          alert("Account updated successfully");
          location.reload();
        } else {
          const data = await response.json();
          alert(data.message || "Failed to update account");
        }
      } catch (error) {
        alert("Error updating account");
      }
    });
  }

  if (addAccountForm) {
    addAccountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addAccountForm);
      try {
        const response = await fetch("/api/account/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData)),
        });
        if (response.ok) {
          alert("Account created successfully");
          location.reload();
        } else {
          const data = await response.json();
          alert(data.message || "Failed to create account");
        }
      } catch (error) {
        alert("Error creating account");
      }
    });
  }

  if (closeEditModal) {
    closeEditModal.addEventListener("click", () => {
      editAccountModal.classList.add("hidden");
    });
  }

  await loadAccounts();
});