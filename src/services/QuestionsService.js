class QuestionsService {
    constructor({ questionsValidator, questionsRepository }) {
        this.questionsValidator = questionsValidator;
        this.questionsRepository = questionsRepository;
    }
    async getAllQuestions() {
        try {
            return await this.questionsRepository.findAllWithDetails();
        } catch (error) {
            throw new Error(`Failed to get questions: ${error.message}`);
        }
    }

    async getQuestionById(question_id) {
        try {
            this.questionsValidator.validateId(question_id);
            
            const question = await this.questionsRepository.findById(question_id);
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
            this.questionsValidator.validateCreateData(questionData);
            
            return await this.questionsRepository.create(questionData);
        } catch (error) {
            throw new Error(`Failed to create question: ${error.message}`);
        }
    }

    async updateQuestion(question_id, questionData, user_id) {
        try {
            this.questionsValidator.validateId(question_id);
            this.questionsValidator.validateUpdateData(questionData);
            
            const questionExists = await this.questionsRepository.exists(question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }

            const isAuthor = await this.questionsRepository.isAuthor(question_id, user_id);
            if (!isAuthor) {
                throw new Error('You can only edit your own questions');
            }

            const updatedQuestion = await this.questionsRepository.update(question_id, questionData);
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
            this.questionsValidator.validateId(question_id);
            
            const questionExists = await this.questionsRepository.exists(question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }

            const isAuthor = await this.questionsRepository.isAuthor(question_id, user_id);
            const userRole = await this.questionsRepository.getUserRole(user_id);
            const isAdmin = userRole === 'admin';

            if (!isAuthor && !isAdmin) {
                throw new Error('You can only delete your own questions');
            }

            const isDeleted = await this.questionsRepository.delete(question_id);
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
            this.questionsValidator.validateId(question_id);
            this.questionsValidator.validateStatusData(statusData);
            
            const questionExists = await this.questionsRepository.exists(question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }

            const isAuthor = await this.questionsRepository.isAuthor(question_id, user_id);
            if (!isAuthor) {
                throw new Error('You can only edit your own questions');
            }

            const updatedQuestion = await this.questionsRepository.updateStatus(question_id, statusData.is_closed);
            if (!updatedQuestion) {
                throw new Error('Failed to update question status');
            }
            
            return updatedQuestion;
        } catch (error) {
            throw new Error(`Failed to toggle question status: ${error.message}`);
        }
    }
}

module.exports =  QuestionsService;