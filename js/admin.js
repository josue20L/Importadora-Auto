// Recuperar pedidos de localStorage (array)
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

// Lista de estados simples
const ESTADOS = [
  "Comprado",
  "En tránsito",
  "En aduana",
  "En reparto",
  "Entregado"
];

const tablaPedidos = document.getElementById("tablaPedidos").querySelector("tbody");
const tablaCatalogo = document.getElementById("tablaCatalogo").querySelector("tbody");
const autoForm = document.getElementById("autoForm");

function renderTablaPedidos() {
  tablaPedidos.innerHTML = ""; // limpiar tabla

  if (pedidos.length === 0) {
    tablaPedidos.innerHTML = `<tr><td colspan="5">No hay pedidos</td></tr>`;
    return;
  }

  pedidos.forEach((pedido, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${pedido.autoId}</td>
      <td>${pedido.usuario || "Desconocido"}</td>
      <td>${pedido.estado}</td>
      <td><button onclick="verSeguimientoAdmin(${index})">Ver Seguimiento</button></td>
      <td>
        <button onclick="avanzarEstado(${index})">Avanzar</button>
        <button onclick="resetearEstado(${index})">Reset</button>
      </td>
    `;
    tablaPedidos.appendChild(tr);
  });
}

// Función para avanzar el estado
function avanzarEstado(index) {
  let idx = ESTADOS.indexOf(pedidos[index].estado);
  if (idx < ESTADOS.length - 1) {
    pedidos[index].estado = ESTADOS[idx + 1];
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    renderTablaPedidos();
  }
}

// Función para reiniciar a "Comprado"
function resetearEstado(index) {
  pedidos[index].estado = ESTADOS[0];
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  renderTablaPedidos();
}

// Función para ver seguimiento admin
function verSeguimientoAdmin(index) {
  window.location.href = `seguimiento-admin.html?pedidoIndex=${index}`;
}

// Cargar autos de datosFake.js (simulado, en prototipo)
let autos = JSON.parse(localStorage.getItem("autos")) || [
  {
    id: 1,
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2020,
    precio: 12000,
    imagen: "assets/autos/auto1.jpg",
    descripcion: "Sedán confiable, económico y cómodo para la ciudad."
  },
  {
    id: 2,
    marca: "BMW",
    modelo: "X5",
    anio: 2019,
    precio: 28000,
    imagen: "assets/autos/auto2.jpg",
    descripcion: "SUV de lujo, potente y con tecnología avanzada."
  },
  {
    id: 3,
    marca: "Nissan",
    modelo: "Sentra",
    anio: 2021,
    precio: 13500,
    imagen: "assets/autos/auto3.jpg",
    descripcion: "Compacto moderno, seguro y eficiente en combustible."
  }
];

function renderTablaCatalogo() {
  tablaCatalogo.innerHTML = "";
  autos.forEach((auto, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${auto.imagen}" alt="${auto.marca} ${auto.modelo}" style="width:50px; height:50px; border-radius:6px; object-fit:cover;">
      </td>
      <td>${auto.marca}</td>
      <td>${auto.modelo}</td>
      <td>${auto.anio}</td>
      <td>$ ${auto.precio}</td>
      <td>
        <button onclick="editarAuto(${index})" style="background:#3b82f6; margin-right:5px;">✎ Editar</button>
        <button onclick="eliminarAuto(${index})" style="background:#ef4444;">🗑 Eliminar</button>
      </td>
    `;
    tablaCatalogo.appendChild(tr);
  });
}

function mostrarFormulario() {
  document.getElementById("formularioAuto").style.display = "block";
  document.getElementById("formTitle").textContent = "Agregar Nuevo Auto";
  autoForm.reset();
  document.getElementById("autoId").value = "";
  document.getElementById("fotoPreview").style.display = "none";
  window.scrollTo(0, document.querySelector("#catalogo").offsetTop);
}

function ocultarFormulario() {
  document.getElementById("formularioAuto").style.display = "none";
}

function editarAuto(index) {
  const auto = autos[index];
  document.getElementById("autoId").value = index;
  document.getElementById("marca").value = auto.marca;
  document.getElementById("modelo").value = auto.modelo;
  document.getElementById("anio").value = auto.anio;
  document.getElementById("precio").value = auto.precio;
  document.getElementById("descripcion").value = auto.descripcion;
  document.getElementById("formTitle").textContent = "Editar Auto";
  
  // Mostrar preview de foto actual
  document.getElementById("previewImg").src = auto.imagen;
  document.getElementById("fotoPreview").style.display = "block";
  document.getElementById("fotoDrive").value = "";
  
  document.getElementById("formularioAuto").style.display = "block";
  window.scrollTo(0, document.querySelector("#catalogo").offsetTop);
}

function eliminarAuto(index) {
  if (confirm("¿Eliminar este auto?")) {
    autos.splice(index, 1);
    localStorage.setItem("autos", JSON.stringify(autos));
    renderTablaCatalogo();
  }
}

// Preview de foto en tiempo real
document.getElementById("fotoDrive").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.size <= 5 * 1024 * 1024) { // 5MB máx
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById("previewImg").src = event.target.result;
      document.getElementById("fotoPreview").style.display = "block";
    };
    reader.readAsDataURL(file);
  } else if (file) {
    alert("La foto debe ser menor a 5MB");
    e.target.value = "";
  }
});

autoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("autoId").value;
  const fotoInput = document.getElementById("fotoDrive");
  const previewImg = document.getElementById("previewImg").src;
  
  // Si hay foto nueva, usar esa; si no, mantener la anterior
  let fotoFinal = previewImg;
  
  const nuevoAuto = {
    id: autos.length + 1,
    marca: document.getElementById("marca").value,
    modelo: document.getElementById("modelo").value,
    anio: parseInt(document.getElementById("anio").value),
    precio: parseInt(document.getElementById("precio").value),
    imagen: fotoFinal,
    descripcion: document.getElementById("descripcion").value
  };

  if (id === "") {
    // Nuevo auto - requiere foto
    if (!fotoInput.files[0]) {
      alert("Debes seleccionar una foto para el auto");
      return;
    }
    autos.push(nuevoAuto);
  } else {
    // Editar auto
    autos[parseInt(id)] = { ...autos[parseInt(id)], ...nuevoAuto };
  }

  localStorage.setItem("autos", JSON.stringify(autos));
  renderTablaCatalogo();
  ocultarFormulario();
  alert("✓ Auto guardado correctamente");
});

// Cargar tablas al inicio
renderTablaPedidos();
renderTablaCatalogo();