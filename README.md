
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"**, significa que el DNS ya apunta a Google, pero Firebase aún está procesando el primer despliegue.

### Pasos para Activar el Sitio:
1. **Push al repositorio**: Ejecuta los comandos de Git de abajo.
2. **Revisar Rollouts**: Entra a [Firebase Console](https://console.firebase.google.com/) -> App Hosting -> Tu Backend -> **Rollouts**.
3. **Validación de Dominio**: En la pestaña **Settings -> Domains**, el estado debe decir **Active**.

## Gestión de Administrador
- **Acceso**: `/login`
- **Email Admin**: `admin@oralab.cl`
- **Funcionalidad**: Gestión de citas, cambios de estado (Llegó, Iniciado, Completado) y eliminación de registros.

## Guía de Desarrollo (Comandos Git)

Para subir las últimas mejoras de robustez y diseño, ejecuta:

```bash
# 1. Preparar los archivos
git add .

# 2. Crear un commit con las mejoras realizadas
git commit -m "Robustez de Admin: Corrección de hidratación, ordenamiento en memoria y validación de rol"

# 3. Subir al repositorio
git push origin main
```

## Características Técnicas
- **Home de Alta Fidelidad**: Animaciones Framer Motion (Tech Scanner).
- **Informe Interactivo**: Gráfico multigas (H2, CH4, H2S) para interpretación médica.
- **Consultas Optimizadas**: Ordenamiento en memoria para evitar errores de índices de Firestore.

---
© 2024 Oralab Clinical Lab.
