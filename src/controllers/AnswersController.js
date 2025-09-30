const AnswersService = require('../services/AnswersService');

class AnswersController {
    async getAnswersByQuestion(req, res) {
        try {
            const { questionId } = req.params;
            const answers = await AnswersService.getAnswersByQuestion(questionId);
            res.json(answers);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createAnswer(req, res) {
        try {
            const answerData = {
                ...req.body,
                user_id: req.user.user_id
            };
            
            const answer = await AnswersService.createAnswer(answerData);
            res.status(201).json({
                message: 'Answer created successfully',
                answer
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async updateAnswer(req, res) {
        try {
            const { id } = req.params;
            const answer = await AnswersService.updateAnswer(id, req.body, req.user.user_id);
            res.json({
                message: 'Answer updated successfully',
                answer
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

    async deleteAnswer(req, res) {
        try {
            const { id } = req.params;
            await AnswersService.deleteAnswer(id, req.user.user_id);
            res.json({ message: 'Answer deleted successfully' });
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

    async markAsSolution(req, res) {
        try {
            const { id } = req.params;
            const answer = await AnswersService.markAsSolution(id, req.user.user_id);
            res.json({
                message: 'Answer marked as solution successfully',
                answer
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('question author')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new AnswersController();