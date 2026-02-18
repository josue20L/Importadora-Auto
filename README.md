# Importadora Auto - Backend Setup

Este proyecto ahora incluye un backend Node.js para manejar la subida y almacenamiento de imágenes de autos.

## 🚀 Instalación y Configuración

### 1. Instalar Node.js
Si no tienes Node.js instalado, descárgalo desde [nodejs.org](https://nodejs.org/)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar el servidor
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### 4. Acceder a la aplicación
Abre `admin.html` en tu navegador para gestionar autos con subida de imágenes.

## 📁 Estructura del Proyecto

```
Importadora-Auto/
├── server.js              # Servidor Node.js
├── package.json           # Dependencias del proyecto
├── assets/
│   └── autos/            # 📸 Aquí se guardan las imágenes subidas
├── js/
│   ├── admin.js          # Lógica del admin (modificada para backend)
│   └── datosFake.js      # Datos de ejemplo
├── css/
│   └── styles.css        # Estilos
├── admin.html            # Panel de administración
├── usuario.html          # Panel de cliente
└── README.md            # Este archivo
```

## 🖼️ Cómo funciona la subida de imágenes

1. **Selecciona una imagen** en el formulario de agregar/editar auto
2. **Se muestra preview** inmediatamente
3. **Al guardar**, la imagen se envía al servidor Node.js
4. **Se guarda físicamente** en `assets/autos/` con nombre único
5. **Se registra** la ruta en los datos del auto

## 🔧 Características

- ✅ **Subida de imágenes** al servidor
- ✅ **Almacenamiento físico** en carpeta `assets/autos/`
- ✅ **Nombres únicos** con timestamp para evitar conflictos
- ✅ **Validación** de tipo y tamaño (máx. 5MB)
- ✅ **Preview en tiempo real** antes de guardar
- ✅ **Persistencia** de datos en localStorage + servidor

## 🛠️ Tecnologías utilizadas

- **Node.js** - Servidor backend
- **Express.js** - Framework web
- **Multer** - Manejo de archivos multipart
- **CORS** - Cross-Origin Resource Sharing

## 📋 API Endpoints

- `POST /upload` - Subir imagen de auto
- `GET /api/autos` - Obtener lista de autos
- `POST /api/autos` - Guardar datos de autos

## 🔄 Compatibilidad

El sistema mantiene compatibilidad con localStorage para casos donde el servidor no esté disponible, pero ahora guarda físicamente las imágenes cuando el backend está activo.

## 🐛 Solución de problemas

**Error: "Asegúrate de que el servidor esté corriendo"**
- Ejecuta `npm start` en la terminal
- Verifica que el puerto 3000 no esté ocupado

**Imágenes no se muestran**
- Verifica que el servidor esté ejecutándose
- Revisa que las imágenes existan en `assets/autos/`

**Problemas de CORS**
- El servidor incluye configuración CORS para desarrollo local
