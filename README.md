# Sistema Hospitalario HIS

## Descripción general

El Sistema Hospitalario HIS es una aplicación web diseñada para gestionar de manera integral la información y procesos de un hospital. Permite administrar pacientes, personal, admisiones, habitaciones, turnos, evaluaciones médicas y de enfermería y emergencias. El sistema está orientado a facilitar el trabajo del personal administrativo, médico y de enfermería, brindando acceso seguro y eficiente a las funcionalidades según el rol del usuario.

---

## Entidades principales (tablas)

### Usuarios (Personal)

- **id**
- **nombre**
- **apellido**
- **usuario**
- **contraseña**
- **rol** (admin, médico, enfermero, recepcionista)

### Pacientes

- **id**
- **nombre**
- **apellido**
- **dni**
- **genero**
- **fecha_nac**
- **telefono**
- **direccion**
- **contacto_emergencia**
- **historial_medico**
- **creado_en**

### Admisiones

- **id**
- **paciente_id** (FK a Pacientes)
- **cama_id** (FK a Camas)
- **tipo_admision** (Derivada, Emergencia, Programada)
- **motivo**
- **motivo_alta**
- **estado**
- **fecha_admision**

### Habitaciones 

- **id** 
- **ala**
- **numero_sala**
- **capacidad**
- **createdAt**
- **updatedAt**

### Camas

- **id**
- **numero_cama**
- **estado**
- **restriccion_genero**
- **sala_id** (FK a Habitaciones)
- **createdAt**
- **updatedAt**

### Evaluaciones Médicas

- **id**
- **admision_id** (FK a Admisiones)
- **diagnostico**
- **tratamiento**
- **seguimiento**
- **fecha_evaluacion**

### Evaluaciones de Enfermería

- **id**
- **admision_id** (FK a Admisiones)
- **signos_vitales**
- **sintomas**
- **plan_cuidado**
- **fecha_evaluacion**

### Turnos

- **id**
- **paciente_id** (FK a Pacientes)
- **fecha**
- **motivo**
- **medico_id** (FK a Usuarios)
- **estado**

---

## Funcionalidades principales

- **Autenticación y roles:** Inicio de sesión seguro y control de acceso según el rol.
- **Gestión de pacientes:** Alta, edición, baja, búsqueda y exportación a PDF de la ficha completa del paciente (incluyendo admisiones y evaluaciones).
- **Admisión y recepción:** Registro de admisiones normales y de emergencia, asignación de camas.
- **Gestión de habitaciones y camas:** Visualización y administración del estado de las camas.
- **Evaluaciones médicas y de enfermería:** Registro y edición de diagnósticos, tratamientos, signos vitales y planes de cuidado.
- **Turnos:** Gestión de turnos médicos para pacientes.
- **Emergencias:** Admisión rápida de pacientes en situación de emergencia.
- **Exportar a PDF:** Botón para exportar la ficha completa del paciente (datos personales, admisiones, evaluaciones, etc.) en formato PDF.

---

## Tecnologías utilizadas

- **Node.js + Express:** Backend y rutas.
- **Sequelize:** ORM para modelos, relaciones y consultas a MySQL.
- **MySQL:** Base de datos relacional.
- **PUG:** Motor de vistas para renderizar páginas HTML.
- **Bootstrap:** Estilos y componentes visuales.
- **PDFKit:** Generación de archivos PDF para exportar datos de pacientes.
- **dotenv:** Manejo de variables de entorno.
- **express-session:** Manejo de sesiones y autenticación.
- **bcrypt:** Encriptar las contraseñas 


---

## Cómo ejecutar el proyecto

1. **Clona este repositorio:**
   ```bash
   git clone https://github.com/YacielM/PROYECTO-WEB-2.git
   ```
2. **Ingresa al directorio del proyecto:**
   ```bash
   cd PROYECTO-WEB-2
   ```
3. **Instala las dependencias:**
   ```bash
   npm install
   ```
4. **Configura las variables de entorno:**
   - Crea un archivo `.env` en la raíz con los siguientes datos (ajusta según tu base de datos):
     ```
     DB_NAME=nombre_de_tu_bd
     DB_USER=usuario
     DB_PASSWORD=contraseña
     DB_HOST=host
     DB_PORT=puerto
     PORT=3000
     ```
5. **Inicia la aplicación:**
   ```bash
   npm start
   ```
6. **Sincroniza la  carga datos de ejemplo (opcional):**
   ```bash
   node seed/seeders.js
   ```
7. **Accede a la app en tu navegador:**
   [http://localhost:3000](http://localhost:3000)

---

## Endpoints principales

- **Inicio:** `/`
- **Pacientes:** `/pacientes`
- **Admisiones:** `/admisiones`
- **Personal:** `/personal`
- **Habitaciones:** `/habitaciones`
- **Evaluaciones de enfermería:** `/eva_enfermeria`
- **Evaluaciones médicas:** `/eva_medicas`
- **Turnos:** `/turnos`
- **Emergencia:** `/emergencia`
- **Exportar PDF de paciente:** `/pacientes/:id/exportar-pdf`

---

## Exportar PDF de paciente

En la vista de antecedentes del paciente encontrarás un botón para exportar toda la información relevante del paciente (datos personales, admisiones, evaluaciones, etc.) en formato PDF.

---

## Créditos

Desarrollado por Yaciel Muñoz para la materia Programación Web 2.

---