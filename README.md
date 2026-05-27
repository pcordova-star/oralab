# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado para el diagnóstico de SIBO, IMO y otras condiciones digestivas.

## Tecnologías Utilizadas
- **Next.js 15** (App Router)
- **Firebase App Hosting** (Despliegue dinámico)
- **Firestore** (Base de datos en tiempo real)
- **Genkit** (IA para generación de instrucciones de preparación)
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
2. Crea un nuevo **Backend** conectado a este repositorio.
3. En la pestaña **Settings -> Domains**, agrega `oralab.cl`.

### 3. DNS en Cloudflare
Para `oralab.cl`, configura los registros CNAME apuntando al host de Firebase:
1. Crea un CNAME para `@` apuntando a `studio-7816109963-74959.web.app`.
2. Crea un CNAME para `www` apuntando a `studio-7816109963-74959.web.app`.
3. **IMPORTANTE**: Mantén la **Nube Gris** (DNS Only) hasta que Firebase active el SSL.

---
© 2024 Oralab Clinical Lab.# oralab
