# OralabFlow - Guía de Publicación y Dominio .cl

Esta aplicación está construida con Next.js y configurada para funcionar en **Firebase App Hosting**.

## Cómo conectar tu dominio .cl (NIC Chile)

Para que tu sitio sea accesible desde `www.tudominio.cl`, sigue estos pasos:

### 1. Obtener los registros de Firebase
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Selecciona tu proyecto.
3. En el menú de la izquierda, ve a **Build** > **Hosting** (o **App Hosting** si estás usando el nuevo servicio).
4. Haz clic en el botón **"Añadir dominio personalizado"**.
5. Ingresa tu dominio (ej: `oralab.cl`).
6. Firebase realizará una verificación. Al final, te mostrará una tabla con:
   - **Tipo**: A
   - **Host**: @ (o en blanco)
   - **Valor**: (Una dirección IP como `199.36.158.100`)

### 2. Configurar en NIC Chile
1. Inicia sesión en [NIC Chile](https://www.nic.cl/).
2. Ve a **"Mis Dominios"** y haz clic en tu dominio `.cl`.
3. Dirígete a la sección **"Configuración Técnica"**.
4. **IMPORTANTE**: NIC Chile tiene dos formas de configurar:
   - **Servidores de Nombre (DNS)**: Si usas un servicio externo como Cloudflare o un Hosting compartido.
   - **Configuración de DNS (Registros A, CNAME, etc.)**: Esta es la que necesitas si vas a apuntar directamente a Firebase.
5. Si no ves la opción de agregar registros A, es posible que debas habilitar el servicio de DNS gratuito de NIC Chile o usar un proveedor intermedio.
6. Agrega los dos registros **Tipo A** con las IPs que te entregó Firebase.

### 3. Esperar la Propagación
- Una vez guardados los cambios en NIC Chile, los DNS pueden tardar desde **algunos minutos hasta 48 horas** en propagarse globalmente.
- Firebase generará automáticamente un certificado **SSL (HTTPS)** gratuito para tu dominio una vez que detecte que los registros son correctos.

---

## Desarrollo Local
Para correr el proyecto localmente:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:9002`.
