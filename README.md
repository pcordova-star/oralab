# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, especializado en tests de aire espirado SIBO e Intolerancias.

## Guía de Gestión de Cambios (Git)

Si encuentras errores de rechazo al subir cambios, sigue estos pasos secuenciales:

### 1. Sincronizar el repositorio local
Ejecuta este comando para traer cambios remotos y evitar conflictos de historial:
```bash
git pull origin main --rebase
```

### 2. Subir tus cambios finales
Una vez sincronizado, utiliza el comando estándar. La terminal te solicitará tu **Username** y tu **Token Personal** (como contraseña):
```bash
git add .
git commit -m "Oralab: Actualización de funcionalidades y mejoras clínicas"
git push origin main
```

---

## Estado del Proyecto
- **Lanzamiento Septiembre 2026**: Sistema configurado para iniciar el 01/09/2026.
- **Pipeline B2B**: Gestión en `/admin/crm` con selección de fecha histórica de contacto.
- **Alianza Cybersalud**: Integración en Home para seguimiento médico y validación de resultados.
- **Tecnología**: Basado en equipos Sunvou® con medición de H2, CH4 y CO2.

© 2024 Oralab Clinical Lab.