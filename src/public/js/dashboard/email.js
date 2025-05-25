class EmailSender {
    constructor(formId, errorDivId, redirectUrl = "/dashboard/subscriptions") {
        this.form = document.getElementById(formId);
        this.errorDiv = document.getElementById(errorDivId);
        this.redirectUrl = redirectUrl;
        this.#init();
    }

    #init() {
        if (!this.form) return;
        this.form.addEventListener("submit", (e) => this.#handleSubmit(e));
    }

    async #handleSubmit(e) {
        e.preventDefault();
        this.#hideError();

        const formData = new FormData(this.form);
        const emails = formData.getAll("emails");
        const subject = formData.get("subject")?.trim();
        const message = formData.get("message")?.trim();
        const text = formData.get("text")?.trim();

        if (!emails.length || !subject || !message) {
            this.#showError("All fields are required.");
            return;
        }

        try {
            const res = await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emails, subject, message, text }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Email sent successfully!");
                window.location.href = this.redirectUrl;
            } else {
                this.#showError(data.message || "Failed to send email.");
            }
        } catch {
            this.#showError("Error sending email.");
        }
    }

    #showError(message) {
        if (this.errorDiv) {
            this.errorDiv.textContent = message;
            this.errorDiv.classList.remove("hidden");
        }
    }

    #hideError() {
        if (this.errorDiv) {
            this.errorDiv.textContent = "";
            this.errorDiv.classList.add("hidden");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new EmailSender("sendEmailForm", "email-error");
});