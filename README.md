# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, especializado en tests de aire espirado SIBO e Intolerancias.

## Guía de Configuración Git

Para subir cambios sin errores de permisos ni bloqueos de seguridad de GitHub, sigue estos pasos:

### 1. Limpiar Configuración Antigua
Ejecuta este comando para asegurarte de que Git te pida tus credenciales actuales:
```bash
git remote set-url origin https://github.com/pcordova-star/oralab.git
```

### 2. Subir Cambios
Al ejecutar el siguiente comando, la consola solicitará tus credenciales:
- **Username:** Tu usuario de GitHub (`pcordova-star`).
- **Password:** Tu **Token Personal (Classic)**. 
  *Nota: Al pegar el token no se verán caracteres en la pantalla por seguridad.*

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
