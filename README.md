
# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado para el diagnóstico de SIBO e Intolerancias Alimentarias.

## Estado del Proyecto
- **Lanzamiento Septiembre 2026**: El sistema de agendamiento está configurado para iniciar operaciones el 1 de septiembre de 2026.
- **Bloqueos de Agenda**: Todo Septiembre 2026 y la primera semana de Octubre 2026 están marcados como ocupados.
- **Pipeline B2B (CRM)**: Nueva sección administrativa en `/admin/crm` para gestión de prospectos y convenios.
- **Alianza Cybersalud**: Integración en el Home para seguimiento médico de pacientes.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:
```bash
git add .
git commit -m "Oralab: Implementación Pipeline Estratégico y ajustes de agenda"
git push
```

### Solución al error "Invalid username or token"
Si el comando `git push` falla directamente sin pedirte usuario/contraseña, ejecuta estos pasos:

1. **Limpiar credenciales guardadas**:
   Ejecuta este comando para que Git olvide la contraseña antigua:
   ```bash
   git config --global --unset credential.helper
   ```

2. **Intentar subir de nuevo**:
   ```bash
   git push
   ```
   - **Username**: Escribe tu nombre de usuario de GitHub.
   - **Password**: Pega tu **Personal Access Token (PAT)** (empieza con `ghp_...`). *Nota: No verás nada al pegar, es normal.*

3. **Método Definitivo (Si lo anterior falla)**:
   Si sigue fallando, vincula el token directamente al repositorio con este comando (reemplaza `<TOKEN>` por tu código ghp_...):
   ```bash
   git remote set-url origin https://<TOKEN>@github.com/pcordova-star/oralab.git
   ```
   Luego simplemente haz:
   ```bash
   git push
   ```

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.
