const LocationService = require('../services/LocationService');

class LocationsController {
    async getAllLocations(req, res) {
        try {
            const locations = await LocationService.getAllLocations();
            res.json(locations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getLocationById(req, res) {
        try {
            const { id } = req.params;
            const location = await LocationService.getLocationById(id);
            res.json(location);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async getLocationsByFloor(req, res) {
        try {
            const { floorNumber } = req.params;
            const locations = await LocationService.getLocationsByFloor(floorNumber);
            res.json(locations);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createLocation(req, res) {
        try {
            const location = await LocationService.createLocation(req.body);
            res.status(201).json({
                message: 'Location created successfully',
                location
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const location = await LocationService.updateLocation(id, req.body);
            res.json({
                message: 'Location updated successfully',
                location
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteLocation(req, res) {
        try {
            const { id } = req.params;
            await LocationService.deleteLocation(id);
            res.json({ message: 'Location deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new LocationsController();