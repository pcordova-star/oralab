# OralabFlow - Guía de Publicación y Dominio .cl

Esta aplicación está construida con Next.js y configurada para funcionar en **Firebase App Hosting**.

## Cómo conectar tu dominio .cl (NIC Chile)

Si el panel de Firebase te da un **CNAME** o un **Registro A**, pero NIC Chile te pide **"Nombre del Servidor"**, es porque estás en la sección equivocada. Sigue estos pasos:

### 1. Entender la diferencia en NIC Chile
NIC Chile tiene dos pestañas principales en la configuración técnica de tu dominio:
- **Delegación (Servidores de Nombre)**: AQUÍ NO SE PONE EL CNAME. Esta sección pide nombres como `ns1.proveedor.com`. Solo se usa si quieres que otra empresa (como Cloudflare) maneje tus DNS.
- **Configuración de DNS (Registros A, CNAME, etc.)**: AQUÍ ES DONDE DEBES IR. Es donde puedes agregar los valores que te dio Firebase.

### 2. Pasos en el panel de NIC Chile
1. Inicia sesión en [NIC Chile](https://www.nic.cl/).
2. Haz clic en tu dominio `.cl`.
3. Busca la sección **"Configuración Técnica"**.
4. Si solo ves campos que dicen **"Nombre del servidor"**, busca un botón o enlace que diga **"Configurar DNS"** o **"Usar servidores de NIC Chile"**.
   - *Nota*: Si tu dominio está "Delegado" a otro hosting anterior, primero debes quitar esa delegación para poder editar los registros directamente en NIC.
5. Una vez habilitada la edición de registros:
   - Para el dominio raíz (`oralab.cl`): Crea un registro **Tipo A** con la IP que te dio Firebase.
   - Para el subdominio (`www.oralab.cl`): Crea un registro **Tipo CNAME** y pega el nombre de host que te dio Firebase (terminado en `.firebaseapp.com` o similar).

### 3. Opción recomendada: Cloudflare (Si NIC no te deja editar registros)
Si NIC Chile te sigue pidiendo servidores de nombre obligatoriamente y no te deja poner el CNAME:
1. Crea una cuenta gratuita en [Cloudflare](https://www.cloudflare.com/).
2. Agrega tu dominio `oralab.cl`.
3. Cloudflare te dará dos "Nombres de Servidor" (ej: `vera.ns.cloudflare.com`).
4. **Esos nombres** sí los pones en la sección de **Delegación** de NIC Chile.
5. Luego, entras a Cloudflare y allí agregas el CNAME y el Registro A que te pidió Firebase.

---

## Desarrollo Local
Para correr el proyecto localmente:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:9002`.
