
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado del Proyecto
- **Agendamiento**: Implementado con cálculo automático de tarifas: $80.000 en laboratorio y $100.000 a domicilio. Descuentos del 15% para Fonasa/Isapre.
- **CRM de Ventas**: Sistema de cotizaciones Sunvou con catálogo integrado. Aplicado **descuento automático del 15%** en sensores de Hidrógeno, Metano y Sulfuro.
- **Mensajería**: Se eliminó el aviso de envío de correo en el éxito de reserva hasta que el sistema de mail esté operativo.
- **Administración**: Panel de recepción con vista de calendario mensual y filtrado diario de pacientes. Corregidos errores de importación de íconos.
- **Convenios**: Página dedicada para alianzas institucionales y captación de médicos especialistas.
- **IA**: Escaneo opcional de órdenes médicas para pre-selección de exámenes (Lactulosa, Fructosa, Lactosa). Robot de chat desactivado temporalmente.
- **Logística**: Integración de tiempos críticos (6 horas) y retiro presencial de kits en Apoquindo 3990.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:
```bash
git add .
git commit -m "Oralab: Descuento 15% sensores CRM, corrección de íconos y actualización de precios"
git push
```

## Configuración de Correos (Trigger Email Extension)
Para que las confirmaciones de reserva lleguen a los pacientes, la extensión en Firebase Console debe configurarse así:

- **Colección**: `mail`
- **Authentication Type**: `Username & Password`
- **SMTP URI**: `smtps://control%40pcgoperacion.com:jsvfmrifbtqmlzye@smtp.gmail.com:465`
- **Use secure OAuth2 connection?**: **NO** (Debe estar en No para que funcione la autenticación por contraseña).
- **From Address**: `contacto@oralab.cl`

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
