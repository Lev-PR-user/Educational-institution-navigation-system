const bcrypt = require('bcryptjs');

class UserValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@(mail\.ru|gmail\.com|yandex\.ru|outlook\.com|bk\.ru|inbox\.ru|rambler\.ru)$/;
        return emailRegex.test(email);
    }

    static async validatePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    static validateRegistrationData(data) {
        const { login_name, email_users, password_hash, photo_url } = data;
        
        if (!login_name || !email_users || !password_hash || !photo_url) {
            throw new Error('All fields are required');
        }

        if (!this.validateEmail(email_users)) {
            throw new Error('Invalid email domain');
        }

        if (password_hash.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        return true;
    }

    static validateLoginData(data) {
        const { email_users, password_hash } = data;
        
        if (!email_users || !password_hash) {
            throw new Error('Email and password are required');
        }

        return true;
    }
}

module.exports = UserValidator;