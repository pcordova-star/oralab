
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue.

### Configuración de Dominio WWW
Actualmente, el dominio raíz `oralab.cl` está activo. Para que `www.oralab.cl` funcione:
1. Entra a **Firebase Console** -> App Hosting -> Backend -> **Configuración** -> **Dominios**.
2. Haz clic en **"Agregar un dominio personalizado"**.
3. Ingresa `www.oralab.cl` y sigue los pasos de verificación DNS.

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`
- **Configuración Inicial**: Si es la primera vez que accedes, escribe el email `admin@oralab.cl`, una contraseña (mínimo 6 caracteres) y haz clic en el botón inferior **"¿Primer acceso? Crear cuenta Admin"**.
- **Funcionalidad**: Gestión de citas, cambios de estado (Llegó, Iniciado, Completado) y eliminación de registros.

## Guía de Desarrollo (Comandos Git)

Para subir las últimas mejoras, ejecuta:

```bash
git add .
git commit -m "Admin Setup: Habilitada creación de cuenta administrativa inicial y corrección de flujos"
git push origin main
```

## Características Técnicas
- **Home de Alta Fidelidad**: Animaciones Framer Motion (Tech Scanner).
- **Informe Interactivo**: Gráfico multigas (H2, CH4, H2S) para interpretación médica.
- **Robustez Administrativa**: Ordenamiento en memoria para evitar errores de índices y validación de rol estricta.

---
© 2024 Oralab Clinical Lab.
