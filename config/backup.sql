-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS his_db;
USE his_db;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'medico', 'enfermero', 'recepcionista') NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50)
);

-- Tabla de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    genero ENUM('M', 'F', 'O') NOT NULL,
    fecha_nac DATE NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    contacto_emergencia VARCHAR(100),
    historial_medico TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Salas
CREATE TABLE IF NOT EXISTS salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ala VARCHAR(50) NOT NULL,
    numero_sala VARCHAR(20) NOT NULL UNIQUE,
    capacidad INT NOT NULL CHECK (capacidad >= 1)
);

-- Tabla de Camas
CREATE TABLE IF NOT EXISTS camas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_cama INT NOT NULL CHECK (numero_cama >= 1),
    estado ENUM('Disponible', 'Ocupada', 'En Limpieza') NOT NULL DEFAULT 'Disponible',
    restriccion_genero ENUM('M', 'F', 'Ninguno') NOT NULL DEFAULT 'Ninguno',
    sala_id INT NOT NULL,
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE
);

-- Tabla de Admisiones
CREATE TABLE IF NOT EXISTS admisiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_admision ENUM('Programada', 'Emergencia', 'Derivada') NOT NULL,
    estado ENUM('Activo', 'Cancelado', 'Dados de Alta') NOT NULL DEFAULT 'Activo',
    motivo TEXT,
    motivo_alta TEXT,
    paciente_id INT NOT NULL,
    cama_id INT NOT NULL,
    fecha_admision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (cama_id) REFERENCES camas(id) ON DELETE CASCADE
);

-- Tabla de Evaluaciones de Enfermería
CREATE TABLE IF NOT EXISTS evaluaciones_enfermeria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    signos_vitales VARCHAR(255) NOT NULL,
    sintomas TEXT NOT NULL,
    plan_cuidado TEXT NOT NULL,
    admision_id INT NOT NULL,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admision_id) REFERENCES admisiones(id) ON DELETE CASCADE
);

-- Tabla de Evaluaciones Médicas
CREATE TABLE IF NOT EXISTS evaluaciones_medicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnostico TEXT NOT NULL,
    tratamiento TEXT NOT NULL,
    seguimiento TEXT,
    admision_id INT NOT NULL,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admision_id) REFERENCES admisiones(id) ON DELETE CASCADE
);

-- Tabla de Turnos
CREATE TABLE IF NOT EXISTS turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    estado ENUM('pendiente', 'atendido', 'cancelado', 'internacion_pendiente') NOT NULL DEFAULT 'pendiente',
    motivo VARCHAR(255),
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
