class BookingTableManager {
    constructor(bookingList, editButton, deleteButton, emailButton) {
        this.bookingList = bookingList;
        this.editButton = editButton;
        this.deleteButton = deleteButton;
        this.emailButton = emailButton;
        this.selectedBookingIds = [];
        this.selectedBookingEmails = [];
        this.bookings = [];
        this.init();
    }

    init() {
        if (!this.bookingList) return;
        this.bookingList.addEventListener("click", (e) => this.handleRowClick(e));
        if (this.editButton) {
            this.editButton.addEventListener("click", () => this.handleEdit());
        }
        if (this.deleteButton) {
            this.deleteButton.addEventListener("click", () => this.handleDelete());
        }
        if (this.emailButton) {
            this.emailButton.addEventListener("click", () => this.handleEmail());
        }
        this.fetchBookings();
    }

    async fetchBookings() {
        try {
            const response = await fetch("/api/booking/listall");
            const data = await response.json();
            this.bookings = Array.isArray(data.bookings) ? data.bookings : [];
            this.renderTable();
            this.editButton.disabled = true;
            this.deleteButton.disabled = true;
            if (this.emailButton) this.emailButton.disabled = true;
            this.selectedBookingIds = [];
            this.selectedBookingEmails = [];
        } catch {
            this.bookingList.innerHTML =
                `<tr><td colspan="5" class="text-center text-gray-500 py-6">Failed to load bookings.</td></tr>`;
        }
    }

    renderTable() {
        this.bookingList.innerHTML = "";
        if (!this.bookings.length) {
            this.bookingList.innerHTML =
                `<tr><td colspan="5" class="text-center text-gray-500 py-6">No bookings found.</td></tr>`;
            return;
        }
        this.bookings.forEach((booking) => {
            const row = document.createElement("tr");
            row.className = "cursor-pointer select-none";
            row.dataset.id = booking.id;
            row.dataset.email = booking.guest?.email || "";

            row.innerHTML = `
        <td class="border border-gray-300 px-2 py-2">${booking.property?.name || "-"}</td>
        <td class="border border-gray-300 px-2 py-2">${booking.guest?.name || "-"}<br><span class="text-xs text-gray-500">${booking.guest?.email || ""}</span></td>
        <td class="border border-gray-300 px-2 py-2">${this.formatDate(booking.startDate)}</td>
        <td class="border border-gray-300 px-2 py-2">${this.formatDate(booking.endDate)}</td>
        <td class="border border-gray-300 px-2 py-2">
          <span class="${this.statusClass(booking.status)} px-2 py-1 rounded text-xs font-semibold">${this.capitalize(booking.status)}</span>
        </td>
      `;
            this.bookingList.appendChild(row);
        });
    }

    handleRowClick(e) {
        let tr = e.target.closest("tr");
        if (!tr || !tr.dataset.id) return;
        const id = tr.dataset.id;
        const email = tr.dataset.email;

        if (tr.classList.contains("bg-blue-100")) {
            tr.classList.remove("bg-blue-100");
            this.selectedBookingIds = this.selectedBookingIds.filter((selectedId) => selectedId !== id);
            this.selectedBookingEmails = this.selectedBookingEmails.filter((selectedEmail) => selectedEmail !== email);
        } else {
            tr.classList.add("bg-blue-100");
            this.selectedBookingIds.push(id);
            this.selectedBookingEmails.push(email);
        }
        this.updateButtonStates();
    }

    updateButtonStates() {
        this.editButton.disabled = this.selectedBookingIds.length !== 1;
        this.deleteButton.disabled = this.selectedBookingIds.length === 0;
        if (this.emailButton) this.emailButton.disabled = this.selectedBookingEmails.length === 0;
    }

    handleEmail() {
        if (!this.selectedBookingEmails.length) return;
        const query = this.selectedBookingEmails.map(encodeURIComponent).join(",");
        window.location.href = `/dashboard/email?emails=${query}`;
    }

    handleEdit() {
        if (this.selectedBookingIds.length !== 1) return;
        const booking = this.bookings.find((b) => b.id == this.selectedBookingIds[0]);
        if (!booking) return;
        document.getElementById("editBookingId").value = booking.id;
        document.getElementById("editStatus").value = booking.status;
        document.getElementById("editBookingModal").classList.remove("hidden");
    }

    handleDelete() {
        if (!this.selectedBookingIds.length) return;
        if (
            !confirm(
                "Are you sure you want to delete the selected booking(s)? This action cannot be undone."
            )
        )
            return;
        this.deleteBookings(this.selectedBookingIds);
    }

    async deleteBookings(ids) {
        try {
            for (const id of ids) {
                const res = await fetch(`/api/booking/delete/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    alert(data.message || "Failed to delete booking.");
                    return;
                }
            }
            alert("Booking(s) deleted and user(s) notified via email.");
            this.selectedBookingIds = [];
            this.selectedBookingEmails = [];
            this.editButton.disabled = true;
            this.deleteButton.disabled = true;
            if (this.emailButton) this.emailButton.disabled = true;
            this.fetchBookings();
        } catch {
            alert("Failed to delete booking(s).");
        }
    }

    formatDate(dateStr) {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    statusClass(status) {
        switch (status) {
            case "booked":
                return "bg-green-200 text-green-900";
            case "pending":
                return "bg-yellow-200 text-yellow-900";
            case "declined":
                return "bg-red-200 text-red-900";
            case "cancelled":
                return "bg-gray-200 text-gray-900";
            default:
                return "bg-gray-100 text-gray-900";
        }
    }

    capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    }
}

class BookingEditModal {
    constructor(modalId, formId, closeBtnId, tableManager) {
        this.modal = document.getElementById(modalId);
        this.form = document.getElementById(formId);
        this.closeBtn = document.getElementById(closeBtnId);
        this.tableManager = tableManager;
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener("submit", (e) => this.handleSubmit(e));
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.close());
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !this.modal.classList.contains("hidden")) {
                this.close();
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("editBookingId").value;
        const status = document.getElementById("editStatus").value;
        try {
            const res = await fetch(`/api/booking/edit/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Booking updated and user notified via email.");
                this.close();
                this.tableManager.selectedBookingIds = [];
                this.tableManager.selectedBookingEmails = [];
                this.tableManager.editButton.disabled = true;
                this.tableManager.deleteButton.disabled = true;
                if (this.tableManager.emailButton) this.tableManager.emailButton.disabled = true;
                this.tableManager.fetchBookings();
            } else {
                alert(data.message || "Failed to update booking.");
            }
        } catch {
            alert("Failed to update booking.");
        }
    }

    close() {
        this.modal.classList.add("hidden");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const bookingList = document.getElementById("booking-list");
    const editButton = document.getElementById("edit-button");
    const deleteButton = document.getElementById("delete-button");
    const emailButton = document.getElementById("email-button");

    const tableManager = new BookingTableManager(
        bookingList,
        editButton,
        deleteButton,
        emailButton
    );

    new BookingEditModal(
        "editBookingModal",
        "editBookingForm",
        "closeEditModal",
        tableManager
    );
});