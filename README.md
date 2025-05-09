# Sistema de Gestión Vecinal

Este repositorio contiene el desarrollo del sistema de software correspondiente al proyecto de la asignatura **Ingeniería de Software**. El objetivo es construir una solución digital que mejore la comunicación, gestión y participación vecinal, atendiendo las necesidades específicas de la Junta de Vecinos y su directiva.

## 📌 Objetivo General

Desarrollar una solución de software que permita mejorar la comunicación, gestión y participación vecinal, satisfaciendo las necesidades planteadas por la junta de vecinos y su directiva.

## 🎯 Objetivos Específicos

- Analizar y documentar los requerimientos funcionales y no funcionales mediante entrevistas y encuestas.
- Diseñar y programar funcionalidades que optimicen la gestión vecinal.
- Crear una interfaz accesible considerando distintos niveles de alfabetización digital.
- Validar el sistema con vecinos reales a través de pruebas funcionales y de usabilidad.
- Implementar una simulación de producción para asegurar el correcto funcionamiento del software.

## ✅ Requisitos Funcionales

1. **Gestión del padrón de vecinos**  
   Permite registrar, modificar y eliminar vecinos. Algunas acciones requieren aprobación del/la President@.

2. **Gestión de reuniones**  
   Agenda reuniones, notifica a vecinos, registra actas y asistencia mediante token único.

3. **Gestión financiera**  
   Registro de ingresos y egresos por el/la Tesorer@, con visualización de cuotas por parte de los vecinos.

4. **Postulación a proyectos**  
   El/la Secretari@ gestiona convocatorias de postulación, que deben ser aprobadas antes de ser visibles. Los vecinos pueden postular cargando documentos.

5. **Difusión de información**  
   El/la President@ publica noticias o comunicados visibles para todos los vecinos.

## ⚙️ Requisitos No Funcionales

- **Usabilidad**: Interfaz amigable para personas con bajo dominio computacional.
- **Accesibilidad**: Sistema web responsive, usable desde navegador y móvil.
- **Seguridad**: Roles diferenciados y protección de datos personales.
- **Disponibilidad**: Al menos 95% de uptime mensual.
- **Exportación de datos**: Posibilidad de exportar reportes en PDF y Excel.

---

Desarrollado por el Grupo 1 – Ingeniería Civil en Informática, Universidad.



## Tecnologías

Este proyecto utiliza el stack **PERN**, que incluye las siguientes tecnologías:

### PostgreSQL

- **Descripción**: Sistema de gestión de bases de datos relacional y objeto.
- **Uso en el Proyecto**: Se utiliza para almacenar y gestionar datos de usuarios y otros datos de la aplicación.
- **Enlace**: [PostgreSQL](https://www.postgresql.org/)

### Express.js

- **Descripción**: Framework minimalista para Node.js que facilita la creación de aplicaciones web y APIs.
- **Uso en el Proyecto**: Se utiliza para construir la API del Backend, gestionando rutas y solicitudes HTTP.
- **Enlace**: [Express.js](https://expressjs.com/)

### React

- **Descripción**: Biblioteca de JavaScript para construir interfaces de usuario.
- **Uso en el Proyecto**: Se utiliza para construir la interfaz de usuario del Frontend, proporcionando una experiencia interactiva y dinámica.
- **Enlace**: [React](https://reactjs.org/)

### Node.js

- **Descripción**: Entorno de ejecución para JavaScript en el lado del servidor.
- **Uso en el Proyecto**: Se utiliza para ejecutar el código del Backend y manejar la lógica del servidor.
- **Enlace**: [Node.js](https://nodejs.org/)

### Otros Recursos y Librerías

- **Passport.js**: Middleware de autenticación para Node.js.
  - **Enlace**: [Passport.js](http://www.passportjs.org/)
- **bcrypt.js**: Biblioteca para el hashing de contraseñas.
  - **Enlace**: [bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- **dotenv**: Carga variables de entorno desde un archivo `.env`.
  - **Enlace**: [dotenv](https://www.npmjs.com/package/dotenv)

Estas tecnologías y herramientas forman la base de la aplicación y permiten su funcionamiento de forma correcta.
