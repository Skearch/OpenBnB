document.addEventListener("DOMContentLoaded", () => {
  const totalPropertiesEl = document.getElementById("total-properties");
  const usersRegisteredEl = document.getElementById("users-registered");

  async function fetchAndDisplayStats() {
    try {
      const propRes = await fetch("/api/property/listall");
      const propData = await propRes.json();
      const totalProperties = propData.success && Array.isArray(propData.properties)
        ? propData.properties.length
        : 0;
      if (totalPropertiesEl) totalPropertiesEl.textContent = totalProperties;
    } catch {
      if (totalPropertiesEl) totalPropertiesEl.textContent = "N/A";
    }

    try {
      const userRes = await fetch("/api/account/listall");
      const users = await userRes.json();
      const totalUsers = Array.isArray(users) ? users.length : 0;
      if (usersRegisteredEl) usersRegisteredEl.textContent = totalUsers;
    } catch {
      if (usersRegisteredEl) usersRegisteredEl.textContent = "N/A";
    }

    try {
      const res = await fetch("/api/booking/active/list");
      const data = await res.json();
      const activeReservationsEl = document.getElementById("active-reservations");
      const count = data.success && Array.isArray(data.bookings) ? data.bookings.length : 0;
      if (activeReservationsEl) activeReservationsEl.textContent = count;
    } catch {
      const activeReservationsEl = document.getElementById("active-reservations");
      if (activeReservationsEl) activeReservationsEl.textContent = "N/A";
    }
  }

  fetchAndDisplayStats();
});