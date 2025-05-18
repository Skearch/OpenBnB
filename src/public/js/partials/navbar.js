class NavbarManager {
    constructor() {
        this.navbarToggle = document.getElementById("navbarToggle");
        this.mobileNav = document.getElementById("mobileNav");
        this.closeMobileNav = document.getElementById("closeMobileNav");
        this.mobileNavOverlay = document.getElementById("mobileNavOverlay");
        this.#init();
    }

    #init() {
        if (!this.navbarToggle || !this.mobileNav || !this.closeMobileNav || !this.mobileNavOverlay) {
            console.error("Navbar elements missing.");
            return;
        }
        this.navbarToggle.addEventListener("click", () => this.openMobileNav());
        this.closeMobileNav.addEventListener("click", () => this.closeNav());
        this.mobileNavOverlay.addEventListener("click", () => this.closeNav());
        document.addEventListener("keydown", (e) => {
            if (!this.mobileNav.classList.contains("translate-x-full") && e.key === "Escape") {
                this.closeNav();
            }
        });
    }

    openMobileNav() {
        this.mobileNav.classList.remove("translate-x-full");
        this.mobileNavOverlay.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
        this.closeMobileNav.focus();
    }

    closeNav() {
        this.mobileNav.classList.add("translate-x-full");
        this.mobileNavOverlay.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
        this.navbarToggle.focus();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new NavbarManager();
});