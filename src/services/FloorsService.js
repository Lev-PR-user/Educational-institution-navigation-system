class FloorsService {
    constructor({ floorsValidator, floorsRepository }) {
        this.floorsValidator = floorsValidator;
        this.floorsRepository = floorsRepository;
    }
    async getAllFloors() {
        try {
            return await this.floorsRepository.findAll();
        } catch (error) {
            throw new Error(`Failed to get floors: ${error.message}`);
        }
    }

    async getFloorByNumber(floor_number) {
        try {
            this.floorsValidator.validateFloorNumber(floor_number);
            
            const floor = await this.floorsRepository.findByNumber(floor_number);
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
            this.floorsValidator.validateCreateData(floorData);
            
            const floorExists = await this.floorsRepository.exists(floorData.floor_number);
            if (floorExists) {
                throw new Error('Floor already exists');
            }

            return await this.floorsRepository.create(floorData);
        } catch (error) {
            throw new Error(`Failed to create floor: ${error.message}`);
        }
    }

    async updateFloor(floor_number, floorData) {
        try {
            this.floorsValidator.validateFloorNumber(floor_number);
            this.floorsValidator.validateUpdateData(floorData);
            
            const floorExists = await this.floorsRepository.exists(floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }

            const updatedFloor = await this.floorsRepository.update(floor_number, floorData);
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
            this.floorsValidator.validateFloorNumber(floor_number);
            
            const floorExists = await this.floorsRepository.exists(floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }
            
            const relatedLocations = await require('../repositories/LocationsRepository').findByFloor_number(floor_number);
            if (relatedLocations.length > 0) {
                throw new Error('Cannot delete floor with existing locations. Delete locations first.');
            }
            
            const isDeleted = await this.floorsRepository.delete(floor_number);
            if (!isDeleted) {
                throw new Error('Failed to delete floor');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete floor: ${error.message}`);
        }
    }
}

module.exports =  FloorsService;