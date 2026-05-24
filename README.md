# OralabFlow - Guía de Publicación y Dominio .cl

Esta aplicación está construida con Next.js y configurada para funcionar en **Firebase App Hosting**.

## Configuración de Dominio en Cloudflare (Recomendado)

Si estás usando Cloudflare para gestionar tu dominio de NIC Chile, sigue estos pasos para que Firebase valide tu sitio correctamente:

### 1. Configurar el Dominio Raíz (oralab.cl)
1. En el panel de DNS de Cloudflare, haz clic en **Add record**.
2. **Tipo**: `A`
3. **Nombre**: `@`
4. **IPv4**: [La dirección IP que te entrega Firebase Console]
5. **Proxy status**: **DNS Only** (Nube GRIS). *Es vital que esté gris durante la validación inicial.*

### 2. Configurar el Subdominio (www.oralab.cl)
1. Si ya existe un registro CNAME para `www`, haz clic en **Edit**.
2. Asegúrate de que apunte al host de Firebase (ej: `studio-XXXX.firebaseapp.com`).
3. **Proxy status**: **DNS Only** (Nube GRIS).

### 3. Verificación
- Una vez configurados ambos en nube gris, vuelve a la consola de Firebase.
- El estado debería cambiar de "Pending" a "Verifying" y finalmente a **"Active"**.
- Una vez que el sitio esté **Active** y el certificado SSL (candado) funcione, puedes volver a Cloudflare y activar el Proxy (Nube Naranja) si deseas mayor seguridad y caché.

---

## Desarrollo Local
Para correr el proyecto localmente:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:9002`.
