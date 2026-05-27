
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado de Configuración DNS (Verificado)

La configuración en Cloudflare es **CORRECTA**. El sitio está listo para la validación de Firebase.

### Registros DNS Configurados:
1. **Registro A**: `oralab.cl` -> `35.219.200.4` (**DNS Only / Nube Gris**)
2. **CNAME _acme-challenge**: Para validación SSL de Google (**DNS Only / Nube Gris**)
3. **CNAME www**: Redirección a dominio principal (**DNS Only / Nube Gris**)
4. **TXT fah-claim**: Validación de propiedad para App Hosting (**DNS Only**)

## Guía de Desarrollo

Para guardar y subir los cambios realizados en el proyecto, utiliza los siguientes comandos:

```bash
# 1. Preparar los archivos
git add .

# 2. Crear un commit con las mejoras realizadas
git commit -m "Mejoras en el Home: Animaciones avanzadas, visualizador de informe técnico y narrativa clínica para pacientes"

# 3. Subir al repositorio
git push origin main
```

## Características Recientes
- **Home de Alta Fidelidad**: Implementación de animaciones con Framer Motion y diseño moderno (Glassmorphism).
- **Enfoque Clínico**: Narrativa equilibrada entre el rigor técnico (Sunvou®) y la educación al paciente.
- **Visualizador de Informe**: Gráfico interactivo de biomarcadores (H2, CH4, H2S) para demostración técnica.
- **Resumen PDF**: Funcionalidad de descarga de indicaciones pre-cita generadas con IA.

---
© 2024 Oralab Clinical Lab.
