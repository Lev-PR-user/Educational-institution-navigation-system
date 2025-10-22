const jwt = require('jsonwebtoken');

class UserService {
    constructor({ userValidator, userRepository }) {
        this.userValidator = userValidator;
        this.userRepository = userRepository;
    }

    async register(userData) {
        try {
            this.userValidator.validateRegistrationData(userData);
            
            const existingUser = await this.userRepository.findByEmail(userData.email_users);
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await this.userValidator.hashPassword(userData.password_hash);
            userData.password_hash = hashedPassword;

            const user = await this.userRepository.create(userData);

            return user;
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    async login(loginData) {
        try {
            this.userValidator.validateLoginData(loginData);

            const user = await this.userRepository.findByEmail(loginData.email_users);
            if (!user) {
                throw new Error('User not found');
            }

            const isValidPassword = await this.userValidator.validatePassword(
                loginData.password_hash, 
                user.password_hash
            );

            if (!isValidPassword) {
                throw new Error('Invalid password');
            }

            const token = jwt.sign(
                { user_id: user.user_id },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '1h' }
            );

            return {
                token,
                user: {
                    user_id: user.user_id,
                    email_users: user.email_users
                }
            };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    async getProfile(user_id) {
        const user = await this.userRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateProfile(user_id, updateData) {
        if (updateData.password_hash) {
            updateData.password_hash = await this.userValidator.hashPassword(updateData.password_hash);
        }

        const updatedUser = await this.userRepository.update(user_id, updateData);
        if (!updatedUser) {
            throw new Error('User not found');
        }

        return updatedUser;
    }

    async deleteProfile(user_id) {
        const user = await this.userRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.delete(user_id);
        return true;
    }
}

module.exports = UserService;