const sequelize = require('../config/db');

class AdministrationRepository {
    async getAllAdministration() {
        const result = await sequelize.models.administration.findAll({
            attributes: [
                'administration_id',
                'name_administration',
                'position',
                'photo_url',
                [sequelize.literal(`COALESCE("contact"."phone_number"::text, '-')`), 'phone_number'],
                [sequelize.literal(`COALESCE("contact"."administration_email", '-')`), 'email'],
                [sequelize.literal(`COALESCE("location"."room_number", '-')`), 'room_number'],
                [sequelize.literal(`COALESCE("location"."description", '-')`), 'location_description'],
                [sequelize.literal(`COALESCE("floor"."floor_number"::text, '-')`), 'floor_number']
            ],
            include: [
                {
                    model: sequelize.models.contacts,
                    as: 'contact',
                    attributes: [],
                    required: false
                },
                {
                    model: sequelize.models.locations,
                    as: 'location',
                    attributes: [],
                    include: [
                        {
                            model: sequelize.models.floors,
                            as: 'floor',
                            attributes: [],
                            required: false
                        }
                    ],
                    required: false
                }
            ],
            order: [['name_administration', 'ASC']]
        });
        return result;
    }

    async findById(administration_id) {
        const result = await sequelize.models.administration.findOne({
            where: { administration_id }
        });
        return result;
    }

    async create(adminData) {
        const { name_administration, position, photo_url, location_id } = adminData;

        const result = await sequelize.models.administration.create({
            name_administration,
            position,
            photo_url,
            location_id
        });

        await sequelize.models.contacts.create({
            contacts_id: result.administration_id
        });

        return result;
    }

    async update(administration_id, adminData) {
        const { name_administration, position, photo_url, location_id } = adminData;

        await sequelize.models.administration.update({
            name_administration,
            position,
            photo_url,
            location_id
        }, {
            where: { administration_id }
        });

        const updatedAdmin = await sequelize.models.administration.findOne({
            where: { administration_id }
        });

        return updatedAdmin;
    }

    async delete(administration_id) {
        const result = await sequelize.models.administration.destroy({
            where: { administration_id }
        });
        return result > 0;
    }
}

module.exports =  AdministrationRepository;