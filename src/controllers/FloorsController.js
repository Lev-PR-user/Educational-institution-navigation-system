const FloorsService = require('../services/FloorsService');

class FloorsController {
    async getAllFloors(req, res) {
        try {
          

            const floors = await FloorsService.getAllFloors();
            res.json(floors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getFloorByNumber(req, res) {
        try {
            const { floors_number } = req.params;
            const floor = await FloorsService.getFloorByNumber(floors_number);
            res.json(floor);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createFloor(req, res) {
        try {
            const floor = await FloorsService.createFloor(req.body);
            res.status(201).json({
                message: 'Floor created successfully',
                floor
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async updateFloor(req, res) {
        try {
            const { floor_number } = req.params;
            const floor = await FloorsService.updateFloor(floor_number, req.body);
            res.json({
                message: 'Floor updated successfully',
                floor
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteFloor(req, res) {
        try {
            const { floor_number } = req.params;
            await FloorsService.deleteFloor(floor_number);
            res.json({ message: 'Floor deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('existing locations')) {
                res.status(409).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new FloorsController();