# Educational institution navigation system
 
![Логотип](https://octodex.github.com/images/orderedlistocat.png "Логотип GitHub")
 
Веб-приложение для навигации по учебному заведению с системой управления преподавателями, аудиториями и FAQ.

## Возможности

Управление пользователями: регистрация, авторизация 
Навигация по колледжу: этажи, аудитории, местоположения учителей/администрации
База данных преподавателей: полная информация о преподавательском составе
FAQ система: вопросы и ответы для студентов
Кружки и секции: информация о внеурочной деятельности

## Backend
Node.js 
Express.js 
PostgreSQL - база данных 
JWT - аутентификация
bcryptjs - для хеширования паролей 

## Структура проекта
navi-college/
    config/ 
        db.js - Подключение к БД 
        Setup.js - Инициализация таблиц
    controllers/ - Логика приложения
        UserController.js
        TeachersController.js
        ...
    middleware/ - Промежуточное ПО
        authMiddleware.js
        checkAdmin.js
    routes/ - Маршруты API
        userRoutes.js
        teacherRoutes.js
        ...
    .env - Переменные окружения
    app.js - Основной файл приложения
    package.json - Зависимости

## Структура базы данных
users - пользователи системы
roles -  роли пользователей (user/admin)
floors - этажи здания
locations - местоположения (аудитории, кабинеты)
teachers - преподаватели
administration - административный состав
questions/answers - система вопросов и ответов
faq - часто задаваемые вопросы
clubs - кружки и секции

## Установка
Скачиваем папку src открываем её в vs code
Заполняем файл .env своими данными
Открываем терминал запускаем команды: npm i или npm install (для скачивание node_modules)
Запускаем программу с помощью команды npm start или node.js