
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado del Proyecto
- **Protocolo SIBO**: Implementado asistente interactivo para test en casa con protocolo optimizado de 90 minutos y 4 muestras.
- **Logística Home Kit**: Los pacientes ahora declaran una "Dirección de Retiro" específica para el motoboy, independiente de su residencia.
- **Administración**: Panel de recepción con **Ficha Clínica Completa**, permitiendo ver datos de contacto, direcciones de retiro y desglose financiero de cada reserva.
- **Agendamiento**: Simplificado el formulario eliminando el campo de peso y mejorando el flujo de datos personales.
- **CRM de Ventas**: Sistema Sunvou con catálogo automatizado, 15% de descuento en sensores y condiciones 70/30 de pago.
- **Convenios**: Portal activo para captación de médicos e instituciones asociadas.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:
```bash
git add .
git commit -m "Oralab: Protocolo SIBO, dirección de retiro y ficha clínica detallada"
git push
```

## Configuración de Correos (Trigger Email Extension)
Para que las confirmaciones de reserva lleguen a los pacientes, la extensión en Firebase Console debe configurarse así:

- **Colección**: `mail`
- **Authentication Type**: `Username & Password`
- **SMTP URI**: `smtps://control%40pcgoperacion.com:jsvfmrifbtqmlzye@smtp.gmail.com:465`
- **Use secure OAuth2 connection?**: **NO**
- **From Address**: `contacto@oralab.cl`

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
