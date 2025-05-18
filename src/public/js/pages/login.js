class AuthFormHandler {
  constructor(loginForm) {
    this.loginForm = loginForm;
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
    try {
      const params = new URLSearchParams(window.location.search);
      const rdirect = params.get("rdirect");

      const response = await fetch("/api/authentication/login" + (rdirect ? `?rdirect=${encodeURIComponent(rdirect)}` : ""), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          window.location.href = "/dashboard/redirect";
        }
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error logging in");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  new AuthFormHandler(loginForm);
});