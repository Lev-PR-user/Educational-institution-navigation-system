const sequelize = require('../config/db');

class FloorsRepository {
    async findAll() {
        const result = await sequelize.models.floors.findAll({
            order: [['floor_number', 'ASC']]
        });
        return result;
    }

    async findByNumber(floor_number) {
        const result = await sequelize.models.floors.findOne({
            where: { floor_number }
        });
        return result;
    }

    async create(floorData) {
        const { floor_number, map_image_url } = floorData;
        
        const result = await sequelize.models.floors.create({
            floor_number,
            map_image_url
        });
        
        return result;
    }

    async update(floor_number, floorData) {
        const { map_image_url } = floorData;
        
        await sequelize.models.floors.update({
            map_image_url
        }, {
            where: { floor_number }
        });

        const updatedFloor = await sequelize.models.floors.findOne({
            where: { floor_number }
        });
        
        return updatedFloor;
    }

    async delete(floor_number) {
        const result = await sequelize.models.floors.destroy({
            where: { floor_number }
        });
        return result > 0;
    }

    async exists(floor_number) {
        const result = await sequelize.models.floors.findOne({
            where: { floor_number },
            attributes: ['floor_number']
        });
        return result !== null;
    }
}

module.exports =  FloorsRepository;