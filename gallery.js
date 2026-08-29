document.querySelectorAll("img").forEach(function (img) {
  var s = img.getAttribute("src") || "";
  if (!/\.jpg$/i.test(s)) return;
  fetch(s.replace(/\.jpg$/i, ".b64")).then(function (r) {
    if (!r.ok) throw new Error(s);
    return r.text();
  }).then(function (t) {
    img.src = "data:image/jpeg;base64," + t.trim();
  }).catch(function () {});
});
