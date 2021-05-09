// TODO: Use env variables.
(() => {
  "use strict";
  const MAX_CHARS_TITLE = 96;
  const MIN_CHARS_TITLE = 24;
  const MAX_CHARS_TEXT = 2048;
  const MIN_CHARS_TEXT = 128;

  const postForm = document.querySelector(".post-form");
  const titleBadge = document.querySelector(".title-badge");
  const descBadge = document.querySelector(".desc-badge");
  const imgBadge = document.querySelector(".img-badge");
  const catBadge = document.querySelector(".cat-badge");

  // Set the text inside spans representing the max and min
  // values with the constant variables.

  // Title
  document.querySelector(
    "#title-paragraph span:last-child"
  ).textContent = MAX_CHARS_TITLE;
  document.querySelector(
    "#title-paragraph span:first-child"
  ).textContent = MIN_CHARS_TITLE;

  // Desc
  document.querySelector(
    "#text-paragraph span:last-child"
  ).textContent = MAX_CHARS_TEXT;
  document.querySelector(
    "#text-paragraph span:first-child"
  ).textContent = MIN_CHARS_TEXT;

  const changeBadgeState = (badgeRef, state) => {
    if (state) {
      badgeRef.textContent = "OK";
      badgeRef.classList.remove("bg-danger");
      badgeRef.classList.add("bg-success");
      return;
    }
    badgeRef.textContent = "Not OK";
    badgeRef.classList.add("bg-danger");
    badgeRef.classList.remove("bg-success");
  };

  const checkValidityInput = (eventRef, badgeRef, minValue, maxValue) => {
    if (
      eventRef.target.value.length >= minValue &&
      eventRef.target.value.length <= maxValue
    ) {
      changeBadgeState(badgeRef, true);
    } else {
      changeBadgeState(badgeRef, false);
    }
  };

  const runValidation = (event) => {
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
          checkValidityInput(event, imgBadge, 1, 999);
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
        changeBadgeState(catBadge, true);
        return;
      }
      changeBadgeState(catBadge, false);
    }
  };

  // Listen for user inputs inside one of the input elements.
  postForm.addEventListener("input", (event) => {
    runValidation(event);
  });

  // Fire the validation one time without user interactions.
  Array.from(postForm.elements).forEach((el) => runValidation(el));
})();
