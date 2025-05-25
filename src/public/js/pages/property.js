class PropertyDetailsRenderer {
  constructor(container) {
    this.container = container;
    this.galleryCard = document.getElementById("property-gallery-card");
    this.infoCard = document.getElementById("property-info-card");
    this.propertyId = container?.dataset.propertyId;
    this.init();
  }

  async init() {
    if (!this.propertyId) {
      this.renderError("Property ID is missing.");
      return;
    }
    try {
      const data = await this.fetchProperty();
      if (!data.success || !data.property) {
        this.renderError(data.message || "Property not found.");
        return;
      }
      this.renderProperty(data.property);
    } catch (err) {
      this.renderError("Failed to load property details.");
    }
  }

  async fetchProperty() {
    const res = await fetch(`/api/property/get/${this.propertyId}`);
    return res.json();
  }

  renderGallery(images, name) {
    if (!images.length) {
      return `<img src="https://placehold.co/800x600" class="rounded-xl w-full aspect-[4/3] object-cover" alt="No image">`;
    }

    const grid = `
      <div class="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden" style="height:450px;max-height:450px;">
        ${images
        .slice(0, 5)
        .map((img, i) =>
          i === 0
            ? `<div class="col-span-2 row-span-2">
                  <img src="${img}" class="w-full h-full object-cover rounded-l-xl cursor-pointer gallery-img" data-idx="0" alt="${name}">
                </div>`
            : `<div class="col-span-1 row-span-1">
                  <img src="${img}" class="w-full h-full object-cover cursor-pointer gallery-img ${i === 2 ? 'rounded-tr-xl' : ''} ${i === 4 ? 'rounded-br-xl' : ''}" data-idx="${i}" alt="${name}">
                </div>`
        )
        .join("")}
      </div>
      <div id="gallery-modal" class="fixed inset-0 z-50 hidden flex flex-col bg-white bg-opacity-30 backdrop-blur-xl">
        <button id="close-gallery-modal" class="absolute top-4 right-6 text-gray-700 hover:text-black text-4xl font-bold focus:outline-none z-50">&times;</button>
        <div class="flex-1 flex flex-col justify-center items-center w-full h-full px-2 md:px-12 overflow-y-auto">
          <div class="w-full max-w-5xl mx-auto masonry-gallery pt-12 pb-8">
            ${images
        .map(
          (img) =>
            `<img src="${img}" class="rounded-xl shadow mb-4 w-full h-auto object-contain masonry-img" style="break-inside:avoid;" alt="gallery">`
        )
        .join("")}
          </div>
        </div>
      </div>
      <style>
        .masonry-gallery { column-count: 1; column-gap: 1rem; }
        @media (min-width: 640px) { .masonry-gallery { column-count: 2; } }
        @media (min-width: 1024px) { .masonry-gallery { column-count: 3; } }
        .masonry-img { display: block; width: 100%; height: auto; margin-bottom: 1rem; border-radius: 0.75rem; box-shadow: 0 2px 16px rgba(0,0,0,0.12); background: #fff; }
        #gallery-modal { padding-top: 0 !important; }
        @media (max-width: 768px) {
          #property-gallery-card .grid { height: 110px !important; max-height: 110px !important; }
          #close-gallery-modal { top: 10px !important; right: 16px !important; font-size: 2.5rem !important; }
          .masonry-gallery { column-count: 1; }
        }
      </style>
    `;

    setTimeout(() => this.attachGalleryListeners(), 0);

    return grid;
  }

  attachGalleryListeners() {
    const modal = document.getElementById("gallery-modal");
    const closeBtn = document.getElementById("close-gallery-modal");
    const galleryImgs = document.querySelectorAll(".gallery-img");

    galleryImgs.forEach((img) => {
      img.addEventListener("click", () => {
        modal.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
      });
    });

    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }
    });
  }

  renderProperty(property) {
    const images = [property.featuredImage, ...(property.images || [])].filter(Boolean);

    if (this.galleryCard) {
      this.galleryCard.innerHTML = this.renderGallery(images, property.name);
    }

    if (this.infoCard) {
      this.infoCard.innerHTML = `
        <h1 class="text-2xl md:text-3xl font-bold mb-2">${property.name}</h1>
        <div class="mb-4 text-gray-700">
          ${this.renderExpandableText("desc", property.description, 220)}
        </div>
        <div class="border-t border-gray-200 my-4"></div>
        <div class="text-lg text-gray-700 mb-2 font-semibold">
          ${property.currencySymbol} ${Number(property.price).toLocaleString()} 
          <span class="text-base text-gray-500 font-normal">/ ${property.checkInOutTitle}</span>
        </div>
        <div class="border-t border-gray-200 my-4"></div>
        <div class="flex items-start gap-2 text-gray-600 text-sm mb-2">
          <i class="bi bi-geo-alt mt-1"></i>
          ${this.renderExpandableText("addr", property.address, 80)}
        </div>
      `;
      this.attachExpandableListeners();
    }
  }

  renderExpandableText(id, text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) {
      return `<div class="text-left whitespace-pre-line font-sans m-0">${text}</div>`;
    }
    const short = text.slice(0, maxLength) + "...";
    return `
      <div id="${id}-short" class="text-left whitespace-pre-line font-sans m-0">
        ${short}
        <a href="#" id="${id}-toggle" data-state="short" class="text-blue-500 hover:underline ml-2">Show more</a>
      </div>
      <div id="${id}-full" class="text-left whitespace-pre-line font-sans m-0" style="display:none">
        ${text}
        <a href="#" id="${id}-toggle" data-state="full" class="text-blue-500 hover:underline ml-2">Show less</a>
      </div>
    `;
  }

  attachExpandableListeners() {
    ["desc", "addr"].forEach((id) => {
      const short = this.infoCard?.querySelector(`#${id}-short`);
      const full = this.infoCard?.querySelector(`#${id}-full`);
      [short, full].forEach((container) => {
        if (container) {
          const toggle = container.querySelector(`#${id}-toggle`);
          if (toggle) {
            toggle.addEventListener("click", (e) => {
              e.preventDefault();
              if (short.style.display !== "none") {
                short.style.display = "none";
                full.style.display = "";
              } else {
                short.style.display = "";
                full.style.display = "none";
              }
            });
          }
        }
      });
    });
  }

  renderError(message) {
    if (this.galleryCard) this.galleryCard.innerHTML = "";
    if (this.infoCard) this.infoCard.innerHTML = `<div class="w-full text-center text-danger">${message}</div>`;
  }
}

