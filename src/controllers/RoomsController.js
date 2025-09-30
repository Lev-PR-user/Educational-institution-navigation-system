const RoomsService = require('../services/RoomsService');

class RoomsController {
    async getAllRooms(req, res) {
        try {
            const rooms = await RoomsService.getAllRooms();
            res.json(rooms);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getRoomByNumber(req, res) {
        try {
            const { id } = req.params;
            const room = await RoomsService.getRoomByNumber(id);
            res.json(room);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async getRoomsByLocation(req, res) {
        try {
            const { locationId } = req.params;
            const rooms = await RoomsService.getRoomsByLocation(locationId);
            res.json(rooms);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createRoom(req, res) {
        try {
            const room = await RoomsService.createRoom(req.body);
            res.status(201).json({
                message: 'Room created successfully',
                room
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                res.status(400).json({ message: error.message });
            } else if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async updateRoom(req, res) {
        try {
            const { id } = req.params;
            const room = await RoomsService.updateRoom(id, req.body);
            res.json({
                message: 'Room updated successfully',
                room
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('already exists')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteRoom(req, res) {
        try {
            const { id } = req.params;
            await RoomsService.deleteRoom(id);
            res.json({ message: 'Room deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new RoomsController();