
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Despliegue (Firebase App Hosting)

Si ves el error **"Backend Not Found"**, no te preocupes. Significa que el DNS ya apunta a Google, pero Firebase aún está procesando el certificado SSL o el primer "Rollout".

### Pasos para Activar el Sitio:
1. **Push al repositorio**: Ejecuta los comandos de Git de abajo.
2. **Revisar Rollouts**: Entra a [Firebase Console](https://console.firebase.google.com/) -> App Hosting -> Tu Backend -> **Rollouts**. Asegúrate de que la versión actual esté "Published".
3. **Validación de Dominio**: En la pestaña **Settings -> Domains**, el estado debe decir **Active**.

## Guía de Desarrollo (Comandos Git)

Para subir las últimas mejoras (Home animado, visualizador técnico y estadísticas clínicas), ejecuta:

```bash
# 1. Preparar los archivos
git add .

# 2. Crear un commit con las mejoras realizadas
git commit -m "Mejoras finales Home: Animaciones tecnológicas, visualizador de informe técnico y narrativa clínica para pacientes"

# 3. Subir al repositorio (Esto activará automáticamente una nueva versión en App Hosting)
git push origin main
```

## Características de la Versión Actual
- **Home de Alta Fidelidad**: Animaciones avanzadas con Framer Motion (Tech Scanner y Bio-blobs).
- **Enfoque Clínico**: Narrativa que equilibra el rigor técnico (Sunvou®) con la educación al paciente recién diagnosticado.
- **Visualizador de Informe**: Gráfico interactivo de biomarcadores (H2, CH4, H2S) para interpretación médica.
- **Estadísticas Educativas**: Sección para pacientes sobre prevalencia de SIBO e intolerancias.

---
© 2024 Oralab Clinical Lab.
