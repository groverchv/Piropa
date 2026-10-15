# Guía de Despliegue 100% Gratuito en Netlify 🚀

Tu aplicación **"Elogios de Gracia"** ya está configurada con `@sveltejs/adapter-netlify` y lista para publicarse en 2 minutos.

---

## 1. Obtener tu clave de Groq (Gratis)
1. Ve a [https://console.groq.com/keys](https://console.groq.com/keys).
2. Inicia sesión (con Google o GitHub).
3. Haz clic en **"Create API Key"** y copia la clave generada (empieza por `gsk_...`).

---

## 2. Para probar en local
Crea un archivo llamado `.env` en la raíz de tu proyecto con:
```bash
GROQ_API_KEY=tu_clave_de_groq_aqui
```
*(Nota: Si no pones la clave de Groq, la app funcionará igualmente con el sistema inteligente de frases y versículos de respaldo)*.

---

## 3. Despliegue en Netlify (Gratuito)

### Opción A: Desde GitHub (Recomendada)
1. Sube este proyecto a un repositorio en **GitHub** (o GitLab).
2. Entra a [https://app.netlify.com/](https://app.netlify.com/) y haz clic en **"Add new site" > "Import an existing project"**.
3. Selecciona tu repositorio de GitHub.
4. Netlify detectará automáticamente:
   - **Build command:** `npm run build`
   - **Publish directory:** `.netlify` (o lo detecta por el archivo `netlify.toml`)
5. En la sección **"Environment variables"**, agrega:
   - **Key:** `GROQ_API_KEY`
   - **Value:** `gsk_tu_clave_de_groq`
6. Presiona **"Deploy site"** ¡y listo! Te dará una URL pública tipo `https://tu-sitio.netlify.app`.

---

## 4. Uso del Código QR
1. Una vez desplegada tu web en Netlify con tu enlace público, abre la página.
2. Haz clic en el botón superior **"📱 Ver Código QR para Compartir"**.
3. Se generará automáticamente el código QR exacto hacia tu página.
4. Presiona **"Descargar Imagen del QR"** e imprímelo en tus tarjetas, recuerdos o proyéctalo en pantallas.
