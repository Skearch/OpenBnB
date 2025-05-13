class AuthFormHandler {
  constructor(registerForm) {
    this.registerForm = registerForm;
    this.init();
  }

  init() {
    if (this.registerForm) {
      this.registerForm.addEventListener("submit", (e) =>
        this.handleRegister(e)
      );
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const name = document.getElementById("name").value.trim();
    try {
      const response = await fetch("/api/authentication/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (response.ok) {
        window.location.href = "/account/login";
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error registering");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  new AuthFormHandler(registerForm);
});
