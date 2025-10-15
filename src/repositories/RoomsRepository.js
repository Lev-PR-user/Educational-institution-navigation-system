const sequelize = require('../config/db');

class RoomsRepository {
    async findAllWithDetails() {
        const result = await sequelize.models.rooms.findAll({
            attributes: [
                'room_number',
                'room_url'
            ],
            order: [['room_number', 'ASC']]
        });
        return result;
    }

    async findByNumber(room_number) {
        const result = await sequelize.models.rooms.findOne({
            attributes: [
                'room_number',
                'room_url'
            ],
            where: { room_number }
        });
        return result;
    }

    async findByFloorNumber(floor_number) {
    const result = await sequelize.models.locations.findAll({
        attributes: [
            [sequelize.col('room.room_number'), 'room_number'],
            [sequelize.col('room.room_url'), 'room_url'],
            'description',
            'floor_number'
        ],
        include: [
            {
                model: sequelize.models.rooms,
                as: 'room',
                attributes: []
            }
        ],
        where: { floor_number }
    });
    return result;
}
    async create(roomData) {
        const { room_number, room_url } = roomData;
        
        const result = await sequelize.models.rooms.create({
            room_number,
            room_url
        });
        
        return result;
    }

    async update(room_number, roomData) {
        const { room_number: new_room_number, room_url } = roomData;
        
        await sequelize.models.rooms.update({
            room_number: new_room_number,
            room_url
        }, {
            where: { room_number }
        });

        const updatedRoom = await sequelize.models.rooms.findOne({
            where: { room_number: new_room_number }
        });
        
        return updatedRoom;
    }

    async delete(room_number) {
        const result = await sequelize.models.rooms.destroy({
            where: { room_number }
        });
        return result > 0;
    }

    async exists(room_number) {
        const result = await sequelize.models.rooms.findOne({
            where: { room_number },
            attributes: ['room_number']
        });
        return result !== null;
    }

    async existsByNumber(room_number, exclude_room_number = null) {
        const whereCondition = { room_number };
        
        if (exclude_room_number) {
            whereCondition.room_number = {
                [sequelize.Op.eq]: room_number,
                [sequelize.Op.ne]: exclude_room_number
            };
        }
        
        const result = await sequelize.models.rooms.findOne({
            where: whereCondition,
            attributes: ['room_number']
        });
        return result !== null;
    }
}

module.exports =  RoomsRepository;