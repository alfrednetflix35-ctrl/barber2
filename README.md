# The Elegance Barbershop

Página de reservas, tarjeta de fidelidad con sellos y panel de administrador.
Sitio 100 % estático (HTML + JavaScript), con datos en Firebase (Firestore + Authentication).

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página de clientes: reservar, mi tarjeta, productos, registrarme y registro de visita (QR) |
| `admin.html` | Panel de administrador (entra por `/admin`): clientes, tarjeta, productos y códigos QR |
| `_redirects` | Hace que `/admin` abra `admin.html` |
| `netlify.toml` | Configuración de despliegue en Netlify (carpeta raíz, cabeceras de seguridad, caché) |
| `firestore.rules` | Reglas de seguridad de Firestore (pegar en Firebase → Firestore → Reglas) |
| `.gitignore` | Archivos que Git debe ignorar |

`index.html` y `admin.html` se conectan por la misma base de datos de Firebase
(`const FIREBASE` al inicio del script de cada archivo). Si cambias de proyecto de Firebase,
actualiza **los dos** archivos.

## Subir a GitHub

```bash
git init
git add .
git commit -m "The Elegance Barbershop"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## Desplegar en Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub** y elige el repositorio.
2. Deja **Build command** vacío y **Publish directory** en `.` (ya viene en `netlify.toml`).
3. Pulsa **Deploy**. Cada `git push` a `main` vuelve a desplegar solo.
4. Abre `https://TU-SITIO.netlify.app` (clientes) y `https://TU-SITIO.netlify.app/admin` (administrador).

## Después del primer deploy

1. En `/admin` → **Mi tarjeta de fidelidad → Códigos QR**, pega en "Dirección de la página de clientes"
   la URL de tu sitio en Netlify, pulsa **Mostrar QRs** e imprime los códigos.
2. **Firebase** (proyecto `barberclaude-5c36e`):
   - Crea la base **Firestore** (colecciones usadas: `clientes`, `privados`, `config`, `galeria`).
   - En **Authentication** activa *Correo y contraseña* y crea el usuario administrador.
   - Publica **reglas de Firestore** que permitan registrarse y consultar la tarjeta a los clientes,
     y que solo el administrador lea `privados`. Con las reglas por defecto todo se bloquea.
   - En **Authentication → Settings → Authorized domains** agrega tu dominio `*.netlify.app`.

## Reglas del club

- El sello solo se suma al abrir la página escaneando el QR de visita (`#visita`), una vez por día.
- Máximo 35 días entre un servicio y el siguiente; si pasan, la tarjeta se reinicia en el sello 1.
- El botón "Enviar progreso a mi barbero" abre el WhatsApp configurado en `WA_BARBERO` (`index.html`).

## App instalable (PWA)

- `manifest.webmanifest`: nombre, colores e iconos de la app.
- `sw.js`: service worker (abre la página sin conexión; Firebase siempre va a la red).
- `icons/`: iconos 192, 512, maskable, apple-touch y favicon.
- Para forzar que los clientes reciban una actualización grande, cambia `VERSION` en `sw.js` (p. ej. `v2`).
- Hay que subir todo a la **raíz** del repositorio, con la carpeta `icons/` incluida.
