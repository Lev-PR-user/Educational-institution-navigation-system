class ClubsValidator {
    static validateCreateData(data) {
        const { name_clubs, description, contact_info, image_url, location_id } = data;
        
        if (!name_clubs || !description || !contact_info || !location_id) {
            throw new Error('All fields are required: name_clubs, description, contact_info, location_id');
        }

        if (name_clubs.length < 2) {
            throw new Error('Club name must be at least 2 characters long');
        }

        if (description.length < 10) {
            throw new Error('Description must be at least 10 characters long');
        }

        if (contact_info.length < 5) {
            throw new Error('Contact info must be at least 5 characters long');
        }

        if (image_url && !image_url.startsWith('/') && !image_url.startsWith('http')) {
            throw new Error('Image URL must be a valid path or URL');
        }

        if (isNaN(parseInt(location_id)) || location_id < 1) {
            throw new Error('Valid location ID is required');
        }

        return true;
    }

    static validateUpdateData(data) {
        const { name_clubs, description, contact_info, image_url, location_id } = data;
        
        if (name_clubs && name_clubs.length < 2) {
            throw new Error('Club name must be at least 2 characters long');
        }

        if (description && description.length < 10) {
            throw new Error('Description must be at least 10 characters long');
        }

        if (contact_info && contact_info.length < 5) {
            throw new Error('Contact info must be at least 5 characters long');
        }

        if (image_url && !image_url.startsWith('/') && !image_url.startsWith('http')) {
            throw new Error('Image URL must be a valid path or URL');
        }

        if (location_id && (isNaN(parseInt(location_id)) || location_id < 1)) {
            throw new Error('Valid location ID is required');
        }

        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id)) || id < 1) {
            throw new Error('Valid club ID is required');
        }
        return true;
    }
}

module.exports = ClubsValidator;