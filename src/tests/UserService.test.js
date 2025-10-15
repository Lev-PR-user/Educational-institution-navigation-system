const UserService = require('../services/UserService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/UserRepository', () => ({
    findByEmail: jest.fn(),
    findById: jest.fn(), 
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/UserValidator', () => ({
    validateRegistrationData: jest.fn(),
    validateLoginData: jest.fn(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

jest.mock('bcryptjs', () => ({}));

// Теперь импортируем моки
const UserRepository = require('../repositories/UserRepository');
const UserValidator = require('../validators/UserValidator');
const jwt = require('jsonwebtoken');

describe('UserService', () => {
    let userService;
    
    const mockUser = {
        user_id: 1,
        email_users: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
    };

    const originalEnv = process.env;

    beforeEach(() => {
        userService = new UserService();
        process.env = { ...originalEnv };
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('register', () => {
        const validUserData = {
            email_users: 'newuser@example.com',
            password_hash: 'password123', 
            first_name: 'New',
            last_name: 'User'
        };

        it('should register a new user successfully', async () => {
            // Arrange
            UserValidator.validateRegistrationData.mockReturnValue(true);
            UserRepository.findByEmail.mockResolvedValue(null);
            UserValidator.hashPassword.mockResolvedValue('hashed_password');
            UserRepository.create.mockResolvedValue(mockUser);

            // Act
            const result = await userService.register(validUserData);

            // Assert
            expect(UserValidator.validateRegistrationData).toHaveBeenCalledWith(validUserData);
            expect(UserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email_users);
            expect(UserValidator.hashPassword).toHaveBeenCalledWith('password123');
            expect(UserRepository.create).toHaveBeenCalledWith({
                ...validUserData,
                password_hash: 'hashed_password'
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user already exists', async () => {
            // Arrange
            UserValidator.validateRegistrationData.mockReturnValue(true);
            UserRepository.findByEmail.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(userService.register(validUserData))
                .rejects
                .toThrow('Registration failed: User already exists');
            
            expect(UserValidator.hashPassword).not.toHaveBeenCalled();
            expect(UserRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            UserValidator.validateRegistrationData.mockImplementation(() => {
                throw new Error('Invalid email format');
            });

            // Act & Assert
            await expect(userService.register(validUserData))
                .rejects
                .toThrow('Registration failed: Invalid email format');
            
            expect(UserRepository.findByEmail).not.toHaveBeenCalled();
            expect(UserValidator.hashPassword).not.toHaveBeenCalled();
            expect(UserRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const validLoginData = {
            email_users: 'test@example.com',
            password_hash: 'password123'
        };

        it('should login user successfully', async () => {
            // Arrange
            UserValidator.validateLoginData.mockReturnValue(true);
            UserRepository.findByEmail.mockResolvedValue(mockUser);
            UserValidator.validatePassword.mockResolvedValue(true);
            process.env.JWT_SECRET = 'test_jwt_secret';
            jwt.sign.mockReturnValue('mock_jwt_token');

            // Act
            const result = await userService.login(validLoginData);

            // Assert
            expect(UserValidator.validateLoginData).toHaveBeenCalledWith(validLoginData);
            expect(UserRepository.findByEmail).toHaveBeenCalledWith(validLoginData.email_users);
            expect(UserValidator.validatePassword).toHaveBeenCalledWith(
                'password123',
                'hashed_password'
            );
            expect(jwt.sign).toHaveBeenCalledWith(
                { user_id: mockUser.user_id },
                'test_jwt_secret',
                { expiresIn: '1h' }
            );
            expect(result).toEqual({
                token: 'mock_jwt_token',
                user: {
                    user_id: mockUser.user_id,
                    email_users: mockUser.email_users
                }
            });
        });

        it('should use default secret when JWT_SECRET is not set', async () => {
            // Arrange
            UserValidator.validateLoginData.mockReturnValue(true);
            UserRepository.findByEmail.mockResolvedValue(mockUser);
            UserValidator.validatePassword.mockResolvedValue(true);
            delete process.env.JWT_SECRET;
            jwt.sign.mockReturnValue('mock_jwt_token');

            // Act
            const result = await userService.login(validLoginData);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                { user_id: mockUser.user_id },
                'default_secret',
                { expiresIn: '1h' }
            );
        });

        it('should throw error when user not found', async () => {
            // Arrange
            UserValidator.validateLoginData.mockReturnValue(true);
            UserRepository.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.login(validLoginData))
                .rejects
                .toThrow('Login failed: User not found');
            
            expect(UserValidator.validatePassword).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('should throw error when password is invalid', async () => {
            // Arrange
            UserValidator.validateLoginData.mockReturnValue(true);
            UserRepository.findByEmail.mockResolvedValue(mockUser);
            UserValidator.validatePassword.mockResolvedValue(false);

            // Act & Assert
            await expect(userService.login(validLoginData))
                .rejects
                .toThrow('Login failed: Invalid password');
            
            expect(jwt.sign).not.toHaveBeenCalled();
        });
    });

    describe('getProfile', () => {
        it('should return user profile successfully', async () => {
            // Arrange
            UserRepository.findById.mockResolvedValue(mockUser);

            // Act
            const result = await userService.getProfile(1);

            // Assert
            expect(UserRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found', async () => {
            // Arrange
            UserRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.getProfile(999))
                .rejects
                .toThrow('User not found');
        });
    });

    describe('updateProfile', () => {
        const updateData = {
            first_name: 'Updated',
            last_name: 'Name'
        };

        const updateDataWithPassword = {
            ...updateData,
            password_hash: 'newpassword123'
        };

        it('should update user profile without password', async () => {
            // Arrange
            const updatedUser = { ...mockUser, ...updateData };
            UserRepository.update.mockResolvedValue(updatedUser);

            // Act
            const result = await userService.updateProfile(1, updateData);

            // Assert
            expect(UserRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual(updatedUser);
        });

        it('should update user profile with password hashing', async () => {
            // Arrange
            UserValidator.hashPassword.mockResolvedValue('hashed_new_password');
            const updatedUser = { 
                ...mockUser, 
                ...updateData,
                password_hash: 'hashed_new_password'
            };
            UserRepository.update.mockResolvedValue(updatedUser);

            // Act
            const result = await userService.updateProfile(1, updateDataWithPassword);

            // Assert
            expect(UserValidator.hashPassword).toHaveBeenCalledWith('newpassword123');
            expect(UserRepository.update).toHaveBeenCalledWith(1, {
                ...updateData,
                password_hash: 'hashed_new_password'
            });
            expect(result.password_hash).toBe('hashed_new_password');
        });

        it('should throw error when user not found during update', async () => {
            // Arrange
            UserRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.updateProfile(999, updateData))
                .rejects
                .toThrow('User not found');
        });
    });

    describe('deleteProfile', () => {
        it('should delete user profile successfully', async () => {
            // Arrange
            UserRepository.findById.mockResolvedValue(mockUser);
            UserRepository.delete.mockResolvedValue(true);

            // Act
            const result = await userService.deleteProfile(1);

            // Assert
            expect(UserRepository.findById).toHaveBeenCalledWith(1);
            expect(UserRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when user not found for deletion', async () => {
            // Arrange
            UserRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.deleteProfile(999))
                .rejects
                .toThrow('User not found');
        });
    });
});