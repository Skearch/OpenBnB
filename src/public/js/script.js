class SidebarManager {
  constructor() {
    this.sidebar = document.getElementById("sidebar");
    this.sidebarToggle = document.getElementById("sidebarToggle");
    this.closeSidebar = document.getElementById("closeSidebar");
    this.sidebarOverlay = document.getElementById("sidebarOverlay");
    this.logoutButton = document.getElementById("logout-button");
    this.init();
  }

  init() {
    if (!this.sidebar || !this.sidebarToggle || !this.closeSidebar || !this.sidebarOverlay) {
      console.error("One or more sidebar elements are missing.");
      return;
    }

    this.sidebarToggle.addEventListener("click", () => this.toggleSidebar());
    this.closeSidebar.addEventListener("click", () => this.toggleSidebar());
    this.sidebarOverlay.addEventListener("click", () => this.toggleSidebar());

    this.sidebarToggle.addEventListener("keydown", (e) => this.handleToggleKeydown(e));
    this.closeSidebar.addEventListener("keydown", (e) => this.handleToggleKeydown(e));

    if (this.logoutButton) {
      this.logoutButton.addEventListener("click", () => this.handleLogout());
      this.logoutButton.addEventListener("keydown", (e) => this.handleLogoutKeydown(e));
    }
  }

  toggleSidebar() {
    const isOpen = !this.sidebar.classList.contains("-translate-x-full");
    this.sidebar.classList.toggle("-translate-x-full");
    this.sidebarOverlay.classList.toggle("hidden", isOpen);
    document.body.classList.toggle("overflow-hidden", !isOpen);

    if (!isOpen) {
      this.closeSidebar.focus();
    } else {
      this.sidebarToggle.focus();
    }
  }

  handleToggleKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toggleSidebar();
    }
  }

  handleLogout() {
    window.location.href = "/dashboard/logout";
  }

  handleLogoutKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleLogout();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SidebarManager();
});