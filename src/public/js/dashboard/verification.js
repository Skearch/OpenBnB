class VerificationHandler {
    constructor(formId, resendBtnId, errorDivId, emailInputId, codeInputId) {
        this.form = document.getElementById(formId);
        this.resendBtn = document.getElementById(resendBtnId);
        this.errorDiv = document.getElementById(errorDivId);
        this.emailInput = document.getElementById(emailInputId);
        this.codeInput = document.getElementById(codeInputId);

        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        if (this.resendBtn) {
            this.resendBtn.addEventListener('click', (e) => this.handleResend(e));
        }
    }

    showError(message, isSuccess = false) {
        this.errorDiv.textContent = message;
        this.errorDiv.classList.remove('hidden');
        if (isSuccess) {
            this.errorDiv.classList.remove('text-red-500');
            this.errorDiv.classList.add('text-green-500');
        } else {
            this.errorDiv.classList.remove('text-green-500');
            this.errorDiv.classList.add('text-red-500');
        }
    }

    hideError() {
        this.errorDiv.classList.add('hidden');
        this.errorDiv.classList.remove('text-green-500', 'text-red-500');
    }

    async handleSubmit(e) {
        e.preventDefault();
        const code = this.codeInput.value.trim();
        const email = this.emailInput.value.trim();
        this.hideError();
        if (!code || !email) {
            this.showError('Please enter both email and code.');
            return;
        }
        try {
            const response = await fetch('/api/authentication/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await response.json();
            if (response.ok) {
                window.location.href = '/dashboard/guest';
            } else {
                this.showError(data.message);
            }
        } catch {
            this.showError('Error verifying code');
        }
    }

    async handleResend(e) {
        e.preventDefault();
        const email = this.emailInput.value.trim();
        this.hideError();
        if (!email) {
            this.showError('Please enter your email.');
            return;
        }
        try {
            const response = await fetch('/api/authentication/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                this.showError('Verification code resent!', true);
            } else {
                this.showError(data.message);
            }
        } catch {
            this.showError('Error resending code');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VerificationHandler(
        'verificationForm',
        'resend-code',
        'verification-error',
        'email',
        'code'
    );
});