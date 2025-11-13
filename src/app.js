const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const CreateTables = require('./config/Setup');
dotenv.config();

const { setup, container } = require('./di-setup');
const { swaggerSpec, swaggerUi, swaggerOptions } = require('./config/Swagger');

// Импорт функций создания роутов
const createUserRoutes = require('./routes/UserRoutes');
const createTeacherRoutes = require('./routes/teacherRoutes');
const createAdministrationRoutes = require('./routes/administrationRoutes');
const createFaqRoutes = require('./routes/faqRoutes');
const createClubsRoutes = require('./routes/clubsRoutes');
const createContactsRoutes = require('./routes/contactsRoutes');
const createQuestionsRoutes = require('./routes/questionsRoutes');
const createAnswersRoutes = require('./routes/answersRoutes');
const createRoomRoutes = require('./routes/roomRoutes');
const createLocationRoutes = require('./routes/locationRoutes');
const createFloorsRoutes = require('./routes/floorsRoutes');

setup();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.get('/', (req, res) => {
  res.json({
    message: 'University Navigation API',
    endpoints: {
      users: '/api/user',
      teachers: '/api/teachers',
      administration: '/api/administration',
      faqs: '/api/faqs',
      clubs: '/api/clubs',
      contacts: '/api/contacts',
      answers: '/api/answers',
      questions: '/api/questions',
      rooms: '/api/rooms',
      locations: '/api/locations',
      floors: '/api/floors'
    }
  });
});

app.use('/api/user', createUserRoutes(
  container.resolve('userController'), 
  container.resolve('authMiddleware')
));

app.use('/api/teachers', createTeacherRoutes(
  container.resolve('teachersController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.use('/api/administration', createAdministrationRoutes(
  container.resolve('administrationController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.use('/api/faqs', createFaqRoutes(
  container.resolve('faqController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.use('/api/clubs', createClubsRoutes(
  container.resolve('clubsController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.use('/api/contacts', createContactsRoutes(
  container.resolve('contactsController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.use('/api/answers', createAnswersRoutes(
  container.resolve('answersController'), 
  container.resolve('authMiddleware')
));

app.use('/api/questions', createQuestionsRoutes(
  container.resolve('questionsController'), 
  container.resolve('authMiddleware')
));

app.use('/api/rooms', createRoomRoutes(
  container.resolve('roomsController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.use('/api/locations', createLocationRoutes(
  container.resolve('locationsController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.use('/api/floors', createFloorsRoutes(
  container.resolve('floorsController'), 
  container.resolve('authMiddleware'),
  container.resolve('checkAdmin')
));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

async function initializeApp() {
  try {
    await CreateTables(pool) 
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Error initializing app:', error.message);
    process.exit(1);
  }
}

initializeApp();