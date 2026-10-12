# PDF Matrix

Aplicación web estática para trabajar con archivos PDF desde el navegador.

## Estructura

- `src/pages/`: páginas de la aplicación.
- `src/assets/css/`: estilos.
- `src/assets/js/`: lógica compartida de la interfaz.
- `src/assets/icons/`: iconos de navegador y PWA.
- `src/assets/`: recursos adicionales de ejecución.
- `manifest.webmanifest` y `sw.js`: instalación y funcionamiento sin conexión.
- `index.html`: acceso de entrada para abrir la aplicación.

## Publicación

Publica el contenido de esta carpeta conservando la estructura. La app utiliza librerías externas por CDN y requiere servirse por HTTP/HTTPS para que el modo sin conexión y el service worker funcionen.
