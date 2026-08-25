#  Mi Bolsillo - Personal Finance Management App

> **Estado del proyecto:** En desarrollo activo 

Una aplicación web full-stack moderna para la administración y control de finanzas personales, construida con arquitectura limpia y enfocada en buenas prácticas de backend.

---

## Tecnologías Utilizadas

### **Backend**
* **Framework:** NestJS (TypeScript)
* **Base de Datos & ORM:** PostgreSQL con Prisma ORM
* **Caché & Sesiones:** Redis
* **Almacenamiento Cloud:** Cloudflare R2 (S3 compatible)
* **Autenticación:** JWT (Access & Refresh Tokens) + Google OAuth 2.0
* **Emails:** Resend API

### **Frontend**
* **Framework:** Angular (TypeScript)
* **Estilos:** Tailwind CSS

### **DevOps & Infraestructura**
* **Contenedorización:** Docker & Docker Compose
* **Control de Versiones:** Git & GitHub

---

##  Características (Implementadas y en progreso)

* **Autenticación Segura:** Sistema de inicio de sesión tradicional y mediante Google OAuth con doble token.
* **Gestión de Transacciones:** Control de ingresos y gastos *(en desarrollo)*.
* **Optimización con Redis:** Caché para mejorar el rendimiento.
* **Almacenamiento en la Nube:** Subida de archivos con Cloudflare R2.
* **Notificaciones por Correo:** Envío de correos mediante Resend.
* **Entorno Contenedorizado:** Despliegue rápido mediante Docker Compose.

---

## Guía de Instalación y Ejecución Local

Asegúrate de tener instalado **Docker** y **Docker Compose**.

### 1. Clonar el repositorio
```bash
git clone [https://github.com/PerdomeroDev11/my-pocket-app.git](https://github.com/PerdomeroDev11/my-pocket-app.git)
cd my-pocket-app