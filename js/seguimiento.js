// ===============================
// Cargar pedido (último de array)
// ===============================
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
const pedido = pedidos[pedidos.length - 1];
if (!pedido) {
  alert("No hay pedido activo");
  throw new Error("Sin pedido");
}

// ===============================
// Estados simplificados
// ===============================
const ESTADOS = [
  "Comprado",      // Pedido realizado
  "En tránsito",   // Va desde Chile hacia Bolivia
  "En aduana",     // Llegó a aduana en Bolivia
  "En reparto",    // Está en transporte local
  "Entregado"      // Pedido recibido
];

// ===============================
// Coordenadas para la ruta
// OpenRouteService -> [lng, lat]
const origenORS = [-71.6197, -33.0458];   // Valparaíso
const destinoORS = [-66.1570, -17.3935];  // Cochabamba

// Leaflet -> [lat, lng]
const origenLeaflet = [-33.0458, -71.6197];
const destinoLeaflet = [-17.3935, -66.1570];

// Punto actual según estado
let puntoActual = origenLeaflet;
if (pedido.estado === "En tránsito") puntoActual = [-22.9087, -68.1997]; // Aproximación
if (["En aduana","En reparto","Entregado"].includes(pedido.estado)) puntoActual = destinoLeaflet;

// ===============================
// Mostrar texto
// ===============================
document.getElementById("estado").textContent = pedido.estado;
document.getElementById("ubicacion").textContent = "Ubicación simulada según estado";

// ===============================
// Mapa
// ===============================
const map = L.map("map").setView(puntoActual, 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Marcador
L.marker(puntoActual)
  .addTo(map)
  .bindPopup("Ubicación actual del pedido")
  .openPopup();

// ===============================
// Ruta real con OpenRouteService
// ===============================
fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
  method: "POST",
  headers: {
    "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjEyODlkMTE4Nzc2YTRkMjc5ZWZkNDFjNTlmMmI5ZDQ0IiwiaCI6Im11cm11cjY0In0=", // Reemplaza con tu API Key
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    coordinates: [origenORS, destinoORS]
  })
})
.then(res => res.json())
.then(data => {
  if(data.features && data.features.length > 0) {
    const ruta = L.geoJSON(data.features[0].geometry, {
      style: { color: "#2563eb", weight: 5 }
    }).addTo(map);
    map.fitBounds(ruta.getBounds());
  }
})
.catch(err => console.error("Error cargando la ruta:", err));

// ===============================
// Timeline de estados
// ===============================
const trackingSteps = document.getElementById("trackingSteps");
const estadoActualIndex = ESTADOS.indexOf(pedido.estado);

ESTADOS.forEach((estado, index) => {
  const step = document.createElement("div");
  step.classList.add("step");
  if (index < estadoActualIndex) step.classList.add("completed");
  if (index === estadoActualIndex) step.classList.add("active");
  step.innerHTML = `<div class="circle"></div><span>${estado}</span>`;
  trackingSteps.appendChild(step);
});

// ===============================
// Función demo para avanzar estado
// ===============================
function avanzarEstado() {
  let idx = ESTADOS.indexOf(pedido.estado);
  if (idx < ESTADOS.length - 1) {
    pedido.estado = ESTADOS[idx + 1];
    localStorage.setItem("pedido", JSON.stringify(pedido));
    location.reload();
  }
}