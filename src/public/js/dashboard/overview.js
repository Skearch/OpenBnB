class DashboardOverview {
  constructor() {
    this.totalPropertiesEl = document.getElementById("total-properties");
    this.usersRegisteredEl = document.getElementById("users-registered");
    this.activeReservationsEl = document.getElementById("active-reservations");
    this.currencySymbol = "$";
    this.init();
  }

  async init() {
    await this.fetchAndDisplayStats();
    await this.fetchAndDisplayInsights();
  }

  async fetchAndDisplayStats() {
    await this.displayTotalProperties();
    await this.displayTotalUsers();
    await this.displayActiveReservations();
  }

  async displayTotalProperties() {
    try {
      const propRes = await fetch("/api/property/listall");
      const propData = await propRes.json();
      const totalProperties =
        propData.success && Array.isArray(propData.properties)
          ? propData.properties.length
          : 0;
      if (this.totalPropertiesEl) this.totalPropertiesEl.textContent = totalProperties;
    } catch {
      if (this.totalPropertiesEl) this.totalPropertiesEl.textContent = "N/A";
    }
  }

  async displayTotalUsers() {
    try {
      const userRes = await fetch("/api/account/listall");
      const users = await userRes.json();
      const totalUsers = Array.isArray(users) ? users.length : 0;
      if (this.usersRegisteredEl) this.usersRegisteredEl.textContent = totalUsers;
    } catch {
      if (this.usersRegisteredEl) this.usersRegisteredEl.textContent = "N/A";
    }
  }

  async displayActiveReservations() {
    try {
      const res = await fetch("/api/booking/active/list");
      const data = await res.json();
      const count =
        data.success && Array.isArray(data.bookings)
          ? data.bookings.length
          : 0;
      if (this.activeReservationsEl) this.activeReservationsEl.textContent = count;
    } catch {
      if (this.activeReservationsEl) this.activeReservationsEl.textContent = "0";
    }
  }

  async fetchAndDisplayInsights() {
    await this.displayBookingsPerMonth();
    await this.setCurrencySymbol();
    await this.displayRevenueStats();
    await this.displayOccupancyRate();
    await this.displayBookingStatusPie();
  }

  async displayBookingsPerMonth() {
    try {
      const bookingsRes = await fetch("/api/booking/stats/monthly");
      const bookingsData = await bookingsRes.json();
      const months = bookingsData.months || [];
      const bookingsPerMonth = bookingsData.counts || [];
      this.renderBarChart("bookingsPerMonthChart", months, bookingsPerMonth, "Bookings", "#3b82f6");
    } catch {
      this.renderBarChart("bookingsPerMonthChart", [], [], "Bookings", "#3b82f6");
    }
  }

  async setCurrencySymbol() {
    try {
      const propRes = await fetch("/api/property/listall");
      const propData = await propRes.json();
      if (propData.success && Array.isArray(propData.properties) && propData.properties.length > 0) {
        this.currencySymbol = propData.properties[0].currencySymbol || "$";
      }
    } catch {
      this.currencySymbol = "$";
    }
  }

  async displayRevenueStats() {
    try {
      const revenueRes = await fetch("/api/booking/stats/revenue");
      const revenueData = await revenueRes.json();
      document.getElementById("total-revenue").textContent = revenueData.total
        ? `${this.currencySymbol}${Number(revenueData.total).toLocaleString()}`
        : `${this.currencySymbol}0`;
      document.getElementById("avg-booking-value").textContent = revenueData.average
        ? `${this.currencySymbol}${Number(revenueData.average).toLocaleString()}`
        : `${this.currencySymbol}0`;
      this.renderLineChart(
        "revenuePerMonthChart",
        revenueData.months || [],
        revenueData.values || [],
        "Revenue",
        "#10b981",
        "rgba(16,185,129,0.1)"
      );
    } catch {
      document.getElementById("total-revenue").textContent = `${this.currencySymbol}0`;
      document.getElementById("avg-booking-value").textContent = `${this.currencySymbol}0`;
      this.renderLineChart("revenuePerMonthChart", [], [], "Revenue", "#10b981", "rgba(16,185,129,0.1)");
    }
  }

  async displayOccupancyRate() {
    try {
      const occRes = await fetch("/api/property/stats/occupancy");
      const occData = await occRes.json();
      const occupancyRate = occData.rate || 0;
      document.getElementById("occupancy-rate-value").textContent = `${occupancyRate}%`;
      this.renderDoughnutChart(
        "occupancyRateChart",
        ["Occupied", "Available"],
        [occupancyRate, 100 - occupancyRate],
        ["#6366f1", "#e5e7eb"]
      );
    } catch {
      document.getElementById("occupancy-rate-value").textContent = "0%";
      this.renderDoughnutChart(
        "occupancyRateChart",
        ["Occupied", "Available"],
        [0, 100],
        ["#6366f1", "#e5e7eb"]
      );
    }
  }

  async displayBookingStatusPie() {
    try {
      const statusRes = await fetch("/api/booking/stats/status");
      const statusData = await statusRes.json();
      this.renderPieChart(
        "bookingStatusPieChart",
        Object.keys(statusData),
        Object.values(statusData),
        ["#10b981", "#f59e42", "#ef4444", "#a1a1aa"]
      );
    } catch {
      this.renderPieChart(
        "bookingStatusPieChart",
        [],
        [],
        ["#10b981", "#f59e42", "#ef4444", "#a1a1aa"]
      );
    }
  }

  renderBarChart(elementId, labels, data, label, color) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: color
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  renderLineChart(elementId, labels, data, label, borderColor, backgroundColor) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor,
          backgroundColor,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  renderDoughnutChart(elementId, labels, data, backgroundColors) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: { legend: { display: false } }
      }
    });
  }

  renderPieChart(elementId, labels, data, backgroundColors) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DashboardOverview();
});