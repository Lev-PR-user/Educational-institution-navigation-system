class RoomsValidator {
    static validateCreateData(data) {
        const { room_number, room_url  } = data;
        
        if (!room_number || !room_url  ) {
            throw new Error('Room number, URL  are required');
        }

        if (room_number.length < 1 || room_number.length > 15) {
            throw new Error('Room number must be between 1 and 15 characters');
        }

        if (room_url.length < 5) {
            throw new Error('Room URL must be at least 5 characters long');
        }

        if (!room_url.startsWith('/') && !room_url.startsWith('http')) {
            throw new Error('Room URL must be a valid path or URL');
        }

        return true;
    }

    static validateUpdateData(data) {
        const { room_number, room_url  } = data;
        
        if (room_number && (room_number.length < 1 || room_number.length > 15)) {
            throw new Error('Room number must be between 1 and 15 characters');
        }

        if (room_url && room_url.length < 5) {
            throw new Error('Room URL must be at least 5 characters long');
        }

        if (room_url && !room_url.startsWith('/') && !room_url.startsWith('http')) {
            throw new Error('Room URL must be a valid path or URL');
        }

        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id)) || id < 1) {
            throw new Error('Valid room ID is required');
        }
        return true;
    }

    static validateLocationId(location_id) {
        if (!location_id || isNaN(parseInt(location_id)) || location_id < 1) {
            throw new Error('Valid location ID is required');
        }
        return true;
    }

    static validateRoomNumber(room_number) {
        if (!room_number || room_number.length < 1 || room_number.length > 15) {
            throw new Error('Valid room number is required');
        }
        return room_number;
    }
}


module.exports = RoomsValidator;