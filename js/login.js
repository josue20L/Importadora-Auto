function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const encontrado = usuarios.find(
    x => x.user === u && x.pass === p
  );

  if (!encontrado) {
    document.getElementById("error").innerText = "Credenciales incorrectas";
    return;
  }

  localStorage.setItem("rol", encontrado.rol);
  localStorage.setItem("usuario", encontrado.user);

  if (encontrado.rol === "ADMIN") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "catalogo.html";
  }
}