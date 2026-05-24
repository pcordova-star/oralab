# OralabFlow - Guía de Publicación y Dominio .cl

Esta aplicación está construida con Next.js y configurada para funcionar en **Firebase App Hosting**.

## Configuración de Dominio en Cloudflare (Guía CNAME)

Si Firebase App Hosting no te entrega una IP y en su lugar te entrega un nombre de host (ej: `xxxx-xxxx.firebaseapp.com`), sigue estos pasos en Cloudflare:

### 1. Configurar el Dominio Raíz (oralab.cl)
1. En el panel de DNS de Cloudflare, haz clic en **Add record**.
2. **Tipo**: `CNAME`
3. **Nombre**: `@` (representa a oralab.cl)
4. **Target (Objetivo)**: Pega el host que te dio Firebase (ej: `studio-XXXX.firebaseapp.com`).
5. **Proxy status**: **DNS Only** (Nube GRIS). *Cloudflare hará "CNAME Flattening" automáticamente para que funcione como dominio principal.*

### 2. Configurar el Subdominio (www.oralab.cl)
1. Haz clic en **Add record**.
2. **Tipo**: `CNAME`
3. **Nombre**: `www`
4. **Target (Objetivo)**: El mismo host de Firebase.
5. **Proxy status**: **DNS Only** (Nube GRIS).

### 3. Verificación
- Una vez configurados ambos en nube gris, vuelve a la consola de Firebase.
- El estado debería cambiar a **"Active"**. Esto puede tardar desde unos minutos hasta un par de horas.
- Una vez que veas el candado verde en tu sitio, puedes volver a Cloudflare y activar el Proxy (Nube Naranja) si lo deseas.

---

## Desarrollo Local
Para correr el proyecto localmente:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:9002`.
# oralab
