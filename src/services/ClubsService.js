const ClubsRepository = require('../repositories/ClubsRepository');
const ClubsValidator = require('../validators/ClubsValidator');

class ClubsService {
    async getAllClubs() {
        try {
            return await ClubsRepository.findAll();
        } catch (error) {
            throw new Error(`Failed to get clubs: ${error.message}`);
        }
    }

    async getClubById(club_id) {
        try {
            ClubsValidator.validateId(club_id);
            
            const club = await ClubsRepository.findById(club_id);
            if (!club) {
                throw new Error('Club not found');
            }
            
            return club;
        } catch (error) {
            throw new Error(`Failed to get club: ${error.message}`);
        }
    }

    async createClub(clubData) {
        try {
            ClubsValidator.validateCreateData(clubData);
            
            const locationExists = await ClubsRepository.locationExists(clubData.location_id);
            if (!locationExists) {
                throw new Error('Location not found');
            }

            return await ClubsRepository.create(clubData);
        } catch (error) {
            throw new Error(`Failed to create club: ${error.message}`);
        }
    }

    async updateClub(club_id, clubData) {
        try {
            ClubsValidator.validateId(club_id);
            ClubsValidator.validateUpdateData(clubData);
            
            const clubExists = await ClubsRepository.exists(club_id);
            if (!clubExists) {
                throw new Error('Club not found');
            }

            if (clubData.location_id) {
                const locationExists = await ClubsRepository.locationExists(clubData.location_id);
                if (!locationExists) {
                    throw new Error('Location not found');
                }
            }

            const updatedClub = await ClubsRepository.update(club_id, clubData);
            if (!updatedClub) {
                throw new Error('Failed to update club');
            }
            
            return updatedClub;
        } catch (error) {
            throw new Error(`Failed to update club: ${error.message}`);
        }
    }

    async deleteClub(club_id) {
        try {
            ClubsValidator.validateId(club_id);
            
            const clubExists = await ClubsRepository.exists(club_id);
            if (!clubExists) {
                throw new Error('Club not found');
            }
            
            const isDeleted = await ClubsRepository.delete(club_id);
            if (!isDeleted) {
                throw new Error('Failed to delete club');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete club: ${error.message}`);
        }
    }
}

module.exports = new ClubsService();