function loadB64Images(root) {
  (root || document).querySelectorAll("img[data-b64]").forEach(function (img) {
    if (img.dataset.loaded === "1") return;
    img.dataset.loaded = "1";
    fetch(img.getAttribute("data-b64")).then(function (r) { return r.text(); }).then(function (t) {
      img.src = "data:image/jpeg;base64," + t.trim();
    }).catch(function () {});
  });
}
loadB64Images();
