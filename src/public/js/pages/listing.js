class ListingsRenderer {
  constructor(titleEl, containerEl) {
    this.titleEl = titleEl;
    this.containerEl = containerEl;
  }

  render(properties) {
    this.containerEl.innerHTML = "";
    properties.forEach((property) => {
      const formattedPrice = property.price
        ? Number(property.price).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })
        : "0";
      const propertyCard = `
        <a href="/property/${property.id}" class="block">
          <div class="bg-white shadow rounded-lg overflow-hidden h-100 w-80 p-4 transition-shadow duration-700 hover:shadow-2xl">
              <img src="${property.featuredImage
          ? property.featuredImage
          : "https://placehold.co/300x200"
        }"
              alt="${property.name
        }" class="w-full h-48 object-cover rounded-md" />
            <div class="p-4">
              <h4 class="text-lg font-semibold">${property.name}</h4>
              <p class="text-gray-600">${property.currencySymbol
        } ${formattedPrice} per ${property.checkInOutTitle}</p>
            </div>
          </div>
        </a>
      `;
      this.containerEl.insertAdjacentHTML("beforeend", propertyCard);
    });
  }

  renderError(message) {
    this.titleEl.textContent = message;
    this.containerEl.innerHTML = "";
  }
}

class Pagination {
  constructor(paginationEl, onPageChange) {
    this.paginationEl = paginationEl;
    this.onPageChange = onPageChange;
  }

  render(currentPage, totalPages) {
    this.paginationEl.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.disabled = i === currentPage;
      btn.className =
        "mx-1 px-3 py-1 rounded border " +
        (i === currentPage
          ? "bg-black text-blue-500 border-blue-500"
          : "bg-black text-white");
      btn.addEventListener("click", () => this.onPageChange(i));
      this.paginationEl.appendChild(btn);
    }
  }
}

class ListingsPage {
  constructor() {
    this.titleEl = document.getElementById("listings-title");
    this.containerEl = document.getElementById("listings-container");
    this.paginationEl = document.getElementById("pagination");
    this.renderer = new ListingsRenderer(this.titleEl, this.containerEl);
    this.pagination = new Pagination(this.paginationEl, (page) =>
      this.loadPage(page)
    );
    this.currentPage = 1;
    this.limit = 6;
    this.init();
  }

  async loadPage(page) {
    try {
      const response = await fetch(
        `/api/property/listall?page=${page}&limit=${this.limit}`
      );
      const data = await response.json();

      if (!data.success || data.properties.length === 0) {
        this.renderer.renderError("No Listings Available");
        return;
      }

      this.titleEl.textContent = "Browse All Listings";
      this.renderer.render(data.properties);
      this.pagination.render(data.pagination.page, data.pagination.totalPages);
      this.currentPage = data.pagination.page;
    } catch {
      this.renderer.renderError(
        "Failed to load listings. Please try again later."
      );
    }
  }

  init() {
    this.loadPage(this.currentPage);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ListingsPage();
});
