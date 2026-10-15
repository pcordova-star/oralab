# Oralab - Salud Digestiva Avanzada

Este es el repositorio oficial de **Oralab**, un laboratorio clínico especializado en tests de aire espirado para el diagnóstico de SIBO e Intolerancias Alimentarias.

## Estado del Proyecto
- **Lanzamiento Septiembre 2026**: El sistema de agendamiento está configurado para iniciar operaciones el 1 de septiembre de 2026.
- **Bloqueos de Agenda**: Todo Septiembre 2026 y la primera semana de Octubre 2026 están marcados como ocupados.
- **Pipeline B2B (CRM)**: Nueva sección administrativa en `/admin/crm` para gestión de prospectos y seguimiento comercial.
- **Alianza Cybersalud**: Integración en el Home para seguimiento médico post-examen.

## Comandos Git para la Terminal
Para guardar y subir tus avances, utiliza esta secuencia:

```bash
git add .
git commit -m "Oralab: Limpieza de seguridad y actualización de pipeline"
git push
```

### Solución al error de autenticación
Si el comando `git push` falla por credenciales, configura tu token de forma segura ejecutando esto en la terminal (reemplaza `<TOKEN>` por tu token real):

```bash
git remote set-url origin https://<TOKEN>@github.com/pcordova-star/oralab.git
```

**Importante:** Nunca guardes el token dentro de archivos de texto que subas al repositorio.

---
© 2024 Oralab Clinical Lab. Tecnología Sunvou®.