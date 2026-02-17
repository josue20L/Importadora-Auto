function protegerVista(rolPermitido) {
  const rol = localStorage.getItem("rol");

  if (!rol || rol !== rolPermitido) {
    window.location.href = "login.html";
  }
}