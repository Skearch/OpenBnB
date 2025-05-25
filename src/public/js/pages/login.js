class AuthFormHandler {
  constructor(loginForm) {
    this.loginForm = loginForm;
    this.errorDiv = document.getElementById("login-error");
    this.init();
  }

  init() {
    if (this.loginForm) {
      this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    this.hideError();
    if (!email || !password) {
      this.showError("Please enter both email and password.");
      return;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const rdirect = params.get("rdirect");

      const response = await fetch(
        "/api/authentication/login" +
        (rdirect ? `?rdirect=${encodeURIComponent(rdirect)}` : ""),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          window.location.href = "/dashboard/redirect";
        }
      } else {
        this.showError(data.message || "Invalid email or password.");
      }
    } catch {
      this.showError("Error logging in. Please try again.");
    }
  }

  showError(message) {
    if (this.errorDiv) {
      this.errorDiv.textContent = message;
      this.errorDiv.classList.remove("hidden");
    } else {
      alert(message);
    }
  }

  hideError() {
    if (this.errorDiv) {
      this.errorDiv.textContent = "";
      this.errorDiv.classList.add("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  new AuthFormHandler(loginForm);
});