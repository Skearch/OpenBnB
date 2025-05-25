class SubscriptionManager {
    constructor() {
        this.subscriptionList = document.getElementById("subscription-list");
        this.subscriptionModal = document.getElementById("subscriptionModal");
        this.subscriptionForm = document.getElementById("subscriptionForm");
        this.openCreateSubscriptionModal = document.getElementById("openCreateSubscriptionModal");
        this.closeSubscriptionModal = document.getElementById("closeSubscriptionModal");
        this.editButton = document.getElementById("edit-button");
        this.deleteButton = document.getElementById("delete-button");
        this.emailButton = document.getElementById("email-button");
        this.selectedSubscriptionIds = [];
        this.selectedEmails = [];
        this.init();
    }

    init() {
        this.loadSubscriptions();
        this.updateButtonStates();
        this.subscriptionList.addEventListener("click", (e) => this.handleRowClick(e));
        this.emailButton.addEventListener("click", () => this.handleEmail());
        this.openCreateSubscriptionModal.addEventListener("click", () => this.openCreateModal());
        this.editButton.addEventListener("click", () => this.openEditModal());
        this.deleteButton.addEventListener("click", () => this.handleDelete());
        this.subscriptionForm.addEventListener("submit", (e) => this.handleSubmit(e));
        this.closeSubscriptionModal.addEventListener("click", () => this.closeModal());
    }

    async loadSubscriptions() {
        this.subscriptionList.innerHTML = "";
        try {
            const response = await fetch("/api/email-subscription/list");
            const data = await response.json();
            if (data.success && Array.isArray(data.subscriptions)) {
                if (!data.subscriptions.length) {
                    this.subscriptionList.innerHTML = `<tr><td colspan="2" class="text-center text-gray-500 py-6">No subscriptions found.</td></tr>`;
                } else {
                    data.subscriptions.forEach((sub) => {
                        const row = document.createElement("tr");
                        row.dataset.id = sub.id;
                        row.dataset.email = sub.email;
                        row.className = "cursor-pointer transition select-none";
                        row.innerHTML = `
                        <td class="border border-gray-300 px-2 py-1">${sub.email}</td>
                        <td class="border border-gray-300 px-2 py-1">${new Date(sub.createdAt).toLocaleString()}</td>
                    `;
                        this.subscriptionList.appendChild(row);
                    });
                }
            } else {
                this.subscriptionList.innerHTML = `<tr><td colspan="2" class="text-center text-gray-500 py-6">Failed to load subscriptions.</td></tr>`;
            }
            this.selectedSubscriptionIds = [];
            this.selectedEmails = [];
            this.updateButtonStates();
        } catch {
            this.subscriptionList.innerHTML = `<tr><td colspan="2" class="text-center text-gray-500 py-6">Error loading subscriptions.</td></tr>`;
        }
    }

    handleRowClick(e) {
        const row = e.target.closest("tr");
        if (!row || !row.dataset.id) return;
        const id = row.dataset.id;
        const email = row.dataset.email;

        if (row.classList.contains("bg-blue-100")) {
            row.classList.remove("bg-blue-100");
            this.selectedSubscriptionIds = this.selectedSubscriptionIds.filter((selectedId) => selectedId !== id);
            this.selectedEmails = this.selectedEmails.filter((selectedEmail) => selectedEmail !== email);
        } else {
            row.classList.add("bg-blue-100");
            this.selectedSubscriptionIds.push(id);
            this.selectedEmails.push(email);
        }
        this.updateButtonStates();
    }

    updateButtonStates() {
        this.editButton.disabled = this.selectedSubscriptionIds.length !== 1;
        this.deleteButton.disabled = this.selectedSubscriptionIds.length === 0;
        this.emailButton.disabled = this.selectedEmails.length === 0;
    }

    openCreateModal() {
        this.subscriptionForm.reset();
        document.getElementById("subscriptionId").value = "";
        document.getElementById("subscriptionModalTitle").textContent = "Create Subscription";
        this.subscriptionModal.classList.remove("hidden");
    }

    async openEditModal() {
        if (this.selectedSubscriptionIds.length !== 1) return;
        const id = this.selectedSubscriptionIds[0];
        try {
            const response = await fetch("/api/email-subscription/list");
            const data = await response.json();
            const sub = data.subscriptions.find((s) => s.id === parseInt(id));
            if (sub) {
                document.getElementById("subscriptionId").value = sub.id;
                document.getElementById("subscriptionEmail").value = sub.email;
                document.getElementById("subscriptionModalTitle").textContent = "Edit Subscription";
                this.subscriptionModal.classList.remove("hidden");
            }
        } catch {
            alert("Error fetching subscription details");
        }
    }

    closeModal() {
        this.subscriptionModal.classList.add("hidden");
    }

    handleEmail() {
        if (!this.selectedEmails.length) return;
        const query = this.selectedEmails.map(encodeURIComponent).join(",");
        window.location.href = `/dashboard/email?emails=${query}`;
    }

    async handleSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("subscriptionId").value;
        const email = document.getElementById("subscriptionEmail").value.trim();
        if (!email) return alert("Email is required.");
        const isEdit = !!id;
        const url = isEdit
            ? `/api/email-subscription/edit/${id}`
            : "/api/email-subscription/subscribe";
        const method = isEdit ? "PUT" : "POST";
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert(isEdit ? "Subscription updated." : "Subscription created.");
                this.closeModal();
                this.loadSubscriptions();
            } else {
                alert(data.message || "Failed to save subscription.");
            }
        } catch {
            alert("Error saving subscription.");
        }
    }

    async handleDelete() {
        if (!this.selectedSubscriptionIds.length) return;
        if (!confirm("Are you sure you want to delete the selected subscription(s)?")) return;
        try {
            for (const id of this.selectedSubscriptionIds) {
                await fetch(`/api/email-subscription/delete/${id}`, {
                    method: "DELETE",
                });
            }
            alert("Selected subscription(s) deleted.");
            this.loadSubscriptions();
        } catch {
            alert("Error deleting subscription(s).");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new SubscriptionManager();
});