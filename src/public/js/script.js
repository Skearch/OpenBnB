document.addEventListener('DOMContentLoaded', async () => {
    const logoutButton = document.getElementById('logout-button');
    const toggleButton = document.getElementById('sidebarToggle');
    const closeEditModal = document.getElementById('closeEditModal');
    const sidebar = document.querySelector('.sidebar-custom');

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });

    closeEditModal.addEventListener('click', () => {
        editPropertyModal.classList.add('hidden');
    });

    logoutButton.addEventListener('click', () => {
        window.location.href = '/dashboard/logout';
    });
});