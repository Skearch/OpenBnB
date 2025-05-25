class AccountManager {
  constructor() {
    this.accountList = document.getElementById("admin-account-list");
    this.accountModal = document.getElementById("accountModal");
    this.accountForm = document.getElementById("accountForm");
    this.openCreateAccountModal = document.getElementById("openCreateAccountModal");
    this.closeAccountModal = document.getElementById("closeAccountModal");
    this.editButton = document.getElementById("edit-button");
    this.deleteButton = document.getElementById("delete-button");
    this.emailButton = document.getElementById("email-button");
    this.selectedAccounts = [];
    this.selectedAccountEmails = [];
    this.init();
  }

  init() {
    this.loadAccounts();
    this.updateButtonStates();

    if (this.accountList) {
      this.accountList.addEventListener("click", (e) => this.handleRowClick(e));
    }
    if (this.openCreateAccountModal) {
      this.openCreateAccountModal.addEventListener("click", () => this.openCreateModal());
    }
    if (this.editButton) {
      this.editButton.addEventListener("click", () => this.openEditModal());
    }
    if (this.deleteButton) {
      this.deleteButton.addEventListener("click", () => this.handleDelete());
    }
    if (this.emailButton) {
      this.emailButton.addEventListener("click", () => this.handleEmail());
    }
    if (this.accountForm) {
      this.accountForm.addEventListener("submit", (e) => this.handleSubmit(e));
    }
    if (this.closeAccountModal) {
      this.closeAccountModal.addEventListener("click", () => this.closeModal());
    }
  }

  async loadAccounts() {
    if (!this.accountList) return;
    this.accountList.innerHTML = "";
    try {
      const response = await fetch("/api/account/listall");
      const accounts = await response.json();
      accounts.forEach((account) => {
        const row = document.createElement("tr");
        row.dataset.id = account.id;
        row.dataset.email = account.email;
        row.className = "cursor-pointer";
        row.innerHTML = `
          <td class="border border-gray-300 px-2 py-1">${account.name}</td>
          <td class="border border-gray-300 px-2 py-1">${account.email}</td>
          <td class="border border-gray-300 px-2 py-1">${account.role}</td>
        `;
        this.accountList.appendChild(row);
      });
    } catch (error) {
      alert("Error loading accounts");
    }
  }

  updateButtonStates() {
    if (this.selectedAccounts.length === 0) {
      this.editButton.disabled = true;
      this.deleteButton.disabled = true;
      this.openCreateAccountModal.disabled = false;
      if (this.emailButton) this.emailButton.disabled = true;
    } else if (this.selectedAccounts.length === 1) {
      this.editButton.disabled = false;
      this.deleteButton.disabled = false;
      this.openCreateAccountModal.disabled = true;
      if (this.emailButton) this.emailButton.disabled = false;
    } else {
      this.editButton.disabled = true;
      this.deleteButton.disabled = false;
      this.openCreateAccountModal.disabled = true;
      if (this.emailButton) this.emailButton.disabled = false;
    }
  }

  handleRowClick(e) {
    const row = e.target.closest("tr");
    if (!row || !row.dataset.id) return;
    const id = row.dataset.id;
    const email = row.dataset.email;

    if (row.classList.contains("bg-blue-100")) {
      row.classList.remove("bg-blue-100");
      this.selectedAccounts = this.selectedAccounts.filter((selectedId) => selectedId !== id);
      this.selectedAccountEmails = this.selectedAccountEmails.filter((selectedEmail) => selectedEmail !== email);
    } else {
      row.classList.add("bg-blue-100");
      this.selectedAccounts.push(id);
      this.selectedAccountEmails.push(email);
    }
    this.updateButtonStates();
  }

  handleEmail() {
    if (!this.selectedAccountEmails.length) return;
    const query = this.selectedAccountEmails.map(encodeURIComponent).join(",");
    window.location.href = `/dashboard/email?emails=${query}`;
  }

  openCreateModal() {
    this.accountForm.reset();
    document.getElementById("accountId").value = "";
    document.getElementById("accountModalTitle").textContent = "Create Account";
    document.getElementById("passwordNote").textContent = "";
    this.accountModal.classList.remove("hidden");
  }

  async openEditModal() {
    if (this.selectedAccounts.length !== 1) return;
    const accountId = this.selectedAccounts[0];
    try {
      const response = await fetch(`/api/account/listall`);
      const accounts = await response.json();
      const account = accounts.find((a) => a.id === parseInt(accountId));
      if (account) {
        document.getElementById("accountId").value = account.id;
        document.getElementById("accountName").value = account.name;
        document.getElementById("accountEmail").value = account.email;
        document.getElementById("accountPassword").value = "";
        document.getElementById("accountRole").value = account.role;
        document.getElementById("accountModalTitle").textContent = "Edit Account";
        document.getElementById("passwordNote").textContent = "(leave blank to keep current)";
        this.accountModal.classList.remove("hidden");
      }
    } catch (error) {
      alert("Error fetching account details");
    }
  }

  async handleDelete() {
    if (this.selectedAccounts.length === 0) return;
    if (!confirm("Are you sure you want to delete the selected account(s)?")) return;
    try {
      for (const accountId of this.selectedAccounts) {
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

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.accountForm);
    const accountId = formData.get("id");
    const isEdit = !!accountId;
    const data = Object.fromEntries(formData);

    if (!isEdit) {
      delete data.id;
    }

    if (isEdit && !data.password) {
      delete data.password;
    }

    const url = isEdit ? `/api/account/update/${accountId}` : "/api/account/create";
    const method = isEdit ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert(isEdit ? "Account updated successfully" : "Account created successfully");
        location.reload();
      } else {
        const resData = await response.json();
        alert(resData.message || "Failed to save account");
      }
    } catch (error) {
      alert("Error saving account");
    }
  }

  closeModal() {
    this.accountModal.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AccountManager();
});