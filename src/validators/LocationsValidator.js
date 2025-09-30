class LocationsValidator{

    static createLocation(data){
        const { description } = data;

        if(description.length < 2 ){
            throw new Error('Description must be at least 2 characters long');
        }

        if (!description) {
            throw new Error('Description, room and floor number are required');
      }
    }

    static updateLocation(data){
        const { description, room_number, floor_number } = data;
        
        console.log('Validating update data:', data);
        
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string' || description.length < 2) {
                throw new Error('Description must be a string with at least 2 characters');
            }
        }

        if (room_number !== undefined && room_number !== null) {
            if (typeof room_number !== 'string' || room_number.length < 1) {
                throw new Error('Room must be a string with at least 1 character');
            }
            if (!/^[a-zA-Zа-яА-Я0-9\s\-]+$/.test(room_number)) {
                throw new Error('Room number can only contain letters, numbers, spaces and hyphens');
            }
        }

        if (floor_number !== undefined && floor_number !== null) {
            const floorNum = parseInt(floor_number);
            if (isNaN(floorNum) || floorNum < 0) {
                throw new Error('Floor number must be a positive number');
            }
        }

        console.log('Update data validation passed');
        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id))) {
            throw new Error('Valid location ID is required');
        }
        return true;
    }

    static validateFloorNumber(floor_number) {
        if (!floor_number || isNaN(parseInt(floor_number)) || floor_number < 0) {
            throw new Error('Valid floor number is required');
        }
        return true;
    }
}

module.exports = LocationsValidator;