class BookingCalendar {
  constructor(calendarContainer, summaryContainer, propertyId, container) {
    this.calendarContainer = calendarContainer;
    this.summaryContainer = summaryContainer;
    this.propertyId = propertyId;
    this.container = container;
    this.today = new Date();
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    this.calendarData = {};
    this.selectedStart = null;
    this.selectedEnd = null;
    this.init();
  }

  async init() {
    await this.fetchBookings();
    this.renderCalendar(this.currentMonth, this.currentYear);
    this.updateSummary();
  }

  async fetchBookings() {
    try {
      const bookingsRes = await fetch(`/api/booking/list/${this.propertyId}`);
      const bookingsData = await bookingsRes.json();
      const bookings = bookingsData.bookings || [];
      bookings.forEach((b) => {
        let current = new Date(b.startDate);
        const end = new Date(b.endDate);
        while (current <= end) {
          const key = current.toISOString().slice(0, 10);
          this.calendarData[key] = b.status;
          current.setDate(current.getDate() + 1);
        }
      });
    } catch {
      
    }
  }

  renderCalendar(month, year) {
    this.calendarContainer.innerHTML = "";

    const nav = this.createCalendarNav(month, year);
    this.calendarContainer.appendChild(nav);

    const flexDiv = document.createElement("div");
    flexDiv.className = "flex flex-col md:flex-row gap-4 justify-center";
    flexDiv.appendChild(this.renderSingleMonthTable(month, year));

    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    flexDiv.appendChild(this.renderSingleMonthTable(nextMonth, nextYear));
    this.calendarContainer.appendChild(flexDiv);
  }

