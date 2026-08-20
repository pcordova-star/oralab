
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado.

## Estado del Proyecto
- **Protocolos Clínicos 2017**: Implementados intervalos fijos de 30 minutos para todos los tests. 4 muestras para SIBO (90 min) y 7 muestras para Intolerancias (180 min), cumpliendo con el Consenso Norteamericano.
- **Asistente con Alarma**: El asistente interactivo en casa ahora incluye una **alarma sonora** automática al cumplirse los tiempos de espera.
- **Trazabilidad Clínica**: El panel administrativo permite ver la **Bitácora de Tiempos** exacta de cada soplido realizado por el paciente.
- **Administración Segmentada**: Dashboard dividido en **Área Clínica** (para TENS) y **Gestión Estratégica** (para Dirección).
- **Logística Home Kit**: Los pacientes declaran una "Dirección de Retiro" específica para el motoboy.
- **Agendamiento**: Sistema de bloqueo dinámico de fechas para mañana y gestión de reagendamiento integrada.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:
```bash
git add .
git commit -m "Oralab: Protocolos de 30 min, alarmas sonoras y trazabilidad clínica"
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
