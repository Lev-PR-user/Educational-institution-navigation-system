class QuestionsValidator {
    static validateCreateData(data) {
        const { title, text } = data;
        
        if (!title || !text) {
            throw new Error('Title and text are required');
        }

        if (title.length < 5) {
            throw new Error('Title must be at least 5 characters long');
        }

        if (text.length < 10) {
            throw new Error('Text must be at least 10 characters long');
        }

        if (title.length > 255) {
            throw new Error('Title must be less than 255 characters');
        }

        return true;
    }

    static validateUpdateData(data) {
        const { title, text } = data;
        
        if (title && title.length < 5) {
            throw new Error('Title must be at least 5 characters long');
        }

        if (text && text.length < 10) {
            throw new Error('Text must be at least 10 characters long');
        }

        if (title && title.length > 255) {
            throw new Error('Title must be less than 255 characters');
        }

        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id)) || id < 1) {
            throw new Error('Valid question ID is required');
        }
        return true;
    }

    static validateStatusData(data) {
        const { is_closed } = data;
        
        if (is_closed === undefined || is_closed === null) {
            throw new Error('is_closed field is required');
        }

        if (typeof is_closed !== 'boolean') {
            throw new Error('is_closed must be a boolean value');
        }

        return true;
    }
}

module.exports = QuestionsValidator;