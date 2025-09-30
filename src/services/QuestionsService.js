const QuestionsRepository = require('../repositories/QuestionsRepository');
const QuestionsValidator = require('../validators/QuestionsValidator');

class QuestionsService {
    async getAllQuestions() {
        try {
            return await QuestionsRepository.findAllWithDetails();
        } catch (error) {
            throw new Error(`Failed to get questions: ${error.message}`);
        }
    }

    async getQuestionById(question_id) {
        try {
            QuestionsValidator.validateId(question_id);
            
            const question = await QuestionsRepository.findById(question_id);
            if (!question) {
                throw new Error('Question not found');
            }
            
            return question;
        } catch (error) {
            throw new Error(`Failed to get question: ${error.message}`);
        }
    }

    async createQuestion(questionData) {
        try {
            QuestionsValidator.validateCreateData(questionData);
            
            return await QuestionsRepository.create(questionData);
        } catch (error) {
            throw new Error(`Failed to create question: ${error.message}`);
        }
    }

    async updateQuestion(question_id, questionData, user_id) {
        try {
            QuestionsValidator.validateId(question_id);
            QuestionsValidator.validateUpdateData(questionData);
            
            const questionExists = await QuestionsRepository.exists(question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }

            const isAuthor = await QuestionsRepository.isAuthor(question_id, user_id);
            if (!isAuthor) {
                throw new Error('You can only edit your own questions');
            }

            const updatedQuestion = await QuestionsRepository.update(question_id, questionData);
            if (!updatedQuestion) {
                throw new Error('Failed to update question');
            }
            
            return updatedQuestion;
        } catch (error) {
            throw new Error(`Failed to update question: ${error.message}`);
        }
    }

    async deleteQuestion(question_id, user_id) {
        try {
            QuestionsValidator.validateId(question_id);
            
            const questionExists = await QuestionsRepository.exists(question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }

            const isAuthor = await QuestionsRepository.isAuthor(question_id, user_id);
            const userRole = await QuestionsRepository.getUserRole(user_id);
            const isAdmin = userRole === 'admin';

            if (!isAuthor && !isAdmin) {
                throw new Error('You can only delete your own questions');
            }

            const isDeleted = await QuestionsRepository.delete(question_id);
            if (!isDeleted) {
                throw new Error('Failed to delete question');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete question: ${error.message}`);
        }
    }

    async toggleQuestionStatus(question_id, statusData, user_id) {
        try {
            QuestionsValidator.validateId(question_id);
            QuestionsValidator.validateStatusData(statusData);
            
            const questionExists = await QuestionsRepository.exists(question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }

            const isAuthor = await QuestionsRepository.isAuthor(question_id, user_id);
            if (!isAuthor) {
                throw new Error('You can only edit your own questions');
            }

            const updatedQuestion = await QuestionsRepository.updateStatus(question_id, statusData.is_closed);
            if (!updatedQuestion) {
                throw new Error('Failed to update question status');
            }
            
            return updatedQuestion;
        } catch (error) {
            throw new Error(`Failed to toggle question status: ${error.message}`);
        }
    }
}

module.exports = new QuestionsService();