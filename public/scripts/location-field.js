(() => {
  "use strict";
  const placesCheckbox = document.querySelector("input[value='places']");
  const locField = document.querySelector(".location-field");
  const locFieldInput = document.querySelector(".location-field input");

  const enableInput = () => {
    locField.classList.toggle("d-none");
    locFieldInput.removeAttribute("disabled", null);
    locFieldInput.setAttribute("required", null);
  };
  const disableInput = () => {
    locField.classList.toggle("d-none");
    locFieldInput.setAttribute("disabled", null);
    locFieldInput.removeAttribute("required", null);
  };
  disableInput();
  // To not throw any errors if someone try to type manually some
  // urls like "/posts/new" without beign authenticated.
  if (placesCheckbox && locField && locFieldInput) {
    placesCheckbox.addEventListener("click", function () {
      if (this.checked) {
        enableInput();
      } else {
        disableInput();
      }
    });
  }
})();
