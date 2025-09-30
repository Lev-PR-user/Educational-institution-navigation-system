class FaqsValidator {
    static validateCreateData(data) {
        const { question, answer, category } = data;
        
        if (!question || !answer || !category) {
            throw new Error('All fields are required: question, answer, category');
        }

        if (question.length < 5) {
            throw new Error('Question must be at least 5 characters long');
        }

        if (answer.length < 10) {
            throw new Error('Answer must be at least 10 characters long');
        }

        if (category.length < 2) {
            throw new Error('Category must be at least 2 characters long');
        }

        return true;
    }

    static validateUpdateData(data) {
        const { question, answer, category } = data;
        
        if (question && question.length < 5) {
            throw new Error('Question must be at least 5 characters long');
        }

        if (answer && answer.length < 10) {
            throw new Error('Answer must be at least 10 characters long');
        }

        if (category && category.length < 2) {
            throw new Error('Category must be at least 2 characters long');
        }

        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id)) || id < 1) {
            throw new Error('Valid FAQ ID is required');
        }
        return true;
    }

    static validateCategory(category) {
        if (!category || category.length < 2) {
            throw new Error('Valid category is required');
        }
        return true;
    }
}

module.exports = FaqsValidator;