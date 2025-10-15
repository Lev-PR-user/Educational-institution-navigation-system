const sequelize = require('../config/db');

class ClubsRepository {
    async findAll() {
        const result = await sequelize.models.clubs.findAll({
            attributes: [
                'club_id',
                'name_clubs',
                'description',
                'contact_info',
                'image_url',
                'location_id'
            ],
            order: [['name_clubs', 'ASC']]
        });
        return result;
    }

    async findById(club_id) {
        const result = await sequelize.models.clubs.findOne({
            where: { club_id }
        });
        return result;
    }

    async create(clubData) {
        const { name_clubs, description, contact_info, image_url, location_id } = clubData;
        
        const result = await sequelize.models.clubs.create({
            name_clubs,
            description,
            contact_info,
            image_url,
            location_id
        });
        
        return result;
    }

    async update(club_id, clubData) {
        const { name_clubs, description, contact_info, image_url, location_id } = clubData;
        
        await sequelize.models.clubs.update({
            name_clubs,
            description,
            contact_info,
            image_url,
            location_id
        }, {
            where: { club_id }
        });

        const updatedClub = await sequelize.models.clubs.findOne({
            where: { club_id }
        });
        
        return updatedClub;
    }

    async delete(club_id) {
        const result = await sequelize.models.clubs.destroy({
            where: { club_id }
        });
        return result > 0;
    }

    async exists(club_id) {
        const result = await sequelize.models.clubs.findOne({
            where: { club_id },
            attributes: ['club_id']
        });
        return result !== null;
    }

    async locationExists(location_id) {
        const result = await sequelize.models.locations.findOne({
            where: { location_id },
            attributes: ['location_id']
        });
        return result !== null;
    }
}

module.exports =  ClubsRepository;