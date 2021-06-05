(() => {
  "use strict";

  const recursiveSearchArticle = (target) => {
    if (target.nodeName === "MAIN") {
      return;
    }
    if (target.nodeName === "ARTICLE") {
      window.location.href =
        window.location.href + "posts/" + target.getAttribute("data-posturl");
    } else {
      recursiveSearchArticle(target.parentNode);
    }
  };

  document.querySelector(".carousel-inner").addEventListener("click", (e) => {
    recursiveSearchArticle(e.target);
  });
})();
