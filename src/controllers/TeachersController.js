const TeachersService = require('../services/TeachersService');

class TeachersController {
    async getAllTeachers(req, res) {
        try {
            const teachers = await TeachersService.getAllTeachers();
            res.json(teachers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getTeacherById(req, res) {
        try {
            const { id } = req.params;
            const teacher = await TeachersService.getTeacherById(id);
            res.json(teacher);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createTeacher(req, res) {
        try {
            const teacher = await TeachersService.createTeacher(req.body);
            res.status(201).json({
                message: 'Teacher created successfully',
                teacher
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async updateTeacher(req, res) {
        try {
            const { id } = req.params;
            const teacher = await TeachersService.updateTeacher(id, req.body);
            res.json({
                message: 'Teacher updated successfully',
                teacher
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteTeacher(req, res) {
        try {
            const { id } = req.params;
            await TeachersService.deleteTeacher(id);
            res.json({ message: 'Teacher deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new TeachersController();