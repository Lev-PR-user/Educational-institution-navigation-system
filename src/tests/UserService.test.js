const UserService = require('../services/UserService');

// Мокаем внешние зависимости
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

jest.mock('bcryptjs', () => ({}));

describe('UserService', () => {
    let userService;
    let mockValidator;
    let mockRepository;
    let jwt;
    
    const mockUser = {
        user_id: 1,
        email_users: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
    };

    const originalEnv = process.env;

    beforeEach(() => {
        // Создаем моки для зависимостей
        mockValidator = {
            validateRegistrationData: jest.fn(),
            validateLoginData: jest.fn(),
            hashPassword: jest.fn(),
            validatePassword: jest.fn()
        };

        mockRepository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        // Импортируем jwt после мока
        jwt = require('jsonwebtoken');

        // Создаем экземпляр сервиса с передачей зависимостей
        userService = new UserService({
            userValidator: mockValidator,
            userRepository: mockRepository
        });

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
            mockValidator.validateRegistrationData.mockReturnValue(true);
            mockRepository.findByEmail.mockResolvedValue(null);
            mockValidator.hashPassword.mockResolvedValue('hashed_password');
            mockRepository.create.mockResolvedValue(mockUser);

            // Act
            const result = await userService.register(validUserData);

            // Assert
            expect(mockValidator.validateRegistrationData).toHaveBeenCalledWith(validUserData);
            expect(mockRepository.findByEmail).toHaveBeenCalledWith(validUserData.email_users);
            expect(mockValidator.hashPassword).toHaveBeenCalledWith('password123');
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...validUserData,
                password_hash: 'hashed_password'
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user already exists', async () => {
            // Arrange
            mockValidator.validateRegistrationData.mockReturnValue(true);
            mockRepository.findByEmail.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(userService.register(validUserData))
                .rejects
                .toThrow('Registration failed: User already exists');
            
            expect(mockValidator.hashPassword).not.toHaveBeenCalled();
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateRegistrationData.mockImplementation(() => {
                throw new Error('Invalid email format');
            });

            // Act & Assert
            await expect(userService.register(validUserData))
                .rejects
                .toThrow('Registration failed: Invalid email format');
            
            expect(mockRepository.findByEmail).not.toHaveBeenCalled();
            expect(mockValidator.hashPassword).not.toHaveBeenCalled();
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const validLoginData = {
            email_users: 'test@example.com',
            password_hash: 'password123'
        };

        it('should login user successfully', async () => {
            // Arrange
            mockValidator.validateLoginData.mockReturnValue(true);
            mockRepository.findByEmail.mockResolvedValue(mockUser);
            mockValidator.validatePassword.mockResolvedValue(true);
            process.env.JWT_SECRET = 'test_jwt_secret';
            jwt.sign.mockReturnValue('mock_jwt_token');

            // Act
            const result = await userService.login(validLoginData);

            // Assert
            expect(mockValidator.validateLoginData).toHaveBeenCalledWith(validLoginData);
            expect(mockRepository.findByEmail).toHaveBeenCalledWith(validLoginData.email_users);
            expect(mockValidator.validatePassword).toHaveBeenCalledWith(
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
            mockValidator.validateLoginData.mockReturnValue(true);
            mockRepository.findByEmail.mockResolvedValue(mockUser);
            mockValidator.validatePassword.mockResolvedValue(true);
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
            mockValidator.validateLoginData.mockReturnValue(true);
            mockRepository.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.login(validLoginData))
                .rejects
                .toThrow('Login failed: User not found');
            
            expect(mockValidator.validatePassword).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('should throw error when password is invalid', async () => {
            // Arrange
            mockValidator.validateLoginData.mockReturnValue(true);
            mockRepository.findByEmail.mockResolvedValue(mockUser);
            mockValidator.validatePassword.mockResolvedValue(false);

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
            mockRepository.findById.mockResolvedValue(mockUser);

            // Act
            const result = await userService.getProfile(1);

            // Assert
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found', async () => {
            // Arrange
            mockRepository.findById.mockResolvedValue(null);

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
            mockRepository.update.mockResolvedValue(updatedUser);

            // Act
            const result = await userService.updateProfile(1, updateData);

            // Assert
            expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual(updatedUser);
        });

        it('should update user profile with password hashing', async () => {
            // Arrange
            mockValidator.hashPassword.mockResolvedValue('hashed_new_password');
            const updatedUser = { 
                ...mockUser, 
                ...updateData,
                password_hash: 'hashed_new_password'
            };
            mockRepository.update.mockResolvedValue(updatedUser);

            // Act
            const result = await userService.updateProfile(1, updateDataWithPassword);

            // Assert
            expect(mockValidator.hashPassword).toHaveBeenCalledWith('newpassword123');
            expect(mockRepository.update).toHaveBeenCalledWith(1, {
                ...updateData,
                password_hash: 'hashed_new_password'
            });
            expect(result.password_hash).toBe('hashed_new_password');
        });

        it('should throw error when user not found during update', async () => {
            // Arrange
            mockRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.updateProfile(999, updateData))
                .rejects
                .toThrow('User not found');
        });
    });

    describe('deleteProfile', () => {
        it('should delete user profile successfully', async () => {
            // Arrange
            mockRepository.findById.mockResolvedValue(mockUser);
            mockRepository.delete.mockResolvedValue(true);

            // Act
            const result = await userService.deleteProfile(1);

            // Assert
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when user not found for deletion', async () => {
            // Arrange
            mockRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.deleteProfile(999))
                .rejects
                .toThrow('User not found');
        });
    });
});