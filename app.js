const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const CreateTables = require('./config/Setup');

const UserRouters = require('./routes/UserRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const administrationRoutes = require('./routes/administrationRoutes');
const faqRoutes = require('./routes/faqRoutes');
const ClubsRoutes = require('./routes/ClubsRoutes');
const ContactsRoutes = require('./routes/ContactsRoutes');
const questionsRoutes = require('./routes/questionsRoutes');
const answersRoutes = require('./routes/answersRoutes');
const roomRoutes = require('./routes/roomRoutes');
const locationRoutes = require('./routes/locationRoutes');
const floorsRoutes = require('./routes/floorsRoutes');


dotenv.config();
const app = express()
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/user', UserRouters);
app.use('/api/teachers', teacherRoutes);
app.use('/api/administration', administrationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/Clubs', ClubsRoutes);
app.use('/api/Contacts', ContactsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/floors', floorsRoutes);

async function initializeApp() { 
    try{
    await CreateTables(pool) 

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
} catch (error) {
console.error('Error initializeApp', error.message)
}
}

 initializeApp()