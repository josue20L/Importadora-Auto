// Variables globales
let map;
let deliveryMarker;
let destinationMarker;
let originMarker;
let routeLine;
let currentOrderData = null;
let updateInterval;
let mapLoadTimeout;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Intentar cargar el mapa con timeout
    mapLoadTimeout = setTimeout(() => {
        mostrarPlaceholderMapa();
    }, 5000); // 5 segundos de espera
    
    inicializarMapa();
});

// Mostrar placeholder si el mapa no carga
function mostrarPlaceholderMapa() {
    const placeholder = document.getElementById('mapPlaceholder');
    if (placeholder && !map) {
        placeholder.style.display = 'flex';
        console.log('Mapa no pudo cargar - mostrando placeholder');
    }
}

// Inicializar mapa
function inicializarMapa() {
    try {
        // Verificar si Leaflet está disponible
        if (typeof L === 'undefined') {
            console.error('Leaflet no está disponible');
            mostrarPlaceholderMapa();
            return;
        }
        
        // Crear mapa centrado en una ubicación por defecto (Santo Domingo)
        map = L.map('map').setView([18.4764, -69.9383], 13);
        
        // Añadir capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Limpiar timeout si el mapa carga exitosamente
        if (mapLoadTimeout) {
            clearTimeout(mapLoadTimeout);
        }
        
        // Ocultar placeholder
        const placeholder = document.getElementById('mapPlaceholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Crear iconos personalizados
        const deliveryIcon = L.divIcon({
            html: '<i class="fas fa-truck" style="color: #28a745; font-size: 24px;"></i>',
            iconSize: [30, 30],
            className: 'custom-div-icon'
        });
        
        const destinationIcon = L.divIcon({
            html: '<i class="fas fa-flag-checkered" style="color: #dc3545; font-size: 24px;"></i>',
            iconSize: [30, 30],
            className: 'custom-div-icon'
        });
        
        const originIcon = L.divIcon({
            html: '<i class="fas fa-warehouse" style="color: #007bff; font-size: 24px;"></i>',
            iconSize: [30, 30],
            className: 'custom-div-icon'
        });
        
        // Guardar iconos para uso posterior
        window.mapIcons = {
            delivery: deliveryIcon,
            destination: destinationIcon,
            origin: originIcon
        };
        
        console.log('Mapa inicializado exitosamente');
        
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        mostrarPlaceholderMapa();
    }
}

// Buscar pedido
function buscarPedido() {
    const orderNumber = document.getElementById('orderNumber').value.trim();
    
    if (!orderNumber) {
        mostrarMensaje('Por favor ingresa un número de pedido', 'error');
        return;
    }
    
    // Mostrar loading
    const searchBtn = document.querySelector('.search-btn');
    const originalContent = searchBtn.innerHTML;
    searchBtn.innerHTML = '<div class="loading"></div> Buscando...';
    searchBtn.disabled = true;
    
    // Simular búsqueda de pedido (reemplazar con llamada real a API)
    setTimeout(() => {
        // Datos simulados del pedido
        const mockOrderData = {
            orderNumber: orderNumber,
            vehicle: {
                name: 'Toyota Corolla 2024',
                details: 'Toyota Corolla LE, Blanco',
                vin: '1HGBH41JXMN109186'
            },
            driver: {
                name: 'Carlos Rodríguez',
                phone: '+1 809-555-0123',
                photo: 'driver.jpg'
            },
            status: 'en_camino',
            estimatedTime: '25-30 min',
            locations: {
                origin: { lat: 18.4764, lng: -69.9383, name: 'Centro de Distribución' },
                current: { lat: 18.4864, lng: -69.9283, name: 'En tránsito' },
                destination: { lat: 18.4964, lng: -69.9183, name: 'Dirección del cliente' }
            },
            timeline: [
                { 
                    status: 'confirmado', 
                    title: 'Pedido Confirmado', 
                    description: 'Tu pedido ha sido confirmado y está siendo preparado',
                    time: '10:30 AM',
                    completed: true
                },
                { 
                    status: 'preparacion', 
                    title: 'Vehículo En Camino', 
                    description: 'Tu vehículo está siendo transportado hacia tu ubicación',
                    time: '11:15 AM',
                    completed: true
                },
                { 
                    status: 'en_transito', 
                    title: 'En Tránsito', 
                    description: 'El vehículo está a 15 minutos de tu destino',
                    time: 'Ahora',
                    active: true
                },
                { 
                    status: 'entregado', 
                    title: 'Entregado', 
                    description: 'Vehículo entregado exitosamente',
                    time: 'Pendiente',
                    pending: true
                }
            ]
        };
        
        // Restaurar botón
        searchBtn.innerHTML = originalContent;
        searchBtn.disabled = false;
        
        // Mostrar información del pedido
        mostrarInformacionPedido(mockOrderData);
        
        // Mostrar mensaje de éxito
        mostrarMensaje('¡Pedido encontrado! Mostrando información...', 'success');
        
    }, 1500);
}

// Mostrar información del pedido
function mostrarInformacionPedido(orderData) {
    currentOrderData = orderData;
    
    // Actualizar información básica
    document.getElementById('vehicleName').textContent = orderData.vehicle.name;
    document.getElementById('orderNumberDisplay').textContent = orderData.orderNumber;
    document.getElementById('vehicleDetails').textContent = orderData.vehicle.details;
    document.getElementById('driverName').textContent = orderData.driver.name;
    document.getElementById('estimatedTime').textContent = orderData.estimatedTime;
    
    // Actualizar estado
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = getStatusText(orderData.status);
    statusBadge.className = 'status-badge ' + orderData.status;
    
    // Mostrar secciones
    document.getElementById('orderInfo').style.display = 'block';
    document.getElementById('mapSection').style.display = 'block';
    document.getElementById('timelineSection').style.display = 'block';
    
    // Actualizar mapa
    actualizarMapa(orderData.locations);
    
    // Actualizar timeline
    actualizarTimeline(orderData.timeline);
    
    // Iniciar actualizaciones en tiempo real
    iniciarActualizacionesTiempoReal();
}

// Obtener texto del estado
function getStatusText(status) {
    const statusMap = {
        'confirmado': 'Confirmado',
        'preparacion': 'En Preparación',
        'en_camino': 'En Camino',
        'en_transito': 'En Tránsito',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
}

// Actualizar mapa con ubicaciones
function actualizarMapa(locations) {
    // Verificar si el mapa está disponible
    if (!map) {
        console.log('Mapa no disponible - usando simulación visual');
        mostrarSimulacionVisual(locations);
        return;
    }
    
    // Limpiar marcadores existentes
    if (deliveryMarker) map.removeLayer(deliveryMarker);
    if (destinationMarker) map.removeLayer(destinationMarker);
    if (originMarker) map.removeLayer(originMarker);
    if (routeLine) map.removeLayer(routeLine);
    
    // Añadir marcador de origen
    originMarker = L.marker([locations.origin.lat, locations.origin.lng], {
        icon: window.mapIcons.origin
    }).addTo(map);
    originMarker.bindPopup(`<b>Origen</b><br>${locations.origin.name}`);
    
    // Añadir marcador de destino
    destinationMarker = L.marker([locations.destination.lat, locations.destination.lng], {
        icon: window.mapIcons.destination
    }).addTo(map);
    destinationMarker.bindPopup(`<b>Destino</b><br>${locations.destination.name}`);
    
    // Añadir marcador de ubicación actual del vehículo
    deliveryMarker = L.marker([locations.current.lat, locations.current.lng], {
        icon: window.mapIcons.delivery
    }).addTo(map);
    deliveryMarker.bindPopup(`<b>Vehículo en Tránsito</b><br>Conductor: ${currentOrderData.driver.name}`);
    
    // Crear ruta simulada
    const routeCoordinates = [
        [locations.origin.lat, locations.origin.lng],
        [locations.current.lat, locations.current.lng],
        [locations.destination.lat, locations.destination.lng]
    ];
    
    routeLine = L.polyline(routeCoordinates, {
        color: '#667eea',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Ajustar vista del mapa
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [50, 50] });
}

// Mostrar simulación visual si el mapa no carga
function mostrarSimulacionVisual(locations) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Crear simulación visual simple
    mapContainer.innerHTML = `
        <div style="height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; text-align: center; position: relative;">
            <div style="position: absolute; top: 20px; left: 20px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px;">
                <h4>🚗 Vehículo: ${currentOrderData.vehicle.name}</h4>
                <p>👤 Conductor: ${currentOrderData.driver.name}</p>
                <p>⏰ ETA: ${currentOrderData.estimatedTime}</p>
            </div>
            <div style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 10px;">
                <p>📍 Origen: ${locations.origin.name}</p>
                <p>🏁 Destino: ${locations.destination.name}</p>
            </div>
            <div>
                <i class="fas fa-truck" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h3>Seguimiento Activo</h3>
                <p>Vehículo en tránsito hacia destino</p>
                <div style="margin-top: 2rem;">
                    <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 10px; margin: 0.5rem 0;">
                        <p>📍 Estado: En camino</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 10px; margin: 0.5rem 0;">
                        <p>🕐 Tiempo estimado: ${currentOrderData.estimatedTime}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Actualizar timeline
function actualizarTimeline(timeline) {
    const timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = '';
    
    timeline.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        if (item.completed) {
            timelineItem.classList.add('completed');
        } else if (item.active) {
            timelineItem.classList.add('active');
        } else if (item.pending) {
            timelineItem.classList.add('pending');
        }
        
        let iconHtml = '';
        if (item.completed) {
            iconHtml = '<i class="fas fa-check"></i>';
        } else if (item.active) {
            iconHtml = '<i class="fas fa-truck"></i>';
        } else if (item.pending) {
            iconHtml = '<i class="fas fa-flag-checkered"></i>';
        }
        
        timelineItem.innerHTML = `
            <div class="timeline-marker">
                ${iconHtml}
            </div>
            <div class="timeline-content">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <span class="timeline-time">${item.time}</span>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

// Iniciar actualizaciones en tiempo real
function iniciarActualizacionesTiempoReal() {
    // Limpiar intervalo existente
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Simular actualizaciones cada 5 segundos
    updateInterval = setInterval(() => {
        if (currentOrderData && currentOrderData.status === 'en_transito') {
            // Simular movimiento del vehículo
            simularMovimientoVehiculo();
        }
    }, 5000);
}

// Simular movimiento del vehículo
function simularMovimientoVehiculo() {
    if (!deliveryMarker || !currentOrderData) return;
    
    // Obtener posición actual
    const currentPos = deliveryMarker.getLatLng();
    const destination = L.latLng(
        currentOrderData.locations.destination.lat,
        currentOrderData.locations.destination.lng
    );
    
    // Calcular nueva posición (movimiento simulado hacia el destino)
    const distance = currentPos.distanceTo(destination);
    
    if (distance > 100) { // Si aún no ha llegado
        // Moverse un poco hacia el destino
        const newLat = currentPos.lat + (destination.lat - currentPos.lat) * 0.02;
        const newLng = currentPos.lng + (destination.lng - currentPos.lng) * 0.02;
        
        deliveryMarker.setLatLng([newLat, newLng]);
        
        // Actualizar línea de ruta
        if (routeLine) {
            routeLine.setLatLngs([
                [currentOrderData.locations.origin.lat, currentOrderData.locations.origin.lng],
                [newLat, newLng],
                [currentOrderData.locations.destination.lat, currentOrderData.locations.destination.lng]
            ]);
        }
        
        // Actualizar tiempo estimado
        const remainingMinutes = Math.max(1, Math.floor(distance / 1000 / 0.5)); // Simulación simple
        document.getElementById('estimatedTime').textContent = `${remainingMinutes}-${remainingMinutes + 5} min`;
        
    } else {
        // Llegó al destino
        clearInterval(updateInterval);
        marcarComoEntregado();
    }
}

// Marcar pedido como entregado
function marcarComoEntregado() {
    currentOrderData.status = 'entregado';
    
    // Actualizar badge de estado
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = 'Entregado';
    statusBadge.className = 'status-badge entregado';
    
    // Actualizar timeline
    const timeline = currentOrderData.timeline;
    timeline.forEach(item => {
        if (item.status === 'entregado') {
            item.completed = true;
            item.pending = false;
            item.time = 'Ahora';
        } else if (item.active) {
            item.active = false;
            item.completed = true;
        }
    });
    
    actualizarTimeline(timeline);
    
    // Mostrar mensaje de éxito
    mostrarMensaje('¡Vehículo entregado exitosamente!', 'success');
}

// Centrar mapa en la ubicación actual del vehículo
function centrarMapa() {
    if (deliveryMarker) {
        map.setView(deliveryMarker.getLatLng(), 16);
    }
}

// Toggle fullscreen del mapa
function toggleFullscreen() {
    const mapContainer = document.querySelector('.map-container');
    
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Mostrar mensajes
function mostrarMensaje(message, type) {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    // Insertar después del search section
    const searchSection = document.querySelector('.search-section');
    searchSection.parentNode.insertBefore(messageDiv, searchSection.nextSibling);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Manejo de errores
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    mostrarMensaje('Ha ocurrido un error. Por favor intenta nuevamente.', 'error');
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
