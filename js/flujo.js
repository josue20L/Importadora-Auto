const contenedor = document.getElementById("catalogo");

if (contenedor) {
  // Función para cargar autos
  async function cargarAutos() {
    let autos = [];

    try {
      // Intentar cargar desde el servidor primero
      const response = await fetch('http://localhost:3000/api/autos');
      if (response.ok) {
        autos = await response.json();
        console.log('Autos cargados desde servidor:', autos);
      } else {
        throw new Error('Servidor no disponible');
      }
    } catch (error) {
      console.log('Cargando autos desde localStorage:', error.message);
      // Fallback a localStorage
      autos = JSON.parse(localStorage.getItem("autos")) || [
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
    }

    // Limpiar contenedor
    contenedor.innerHTML = '';

    // Renderizar autos
    autos.forEach(auto => {
      const card = document.createElement("div");
      card.className = "card-auto";

      card.innerHTML = `
        <img src="${auto.imagen}" alt="${auto.marca} ${auto.modelo}" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"800\" height=\"450\"><rect fill=\"%23f3f4f6\" width=\"100%25\" height=\"100%25\"/><text x=\"50%25\" y=\"50%25\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"%239ca3af\" font-family=\"sans-serif\" font-size=\"36\">No%20Image</text></svg>'">
        <div class="info">
          <h3>${auto.marca} ${auto.modelo}</h3>
          <p>Año: ${auto.anio}</p>
          <p class="precio">USD ${auto.precio}</p>
          <button onclick="verDetalles(${auto.id})">Ver detalles</button>
          <button onclick="solicitar(${auto.id})">Solicitar importación</button>
        </div>
      `;

      contenedor.appendChild(card);
    });
  }

  // Cargar autos al inicio
  cargarAutos();
}

// Función para abrir modal con detalles
function verDetalles(idAuto) {
  const auto = autos.find(a => a.id === idAuto);
  if (!auto) return;

  // Crear modal
  const modal = document.createElement("div");
  modal.id = "modalDetalle";
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = 1000;

  modal.innerHTML = `
    <div style="background:white; padding:20px; border-radius:10px; max-width:400px; width:90%; position:relative;">
      <span onclick="cerrarModal()" style="position:absolute; top:10px; right:15px; cursor:pointer; font-weight:bold; font-size:18px;">×</span>
      <h3>${auto.marca} ${auto.modelo}</h3>
      <p><b>Año:</b> ${auto.anio}</p>
      <p><b>Precio:</b> USD ${auto.precio}</p>
      <p>${auto.descripcion}</p>
    </div>
  `;

  document.body.appendChild(modal);
}

function cerrarModal() {
  const modal = document.getElementById("modalDetalle");
  if (modal) modal.remove();
}

function solicitar(idAuto) {
  const usuario = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('usuario')) || localStorage.getItem("usuario") || 'cliente';
  const pedido = {
    autoId: idAuto,
    estado: "COTIZACIÓN",
    ubicacion: "Puerto de Chile",
    usuario: usuario
  };
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  // Guardar el índice del pedido en sessionStorage del top window y navegar toda la ventana
  try{
    const nuevoIndex = pedidos.length - 1;
    if(window.top && window.top.sessionStorage){
      window.top.sessionStorage.setItem('pedidoIndex', String(nuevoIndex));
      window.top.location.href = "seguimiento.html";
      return;
    }
  }catch(e){ /* fall back */ }
  // Fallback: navegar en el mismo contexto
  sessionStorage.setItem('pedidoIndex', String(pedidos.length - 1));
  window.location.href = "seguimiento.html";
}

function volver() {
  window.location.href = "usuario.html";
}