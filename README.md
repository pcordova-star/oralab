
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado para el diagnóstico de SIBO e Intolerancias Alimentarias.

## Estado del Proyecto
- **Lanzamiento Septiembre 2026**: El sistema de agendamiento está configurado para iniciar operaciones el 1 de septiembre de 2026.
- **Bloqueos de Agenda**: Todo Septiembre 2026 y la primera semana de Octubre 2026 están marcados como ocupados.
- **Pipeline B2B (CRM)**: Nueva sección administrativa en `/admin/crm` para gestión de prospectos y convenios.
- **Alianza Cybersalud**: Integración en el Home para seguimiento médico de pacientes.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia en la terminal:
```bash
git add .
git commit -m "Oralab: Implementación Pipeline Estratégico y ajustes de agenda"
git push
```

### Solución al error "Invalid username or token"
GitHub ya no acepta tu contraseña normal para subir cambios desde la terminal. Debes usar un **Personal Access Token (PAT)**:

1. **Generar el Token**: Ve a GitHub > **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
2. **Permisos**: Genera uno nuevo con el permiso `repo` marcado.
3. **Copiar**: Copia el código generado (empieza con `ghp_...`).
4. **Dónde ponerlo**: 
   - Al hacer `git push`, la terminal te pedirá `Username`: Escribe tu nombre de usuario de GitHub.
   - Luego te pedirá `Password`: **Pega aquí el Token** (No verás asteriscos ni letras al pegar, es normal).
   - Presiona **Enter** y listo.

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
