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
    tablaPedidos.innerHTML = `<tr><td colspan="4">No hay pedidos</td></tr>`;
    return;
  }

  pedidos.forEach((pedido, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${pedido.autoId}</td>
      <td>${pedido.usuario || "Desconocido"}</td>
      <td>${pedido.estado}</td>
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
      <td>${auto.id}</td>
      <td>${auto.marca}</td>
      <td>${auto.modelo}</td>
      <td>${auto.anio}</td>
      <td>USD ${auto.precio}</td>
      <td>
        <button onclick="editarAuto(${index})">Editar</button>
        <button onclick="eliminarAuto(${index})">Eliminar</button>
      </td>
    `;
    tablaCatalogo.appendChild(tr);
  });
}

function mostrarFormulario() {
  document.getElementById("formularioAuto").style.display = "block";
  document.getElementById("formTitle").textContent = "Agregar Auto";
  autoForm.reset();
  document.getElementById("autoId").value = "";
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
  document.getElementById("imagen").value = auto.imagen;
  document.getElementById("descripcion").value = auto.descripcion;
  document.getElementById("formTitle").textContent = "Editar Auto";
  document.getElementById("formularioAuto").style.display = "block";
}

function eliminarAuto(index) {
  if (confirm("¿Eliminar este auto?")) {
    autos.splice(index, 1);
    localStorage.setItem("autos", JSON.stringify(autos));
    renderTablaCatalogo();
  }
}

autoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("autoId").value;
  const nuevoAuto = {
    id: autos.length + 1,
    marca: document.getElementById("marca").value,
    modelo: document.getElementById("modelo").value,
    anio: parseInt(document.getElementById("anio").value),
    precio: parseInt(document.getElementById("precio").value),
    imagen: document.getElementById("imagen").value,
    descripcion: document.getElementById("descripcion").value
  };

  if (id === "") {
    autos.push(nuevoAuto);
  } else {
    autos[parseInt(id)] = { ...autos[parseInt(id)], ...nuevoAuto };
  }

  localStorage.setItem("autos", JSON.stringify(autos));
  renderTablaCatalogo();
  ocultarFormulario();
});

// Cargar tablas al inicio
renderTablaPedidos();
renderTablaCatalogo();