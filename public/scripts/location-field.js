(() => {
  "use strict";
  const placesCheckbox = document.querySelector("input[value='places']");
  const locField = document.querySelector(".location-field");
  const locFieldInput = document.querySelector(".location-field input");
  const locationLi = document.querySelector("#location-li");

  const enableInput = () => {
    locField.classList.remove("d-none");
    locFieldInput.removeAttribute("disabled", null);
    locFieldInput.setAttribute("required", null);
    locationLi.classList.remove("d-none");
  };
  const disableInput = () => {
    locField.classList.add("d-none");
    locFieldInput.setAttribute("disabled", null);
    locFieldInput.removeAttribute("required", null);
    locationLi.classList.add("d-none");
  };

  placesCheckbox.checked ? enableInput() : disableInput();

  placesCheckbox.addEventListener("input", function () {
    placesCheckbox.checked ? enableInput() : disableInput();
  });
})();
