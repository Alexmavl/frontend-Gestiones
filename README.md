# 📂 Sistema de Gestión de Expedientes (Frontend)

Este es el **frontend** del sistema de gestión de expedientes, desarrollado con **React + TypeScript + Tailwind CSS**.  
Se conecta con el backend disponible en el repositorio [`project-root`](https://github.com/Alexmavl/project-root).

---

## 🚀 Tecnologías utilizadas

- ⚛️ **React** (Vite + TypeScript)
- 🎨 **Tailwind CSS**
- 🛠 **Heroicons** (para iconografía)
- 🔒 **Auth Context + Hooks personalizados**
- 🍬 **SweetAlert2** (para alertas amigables)
- 🔗 Conexión a **API REST (Node.js + SQL Server)** del repo [`project-root`](https://github.com/Alexmavl/project-root)

---

## 📦 Requisitos previos

Antes de empezar asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) 

---

## ⚙️ Instalación y configuración

1. **Clona este repositorio**
   ```bash
   git clone https://github.com/usuario/frontend-expedientes.git
   cd frontend-expedientes
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto y define la URL de la API:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Ejecuta en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Build para producción**
   ```bash
   npm run build
   ```

---

## 🔗 Relación con el backend

Este frontend **depende del repositorio API** [`project-root`](https://github.com/Alexmavl/project-root.git), el cual expone los endpoints que consume la aplicación.

Para que funcione correctamente:

1. Inicia primero el servidor de la API (`project-root`) en `http://localhost:3000`.
2. Luego arranca el frontend.
3. Ambos proyectos deben ejecutarse en paralelo.

---


---

## 📄 Imagenes

## Inicio de Sesión
![alt text](/public/Imagen/Login.png)

Este proyecto fue desarrollado por mvasquez.

## Inicio Para técnico

![alt text](/public/Imagen/InicioTecnico.png)
## Listado de Expedientes 
Contiene boton de agregar nuevo expediente, funcionalidad de activar y editar.
![alt text](/public/Imagen/ListaExpedienteTecnico.png)

## Modulo para crear expediente
![alt text](/public/Imagen/CrearExpediente.png)

## Alert para desactivar expediente 

![alt text](/public/Imagen/ActivoExpediente.png)

## Modal para Editar
![alt text](/public/Imagen/EditarExpediente.png)

## Busqueda de indicios por expediente

![alt text](/public/Imagen/ListadoIndicio.png)

## Activar y Desactivar indicios

![alt text](/public/Imagen/ActivarIndicio.png)

## Editar Indicio

![alt text](/public/Imagen/EditarIndicio.png)

## Crear Indicio
![alt text](/public/Imagen/CrearIndicio.png)

## Inicio para Coordinador 
![alt text](/public/Imagen/InicioCo.png)

## Listado de Expediente para Aprobar y Rechazar

![alt text](/public/Imagen/Aprobar.png)

## Alerta para aprobar Expediente

![alt text](/public/Imagen/AprobarExpediente.png)

## Alerta para Rechazar con su justificación

![alt text](/public/Imagen/RechazarExpediente.png)

## Listado de Usuarios

![alt text](/public/Imagen/Usuarios.png)