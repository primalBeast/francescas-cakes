document.querySelectorAll("img[data-b64]").forEach(function (img) {
  fetch(img.getAttribute("data-b64")).then(function (r) { return r.text(); }).then(function (t) {
    img.src = "data:image/jpeg;base64," + t.trim();
  }).catch(function () {});
});
