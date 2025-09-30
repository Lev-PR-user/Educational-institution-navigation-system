const LocationsRepository = require('../repositories/LocationsRepository');
const LocationsValidator = require('../validators/LocationsValidator');

class LocationService{
async getAllLocations() {
        try {
            return await LocationsRepository.findAllWithFloorInfo();
        } catch (error) {
            throw new Error(`Failed to get locations: ${error.message}`);
        }
    }

    async getLocationById(location_id) {
        try {
            LocationsValidator.validateId(location_id);
            
            const location = await LocationsRepository.findById(location_id);
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
            LocationsValidator.validateFloorNumber(floor_number);
            
            const floorExists = await LocationsRepository.floorExists(floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }
            
            return await LocationsRepository.findByFloorNumber(floor_number);
        } catch (error) {
            throw new Error(`Failed to get locations by floor: ${error.message}`);
        }
    }

    async createLocation(locationData) {
        try {
            LocationsValidator.createLocation(locationData);
            
            const floorExists = await LocationsRepository.floorExists(locationData.floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }

            return await LocationsRepository.create(locationData);
        } catch (error) {
            throw new Error(`Failed to create location: ${error.message}`);
        }
    }

    async updateLocation(location_id, locationData) {
    try {
        const dataForValidation = { ...locationData, location_id };
        LocationsValidator.updateLocation(dataForValidation);
        
        const locationExists = await LocationsRepository.locationExists(location_id);
        if (!locationExists) {
            throw new Error('Location not found');
        }

        if (locationData.floor_number) {
            const floorExists = await LocationsRepository.floorExists(locationData.floor_number);
            if (!floorExists) {
                throw new Error('Floor not found');
            }
        }

        const updateData = { ...locationData, location_id };
        const updatedLocation = await LocationsRepository.update(updateData);
        
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
            LocationsValidator.validateId(location_id);
            
            const locationExists = await LocationsRepository.locationExists(location_id);
            if (!locationExists) {
                throw new Error('Location not found');
            }
            
            const isDeleted = await LocationsRepository.delete(location_id);
            if (!isDeleted) {
                throw new Error('Failed to delete location');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete location: ${error.message}`);
        }
    }
}

module.exports = new LocationService();