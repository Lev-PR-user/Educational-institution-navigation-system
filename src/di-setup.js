const awilix = require('awilix');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Импорт сервисов
const UserService = require('./services/UserService');
const AdministrationService = require('./services/AdministrationService');
const AnswerService = require('./services/AnswersService');
const ClubsService = require('./services/ClubsService');
const ContactsService = require('./services/ContactsService');
const FagService = require('./services/FaqsService');
const FloorsService = require('./services/FloorsService');
const LocationService = require('./services/LocationService');
const QuestionsService = require('./services/QuestionsService');
const RoomsService = require('./services/RoomsService');
const TeacherService = require('./services/TeachersService');

// Импорт репозиториев
const UserRepository = require('./repositories/UserRepository');
const AdministrationRepository = require('./repositories/AdministrationRepository');
const AnswerRepository = require('./repositories/AnswersRepository');
const ClubsRepository = require('./repositories/ClubsRepository');
const ContactsRepository = require('./repositories/ContactsRepository');
const FagRepository = require('./repositories/FaqsRepository');
const FloorsRepository = require('./repositories/FloorsRepository');
const LocationRepository = require('./repositories/LocationsRepository');
const QuestionsRepository = require('./repositories/QuestionsRepository');
const RoomsRepository = require('./repositories/RoomsRepository');
const TeacherRepository = require('./repositories/TeachersRepository');

// Импорт валидаторов
const UserValidator = require('./validators/UserValidator');
const AdministrationValidator = require('./validators/AdministrationValidator');
const AnswersValidator = require('./validators/AnswersValidator');
const ClubsValidator = require('./validators/ClubsValidator');
const ContactsValidator = require('./validators/ContactsValidator');
const FaqsValidator = require('./validators/FaqsValidator');
const FloorsValidator = require('./validators/FloorsValidator');
const LocationsValidator = require('./validators/LocationsValidator');
const QuestionsValidator = require('./validators/QuestionsValidator');
const RoomsValidator = require('./validators/RoomsValidator');
const TeachersValidator = require('./validators/TeachersValidator');

// Импорт контроллеров
const UserController = require('./controllers/UserController');
const AdministrationController = require('./controllers/AdministrationController');
const AnswersController = require('./controllers/AnswersController');
const ClubsController = require('./controllers/ClubsController');
const ContactsController = require('./controllers/ContactsController');
const FaqController = require('./controllers/FaqController');
const FloorsController = require('./controllers/FloorsController');
const LocationsController = require('./controllers/LocationsController');
const QuestionsController = require('./controllers/QuestionsController');
const RoomsController = require('./controllers/RoomsController');
const TeachersController = require('./controllers/TeachersController');

// Импорт middleware
const authMiddleware = require('./middleware/authMiddleware');
const checkAdmin = require('./middleware/checkAdmin');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

function setup() {
  container.register({
    // Базовые зависимости
    jwt: awilix.asValue(jwt),
    bcrypt: awilix.asValue(bcrypt),
    config: awilix.asValue(process.env),

    // Middleware
    authMiddleware: awilix.asValue(authMiddleware),
    checkAdmin: awilix.asValue(checkAdmin),

    // Сервисы
    userService: awilix.asClass(UserService),
    administrationService: awilix.asClass(AdministrationService),
    answerService: awilix.asClass(AnswerService),
    clubsService: awilix.asClass(ClubsService),
    contactsService: awilix.asClass(ContactsService),
    fagService: awilix.asClass(FagService),
    floorsService: awilix.asClass(FloorsService),
    locationService: awilix.asClass(LocationService),
    questionsService: awilix.asClass(QuestionsService),
    roomsService: awilix.asClass(RoomsService),
    teacherService: awilix.asClass(TeacherService),

    // Репозитории
    userRepository: awilix.asClass(UserRepository),
    administrationRepository: awilix.asClass(AdministrationRepository),
    answerRepository: awilix.asClass(AnswerRepository),
    clubsRepository: awilix.asClass(ClubsRepository),
    contactsRepository: awilix.asClass(ContactsRepository),
    fagRepository: awilix.asClass(FagRepository),
    floorsRepository: awilix.asClass(FloorsRepository),
    locationRepository: awilix.asClass(LocationRepository),
    questionsRepository: awilix.asClass(QuestionsRepository),
    roomsRepository: awilix.asClass(RoomsRepository),
    teacherRepository: awilix.asClass(TeacherRepository),

    // Валидаторы
    userValidator: awilix.asClass(UserValidator),
    administrationValidator: awilix.asClass(AdministrationValidator),
    answersValidator: awilix.asClass(AnswersValidator),
    clubsValidator: awilix.asClass(ClubsValidator),
    contactsValidator: awilix.asClass(ContactsValidator),
    faqsValidator: awilix.asClass(FaqsValidator),
    floorsValidator: awilix.asClass(FloorsValidator),
    locationsValidator: awilix.asClass(LocationsValidator),
    questionsValidator: awilix.asClass(QuestionsValidator),
    roomsValidator: awilix.asClass(RoomsValidator),
    teachersValidator: awilix.asClass(TeachersValidator),

    // Контроллеры
    userController: awilix.asClass(UserController),
    administrationController: awilix.asClass(AdministrationController),
    answersController: awilix.asClass(AnswersController),
    clubsController: awilix.asClass(ClubsController),
    contactsController: awilix.asClass(ContactsController),
    faqController: awilix.asClass(FaqController),
    floorsController: awilix.asClass(FloorsController),
    locationsController: awilix.asClass(LocationsController),
    questionsController: awilix.asClass(QuestionsController),
    roomsController: awilix.asClass(RoomsController),
    teachersController: awilix.asClass(TeachersController),

    // Database (если файл существует)
    // db: awilix.asValue(require('./config/db')),
  });

  return container;
}

module.exports = {
  container,
  setup,
};