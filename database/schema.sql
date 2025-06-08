-- Esquema de Base de Datos para MediRecord Pro
-- Ejecutar en Supabase SQL Editor

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: users (Usuarios del sistema)
CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'patient', 'staff')),
    specialty VARCHAR(100),
    license_number VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    profile_picture TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: patients (Información específica de pacientes)
CREATE TABLE patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(50),
    occupation VARCHAR(100),
    blood_type VARCHAR(5),
    rh_factor VARCHAR(10),
    nationality VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_number VARCHAR(100),
    primary_doctor_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: emergency_contacts (Contactos de emergencia)
CREATE TABLE emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: vital_signs (Signos vitales)
CREATE TABLE vital_signs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    temperature DECIMAL(4,2),
    oxygen_saturation INTEGER,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    bmi DECIMAL(4,2),
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: medical_history (Historia médica)
CREATE TABLE medical_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN ('personal', 'familiar')),
    condition_type VARCHAR(100),
    condition_name VARCHAR(255) NOT NULL,
    diagnosis_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic')),
    severity VARCHAR(50) CHECK (severity IN ('mild', 'moderate', 'severe')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: allergies (Alergias)
CREATE TABLE allergies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    reaction_type VARCHAR(100),
    severity VARCHAR(50) CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
    diagnosis_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: immunizations (Vacunas)
CREATE TABLE immunizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    dose_number INTEGER,
    date_administered DATE NOT NULL,
    administered_by UUID REFERENCES users(id),
    manufacturer VARCHAR(100),
    lot_number VARCHAR(100),
    next_dose_due DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: appointments (Citas médicas)
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: medical_consultations (Consultas médicas)
CREATE TABLE medical_consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id),
    date_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consultation_type VARCHAR(100),
    chief_complaint TEXT,
    symptoms TEXT,
    physical_examination TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_date DATE,
    consultation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: prescriptions (Recetas médicas)
CREATE TABLE prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    consultation_id UUID REFERENCES medical_consultations(id),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    prescription_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: medications (Medicamentos)
CREATE TABLE medications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prescription_id UUID REFERENCES prescriptions(id),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    prescribed_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'completed')),
    reason_for_medication TEXT,
    side_effects TEXT,
    pharmacy_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: laboratory_results (Resultados de laboratorio)
CREATE TABLE laboratory_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    test_type VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    result_date DATE,
    test_results JSONB,
    reference_range TEXT,
    laboratory_name VARCHAR(255),
    ordered_by UUID REFERENCES users(id),
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: imaging_studies (Estudios de imagen)
CREATE TABLE imaging_studies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    study_type VARCHAR(255) NOT NULL,
    body_part VARCHAR(100),
    date_performed DATE NOT NULL,
    findings TEXT,
    impression TEXT,
    radiologist_id UUID REFERENCES users(id),
    ordered_by UUID REFERENCES users(id),
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: surgical_procedures (Procedimientos quirúrgicos)
CREATE TABLE surgical_procedures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    procedure_name VARCHAR(255) NOT NULL,
    date_performed DATE NOT NULL,
    surgeon_id UUID REFERENCES users(id),
    anesthesiologist_id UUID REFERENCES users(id),
    pre_op_diagnosis TEXT,
    post_op_diagnosis TEXT,
    complications TEXT,
    outcome VARCHAR(100),
    recovery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: family_history (Historia familiar)
CREATE TABLE family_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    relation VARCHAR(100) NOT NULL,
    condition VARCHAR(255) NOT NULL,
    age_at_onset INTEGER,
    status VARCHAR(50) CHECK (status IN ('alive', 'deceased')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: lifestyle_factors (Factores de estilo de vida)
CREATE TABLE lifestyle_factors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    smoking_status VARCHAR(50),
    alcohol_consumption VARCHAR(100),
    exercise_habits TEXT,
    diet_type VARCHAR(100),
    occupation_hazards TEXT,
    stress_levels VARCHAR(50),
    sleep_hours INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: mental_health (Salud mental)
CREATE TABLE mental_health (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    assessment_date DATE DEFAULT CURRENT_DATE,
    condition VARCHAR(255),
    symptoms TEXT,
    treatment TEXT,
    progress_notes TEXT,
    medication_id UUID REFERENCES medications(id),
    therapist_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: notifications (Notificaciones)
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: audit_log (Registro de auditoría)
CREATE TABLE audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_primary_doctor ON patients(primary_doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(date_time);
CREATE INDEX idx_consultations_patient ON medical_consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON medical_consultations(doctor_id);
CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_lab_results_patient ON laboratory_results(patient_id);
CREATE INDEX idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX idx_vital_signs_date ON vital_signs(date_recorded);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratory_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Política para pacientes: pueden ver su propia información
CREATE POLICY "Patients can view own data" ON patients
    FOR SELECT USING (user_id = auth.uid());

-- Política para médicos: pueden ver pacientes asignados
CREATE POLICY "Doctors can view assigned patients" ON patients
    FOR SELECT USING (
        primary_doctor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

-- Política para citas: pacientes ven sus citas, médicos ven las suyas
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
        doctor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Funciones para triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular BMI automáticamente
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.weight IS NOT NULL AND NEW.height IS NOT NULL AND NEW.height > 0 THEN
        NEW.bmi = ROUND((NEW.weight / (NEW.height * NEW.height)) * 10000, 2);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_bmi_trigger BEFORE INSERT OR UPDATE ON vital_signs
    FOR EACH ROW EXECUTE FUNCTION calculate_bmi();

-- Insertar datos de ejemplo (opcional)
-- Administrador por defecto
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000001', 'admin@medirecord.com');

INSERT INTO users (id, email, full_name, role, status) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@medirecord.com', 'Administrador Sistema', 'admin', 'active');

-- Comentarios en las tablas
COMMENT ON TABLE users IS 'Usuarios del sistema con diferentes roles';
COMMENT ON TABLE patients IS 'Información específica de pacientes';
COMMENT ON TABLE appointments IS 'Citas médicas programadas';
COMMENT ON TABLE medical_consultations IS 'Registro de consultas médicas realizadas';
COMMENT ON TABLE medications IS 'Medicamentos prescritos a pacientes';
COMMENT ON TABLE laboratory_results IS 'Resultados de estudios de laboratorio';
COMMENT ON TABLE vital_signs IS 'Signos vitales registrados';
COMMENT ON TABLE audit_log IS 'Registro de auditoría para seguimiento de cambios';
