class FloorValidator {
    static validateCreateData(data) {
        const { floor_number, map_image_url } = data;
        
        if (!floor_number || !map_image_url) {
            throw new Error('All fields are required: floor_number, map_image_url');
        }

        if (isNaN(floor_number) || floor_number < 0) {
            throw new Error('Floor number must be a positive number');
        }

        if (map_image_url.length < 5) {
            throw new Error('Map image URL must be at least 5 characters long');
        }

        return true;
    }

    static validateUpdateData(data) {
        const { map_image_url } = data;
        
        if (map_image_url && map_image_url.length < 5) {
            throw new Error('Map image URL must be at least 5 characters long');
        }

        if (map_image_url && !map_image_url.startsWith('/') && !map_image_url.startsWith('http')) {
            throw new Error('Map image URL must be a valid path or URL');
        }

        return true;
    }

    static validateFloorNumber(floor_number) {
         const floorNumber = parseInt(floor_number);
        if (!floor_number || isNaN(parseInt(floor_number)) || floor_number < 0) {
            throw new Error('Valid floor number is required');
        }
        return floorNumber;
    }
}

module.exports = FloorValidator;