  createCalendarNav(month, year) {
    const nav = document.createElement("div");
    nav.className = "flex justify-between items-center mb-2";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<";
    prevBtn.className = "w-8 h-8 flex items-center justify-center px-0 py-0 rounded-full hover:bg-gray-100";
    prevBtn.disabled =
      year < this.today.getFullYear() ||
      (year === this.today.getFullYear() && month <= this.today.getMonth());
    prevBtn.onclick = () => {
      if (month === 0) {
        this.currentMonth = 10;
        this.currentYear--;
      } else if (month === 1) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth -= 2;
      }
      this.renderCalendar(this.currentMonth, this.currentYear);
    };

    const nextBtn = document.createElement("button");
    nextBtn.textContent = ">";
    nextBtn.className = "w-8 h-8 flex items-center justify-center px-0 py-0 rounded-full hover:bg-gray-100";
    nextBtn.onclick = () => {
      if (month === 10) {
        this.currentMonth = 0;
        this.currentYear++;
      } else if (month === 11) {
        this.currentMonth = 1;
        this.currentYear++;
      } else {
        this.currentMonth += 2;
      }
      this.renderCalendar(this.currentMonth, this.currentYear);
    };

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    return nav;
  }

  renderSingleMonthTable(month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const table = document.createElement("table");
    table.className = "mb-6";
    table.style.borderCollapse = "separate";
    table.style.borderSpacing = "0";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const thMonth = document.createElement("th");
    thMonth.colSpan = 7;
    thMonth.className = "text-center font-bold py-2";
    thMonth.textContent = new Date(year, month, 1).toLocaleString("default", { month: "long", year: "numeric" });
    headerRow.appendChild(thMonth);
    thead.appendChild(headerRow);

    const daysHeader = document.createElement("tr");
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
      const th = document.createElement("th");
      th.textContent = d;
      th.className = "text-center font-semibold";
      th.style.width = "44px";
      th.style.height = "44px";
      th.style.minWidth = "44px";
      th.style.minHeight = "44px";
      th.style.maxWidth = "44px";
      th.style.maxHeight = "44px";
      th.style.padding = "0";
      daysHeader.appendChild(th);
    });
    thead.appendChild(daysHeader);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    let row = document.createElement("tr");
    for (let d = 0; d < new Date(year, month, 1).getDay(); d++) {
      const emptyTd = document.createElement("td");
      emptyTd.style.width = "44px";
      emptyTd.style.height = "44px";
      emptyTd.style.padding = "0";
      row.appendChild(emptyTd);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = date.toISOString().slice(0, 10);
      const td = document.createElement("td");
      td.textContent = day;

      td.className = "text-center cursor-pointer transition focus:outline-none select-none";
      td.style.width = "44px";
      td.style.height = "44px";
      td.style.minWidth = "44px";
      td.style.minHeight = "44px";
      td.style.maxWidth = "44px";
      td.style.maxHeight = "44px";
      td.style.verticalAlign = "middle";
      td.style.padding = "0";
      td.style.boxSizing = "border-box";

      if (date < this.today) {
        td.classList.add("text-gray-400", "cursor-not-allowed");
        td.tabIndex = -1;
      } else if (this.calendarData[key] === "booked") {
        td.classList.add("text-green-200", "cursor-not-allowed");
        td.tabIndex = -1;
      } else if (this.calendarData[key] === "pending") {
        td.classList.add("text-yellow-200", "cursor-not-allowed");
        td.tabIndex = 0;
      } else {
        td.tabIndex = 0;
        td.addEventListener("click", () => this.selectDate(date));
        td.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.selectDate(date);
          }
        });
      }

      if (this.selectedStart && this.selectedEnd) {
        const isSelected = date >= this.selectedStart && date <= this.selectedEnd;
        if (date.getTime() === this.selectedStart.getTime()) {
          td.classList.add("bg-gray-800", "text-white", "font-bold", "rounded-l-full");
        } else if (date.getTime() === this.selectedEnd.getTime()) {
          td.classList.add("bg-gray-800", "text-white", "font-bold", "rounded-r-full");
        } else if (isSelected) {
          td.classList.add("bg-gray-100", "text-black");
          const prevDate = new Date(date);
          prevDate.setDate(date.getDate() - 1);
          const isRangeStartOfWeek = date.getDay() === 0 || prevDate < this.selectedStart;
          if (isRangeStartOfWeek) {
            td.classList.add("rounded-l-md");
          }
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);
          const isRangeEndOfWeek = date.getDay() === 6 || nextDate > this.selectedEnd;
          if (isRangeEndOfWeek) {
            td.classList.add("rounded-r-md");
          }
        }
      } else if (this.selectedStart && date.getTime() === this.selectedStart.getTime()) {
        td.classList.add("bg-gray-800", "text-white", "font-bold", "rounded-full");
      }

      row.appendChild(td);
      if (date.getDay() === 6 || day === daysInMonth) {
        tbody.appendChild(row);
        row = document.createElement("tr");
      }
    }
    table.appendChild(tbody);

    return table;
  }

  selectDate(date) {
    if (!this.selectedStart || (this.selectedStart && this.selectedEnd)) {
      this.selectedStart = date;
      this.selectedEnd = null;
    } else if (date.getTime() === this.selectedStart.getTime()) {
      this.selectedEnd = null;
    } else if (date > this.selectedStart) {
      this.selectedEnd = date;
    } else {
      this.selectedStart = date;
      this.selectedEnd = null;
    }
    this.updateSummary();
    this.renderCalendar(this.currentMonth, this.currentYear);
  }

  formatTime12h(timeStr) {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) return timeStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  }

  propertyCheckInTime() {
    return this.container?.dataset.checkInTime || "14:00";
  }
  propertyCheckOutTime() {
    return this.container?.dataset.checkOutTime || "11:00";
  }
  pricePerNight() {
    return parseFloat(this.container?.dataset.price || 0);
  }
  currencySymbol() {
    return this.container?.dataset.currencySymbol;
  }

  updateSummary() {
    const checkin = this.selectedStart
      ? `${this.selectedStart.toDateString()} ${this.formatTime12h(this.propertyCheckInTime())}`
      : "-";
    const checkout = this.selectedEnd
      ? `${this.selectedEnd.toDateString()} ${this.formatTime12h(this.propertyCheckOutTime())}`
      : "-";
    const nights =
      this.selectedStart && this.selectedEnd
        ? Math.round((this.selectedEnd - this.selectedStart) / (1000 * 60 * 60 * 24))
        : "-";
    const amount =
      this.selectedStart && this.selectedEnd
        ? `${this.currencySymbol()} ${(nights * this.pricePerNight()).toLocaleString()}`
        : "-";

    document.getElementById("summary-checkin").textContent = checkin;
    document.getElementById("summary-checkout").textContent = checkout;
    document.getElementById("summary-nights").textContent = nights;
    document.getElementById("summary-amount").textContent = amount;

    const bookNowBtn = document.getElementById("book-now");
    if (bookNowBtn) {
      if (this.selectedStart && this.selectedEnd) {
        bookNowBtn.disabled = false;
        bookNowBtn.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        bookNowBtn.disabled = true;
        bookNowBtn.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  }
}

let bookingCalendar = null;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("property-details");
  new PropertyDetailsRenderer(container);

  const calendarContainer = document.getElementById("booking-calendar-container");
  const summaryContainer = document.getElementById("booking-summary");
  const propertyId = container?.dataset.propertyId;

  if (!calendarContainer || !propertyId) return;

  const bookingCalendar = new BookingCalendar(calendarContainer, summaryContainer, propertyId, container);

  const bookNowBtn = document.getElementById("book-now");
  if (bookNowBtn) {
    bookNowBtn.addEventListener("click", async () => {
      if (!bookingCalendar.selectedStart || !bookingCalendar.selectedEnd) return;

      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: bookingCalendar.propertyId,
          startDate: bookingCalendar.selectedStart.toISOString().slice(0, 10),
          endDate: bookingCalendar.selectedEnd.toISOString().slice(0, 10),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Booking successful!");
        window.location.reload();
      } else {
        alert(data.message || "Booking failed.");
      }
    });
  }
});