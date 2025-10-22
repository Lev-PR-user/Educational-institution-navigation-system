const sequelize = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const result = await sequelize.models.users.findOne({
            where: { email_users: email }
        });
        return result;
    }

    async findById(user_id) {
        const result = await sequelize.models.users.findOne({
            where: { user_id }
        });
        return result;
    }

    async create(userData) {
        const { login_name, email_users, password_hash, photo_url } = userData;
        
        const user = await sequelize.models.users.create({
            login_name,
            email_users,
            password_hash,
            photo_url
        });

        await sequelize.models.roles.create({
            user_id: user.user_id,
            role_name: false 
        });
        
        return user;
    }

    async update(user_id, userData) {
        const { login_name, email_users, password_hash, photo_url } = userData;
        
        await sequelize.models.users.update({
            login_name,
            email_users,
            password_hash,
            photo_url
        }, {
            where: { user_id }
        });

        const updatedUser = await sequelize.models.users.findOne({
            where: { user_id }
        });
        
        return updatedUser;
    }

    async delete(user_id) {
        await sequelize.models.roles.destroy({
            where: { user_id }
        });

        await sequelize.models.users.destroy({
            where: { user_id }
        });

        return true;
    }
}

module.exports = UserRepository;