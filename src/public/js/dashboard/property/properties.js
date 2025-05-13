class PropertyTableManager {
  constructor(propertyList, editButton, deleteButton) {
    this.propertyList = propertyList;
    this.editButton = editButton;
    this.deleteButton = deleteButton;
    this.selectedPropertyId = null;
    this.init();
  }

  init() {
    if (!this.propertyList) return;
    this.propertyList.addEventListener("click", (e) => this.handleRowClick(e));
    if (this.editButton) {
      this.editButton.addEventListener("click", () => this.handleEdit());
    }
    if (this.deleteButton) {
      this.deleteButton.addEventListener("click", () => this.handleDelete());
    }
    this.fetchProperties();
  }

  handleRowClick(e) {
    const row = e.target.closest("tr");
    if (!row) return;
    this.propertyList
      .querySelectorAll("tr")
      .forEach((tr) => tr.classList.remove("bg-gray-200"));
    row.classList.add("bg-gray-200");
    this.selectedPropertyId = row.dataset.id;
    if (this.editButton) this.editButton.disabled = false;
    if (this.deleteButton) this.deleteButton.disabled = false;
  }

  handleEdit() {
    if (this.selectedPropertyId) {
      window.location.href = `/dashboard/properties/edit/${this.selectedPropertyId}`;
    }
  }

  handleDelete() {
    if (
      this.selectedPropertyId &&
      confirm("Are you sure you want to delete this property?")
    ) {
      fetch(`/api/property/delete/${this.selectedPropertyId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.reload();
          } else {
            alert(data.message || "An error occurred.");
          }
        })
        .catch(() => {});
    }
  }

  async fetchProperties() {
    try {
      const response = await fetch("/api/property/listall");
      const data = await response.json();
      if (data.success) {
        this.propertyList.innerHTML = "";
        data.properties.forEach((property) => {
          const row = document.createElement("tr");
          row.dataset.id = property.id;
          row.innerHTML = `
            <td class="border border-gray-300 px-2 py-1">${property.name}</td>
            <td class="border border-gray-300 px-2 py-1">${property.price}</td>
            <td class="border border-gray-300 px-2 py-1">${
              property.showcase ? "Yes" : "No"
            }</td>
          `;
          this.propertyList.appendChild(row);
        });
      } else {
        alert("Failed to fetch properties.");
      }
    } catch {
      alert("An error occurred while fetching properties.");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const propertyList = document.getElementById("property-list");
  const editButton = document.getElementById("edit-button");
  const deleteButton = document.getElementById("delete-button");
  new PropertyTableManager(propertyList, editButton, deleteButton);
});
