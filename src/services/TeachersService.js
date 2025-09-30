const TeachersRepository = require('../repositories/TeachersRepository');
const TeachersValidator = require('../validators/TeachersValidator');

class TeachersService {
    async getAllTeachers() {
        try {
            return await TeachersRepository.findAllWithDetails();
        } catch (error) {
            throw new Error(`Failed to get teachers: ${error.message}`);
        }
    }

    async getTeacherById(teacher_id) {
        try {
            TeachersValidator.validateId(teacher_id);
            
            const teacher = await TeachersRepository.findById(teacher_id);
            if (!teacher) {
                throw new Error('Teacher not found');
            }
            
            return teacher;
        } catch (error) {
            throw new Error(`Failed to get teacher: ${error.message}`);
        }
    }

    async createTeacher(teacherData) {
        try {
            TeachersValidator.validateCreateData(teacherData);
            
            if (teacherData.location_id) {
                const locationExists = await TeachersRepository.locationExists(teacherData.location_id);
                if (!locationExists) {
                    throw new Error('Location not found');
                }
            }

            return await TeachersRepository.create(teacherData);
        } catch (error) {
            throw new Error(`Failed to create teacher: ${error.message}`);
        }
    }

    async updateTeacher(teacher_id, teacherData) {
        try {
            TeachersValidator.validateId(teacher_id);
            TeachersValidator.validateUpdateData(teacherData);
            
            const teacherExists = await TeachersRepository.exists(teacher_id);
            if (!teacherExists) {
                throw new Error('Teacher not found');
            }

            if (teacherData.location_id) {
                const locationExists = await TeachersRepository.locationExists(teacherData.location_id);
                if (!locationExists) {
                    throw new Error('Location not found');
                }
            }

            const updatedTeacher = await TeachersRepository.update(teacher_id, teacherData);
            if (!updatedTeacher) {
                throw new Error('Failed to update teacher');
            }
            
            return updatedTeacher;
        } catch (error) {
            throw new Error(`Failed to update teacher: ${error.message}`);
        }
    }

    async deleteTeacher(teacher_id) {
        try {
            TeachersValidator.validateId(teacher_id);
            
            const teacherExists = await TeachersRepository.exists(teacher_id);
            if (!teacherExists) {
                throw new Error('Teacher not found');
            }
            
            const isDeleted = await TeachersRepository.delete(teacher_id);
            if (!isDeleted) {
                throw new Error('Failed to delete teacher');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete teacher: ${error.message}`);
        }
    }
}

module.exports = new TeachersService();