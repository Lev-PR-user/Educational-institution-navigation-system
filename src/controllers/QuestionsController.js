const QuestionsService = require('../services/QuestionsService');

class QuestionsController {
    async getAllQuestions(req, res) {
        try {
            const questions = await QuestionsService.getAllQuestions();
            res.json(questions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            const question = await QuestionsService.getQuestionById(id);
            res.json(question);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createQuestion(req, res) {
        try {
            const questionData = {
                ...req.body,
                user_id: req.user.user_id
            };
            
            const question = await QuestionsService.createQuestion(questionData);
            res.status(201).json({
                message: 'Question created successfully',
                question
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            const question = await QuestionsService.updateQuestion(id, req.body, req.user.user_id);
            res.json({
                message: 'Question updated successfully',
                question
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('your own')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;
            await QuestionsService.deleteQuestion(id, req.user.user_id);
            res.json({ message: 'Question deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('your own')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async toggleQuestionStatus(req, res) {
        try {
            const { id } = req.params;
            const question = await QuestionsService.toggleQuestionStatus(id, req.body, req.user.user_id);
            res.json({
                message: 'Question status updated successfully',
                question
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('your own')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new QuestionsController();