document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const closeSidebar = document.getElementById("closeSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const logoutButton = document.getElementById("logout-button");

  if (!sidebar || !sidebarToggle || !closeSidebar || !sidebarOverlay) {
    console.error("One or more sidebar elements are missing.");
    return;
  }

  const toggleSidebar = () => {
    const isOpen = !sidebar.classList.contains("-translate-x-full");
    sidebar.classList.toggle("-translate-x-full");
    sidebarOverlay.classList.toggle("hidden", isOpen);
    document.body.classList.toggle("overflow-hidden", !isOpen);

    if (!isOpen) {
      closeSidebar.focus();
    } else {
      sidebarToggle.focus();
    }
  };

  sidebarToggle.addEventListener("click", toggleSidebar);
  closeSidebar.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", toggleSidebar);

  sidebarToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSidebar();
    }
  });

  closeSidebar.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSidebar();
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      window.location.href = "/dashboard/logout";
    });

    logoutButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.location.href = "/dashboard/logout";
      }
    });
  }
});
