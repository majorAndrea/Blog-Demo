(() => {
  "use strict";

  const postForm = document.querySelector(".post-form");
  const titleBadge = document.querySelector(".title-badge");
  const descBadge = document.querySelector(".desc-badge");
  const imgBadge = document.querySelector(".img-badge");
  const catBadge = document.querySelector(".cat-badge");
  const locationCatBadge = document.querySelector(".location-cat-badge");
  const categoryMsg = document.querySelector("#category-msg");
  // Show and hide rule field related to the image if the image input
  // is not present; like when editing one Post.
  const imgInput = document.querySelector("input[type='file']");
  const imgLi = document.querySelector("#image-li");
  if (imgInput) imgLi.classList.toggle("d-none");

  // Change rule max and min values for title and description dynamically.
  const MAX_CHARS_TITLE = postForm.elements[0].attributes.maxlength.value;
  const MIN_CHARS_TITLE = postForm.elements[0].attributes.minlength.value;
  // When editing one Post vs when creating a new one, there is a difference on
  // the postForm elements index, because the image input is not available when editing
  // the Post, so switch to querySelector.
  const MAX_CHARS_TEXT = document.querySelector("#text").attributes.maxlength
    .value;
  const MIN_CHARS_TEXT = document.querySelector("#text").attributes.minlength
    .value;
  const MAX_CHARS_LOCATION = document.querySelector("#location").attributes
    .maxlength.value;
  const MIN_CHARS_LOCATION = document.querySelector("#location").attributes
    .minlength.value;

  // Title max-min values.
  document.querySelector(
    "#title-paragraph span:last-child"
  ).textContent = MAX_CHARS_TITLE;
  document.querySelector(
    "#title-paragraph span:first-child"
  ).textContent = MIN_CHARS_TITLE;
  // Desc max-min values.
  document.querySelector(
    "#text-paragraph span:last-child"
  ).textContent = MAX_CHARS_TEXT;
  document.querySelector(
    "#text-paragraph span:first-child"
  ).textContent = MIN_CHARS_TEXT;

  const changeStyleState = (badgeRef, eventRef, state) => {
    if (state) {
      badgeRef.textContent = "OK";
      badgeRef.classList.remove("bg-danger");
      badgeRef.classList.add("bg-success");
      // For checkbox show custom <p> message.
      if (eventRef.target.type === "checkbox") {
        categoryMsg.classList.add("d-none");
        return;
      }
      eventRef.target.classList.add("is-valid");
      eventRef.target.classList.remove("is-invalid");
    } else {
      badgeRef.textContent = "Not OK";
      badgeRef.classList.add("bg-danger");
      badgeRef.classList.remove("bg-success");
      // For checkbox show custom <p> message.
      if (
        eventRef.target.type === "checkbox" ||
        // Used to fix something weird when choosing image.
        (eventRef.target.value.length && eventRef.target.id === "image")
      ) {
        if (eventRef.target.type === "checkbox") {
          categoryMsg.classList.remove("d-none");
        }
        return;
      }
      eventRef.target.classList.add("is-invalid");
      eventRef.target.classList.remove("is-valid");
    }
  };

  const checkValidityInput = (eventRef, badgeRef, minValue, maxValue) => {
    if (
      eventRef.target.value.length >= minValue &&
      eventRef.target.value.length <= maxValue
    ) {
      changeStyleState(badgeRef, eventRef, true);
      return;
    }
    changeStyleState(badgeRef, eventRef, false);
  };

  const checkElements = (event) => {
    // Create the right object if the event variable is not a
    // "true" event from an event listener but from the forEach loop insted.
    event.target ? null : (event.target = event);
    if (
      (event.target.nodeName === "INPUT" ||
        event.target.nodeName === "TEXTAREA") &&
      event.target.type !== "checkbox"
    ) {
      switch (event.target.id) {
        case "title":
          checkValidityInput(
            event,
            titleBadge,
            MIN_CHARS_TITLE,
            MAX_CHARS_TITLE
          );
          break;
        case "text":
          checkValidityInput(event, descBadge, MIN_CHARS_TEXT, MAX_CHARS_TEXT);
          break;
        case "image":
          // The value of the image is the local path of the user computer.
          checkValidityInput(event, imgBadge, 1, 999);
        case "location":
          checkValidityInput(
            event,
            locationCatBadge,
            MIN_CHARS_LOCATION,
            MAX_CHARS_LOCATION
          );
        default:
          return;
      }
    } else if (event.target.type === "checkbox") {
      // Create an array from HTML Form Collections.
      const checkboxes = Array.from(postForm.elements)
        // Map each checkboxes to false or true if checked.
        .map((isCheckbox) => isCheckbox.checked);
      // If some entry in the array is true, then there are at least
      // one checkbox checked, so change the badge state accordingly.
      if (checkboxes.some((areChecked) => areChecked === true)) {
        changeStyleState(catBadge, event, true);
        return;
      }
      changeStyleState(catBadge, event, false);
    }
  };

  // Listen for user inputs inside one of the input elements.
  postForm.addEventListener("input", (event) => {
    checkElements(event);
  });

  // Prevent user from submitting if the Post is not correctly filled.
  postForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const result = Array.from(document.querySelectorAll(".badge"))
      .filter(
        (eachBadge) =>
          !eachBadge.parentNode.parentNode.classList.contains("d-none")
      )
      .map((eachBadge) => eachBadge.textContent === "OK")
      .every((eachBadge) => eachBadge === true);
    if (result) {
      postForm.submit();
    }
  });

  // Fire the validation one time without user interactions.
  Array.from(postForm.elements).forEach((el) => checkElements(el));
})();
