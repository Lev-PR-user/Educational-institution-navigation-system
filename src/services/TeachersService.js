class TeachersService {
        constructor({ teachersValidator, teacherRepository }) {
        this.teachersValidator = teachersValidator;
        this.teacherRepository = teacherRepository;
    }
    async getAllTeachers() {
        try {
            return await this.teacherRepository.findAllWithDetails();
        } catch (error) {
            throw new Error(`Failed to get teachers: ${error.message}`);
        }
    }

    async getTeacherById(teacher_id) {
        try {
            this.teachersValidator.validateId(teacher_id);
            
            const teacher = await this.teacherRepository.findById(teacher_id);
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
            this.teachersValidator.validateCreateData(teacherData);
            
            if (teacherData.location_id) {
                const locationExists = await this.teacherRepository.locationExists(teacherData.location_id);
                if (!locationExists) {
                    throw new Error('Location not found');
                }
            }

            return await this.teacherRepository.create(teacherData);
        } catch (error) {
            throw new Error(`Failed to create teacher: ${error.message}`);
        }
    }

    async updateTeacher(teacher_id, teacherData) {
        try {
            this.teachersValidator.validateId(teacher_id);
            this.teachersValidator.validateUpdateData(teacherData);
            
            const teacherExists = await this.teacherRepository.exists(teacher_id);
            if (!teacherExists) {
                throw new Error('Teacher not found');
            }

            if (teacherData.location_id) {
                const locationExists = await this.teacherRepository.locationExists(teacherData.location_id);
                if (!locationExists) {
                    throw new Error('Location not found');
                }
            }

            const updatedTeacher = await this.teacherRepository.update(teacher_id, teacherData);
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
            this.teachersValidator.validateId(teacher_id);
            
            const teacherExists = await this.teacherRepository.exists(teacher_id);
            if (!teacherExists) {
                throw new Error('Teacher not found');
            }
            
            const isDeleted = await this.teacherRepository.delete(teacher_id);
            if (!isDeleted) {
                throw new Error('Failed to delete teacher');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete teacher: ${error.message}`);
        }
    }
}

module.exports =  TeachersService;