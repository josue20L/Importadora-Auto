// ===============================
// Cargar pedido (por sessionStorage 'pedidoIndex' o último del array)
// ===============================
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
const pedidoIndex = (sessionStorage.getItem('pedidoIndex') !== null)
  ? parseInt(sessionStorage.getItem('pedidoIndex'))
  : (pedidos.length - 1);
let pedido = pedidos[pedidoIndex];
if (!pedido) {
  alert("No hay pedido activo");
  window.location.href = "catalogo.html";
}

// ===============================
// Estados simplificados
// ===============================
const ESTADOS = [
  "Pedido Confirmado",       // Usuario solicita
  "En Puerto Iquique",       // Mercancía en puerto Chile
  "Control Colchane",        // Aduana Chile - verificación
  "En Transporte",           // Viajando a Bolivia
  "Control Pisiga",          // Aduana Bolivia - ingreso
  "En Depósito Oruro",       // Centro de distribución
  "En Transporte La Paz",    // Transporte local Bolivia
  "En Almacén Cochabamba",   // Almacén final
  "Listo para Entrega"       // Disponible al cliente
];

// Coordenadas de cada punto [lat, lng]
const PUNTOS = {
  "Pedido Confirmado": [-20.2200, -70.1420],      // Iquique, Chile
  "En Puerto Iquique": [-20.2200, -70.1420],      // Iquique
  "Control Colchane": [-21.9000, -68.2000],       // Colchane (frontera Chile)
  "En Transporte": [-22.0000, -68.5000],          // Ruta intermedia
  "Control Pisiga": [-21.4333, -67.5500],         // Pisiga (frontera Bolivia)
  "En Depósito Oruro": [-17.9833, -67.1333],      // Oruro
  "En Transporte La Paz": [-16.5000, -68.1500],   // La Paz
  "En Almacén Cochabamba": [-17.3935, -66.1570], // Cochabamba
  "Listo para Entrega": [-17.3935, -66.1570]     // Cochabamba
};

const UBICACION_DESCRIPCION = {
  "Pedido Confirmado": "Puerto de Iquique, Chile",
  "En Puerto Iquique": "Puerto de Iquique, Chile",
  "Control Colchane": "Control Aduanero Colchane (frontera Chile)",
  "En Transporte": "En transporte carretero (frontera Chile-Bolivia)",
  "Control Pisiga": "Control Aduanero Pisiga (frontera Bolivia)",
  "En Depósito Oruro": "Depósito de distribución, Oruro",
  "En Transporte La Paz": "En transporte hacia La Paz",
  "En Almacén Cochabamba": "Almacén final, Cochabamba (Sacaba)",
  "Listo para Entrega": "Almacén Cochabamba - Listo para entrega"
};

const DOCUMENTOS_POR_ESTADO = {
  "Pedido Confirmado": ["DUI (pre-tramitación)", "Factura comercial"],
  "En Puerto Iquique": ["Factura comercial", "Packing list", "Documento de embarque"],
  "Control Colchane": ["DUI", "Guía internacional", "Documentos de liberación"],
  "En Transporte": ["Guía de transporte terrestre", "Aseguración de carga"],
  "Control Pisiga": ["DUI Bolivia", "Documentos de aduana Bolivia", "Certificado de inspección"],
  "En Depósito Oruro": ["Comprobante de almacenaje", "Inventario de carga"],
  "En Transporte La Paz": ["Guía terrestre Bolivia", "Control de carga"],
  "En Almacén Cochabamba": ["Factura de entrega", "Certificado técnico", "Garantía"],
  "Listo para Entrega": ["Documentación completa", "Certificación técnica", "Garantía mecánica"]
};

// ===============================
// Punto actual según estado
// ===============================
let puntoActual = PUNTOS[pedido.estado] || PUNTOS["Pedido Confirmado"];

// ===============================
// Mostrar texto
// ===============================
document.getElementById("estado").textContent = pedido.estado;
document.getElementById("ubicacion").textContent = UBICACION_DESCRIPCION[pedido.estado] || "Ubicación desconocida";

