function protegerVista(rolPermitido) {
  const rol = sessionStorage.getItem("rol");

  if (!rol || rol !== rolPermitido) {
    window.location.href = "login.html";
  }
}