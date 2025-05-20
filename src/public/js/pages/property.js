class PropertyDetailsRenderer {
  constructor(container) {
    this.container = container;
    this.propertyId = container?.dataset.propertyId;
    this.init();
  }

  init() {
    if (!this.container) return;
    if (!this.propertyId) {
      this.renderError("Invalid property ID.");
      return;
    }
    this.loadProperty();
  }

  async loadProperty() {
    try {
      const res = await fetch(`/api/property/get/${this.propertyId}`);
      const data = await res.json();
      if (!data.success || !data.property) {
        this.renderError("Property not found.");
        return;
      }
      this.renderProperty(data.property);
    } catch {
      this.renderError("Failed to load property details.");
    }
  }

  renderCarousel(images, propertyName) {
    if (!images.length) {
      return `<img src="https://placehold.co/300x400" class="d-block w-100 h-100 rounded mb-4" alt="No image" style="width:300px; height:400px; object-fit:cover;">`;
    }
    const carouselItems = images
      .map(
        (img, idx) => `
        <div class="carousel-item${idx === 0 ? " active" : ""}">
          <img src="${img}" class="d-block w-100 h-100 object-fit-cover rounded" alt="${propertyName} image ${idx + 1
          }" style="width:300px; height:400px; object-fit:cover;">
        </div>
      `
      )
      .join("");
    const controls =
      images.length > 1
        ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#propertyCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#propertyCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      `
        : "";
    return `
    <div id="propertyCarousel" class="carousel slide mb-4" data-bs-ride="carousel" style="width:300px; height:400px; margin:auto;">
      <div class="carousel-inner" style="width:300px; height:400px;">
        ${carouselItems}
      </div>
      ${controls}
    </div>
  `;
  }

  renderProperty(property) {
    const images = [property.featuredImage, ...(property.images || [])].filter(Boolean);

    const renderExpandableText = (id, text, maxLength) => {
      if (!text || text.length <= maxLength) {
        return `<span class="break-words whitespace-pre-line">${text || ""}</span>`;
      }
      const short = text.slice(0, maxLength) + "...";
      return `
      <span id="${id}-short" class="break-words whitespace-pre-line">${short}</span>
      <span id="${id}-full" style="display:none;" class="break-words whitespace-pre-line">${text}</span>
      <a href="#" id="${id}-toggle" class="text-blue-500 hover:underline ml-2">Read more</a>
    `;
    };

    this.container.innerHTML = `
    <div class="flex flex-col md:flex-row gap-8 w-full items-stretch">
      <div class="flex-1 flex flex-col h-full items-center md:items-start">
        ${this.renderCarousel(images, property.name)}
      </div>
      <div class="flex-1 h-full">
        <h2 class="fs-2 fw-bold mb-4">${property.name}</h2>
        <p class="mb-4 text-secondary">
          ${renderExpandableText("desc", property.description, 180)}
        </p>
        <p class="mb-2 fs-5 fw-semibold">
          ${property.currencySymbol} ${Number(property.price).toLocaleString()} per ${property.checkInOutTitle}
        </p>
        <p class="mb-2">
          <strong>Address:</strong>
          ${renderExpandableText("addr", property.address, 80)}
        </p>
        <p class="mb-2"><strong>Check-in:</strong> ${property.checkInTime
      } | <strong>Check-out:</strong> ${property.checkOutTime}</p>
      </div>
    </div>
  `;

    this.#attachExpandableListeners();
  }

  #attachExpandableListeners() {
    const descToggle = this.container.querySelector("#desc-toggle");
    if (descToggle) {
      descToggle.addEventListener("click", (e) => {
        e.preventDefault();
        const short = this.container.querySelector("#desc-short");
        const full = this.container.querySelector("#desc-full");
        if (short.style.display === "none") {
          short.style.display = "";
          full.style.display = "none";
          descToggle.textContent = "Read more";
        } else {
          short.style.display = "none";
          full.style.display = "";
          descToggle.textContent = "Show less";
        }
      });
    }

    const addrToggle = this.container.querySelector("#addr-toggle");
    if (addrToggle) {
      addrToggle.addEventListener("click", (e) => {
        e.preventDefault();
        const short = this.container.querySelector("#addr-short");
        const full = this.container.querySelector("#addr-full");
        if (short.style.display === "none") {
          short.style.display = "";
          full.style.display = "none";
          addrToggle.textContent = "Read more";
        } else {
          short.style.display = "none";
          full.style.display = "";
          addrToggle.textContent = "Show less";
        }
      });
    }
  }

  renderError(message) {
    this.container.innerHTML = `<div class="w-full text-center text-danger">${message}</div>`;
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
    await this.#fetchBookings();
    this.renderCalendar(this.currentMonth, this.currentYear);
    this.updateSummary();
  }

  async #fetchBookings() {
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

    const nav = document.createElement("div");
    nav.className = "flex justify-between items-center mb-2";
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<";
    prevBtn.className = "px-2 py-1 bg-gray-200 rounded hover:bg-gray-300";
    prevBtn.disabled =
      year < this.today.getFullYear() ||
      (year === this.today.getFullYear() && month <= this.today.getMonth());
    prevBtn.onclick = () => {
      if (month === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.renderCalendar(this.currentMonth, this.currentYear);
    };

    const nextBtn = document.createElement("button");
    nextBtn.textContent = ">";
    nextBtn.className = "px-2 py-1 bg-gray-200 rounded hover:bg-gray-300";
    nextBtn.onclick = () => {
      if (month === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.renderCalendar(this.currentMonth, this.currentYear);
    };

    const monthDate = new Date(year, month, 1);
    const monthName = monthDate.toLocaleString("default", { month: "long" });
    const caption = document.createElement("span");
    caption.textContent = `${monthName} ${year}`;
    caption.className = "font-bold";

    nav.appendChild(prevBtn);
    nav.appendChild(caption);
    nav.appendChild(nextBtn);
    this.calendarContainer.appendChild(nav);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const table = document.createElement("table");
    table.className = "mb-6 border w-full";
    const header = document.createElement("tr");
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
      const th = document.createElement("th");
      th.textContent = d;
      header.appendChild(th);
    });
    table.appendChild(header);

    let row = document.createElement("tr");
    for (let d = 0; d < new Date(year, month, 1).getDay(); d++) {
      row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = date.toISOString().slice(0, 10);
      const td = document.createElement("td");
      td.textContent = day;

      td.className = "rounded border border-gray-200 text-center cursor-pointer transition focus:outline-none select-none py-2 px-2";

      if (date < this.today) {
        td.className += " bg-gray-200 text-gray-400 cursor-not-allowed";
        td.tabIndex = -1;
      } else if (this.calendarData[key] === "booked") {
        td.className += " bg-red-400 text-white cursor-not-allowed";
        td.tabIndex = -1;
      } else if (this.calendarData[key] === "pending") {
        td.className += " bg-yellow-300";
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
        if (
          date.getTime() === this.selectedStart.getTime() ||
          date.getTime() === this.selectedEnd.getTime()
        ) {
          td.className += " bg-black text-white font-bold";
        } else if (
          date > this.selectedStart &&
          date < this.selectedEnd
        ) {
          td.className += " bg-gray-600 text-white";
        }
      } else if (this.selectedStart && date.getTime() === this.selectedStart.getTime()) {
        td.className += " bg-black text-white font-bold";
      }

      row.appendChild(td);
      if (date.getDay() === 6 || day === daysInMonth) {
        table.appendChild(row);
        row = document.createElement("tr");
      }
    }
    this.calendarContainer.appendChild(table);
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
    if (this.selectedStart && this.selectedEnd) {
      bookNowBtn.disabled = false;
      bookNowBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      bookNowBtn.disabled = true;
      bookNowBtn.classList.add("opacity-50", "cursor-not-allowed");
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

  bookingCalendar = new BookingCalendar(calendarContainer, summaryContainer, propertyId, container);

  const bookNowBtn = document.getElementById("book-now");
  if (bookNowBtn) {
    bookNowBtn.addEventListener("click", async () => {
      const calendar = bookingCalendar; // Use the stored instance
      if (!calendar.selectedStart || !calendar.selectedEnd) return;

      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: calendar.propertyId,
          startDate: calendar.selectedStart.toISOString().slice(0, 10),
          endDate: calendar.selectedEnd.toISOString().slice(0, 10),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Booking request sent! Please check your email.");
      } else {
        alert(data.message || "Booking failed.");
      }
    });
  }
});