class ClubsService {
    constructor({ clubsValidator, clubsRepository }) {
        this.clubsValidator = clubsValidator;
        this.clubsRepository = clubsRepository;
    }
    async getAllClubs() {
        try {
            return await this.clubsRepository.findAll();
        } catch (error) {
            throw new Error(`Failed to get clubs: ${error.message}`);
        }
    }

    async getClubById(club_id) {
        try {
           await this.clubsValidator.validateId(club_id);
            
            const club = await this.clubsRepository.findById(club_id);
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
            this.clubsValidator.validateCreateData(clubData);
            
            const locationExists = await this.clubsRepository.locationExists(clubData.location_id);
            if (!locationExists) {
                throw new Error('Location not found');
            }

            return await this.clubsRepository.create(clubData);
        } catch (error) {
            throw new Error(`Failed to create club: ${error.message}`);
        }
    }

    async updateClub(club_id, clubData) {
        try {
            this.clubsValidator.validateId(club_id);
            this.clubsValidator.validateUpdateData(clubData);
            
            const clubExists = await this.clubsRepository.exists(club_id);
            if (!clubExists) {
                throw new Error('Club not found');
            }

            if (clubData.location_id) {
                const locationExists = await this.clubsRepository.locationExists(clubData.location_id);
                if (!locationExists) {
                    throw new Error('Location not found');
                }
            }

            const updatedClub = await this.clubsRepository.update(club_id, clubData);
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
            this.clubsValidator.validateId(club_id);
            
            const clubExists = await this.clubsRepository.exists(club_id);
            if (!clubExists) {
                throw new Error('Club not found');
            }
            
            const isDeleted = await this.clubsRepository.delete(club_id);
            if (!isDeleted) {
                throw new Error('Failed to delete club');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete club: ${error.message}`);
        }
    }
}

module.exports =  ClubsService;