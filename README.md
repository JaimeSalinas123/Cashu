# ⚡ Cashu: Tu Vida, Centralizada

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Cashu** es un ecosistema web *All-in-One* creado para unificar la productividad, la salud y las finanzas personales en un solo lugar. Adiós al cambio constante entre aplicaciones; hola a un dashboard modular y minimalista que se adapta exactamente a lo que necesitas en tu día a día.

---

## 🎯 Características Principales

🧩 **Dashboard Modular Dinámico:** Un panel de control central donde tú decides qué herramientas ver. Activa o desactiva módulos con un clic para mantener un espacio de trabajo libre de distracciones.

📊 **Finanzas Inteligentes:** 
Lleva el control absoluto de tus ingresos y gastos. Cuenta con gestión de pagos recurrentes y un sistema visual de "Metas de Ahorro" que calcula matemáticamente tu progreso.

🥑 **Tracking de Nutrición Avanzado:** 
Un contador de calorías súper completo. Visualiza tus macros (Proteínas, Carbohidratos, Grasas) en barras de progreso dinámicas, guarda tus alimentos frecuentes y recibe retroalimentación automática de tu estado (Déficit, Mantenimiento o Superávit) según tu actividad diaria.

📆 **Calendario Inmersivo (Drag & Drop):** 
Una cuadrícula mensual a pantalla completa. Crea *Post-its* de colores para tus tareas y reorganízalos simplemente arrastrándolos y soltándolos con el ratón.

🔔 **Motor de Alertas Globales:** 
No importa en qué parte de la app estés, el sistema de recordatorios trabaja en segundo plano para enviarte notificaciones (*Toasts*) 1 día, 1 hora y 20 minutos antes de tus compromisos importantes.

📝 **Agenda Enriquecida:** 
Un diario personal equipado con un editor de texto nativo que permite dar formato (negritas, colores, listas) y auto-guardado inteligente.

---

## 🛠️ Stack Tecnológico

<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=ts,nextjs,react,supabase,postgres,tailwind,vscode" alt="Tech Stack Cashu" />
  </a>
</p>

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS.
* **Backend:** Next.js Server Actions (Mutaciones directas y seguras).
* **BaaS & Autenticación:** Supabase, PostgreSQL.
* **Diseño:** SVG nativos, Google Fonts (Manrope), UI "Mobile-First".

---

## 🛡️ Bajo el Capó (Arquitectura y Seguridad)

Este proyecto no solo se enfoca en verse bien, sino en funcionar de manera robusta y segura:

* **Privacidad Absoluta (RLS):** La base de datos está blindada con políticas de *Row Level Security* en PostgreSQL. Es criptográficamente imposible que un usuario acceda, lea o modifique los registros financieros o de salud de otro usuario.
* **Optimistic UI & Server Actions:** Aprovechando las últimas capacidades de Next.js, las interacciones no dependen de APIs lentas. La app reacciona instantáneamente en pantalla mientras las *Server Actions* validan y guardan los datos en segundo plano.
* **Interacciones Nativas:** El editor de texto enriquecido y el sistema *Drag & Drop* del calendario fueron construidos desde cero utilizando la API de HTML5 y manipulaciones directas del DOM, garantizando un rendimiento óptimo sin inflar el proyecto con librerías pesadas.

---

## 💡 Demo en Vivo

Prueba la fluidez y modularidad de la plataforma creando una cuenta gratuita:

👉 **[Visitar Cashu en Vercel](#)** *(Nota: Agrega aquí tu link real)*
