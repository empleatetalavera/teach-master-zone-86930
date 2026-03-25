
-- Delete old incorrect formative units for module 1784
DELETE FROM formative_units WHERE module_id = '01343969-4edb-4381-81a0-93e2829549bd';

-- Insert correct 6 formative units
INSERT INTO formative_units (module_id, title, description, order_index, is_active) VALUES
('01343969-4edb-4381-81a0-93e2829549bd', 'UD1. Condiciones previas y facilitadoras del aprendizaje', 'Condiciones previas y facilitadoras del aprendizaje en acciones formativas', 1, true),
('01343969-4edb-4381-81a0-93e2829549bd', 'UD2. Cohesión grupal, participación y funcionamiento', 'Cohesión grupal, participación y funcionamiento en contextos formativos', 2, true),
('01343969-4edb-4381-81a0-93e2829549bd', 'UD3. Comunicación en contextos formativos', 'Comunicación en contextos formativos', 3, true),
('01343969-4edb-4381-81a0-93e2829549bd', 'UD4. Estrategias metodológicas y diseño de sesiones', 'Estrategias metodológicas y diseño de sesiones formativas', 4, true),
('01343969-4edb-4381-81a0-93e2829549bd', 'UD5. Bases psicopedagógicas del aprendizaje', 'Bases psicopedagógicas del aprendizaje', 5, true),
('01343969-4edb-4381-81a0-93e2829549bd', 'UD6. Supervisión, atención individual y gestión de situaciones complejas', 'Supervisión, atención individual y gestión de situaciones complejas', 6, true);
