const FloorsRepository = require('../repositories/FloorsRepository');
const FloorsValidator = require('../validators/FloorsValidator');

class FloorsService {
    async getAllFloors() {
        try {
            return await FloorsRepository.findAll();
        } catch (error) {
            throw new Error(`Failed to get floors: ${error.message}`);
        }
    }

    async getFloorByNumber(floor_number) {
        try {
            FloorsValidator.validateFloorNumber(floor_number);
            
            const floor = await FloorsRepository.findByNumber(floor_number);
            if (!floor) {
                throw new Error('Floor not found');
            }
            
            return floor;
        } catch (error) {
            throw new Error(`Failed to get floor: ${error.message}`);
        }
    }

    async createFloor(floorData) {
        try {
            FloorsValidator.validateCreateData(floorData);
            
            const floorExists = await FloorsRepository.exists(floorData.floor_number);
            if (floorExists) {
                throw new Error('Floor already exists');
            }

            return await FloorsRepository.create(floorData);
        } catch (error) {
            throw new Error(`Failed to create floor: ${error.message}`);
        }
    }

    async updateFloor(floor_number, floorData) {
        try {
            FloorsValidator.validateFloorNumber(floor_number);
            FloorsValidator.validateUpdateData(floorData);
            
            const floorExists = await FloorsRepository.exists(floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }

            const updatedFloor = await FloorsRepository.update(floor_number, floorData);
            if (!updatedFloor) {
                throw new Error('Failed to update floor');
            }
            
            return updatedFloor;
        } catch (error) {
            throw new Error(`Failed to update floor: ${error.message}`);
        }
    }

    async deleteFloor(floor_number) {
        try {
            FloorsValidator.validateFloorNumber(floor_number);
            
            const floorExists = await FloorsRepository.exists(floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }
            
            const relatedLocations = await require('../repositories/LocationsRepository').findByFloor_number(floor_number);
            if (relatedLocations.length > 0) {
                throw new Error('Cannot delete floor with existing locations. Delete locations first.');
            }
            
            const isDeleted = await FloorsRepository.delete(floor_number);
            if (!isDeleted) {
                throw new Error('Failed to delete floor');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete floor: ${error.message}`);
        }
    }
}

module.exports = new FloorsService();