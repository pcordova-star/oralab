
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado del Proyecto
- **Protocolo SIBO**: Implementado asistente interactivo para test en casa con protocolo optimizado de 90 minutos y 4 muestras.
- **Trazabilidad Clínica**: El panel administrativo ahora permite ver la **Bitácora de Tiempos** exacta de cada soplido realizado por el paciente en su hogar.
- **Administración Segmentada**: Dashboard dividido en **Área Clínica** (para TENS) y **Gestión Estratégica** (para Dirección).
- **Logística Home Kit**: Los pacientes declaran una "Dirección de Retiro" específica para el motoboy.
- **Seguridad**: Header administrativo simplificado (solo Logo y Cerrar Sesión) para evitar distracciones operativas.
- **Agendamiento**: Sistema de bloqueo dinámico de fechas y gestión de reagendamiento integrada en la ficha del paciente.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:
```bash
git add .
git commit -m "Oralab: Dashboard segmentado, trazabilidad de muestras y header administrativo limpio"
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
