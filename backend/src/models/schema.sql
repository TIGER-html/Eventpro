-- Table des utilisateurs (Client, Organisateur, Prestataire, Administrateur)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'client',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des événements
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    expected_guests INTEGER DEFAULT 0,
    max_budget NUMERIC(12,2) DEFAULT 0,
    theme_color VARCHAR(20),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des invités
CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    rsvp_status VARCHAR(20) DEFAULT 'pending',
    table_number INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des prestataires
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(12,2),
    rating NUMERIC(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table de liaison événement / prestataire (contrats)
CREATE TABLE event_providers (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    agreed_price NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des dépenses (budget)
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(150),
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);