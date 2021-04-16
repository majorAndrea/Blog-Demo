(() => {
  "use strict";
  const placesCheckbox = document.querySelector("input[value='places']");
  const locField = document.querySelector(".location-field");
  const locFieldInput = document.querySelector(".location-field input");
  // To not throw any errors if someone try to type manually some 
  // urls like "/posts/new" without beign authenticated.
  if (placesCheckbox && locField && locFieldInput) {
    placesCheckbox.addEventListener("click", function () {
      if (this.checked) {
        locField.classList.toggle("d-none");
        locFieldInput.removeAttribute("disabled");
        locFieldInput.setAttribute("required", "");
      } else {
        locField.classList.toggle("d-none");
        locFieldInput.setAttribute("disabled", "");
        locFieldInput.removeAttribute("required");
      }
    });
  }
})();
