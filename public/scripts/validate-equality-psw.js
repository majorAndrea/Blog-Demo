(() => {
  "use strict";

  const form = document.querySelector("form");

  form.addEventListener("submit", (e) => {
    const passwords = Array.from(
      document.querySelectorAll("input[type='password']")
    ).map((password) => password?.value);

    if (passwords.length === 2) {
      if (
        passwords[0] === 0 ||
        passwords[1] === 0 ||
        passwords[0] !== passwords[1]
      ) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll(".invalid-feedback").forEach((feedback) => {
          feedback.classList.add("d-block");
          feedback.textContent = "Passwords don't match!";
        });
      } else {
        document.querySelectorAll(".invalid-feedback").forEach((feedback) => {
          feedback.classList.remove("d-block");
        });
      }
    }
  });
})();
