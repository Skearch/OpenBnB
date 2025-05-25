class MyBookingTableManager {
    constructor(bookingList) {
        this.bookingList = bookingList;
        this.bookings = [];
        this.selectedBookingId = null;
        this.init();
    }

    init() {
        this.fetchBookings();
        this.bookingList.addEventListener("click", (e) => this.handleActionClick(e));
    }

    async fetchBookings() {
        try {
            const response = await fetch("/api/booking/guest/list");
            const data = await response.json();
            this.bookings = Array.isArray(data.bookings) ? data.bookings : [];
            this.renderTable();
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
            row.innerHTML = `
                        <td class="border border-gray-300 px-2 py-2">${booking.property?.name || "-"}</td>
                        <td class="border border-gray-300 px-2 py-2">${this.formatDate(booking.startDate)}</td>
                        <td class="border border-gray-300 px-2 py-2">${this.formatDate(booking.endDate)}</td>
                        <td class="border border-gray-300 px-2 py-2">
                            <span class="${this.statusClass(booking.status)} px-2 py-1 rounded text-xs font-semibold">${this.capitalize(booking.status)}</span>
                        </td>
                        <td class="border border-gray-300 px-2 py-2">
                            ${this.canCancel(booking.status) ? `<button class="cancel-booking-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition" data-id="${booking.id}">Cancel</button>` : "-"}
                        </td>
                    `;
            this.bookingList.appendChild(row);
        });
    }

    handleActionClick(e) {
        const btn = e.target.closest(".cancel-booking-btn");
        if (btn) {
            this.selectedBookingId = btn.dataset.id;
            document.getElementById("cancelBookingModal").classList.remove("hidden");
        }
    }

    async cancelBooking(id) {
        try {
            const res = await fetch(`/api/booking/guest/cancel/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Booking cancelled.");
                this.selectedBookingId = null;
                this.fetchBookings();
            } else {
                alert(data.message || "Failed to cancel booking.");
            }
        } catch {
            alert("Failed to cancel booking.");
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

    canCancel(status) {
        return status === "pending" || status === "booked";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const bookingList = document.getElementById("mybooking-list");
    const tableManager = new MyBookingTableManager(bookingList);

    document.getElementById("closeCancelModal").addEventListener("click", () => {
        document.getElementById("cancelBookingModal").classList.add("hidden");
        tableManager.selectedBookingId = null;
    });

    document.getElementById("confirmCancelBooking").addEventListener("click", () => {
        if (tableManager.selectedBookingId) {
            tableManager.cancelBooking(tableManager.selectedBookingId);
            document.getElementById("cancelBookingModal").classList.add("hidden");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !document.getElementById("cancelBookingModal").classList.contains("hidden")) {
            document.getElementById("cancelBookingModal").classList.add("hidden");
            tableManager.selectedBookingId = null;
        }
    });
});