const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Educational institution navigation system',
            version: '1.0.0',
            description: 'API для управления образовательным учреждением'
        },
        servers: [{
            url: `http://localhost:${process.env.PORT || 5000}`,
            description: 'Development server'
        }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                // Пользователи
                User: {
                    type: 'object',
                    properties: {
                        user_id: { 
                            type: 'integer',
                            example: 1
                        },
                        login_name: { 
                            type: 'string',
                            nullable: true,
                            example: 'john_doe'
                        },
                        email_users: { 
                            type: 'string',
                            format: 'email',
                            nullable: true,
                            example: 'user@mail.ru'
                        },
                        password_hash: { 
                            type: 'string',
                            example: 'hashed_password'
                        },
                        photo_url: { 
                            type: 'string',
                            format: 'uri',
                            example: '/images/users/user1.jpg'
                        }
                    }
                },
                // Этажи
                Floor: {
                    type: 'object',
                    properties: {
                        floor_number: { 
                            type: 'integer',
                            example: 1
                        },
                        map_image_url: { 
                            type: 'string',
                            format: 'uri',
                            example: '/maps/floor1.jpg'
                        }
                    }
                },
                // Комнаты
                Room: {
                    type: 'object',
                    properties: {
                        room_number: { 
                            type: 'string',
                            example: '101'
                        },
                        room_url: { 
                            type: 'string',
                            format: 'uri',
                            example: '/rooms/101.jpg'
                        }
                    }
                },
                // Локации
                Location: {
                    type: 'object',
                    properties: {
                        location_id: { 
                            type: 'integer',
                            example: 1
                        },
                        description: { 
                            type: 'string',
                            example: 'Главный корпус, первый этаж'
                        },
                        room_number: { 
                            type: 'string',
                            example: '101'
                        },
                        floor_number: { 
                            type: 'integer',
                            example: 1
                        }
                    }
                },
                // Преподаватели
                Teacher: {
                    type: 'object',
                    properties: {
                        teacher_id: { 
                            type: 'integer',
                            example: 1
                        },
                        position: { 
                            type: 'string',
                            example: 'Профессор'
                        },
                        photo_url: { 
                            type: 'string',
                            format: 'uri',
                            example: '/teachers/teacher1.jpg'
                        },
                        location_id: { 
                            type: 'integer',
                            nullable: true,
                            example: 1
                        },
                        name_teacher: { 
                            type: 'string',
                            example: 'Иванов Иван Иванович'
                        }
                    }
                },
                // Роли
                Role: {
                    type: 'object',
                    properties: {
                        user_id: { 
                            type: 'integer',
                            example: 1
                        },
                        role_name: { 
                            type: 'boolean',
                            example: true
                        }
                    }
                },
                // FAQ
                FAQ: {
                    type: 'object',
                    properties: {
                        faq_id: { 
                            type: 'integer',
                            example: 1
                        },
                        question: { 
                            type: 'string',
                            example: 'Как найти кабинет директора?'
                        },
                        answer: { 
                            type: 'string',
                            example: 'Кабинет директора находится на втором этаже, комната 201'
                        },
                        category: { 
                            type: 'string',
                            example: 'Навигация'
                        }
                    }
                },
                // Администрация
                Administration: {
                    type: 'object',
                    properties: {
                        administration_id: { 
                            type: 'integer',
                            example: 1
                        },
                        name_administration: { 
                            type: 'string',
                            example: 'Петрова Мария Сергеевна'
                        },
                        position: { 
                            type: 'string',
                            example: 'Директор'
                        },
                        photo_url: { 
                            type: 'string',
                            format: 'uri',
                            example: '/administration/director.jpg'
                        },
                        location_id: { 
                            type: 'integer',
                            nullable: true,
                            example: 1
                        }
                    }
                },
                // Контакты
                Contact: {
                    type: 'object',
                    properties: {
                        contacts_id: { 
                            type: 'integer',
                            example: 1
                        },
                        phone_number: { 
                            type: 'string',
                            nullable: true,
                            example: '+7 (999) 123-45-67'
                        },
                        administration_email: { 
                            type: 'string',
                            format: 'email',
                            nullable: true,
                            example: 'director@mail.ru'
                        }
                    }
                },
                // Клубы
                Club: {
                    type: 'object',
                    properties: {
                        club_id: { 
                            type: 'integer',
                            example: 1
                        },
                        name_clubs: { 
                            type: 'string',
                            example: 'IT Клуб'
                        },
                        description: { 
                            type: 'string',
                            example: 'Клуб для любителей программирования'
                        },
                        contact_info: { 
                            type: 'string',
                            example: 'it_club@mail.ru'
                        },
                        image_url: { 
                            type: 'string',
                            format: 'uri',
                            example: '/clubs/it_club.jpg'
                        },
                        location_id: { 
                            type: 'integer',
                            nullable: true,
                            example: 1
                        }
                    }
                },
                // Вопросы
                Question: {
                    type: 'object',
                    properties: {
                        question_id: { 
                            type: 'integer',
                            example: 1
                        },
                        user_id: { 
                            type: 'integer',
                            example: 1
                        },
                        title: { 
                            type: 'string',
                            example: 'Как записаться в клуб?'
                        },
                        text: { 
                            type: 'string',
                            example: 'Хочу записаться в IT клуб, куда обращаться?'
                        },
                        created_at: { 
                            type: 'string',
                            format: 'date-time',
                            example: '2023-10-01T12:00:00Z'
                        },
                        is_closed: { 
                            type: 'boolean',
                            example: false
                        }
                    }
                },
                // Ответы
                Answer: {
                    type: 'object',
                    properties: {
                        answer_id: { 
                            type: 'integer',
                            example: 1
                        },
                        question_id: { 
                            type: 'integer',
                            example: 1
                        },
                        user_id: { 
                            type: 'integer',
                            example: 2
                        },
                        text: { 
                            type: 'string',
                            example: 'Обратитесь к руководителю клуба в кабинет 305'
                        },
                        created_at: { 
                            type: 'string',
                            format: 'date-time',
                            example: '2023-10-01T14:00:00Z'
                        },
                        is_solution: { 
                            type: 'boolean',
                            example: true
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Users',
                description: 'Управление пользователями'
            },
            {
                name: 'Auth',
                description: 'Аутентификация и авторизация'
            },
            {
                name: 'Room',
                description: 'Управление комнатами'
            },
            {
                name: 'Floor',
                description: 'Управление этажами'
            },
            {
                name: 'Locations',
                description: 'Управление локациями'
            },
            {
                name: 'Teachers',
                description: 'Управление преподавателями'
            },
            {
                name: 'FAQ',
                description: 'Часто задаваемые вопросы'
            },
            {
                name: 'Administration',
                description: 'Управление администрацией'
            },
            {
                name: 'Contact',
                description: 'Контакты администрации'
            },
            {
                name: 'Clubs',
                description: 'Управление кружками'
            },
            {
                name: 'Questions',
                description: 'Вопросы'
            },
            {
                name: 'Answer',
                description: 'Ответы'
            }
        ]
    },
    apis: ['./routes/*.js', './controllers/*.js'],
};

// http://localhost:5000/api-docs
const swaggerSpec = swaggerJSDoc(options);

const swaggerOptions = {
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui {
        color: #333;
    }
    .swagger-ui .info h2 {
        color: #2c3e50;
    }
    .swagger-ui .btn {
        background: #3498db;
        border-color: #3498db;
    }
    .swagger-ui .btn:hover {
        background: #2980b9;
    }
    .swagger-ui .opblock.opblock-get {
        background: rgba(97, 175, 254, 0.1);
        border-color: #0080ffff;
    }
    .swagger-ui .opblock.opblock-post {
        background: rgba(73, 204, 144, 0.1);
        border-color: #00ff00ff;
    }
    .swagger-ui .opblock.opblock-put {
        background: rgba(252, 161, 48, 0.1);
        border-color: #ffbb00ff;
    }
    .swagger-ui .opblock.opblock-delete {
        background: rgba(249, 62, 62, 0.1);
        border-color: #720e0eff;
    }
    .swagger-ui * {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .swagger-ui .information-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }`,
    customSiteTitle: 'Educational Institution API Documentation',
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
    }
};

module.exports = {
    swaggerSpec,
    swaggerUi,
    swaggerOptions
};