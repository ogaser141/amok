# 🟢 AmOK — Aprende Inglés con Inteligencia

Plataforma de aprendizaje de inglés con **repetición espaciada SRS**, niveles **CEFR A1-C2** y diseño esmeralda.

---

## 🛠️ Stack tecnológico (todo gratis)

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Next.js 14** | Framework principal de React |
| **Supabase** | Base de datos PostgreSQL + Autenticación |
| **Tailwind CSS** | Estilos con diseño esmeralda |
| **Vercel** | Deploy automático y hosting |
| **SM-2 SRS** | Algoritmo de repetición espaciada (como Anki) |

---

## 🚀 Pasos para publicar AmOK

### ✅ PASO 1 — Configurar Supabase (base de datos + login)

**¿Qué es Supabase?** Es donde se guardarán todos los datos de los usuarios y su progreso.

1. Ve a **[supabase.com](https://supabase.com)** e inicia sesión
2. Haz clic en **"New Project"**
3. Elige un nombre (ej: `amok`) y una contraseña segura → clic en **"Create new project"**
4. Espera 1-2 minutos mientras se crea
5. Ve al menú izquierdo → **SQL Editor** → **"New query"**
6. Abre el archivo `supabase/migrations/001_amok_schema.sql` de este proyecto
7. Copia **todo** el contenido y pégalo en el editor
8. Haz clic en el botón verde **"Run"**
9. Deberías ver `Success. No rows returned` ✅

**Obtener tus claves secretas:**
- Ve a ⚙️ **Settings** → **API** (menú izquierdo)
- Copia el valor de **"Project URL"** → lo necesitarás en el Paso 3
- Copia el valor de **"anon public"** → lo necesitarás en el Paso 3

**Activar login con Google (opcional pero recomendado):**
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto → "APIs & Services" → "Credentials" → "OAuth 2.0 Client ID"
3. En "Authorized redirect URIs" escribe: `https://TU_PROYECTO_ID.supabase.co/auth/v1/callback`
4. Copia el **Client ID** y **Client Secret**
5. En Supabase: **Authentication** → **Providers** → **Google** → actívalo y pega las claves

---

### ✅ PASO 2 — Subir el código a GitHub

**¿Por qué GitHub?** Vercel se conecta a GitHub para publicar automáticamente cada vez que cambias algo.

1. Ve a **[github.com](https://github.com)** y crea un repositorio nuevo llamado `amok`
2. Asegúrate de que sea **público** (o privado si prefieres)
3. Abre una terminal en la carpeta del proyecto y escribe:

```bash
git init
git add .
git commit -m "AmOK - primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/amok.git
git push -u origin main
```

4. Refresca GitHub — deberías ver todos los archivos ✅

---

### ✅ PASO 3 — Publicar en Vercel

**¿Qué es Vercel?** Es donde vive la app en internet. Cada vez que hagas un push a GitHub, Vercel la actualiza automáticamente.

1. Ve a **[vercel.com](https://vercel.com)** e inicia sesión con tu cuenta de GitHub
2. Haz clic en **"Add New..."** → **"Project"**
3. Busca el repositorio `amok` y haz clic en **"Import"**
4. Antes de hacer deploy, ve a **"Environment Variables"** y agrega estas 3 variables:

   | Nombre | Valor |
   |--------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | La URL que copiaste en el Paso 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave anon que copiaste en el Paso 1 |
   | `NEXT_PUBLIC_SITE_URL` | Déjalo vacío por ahora, lo llenarás después |

5. Haz clic en **"Deploy"** 🚀
6. Espera ~2 minutos. Vercel te dará una URL como: `https://amok-xxx.vercel.app`
7. Copia esa URL

**Último paso importante:**
- Vuelve a Vercel → tu proyecto → **Settings** → **Environment Variables**
- Edita `NEXT_PUBLIC_SITE_URL` y pon tu URL de Vercel (ej: `https://amok.vercel.app`)
- Ve a Vercel → **Deployments** → haz clic en los 3 puntos → **"Redeploy"**

**Configurar Supabase para aceptar tu URL:**
- En Supabase → **Authentication** → **URL Configuration**
- **Site URL**: `https://amok.vercel.app` (tu URL de Vercel)
- **Redirect URLs**: `https://amok.vercel.app/auth/callback`
- Haz clic en **"Save"**

---

### ✅ PASO 4 — Probar la app

1. Abre tu URL de Vercel en el navegador
2. Haz clic en **"Crear cuenta gratis"**
3. Regístrate con Google o con correo
4. Deberías ver el dashboard con los niveles A1-C2
5. Haz clic en **"Comenzar a estudiar"** y elige un nivel
6. ¡Empieza a aprender! 🎉

---

### 💻 Desarrollo local (en tu computadora)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
cp .env.local.example .env.local

# 3. Editar .env.local con tus claves de Supabase
# (abre el archivo y reemplaza los valores)

# 4. Iniciar el servidor de desarrollo
npm run dev

# 5. Abre en el navegador
# http://localhost:3000
```

---

## 📁 Estructura del proyecto

```
amok/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page (página de inicio)
│   │   ├── auth/
│   │   │   ├── login/               # Pantalla de inicio de sesión
│   │   │   ├── signup/              # Pantalla de registro
│   │   │   ├── forgot-password/     # Recuperar contraseña
│   │   │   └── callback/            # Manejo de OAuth (Google/GitHub)
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Panel principal con niveles y stats
│   │   └── learn/
│   │       └── page.tsx             # Sesión de estudio con SRS
│   ├── components/
│   │   ├── layout/DashboardNav.tsx  # Barra de navegación
│   │   └── learn/LearnClient.tsx   # Motor del juego de repetición
│   ├── lib/
│   │   ├── supabase/               # Clientes de Supabase
│   │   ├── srs.ts                  # Algoritmo SM-2
│   │   ├── content.ts              # Contenido educativo A1-B2
│   │   └── utils.ts                # Funciones de utilidad
│   └── types/database.ts           # Tipos TypeScript
├── supabase/migrations/            # Script SQL de la base de datos
├── public/manifest.json            # PWA (instalar como app)
├── .env.local.example              # Plantilla de variables de entorno
└── README.md                       # Esta guía
```

---

## ✨ Características de AmOK

- 🔐 **Login completo** — Google, GitHub y Email/Password con recuperación de contraseña
- 🧠 **Algoritmo SM-2** — El mismo que usa Anki, implementado desde cero
- 📊 **Niveles A1 → B2** — 80 tarjetas con vocabulario real en contexto
- 🎮 **3 tipos de ejercicios** — Flashcard volteada, completar espacios, opción múltiple
- 🔊 **Pronunciación nativa** — Síntesis de voz en inglés americano
- 🔥 **Racha diaria + XP** — Sistema de gamificación para mantener el hábito
- ☁️ **Progreso en la nube** — Guardado automático en Supabase
- 📱 **PWA instalable** — Funciona como app en cualquier dispositivo
- 🟢 **Diseño esmeralda** — Limpio, moderno y fácil de leer

---

## ❓ Preguntas frecuentes

**¿Cuánto cuesta?**
Todo gratis. Supabase: gratis hasta 50,000 usuarios. Vercel: gratis para proyectos personales.

**¿Puedo agregar más vocabulario?**
Sí, edita el archivo `src/lib/content.ts` y agrega más tarjetas siguiendo el mismo formato.

**¿Funciona en el celular?**
Sí, es responsive. Además puedes instalarlo como app desde el navegador (PWA).

---

## 📝 Licencia

MIT — Libre para uso personal y comercial.
