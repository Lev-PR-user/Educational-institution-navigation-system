class AnswersService {
    constructor({ answersValidator, answerRepository }) {
        this.answersValidator = answersValidator;
        this.answerRepository = answerRepository;
    }
    async getAnswersByQuestion(question_id) {
        try {
           await this.answersValidator.validateQuestionId(question_id);
            
            const questionExists = await this.answerRepository.questionExists(question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }
            
            return await this.answerRepository.findByQuestionId(question_id);
        } catch (error) {
            throw new Error(`Failed to get answers: ${error.message}`);
        }
    }

    async createAnswer(answerData) {
        try {
            this.answersValidator.validateCreateData(answerData);
            
            const questionExists = await this.answerRepository.questionExists(answerData.question_id);
            if (!questionExists) {
                throw new Error('Question not found');
            }

            return await this.answerRepository.create(answerData);
        } catch (error) {
            throw new Error(`Failed to create answer: ${error.message}`);
        }
    }

    async updateAnswer(answer_id, answerData, user_id) {
        try {
            this.answersValidator.validateId(answer_id);
            this.answersValidator.validateUpdateData(answerData);
            
            const answerExists = await this.answerRepository.exists(answer_id);
            if (!answerExists) {
                throw new Error('Answer not found');
            }

            const isAuthor = await this.answerRepository.isAuthor(answer_id, user_id);
            if (!isAuthor) {
                throw new Error('You can only edit your own answers');
            }

            const updatedAnswer = await this.answerRepository.update(answer_id, answerData);
            if (!updatedAnswer) {
                throw new Error('Failed to update answer');
            }
            
            return updatedAnswer;
        } catch (error) {
            throw new Error(`Failed to update answer: ${error.message}`);
        }
    }

    async deleteAnswer(answer_id, user_id) {
        try {
            this.answersValidator.validateId(answer_id);
            
            const answerExists = await this.answerRepository.exists(answer_id);
            if (!answerExists) {
                throw new Error('Answer not found');
            }

            const isAuthor = await this.answerRepository.isAuthor(answer_id, user_id);
            const userRole = await this.answerRepository.getUserRole(user_id);
            const isAdmin = userRole === 'admin';

            if (!isAuthor && !isAdmin) {
                throw new Error('You can only delete your own answers');
            }

            const isDeleted = await this.answerRepository.delete(answer_id);
            if (!isDeleted) {
                throw new Error('Failed to delete answer');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete answer: ${error.message}`);
        }
    }

    async markAsSolution(answer_id, user_id) {
        try {
            this.answersValidator.validateId(answer_id);
            
            const answerInfo = await this.answerRepository.getAnswerWithQuestionInfo(answer_id);
            if (!answerInfo) {
                throw new Error('Answer not found');
            }

            if (answerInfo.question_author_id !== user_id) {
                throw new Error('Only question author can mark answer as solution');
            }

            await this.answerRepository.unmarkOtherSolutions(answerInfo.question_id, answer_id);
            const updatedAnswer = await this.answerRepository.markAsSolution(answer_id);
            
            if (!updatedAnswer) {
                throw new Error('Failed to mark answer as solution');
            }
            
            return updatedAnswer;
        } catch (error) {
            throw new Error(`Failed to mark as solution: ${error.message}`);
        }
    }
}

module.exports =  AnswersService;