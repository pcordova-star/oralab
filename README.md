
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado para el diagnóstico de SIBO e Intolerancias Alimentarias.

## Estado del Proyecto
- **Lanzamiento Septiembre 2026**: El sistema de agendamiento ha sido configurado para iniciar operaciones oficialmente el 1 de septiembre de 2026. 
- **Bloqueos de Agenda**: Septiembre 2026 y la primera semana de Octubre 2026 están marcados como ocupados para permitir la marcha blanca institucional.
- **Protocolos Clínicos 2017**: Implementados intervalos fijos de 30 minutos para todos los tests. 4 muestras para SIBO (90 min) y 7 muestras para Intolerancias (180 min), cumpliendo estrictamente con el Consenso Norteamericano.
- **Pipeline Estratégico (CRM)**: Nueva sección administrativa para la gestión de prospectos B2B (Sunvou) y convenios institucionales con tablero Kanban y bitácora de seguimiento.
- **Asistente de Alta Seguridad**: El asistente domiciliario incluye **alarma sonora en loop**, vibración háptica y **Wake Lock API** para evitar que el móvil se suspenda.
- **Trazabilidad Clínica**: El panel administrativo permite ver la **Bitácora de Tiempos** exacta de cada soplido realizado por el paciente para validación de resultados.
- **Administración Segmentada**: Dashboard unificado dividido en **Área Clínica** (para personal TENS) y **Gestión Estratégica** (CRM Sunvou e Inversores).

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:
```bash
git add .
git commit -m "Oralab: Implementación Pipeline Estratégico y formulario de prospectos"
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
