class FAQAccordion {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        this.buttons = Array.from(this.container.querySelectorAll('[data-accordion-target]'));
        this.panels = Array.from(this.container.querySelectorAll('[id^="faq-panel-"]'));
        this.init();
    }

    init() {
        this.buttons.forEach((btn) => {
            btn.addEventListener('click', () => this.togglePanel(btn));
        });
    }

    togglePanel(btn) {
        const targetId = btn.getAttribute('data-accordion-target');
        const panel = document.getElementById(targetId);
        const svg = btn.querySelector('svg');
        if (!panel || !svg) return;

        if (panel.classList.contains('hidden')) {
            this.closeAll();
            panel.classList.remove('hidden');
            svg.classList.add('rotate-180');
        } else {
            panel.classList.add('hidden');
            svg.classList.remove('rotate-180');
        }
    }

    closeAll() {
        this.panels.forEach((p) => p.classList.add('hidden'));
        this.buttons.forEach((btn) => {
            const svg = btn.querySelector('svg');
            if (svg) svg.classList.remove('rotate-180');
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new FAQAccordion('#faq-accordion');
});