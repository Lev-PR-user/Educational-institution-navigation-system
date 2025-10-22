class LocationService{
    constructor({ locationsValidator, locationRepository }) {
        this.locationsValidator = locationsValidator;
        this.locationRepository = locationRepository;
    }
async getAllLocations() {
        try {
            return await this.locationRepository.findAllWithFloorInfo();
        } catch (error) {
            throw new Error(`Failed to get locations: ${error.message}`);
        }
    }

    async getLocationById(location_id) {
        try {
            this.locationsValidator.validateId(location_id);
            
            const location = await this.locationRepository.findById(location_id);
            if (!location) {
                throw new Error('Location not found');
            }
            
            return location;
        } catch (error) {
            throw new Error(`Failed to get location: ${error.message}`);
        }
    }

    async getLocationsByFloor(floor_number) {
        try {
            this.locationsValidator.validateFloorNumber(floor_number);
            
            const floorExists = await this.locationRepository.floorExists(floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }
            
            return await this.locationRepository.findByFloorNumber(floor_number);
        } catch (error) {
            throw new Error(`Failed to get locations by floor: ${error.message}`);
        }
    }

    async createLocation(locationData) {
        try {
            this.locationsValidator.createLocation(locationData);
            
            const floorExists = await this.locationRepository.floorExists(locationData.floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }

            return await this.locationRepository.create(locationData);
        } catch (error) {
            throw new Error(`Failed to create location: ${error.message}`);
        }
    }

    async updateLocation(location_id, locationData) {
    try {
        const dataForValidation = { ...locationData, location_id };
        this.locationsValidator.updateLocation(dataForValidation);
        
        const locationExists = await this.locationRepository.locationExists(location_id);
        if (!locationExists) {
            throw new Error('Location not found');
        }

        if (locationData.floor_number) {
            const floorExists = await this.locationRepository.floorExists(locationData.floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }
        }

        const updateData = { ...locationData, location_id };
        const updatedLocation = await this.locationRepository.update(updateData);
        
        if (!updatedLocation) {
            throw new Error('Failed to update location');
        }
        
        return updatedLocation;
    } catch (error) {
        throw new Error(`Failed to update location: ${error.message}`);
    }
}

    async deleteLocation(location_id) {
        try {
            this.locationsValidator.validateId(location_id);
            
            const locationExists = await this.locationRepository.locationExists(location_id);
            if (!locationExists) {
                throw new Error('Location not found');
            }
            
            const isDeleted = await this.locationRepository.delete(location_id);
            if (!isDeleted) {
                throw new Error('Failed to delete location');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete location: ${error.message}`);
        }
    }
}

module.exports =  LocationService;