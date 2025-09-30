class TeachersValidator {
    static validateCreateData(data) {
        const { name_teacher, position, photo_url, location_id } = data;
        
        if (!name_teacher || !position || !photo_url) {
            throw new Error('All fields are required: name_teacher, position, photo_url');
        }

        if (name_teacher.length < 2) {
            throw new Error('Teacher name must be at least 2 characters long');
        }

        if (position.length < 2) {
            throw new Error('Position must be at least 2 characters long');
        }

        if (!photo_url.startsWith('/') && !photo_url.startsWith('http')) {
            throw new Error('Photo URL must be a valid path or URL');
        }

        if (location_id && (isNaN(parseInt(location_id)) || location_id < 1)) {
            throw new Error('Valid location ID is required');
        }

        return true;
    }

    static validateUpdateData(data) {
        const { name_teacher, position, photo_url, location_id } = data;
        
        if (name_teacher && name_teacher.length < 2) {
            throw new Error('Teacher name must be at least 2 characters long');
        }

        if (position && position.length < 2) {
            throw new Error('Position must be at least 2 characters long');
        }

        if (photo_url && !photo_url.startsWith('/') && !photo_url.startsWith('http')) {
            throw new Error('Photo URL must be a valid path or URL');
        }

        if (location_id && (isNaN(parseInt(location_id)) || location_id < 1)) {
            throw new Error('Valid location ID is required');
        }

        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id)) || id < 1) {
            throw new Error('Valid teacher ID is required');
        }
        return true;
    }
}

module.exports = TeachersValidator;