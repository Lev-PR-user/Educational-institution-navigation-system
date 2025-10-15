const sequelize = require('../config/db');

class TeachersRepository {
    async findAllWithDetails() {
    const result = await sequelize.models.teachers.findAll({
        include: [
            {
                model: sequelize.models.locations,
                as: 'location',
                attributes: ['room_number', 'description'],
                include: [
                    {
                        model: sequelize.models.floors,
                        as: 'floor',
                        attributes: ['floor_number']
                    }
                ]
            }
        ],
        order: [['name_teacher', 'ASC']]
    });
    return result;
}

   async findById(teacher_id) {
    const result = await sequelize.models.teachers.findOne({
        include: [
            {
                model: sequelize.models.locations,
                as: 'location',
                include: [
                    {
                        model: sequelize.models.floors,
                        as: 'floor'
                    }
                ]
            }
        ],
        where: { teacher_id }
    });
    
    return result;
}

    async create(teacherData) {
        const { name_teacher, position, photo_url, location_id } = teacherData;
        
        const result = await sequelize.models.teachers.create({
            name_teacher,
            position,
            photo_url,
            location_id: location_id || null
        });
        
        return result;
    }

    async update(teacher_id, teacherData) {
        const { name_teacher, position, photo_url, location_id } = teacherData;
        
        await sequelize.models.teachers.update({
            name_teacher,
            position,
            photo_url,
            location_id
        }, {
            where: { teacher_id }
        });

        const updatedTeacher = await sequelize.models.teachers.findOne({
            where: { teacher_id }
        });
        
        return updatedTeacher;
    }

    async delete(teacher_id) {
        const result = await sequelize.models.teachers.destroy({
            where: { teacher_id }
        });
        return result > 0;
    }

    async exists(teacher_id) {
        const result = await sequelize.models.teachers.findOne({
            where: { teacher_id },
            attributes: ['teacher_id']
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

module.exports =  TeachersRepository;