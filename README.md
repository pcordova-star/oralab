
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado para el diagnóstico de SIBO e Intolerancias Alimentarias.

## Estado del Proyecto
- **Lanzamiento Septiembre 2026**: El sistema de agendamiento está configurado para iniciar operaciones el 1 de septiembre de 2026.
- **Bloqueos de Agenda**: Septiembre 2026 y la primera semana de Octubre 2026 están marcados como ocupados para la marcha blanca.
- **Pipeline B2B (CRM)**: Nueva sección administrativa en `/admin/crm` para gestión de prospectos y convenios institucionales.
- **Alianza Cybersalud**: Integración en el Home para seguimiento médico de pacientes.
- **Asistente TENS**: Panel de control multi-paciente con cronómetros y alarmas de seguridad.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:
```bash
git add .
git commit -m "Oralab: Implementación Pipeline Estratégico y ajustes de agenda"
git push
```

### Solución a error "Invalid username or token"
Si al hacer `git push` recibes un error de autenticación, es porque GitHub ya no acepta tu contraseña normal. Debes usar un **Personal Access Token (PAT)**:

1. Ve a GitHub: **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
2. Genera un nuevo token con permisos de `repo`.
3. Cuando la terminal te pida la contraseña, pega el **Token** generado en lugar de tu clave habitual.

---
## Configuración de Correos (Trigger Email Extension)
Para que las confirmaciones de reserva lleguen a los pacientes, la extensión en Firebase Console debe configurarse así:

- **Colección**: `mail`
- **Authentication Type**: `Username & Password`
- **SMTP URI**: `smtps://control%40pcgoperacion.com:jsvfmrifbtqmlzye@smtp.gmail.com:465`
- **Use secure OAuth2 connection?**: **NO**
- **From Address**: `contacto@oralab.cl`

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