// Mapa
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
// Ruta Real con OSRM (Open Source Routing Machine)
// ===============================
const coordenadas = [
  [-70.1420, -20.2200],    // Iquique [lng, lat]
  [-68.2000, -21.9000],    // Colchane
  [-67.5500, -21.4333],    // Pisiga
  [-67.1333, -17.9833],    // Oruro
  [-68.1500, -16.5000],    // La Paz
  [-66.1570, -17.3935]     // Cochabamba
];

// Construir URLs para OSRM (ruta entre puntos consecutivos)
const rutasOSRM = [];
for (let i = 0; i < coordenadas.length - 1; i++) {
  const inicio = coordenadas[i];
  const fin = coordenadas[i + 1];
  const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${inicio[0]},${inicio[1]};${fin[0]},${fin[1]}?geometries=geojson`;
  rutasOSRM.push(fetch(urlOSRM).then(r => r.json()));
}

// Cargar todas las rutas y combinarlas
Promise.all(rutasOSRM)
.then(respuestas => {
  const lineasRuta = [];
  respuestas.forEach(data => {
    if (data.routes && data.routes[0] && data.routes[0].geometry.coordinates) {
      lineasRuta.push(...data.routes[0].geometry.coordinates);
    }
  });
  
  if (lineasRuta.length > 0) {
    // Convertir [lng, lat] a [lat, lng] para Leaflet
    const rutaLeaflet = lineasRuta.map(coord => [coord[1], coord[0]]);
    const polyline = L.polyline(rutaLeaflet, { 
      color: "#0077b6", 
      weight: 4,
      opacity: 0.8
    }).addTo(map);
    map.fitBounds(polyline.getBounds());
    console.log("✓ Ruta real cargada desde OSRM");
  } else {
    throw new Error("No se obtuvieron datos de OSRM");
  }
})
.catch(err => {
  console.warn("Error cargando ruta OSRM:", err);
  // Fallback a aproximación recta
  const rutaAproximada = coordenadas.map(coord => [coord[1], coord[0]]);
  L.polyline(rutaAproximada, { 
    color: "#ef4444", 
    weight: 3,
    dashArray: "5, 5",
    opacity: 0.6
  }).addTo(map);
  map.fitBounds(rutaAproximada);
  console.log("⚠ Usando aproximación recta (línea roja punteada)");
});

// ===============================
// Iconos para cada estado
// ===============================
const ICONOS_ESTADOS = {
  "Pedido Confirmado": "📋",
  "En Puerto Iquique": "⚓",
  "Control Colchane": "🛃",
  "En Transporte": "🚚",
  "Control Pisiga": "🛃",
  "En Depósito Oruro": "🏭",
  "En Transporte La Paz": "🚐",
  "En Almacén Cochabamba": "📦",
  "Listo para Entrega": "✅"
};

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
  
  const icono = ICONOS_ESTADOS[estado] || "📍";
  step.innerHTML = `<div class="circle">${icono}</div><span>${estado}</span>`;
  trackingSteps.appendChild(step);
});

// ===============================
// Mostrar documentos según estado
// ===============================
function mostrarDocumentos() {
  const docsList = document.getElementById("documentosList");
  const docsRequeridos = DOCUMENTOS_POR_ESTADO[pedido.estado] || [];
  
  docsList.innerHTML = "";
  if (docsRequeridos.length === 0) {
    docsList.innerHTML = "<p>Sin documentos especificados</p>";
    return;
  }

  docsRequeridos.forEach((doc) => {
    const li = document.createElement("div");
    li.style.padding = "5px";
    li.innerHTML = `✓ ${doc}`;
    docsList.appendChild(li);
  });
}

mostrarDocumentos();

// ===============================
// Función demo para avanzar estado
// ===============================
function avanzarEstado() {
  let idx = ESTADOS.indexOf(pedido.estado);
  if (idx < ESTADOS.length - 1) {
    pedidos[pedidoIndex].estado = ESTADOS[idx + 1];
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    location.reload();
  }
}

// Volver a la pantalla anterior o a usuario.html si no hay referrer
function volverAUsuario(){
  try{
    if(document.referrer && document.referrer.includes('usuario.html')){
      history.back();
    } else {
      window.location.href = 'usuario.html';
    }
  }catch(e){ window.location.href = 'usuario.html'; }
}