const { Console } = require("console");

async function CreateTables(pool) {
    try{
const Createusers = 
`CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    login_name VARCHAR(100),
    email_users VARCHAR(100) CHECK (
        email_users LIKE '%@mail.ru' OR
        email_users LIKE '%@gmail.com' OR
        email_users LIKE '%@yandex.ru' OR
        email_users LIKE '%@outlook.com' OR
        email_users LIKE '%@bk.ru' OR
        email_users LIKE '%@inbox.ru' OR
        email_users LIKE '%@rambler.ru'
    ),
    password_hash VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255) NOT NULL
)`;

const Createfloors = 
`CREATE TABLE floors (
    floor_number INTEGER PRIMARY KEY NOT NULL,
    map_image_url VARCHAR(255) NOT NULL
)`;

const Createlocations = 
`CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    room VARCHAR(100) NOT NULL, 
    floor_number INTEGER NOT NULL REFERENCES floors(floor_number) ON DELETE CASCADE ON UPDATE CASCADE
)`;

const Createteachers = 
`CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    position VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    location_id INTEGER REFERENCES locations(location_id) ON DELETE SET NULL,
    name_teacher VARCHAR(100) NOT NULL 
)`;

const Createroles = 
`CREATE TABLE roles (
    user_id INTEGER REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    role_name BOOLEAN NOT NULL DEFAULT FALSE
)`;

const Createrooms = `
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE ON UPDATE CASCADE,    
    room_number VARCHAR(15) NOT NULL,
    room_url VARCHAR(255) NOT NULL,
    UNIQUE (room_number, location_id)
)`;

const Createfaq = `
CREATE TABLE faq (
    faq_id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL 
)`;

const Createadministration = `
CREATE TABLE administration (
    administration_id SERIAL PRIMARY KEY,
    name_administration VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    location_id INTEGER REFERENCES locations(location_id) ON DELETE SET NULL
)`;

const Createacontacts = `
CREATE TABLE contacts (
    contacts_id INTEGER PRIMARY KEY REFERENCES administration(administration_id) ON DELETE CASCADE ON UPDATE CASCADE,
    phone_number VARCHAR(20),
    administration_email VARCHAR(100) CHECK (
        administration_email LIKE '%@mail.ru' OR
        administration_email LIKE '%@gmail.com' OR
        administration_email LIKE '%@yandex.ru' OR
        administration_email LIKE '%@outlook.com' OR
        administration_email LIKE '%@bk.ru' OR
        administration_email LIKE '%@inbox.ru' OR
        administration_email LIKE '%@rambler.ru'
    )
)`;

const Createaclubs = `
CREATE TABLE clubs (
    club_id SERIAL PRIMARY KEY,
    name_clubs VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    contact_info VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    location_id INTEGER REFERENCES locations(location_id) ON DELETE CASCADE ON UPDATE CASCADE
)`;

const Createaquestions =
`CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    is_closed BOOLEAN NULL DEFAULT FALSE
)`;

const Createanswers = `
CREATE TABLE answers (
    answer_id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_solution BOOLEAN NOT NULL DEFAULT FALSE
)`;

await pool.query(Createusers)
console.log('users created')

await pool.query(Createfloors)
console.log('floors created')

await pool.query(Createlocations)
console.log('locations created')

await pool.query(Createteachers)
console.log('teachers created')

await pool.query(Createroles)
console.log('roles created')

await pool.query(Createrooms)
console.log('rooms created')

await pool.query(Createfaq)
console.log('users created')

await pool.query(Createadministration)
console.log('administration Created')

await pool.query(Createacontacts)
console.log('contacts Created')

await pool.query(Createaclubs)
console.log('clubs Created')

await pool.query(Createaquestions)
console.log('questions Created')

await pool.query(Createanswers)
console.log('answers Created')
    } catch (error){
        console.error('Error Created', error.message)
    }
}

module.exports = CreateTables;