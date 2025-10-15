const { DataTypes } = require("sequelize");

async function CreateTables(sequelize) {
    try {
        // Модель пользователей
        const Users = sequelize.define('users', {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'user_id'
            },
            login_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'login_name'
            },
            email_users: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'email_users',
                validate: {
                    isEmailDomain: function(value) {
                        if (value && ![
                            '@mail.ru', '@gmail.com', '@yandex.ru', 
                            '@outlook.com', '@bk.ru', '@inbox.ru', '@rambler.ru'
                        ].some(domain => value.endsWith(domain))) {
                            throw new Error('Email must be from allowed domains');
                        }
                    }
                }
            },
            password_hash: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'password_hash'
            },
            photo_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'photo_url'
            }
        }, {
            tableName: 'users',
            timestamps: false,
            underscored: true
        });

        // Модель этажей
        const Floors = sequelize.define('floors', {
            floor_number: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: 'floor_number'
            },
            map_image_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'map_image_url'
            }
        }, {
            tableName: 'floors',
            timestamps: false,
            underscored: true
        });

        // Модель комнат
        const Rooms = sequelize.define('rooms', {
            room_number: {
                type: DataTypes.STRING(15),
                primaryKey: true,
                field: 'room_number'
            },
            room_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'room_url'
            }
        }, {
            tableName: 'rooms',
            timestamps: false,
            underscored: true
        });

        // Модель локаций
        const Locations = sequelize.define('locations', {
            location_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'location_id'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'description'
            },
            room_number: {
                type: DataTypes.STRING(15),
                allowNull: false,
                field: 'room_number'
            },
            floor_number: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'floor_number'
            }
        }, {
            tableName: 'locations',
            timestamps: false,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['room_number', 'floor_number']
                }
            ]
        });

        // Модель преподавателей
        const Teachers = sequelize.define('teachers', {
            teacher_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'teacher_id'
            },
            position: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'position'
            },
            photo_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'photo_url'
            },
            location_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'location_id'
            },
            name_teacher: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'name_teacher'
            }
        }, {
            tableName: 'teachers',
            timestamps: false,
            underscored: true
        });

        // Модель ролей
        const Roles = sequelize.define('roles', {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: 'user_id'
            },
            role_name: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'role_name'
            }
        }, {
            tableName: 'roles',
            timestamps: false,
            underscored: true
        });

        // Модель FAQ
        const FAQ = sequelize.define('faq', {
            faq_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'faq_id'
            },
            question: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'question'
            },
            answer: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'answer'
            },
            category: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'category'
            }
        }, {
            tableName: 'faq',
            timestamps: false,
            underscored: true
        });

        // Модель администрации
        const Administration = sequelize.define('administration', {
            administration_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'administration_id'
            },
            name_administration: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'name_administration'
            },
            position: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'position'
            },
            photo_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'photo_url'
            },
            location_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'location_id'
            }
        }, {
            tableName: 'administration',
            timestamps: false,
            underscored: true
        });

        // Модель контактов
        const Contacts = sequelize.define('contacts', {
            contacts_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: 'contacts_id'
            },
            phone_number: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'phone_number'
            },
            administration_email: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'administration_email',
                validate: {
                    isEmailDomain: function(value) {
                        if (value && ![
                            '@mail.ru', '@gmail.com', '@yandex.ru', 
                            '@outlook.com', '@bk.ru', '@inbox.ru', '@rambler.ru'
                        ].some(domain => value.endsWith(domain))) {
                            throw new Error('Email must be from allowed domains');
                        }
                    }
                }
            }
        }, {
            tableName: 'contacts',
            timestamps: false,
            underscored: true
        });

        // Модель клубов
        const Clubs = sequelize.define('clubs', {
            club_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'club_id'
            },
            name_clubs: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'name_clubs'
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'description'
            },
            contact_info: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'contact_info'
            },
            image_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'image_url'
            },
            location_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'location_id'
            }
        }, {
            tableName: 'clubs',
            timestamps: false,
            underscored: true
        });

        // Модель вопросов
        const Questions = sequelize.define('questions', {
            question_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'question_id'
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id'
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'title'
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'text'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'created_at'
            },
            is_closed: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
                field: 'is_closed'
            }
        }, {
            tableName: 'questions',
            timestamps: false,
            underscored: true
        });

        // Модель ответов
        const Answers = sequelize.define('answers', {
            answer_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'answer_id'
            },
            question_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'question_id'
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id'
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'text'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'created_at'
            },
            is_solution: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_solution'
            }
        }, {
            tableName: 'answers',
            timestamps: false,
            underscored: true
        });

        // Определение связей между таблицами
        Users.hasOne(Roles, { foreignKey: 'user_id' });
        Roles.belongsTo(Users, { foreignKey: 'user_id' });

        Floors.hasMany(Locations, { foreignKey: 'floor_number' });
        Locations.belongsTo(Floors, { foreignKey: 'floor_number' });

        Rooms.hasMany(Locations, { foreignKey: 'room_number' });
        Locations.belongsTo(Rooms, { foreignKey: 'room_number' });

        Locations.hasMany(Teachers, { foreignKey: 'location_id' });
        Teachers.belongsTo(Locations, { foreignKey: 'location_id' });

        Locations.hasMany(Administration, { foreignKey: 'location_id' });
        Administration.belongsTo(Locations, { foreignKey: 'location_id' });

        Locations.hasMany(Clubs, { foreignKey: 'location_id' });
        Clubs.belongsTo(Locations, { foreignKey: 'location_id' });

        Administration.hasOne(Contacts, { foreignKey: 'contacts_id' });
        Contacts.belongsTo(Administration, { foreignKey: 'contacts_id' });

        Users.hasMany(Questions, { foreignKey: 'user_id' });
        Questions.belongsTo(Users, { foreignKey: 'user_id' });

        Questions.hasMany(Answers, { foreignKey: 'question_id' });
        Answers.belongsTo(Questions, { foreignKey: 'question_id' });

        Users.hasMany(Answers, { foreignKey: 'user_id' });
        Answers.belongsTo(Users, { foreignKey: 'user_id' });

        // Создание таблиц в БД
        await sequelize.sync({ force: false });
        console.log('All tables for university system created successfully');

    } catch (error) {
        console.error('Error creating tables:', error.message);
        throw error;
    }
}

module.exports = CreateTables;