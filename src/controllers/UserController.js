const UserService = require('../services/UserService');

class UserController {
    async register(req, res) {
        try {
            const user = await UserService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const result = await UserService.login(req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await UserService.getProfile(req.user.user_id);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const user = await UserService.updateProfile(req.user.user_id, req.body);
            res.json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteProfile(req, res) {
        try {
            await UserService.deleteProfile(req.user.user_id);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new UserController();