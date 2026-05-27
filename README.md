# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Tecnologías Utilizadas
- **Next.js 15** (App Router)
- **Firebase App Hosting** (Despliegue dinámico)
- **Firestore** (Base de datos en tiempo real)
- **Genkit** (IA para generación de instrucciones)
- **Tailwind CSS & ShadCN UI**

## Guía de Publicación (Hosting)

### 1. GitHub
Para subir los cambios:
```bash
git add .
git commit -m "Actualización"
git push origin main
```

### 2. Configuración en Firebase App Hosting
1. Ve a la consola de Firebase -> **App Hosting**.
2. Crea un nuevo **Backend** conectado a tu repositorio de GitHub.
3. En el **Paso 4 (Variables de Entorno)**, agrega:
   - **Clave**: `GOOGLE_GENAI_API_KEY`
   - **Valor**: Tu API Key de Google AI Studio.
4. En la pestaña **Settings -> Domains**, agrega `oralab.cl`.

### 3. DNS en Cloudflare
Para `oralab.cl`, configura los registros CNAME:
1. Crea un CNAME para `@` apuntando a `studio-7816109963-74959.web.app`.
2. Crea un CNAME para `www` apuntando a `studio-7816109963-74959.web.app`.
3. **IMPORTANTE**: Mantén la **Nube Gris** (DNS Only) hasta que Firebase active el SSL y el estado sea "Active".

---
© 2024 Oralab Clinical Lab.