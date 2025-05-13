document.addEventListener("DOMContentLoaded", async () => {
  const totalPropertiesEl = document.getElementById("total-properties");
  const usersRegisteredEl = document.getElementById("users-registered");

  try {
    const propRes = await fetch("/api/property/listall");
    const propData = await propRes.json();
    const totalProperties = propData.success ? propData.properties.length : 0;
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
});
