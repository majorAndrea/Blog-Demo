(() => {
  "use strict";
  const placesCheckbox = document.querySelector("input[value='places']");
  const locField = document.querySelector(".location-field");
  const locFieldInput = document.querySelector(".location-field input");
  const locationLi = document.querySelector("#location-li");

  const enableInput = () => {
    locField.classList.toggle("d-none");
    locFieldInput.removeAttribute("disabled", null);
    locFieldInput.setAttribute("required", null);
    locationLi.classList.toggle("d-none");
  };
  const disableInput = () => {
    locField.classList.toggle("d-none");
    locFieldInput.setAttribute("disabled", null);
    locFieldInput.removeAttribute("required", null);
    locationLi.classList.toggle("d-none");
  };

  // To not throw any errors if someone try to type manually some
  // urls like "/posts/new" without beign authenticated because the
  // addEventListener attempts to bind anyway.
  if (placesCheckbox && locField && locFieldInput) {
    placesCheckbox.addEventListener("input", function () {
      if (this.checked) {
        enableInput();
      } else {
        disableInput();
      }
    });
  }
})();
