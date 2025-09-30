const ClubsService = require('../services/ClubsService');

class ClubsController {
    async getClubs(req, res) {
        try {
            const clubs = await ClubsService.getAllClubs();
            res.json(clubs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getClubById(req, res) {
        try {
            const { id } = req.params;
            const club = await ClubsService.getClubById(id);
            res.json(club);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createClub(req, res) {
        try {
            const club = await ClubsService.createClub(req.body);
            res.status(201).json({
                message: 'Club created successfully',
                club
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async updateClub(req, res) {
        try {
            const { id } = req.params;
            const club = await ClubsService.updateClub(id, req.body);
            res.json({
                message: 'Club updated successfully',
                club
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteClub(req, res) {
        try {
            const { id } = req.params;
            await ClubsService.deleteClub(id);
            res.json({ message: 'Club deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new ClubsController();