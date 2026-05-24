# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado para el diagnóstico de SIBO, IMO y otras condiciones digestivas.

## Tecnologías Utilizadas
- **Next.js 15** (App Router)
- **Firebase App Hosting** (Despliegue dinámico)
- **Firestore** (Base de datos en tiempo real)
- **Genkit** (IA para generación de instrucciones de preparación)
- **Tailwind CSS & ShadCN UI** (Interfaz moderna y profesional)

## Guía de Publicación (Hosting)

### 1. GitHub
Para subir los cambios a este repositorio:
```bash
git add .
git commit -m "Oralab: Actualización de configuración y reglas"
git push origin main
```

### 2. Configuración de Dominio (Cloudflare)
Si usas Cloudflare para `oralab.cl`, configura los registros CNAME apuntando al host de Firebase que aparece en tu consola de **App Hosting** (ej: `studio-xxxx.web.app`). Asegúrate de:
1. Usar **CNAME Flattening** en el registro `@`.
2. Mantener la **Nube Gris** (DNS Only) hasta que Firebase active el certificado SSL.

## Administración
El panel de administración está disponible en `/login` para el personal autorizado. Permite gestionar el flujo de pacientes (Llegada, Inicio de Test, Finalización).

---
© 2024 Oralab Clinical Lab.