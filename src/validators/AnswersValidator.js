class AnswersValidator {
    static validateCreateData(data) {
        const { question_id, text } = data;
        
        if (!question_id || !text) {
            throw new Error('Question ID and text are required');
        }

        if (isNaN(parseInt(question_id)) || question_id < 1) {
            throw new Error('Valid question ID is required');
        }

        if (text.length < 5) {
            throw new Error('Answer text must be at least 5 characters long');
        }

        if (text.length > 1000) {
            throw new Error('Answer text must be less than 1000 characters');
        }

        return true;
    }

    static validateUpdateData(data) {
        const { text } = data;
        
        if (!text) {
            throw new Error('Text is required for update');
        }

        if (text.length < 5) {
            throw new Error('Answer text must be at least 5 characters long');
        }

        if (text.length > 1000) {
            throw new Error('Answer text must be less than 1000 characters');
        }

        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id)) || id < 1) {
            throw new Error('Valid answer ID is required');
        }
        return true;
    }

    static validateQuestionId(question_id) {
        if (!question_id || isNaN(parseInt(question_id)) || question_id < 1) {
            throw new Error('Valid question ID is required');
        }
        return true;
    }
}

module.exports = AnswersValidator;