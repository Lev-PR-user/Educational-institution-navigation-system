const sequelize = require('../config/db');

class LocationsRepository {
    async findAllWithFloorInfo() {
        const result = await sequelize.models.locations.findAll({
            attributes: [
                'description',
                'room_number',
                'floor_number',
                [sequelize.literal('"floor"."map_image_url"'), 'floor_map'],
                [sequelize.literal('"room"."room_url"'), 'room_map']
            ],
            include: [
                {
                    model: sequelize.models.rooms,
                    as: 'room',
                    attributes: []
                },
                {
                    model: sequelize.models.floors,
                    as: 'floor',
                    attributes: []
                }
            ],
            order: [
                ['floor_number', 'ASC'],
                ['room_number', 'ASC']
            ]
        });
        return result;
    }

    async findById(location_id) {
        const result = await sequelize.models.locations.findOne({
            where: { location_id }
        });
        return result;
    }

    async findByFloorNumber(floor_number) {
        const result = await sequelize.models.locations.findAll({
            where: { floor_number },
            order: [['room_number', 'ASC']]
        });
        return result;
    }

    async create(locationData) {
        const { description, room_number, floor_number } = locationData;
        
        const result = await sequelize.models.locations.create({
            description,
            room_number,
            floor_number
        });

        return result;
    }

    async update(locationData) {
        const { location_id, description, room_number, floor_number } = locationData;
        
        await sequelize.models.locations.update({
            description,
            room_number,
            floor_number
        }, {
            where: { location_id }
        });

        const updatedLocation = await sequelize.models.locations.findOne({
            where: { location_id }
        });

        return updatedLocation;
    }

    async delete(location_id) {
        const result = await sequelize.models.locations.destroy({
            where: { location_id }
        });
        return result > 0;
    }

    async floorExists(floor_number) {
        const result = await sequelize.models.floors.findOne({
            where: { floor_number },
            attributes: ['floor_number']
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

module.exports =  LocationsRepository;