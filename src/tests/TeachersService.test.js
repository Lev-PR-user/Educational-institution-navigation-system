const TeachersService = require('../services/TeachersService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/TeachersRepository', () => ({
    findAllWithDetails: jest.fn(),
    findById: jest.fn(),
    locationExists: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/TeachersValidator', () => ({
    validateId: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn()
}));

// Теперь импортируем моки
const TeachersRepository = require('../repositories/TeachersRepository');
const TeachersValidator = require('../validators/TeachersValidator');

describe('TeachersService', () => {
    let teachersService;
    
    const mockTeacher = {
        teacher_id: 1,
        user_id: 1,
        location_id: 1,
        bio: 'Experienced teacher',
        qualifications: 'PhD in Computer Science',
        hourly_rate: 50.00,
        is_verified: true,
        created_at: '2023-01-01T00:00:00.000Z'
    };

    const mockTeacherWithDetails = {
        ...mockTeacher,
        user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
        },
        location: {
            location_name: 'Main Campus'
        }
    };

    beforeEach(() => {
        teachersService = new TeachersService();
        jest.clearAllMocks();
    });

    describe('getAllTeachers', () => {
        it('should return all teachers with details successfully', async () => {
            // Arrange
            const mockTeachers = [mockTeacherWithDetails, { ...mockTeacherWithDetails, teacher_id: 2 }];
            TeachersRepository.findAllWithDetails.mockResolvedValue(mockTeachers);

            // Act
            const result = await teachersService.getAllTeachers();

            // Assert
            expect(TeachersRepository.findAllWithDetails).toHaveBeenCalled();
            expect(result).toEqual(mockTeachers);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            TeachersRepository.findAllWithDetails.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(teachersService.getAllTeachers())
                .rejects
                .toThrow('Failed to get teachers: Database connection failed');
        });
    });

    describe('getTeacherById', () => {
        it('should return teacher by id successfully', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersRepository.findById.mockResolvedValue(mockTeacherWithDetails);

            // Act
            const result = await teachersService.getTeacherById(1);

            // Assert
            expect(TeachersValidator.validateId).toHaveBeenCalledWith(1);
            expect(TeachersRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockTeacherWithDetails);
        });

        it('should throw error when teacher not found', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(teachersService.getTeacherById(999))
                .rejects
                .toThrow('Failed to get teacher: Teacher not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            TeachersValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid teacher ID');
            });

            // Act & Assert
            await expect(teachersService.getTeacherById(-1))
                .rejects
                .toThrow('Failed to get teacher: Invalid teacher ID');
            
            expect(TeachersRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('createTeacher', () => {
        const validTeacherData = {
            user_id: 2,
            location_id: 1,
            bio: 'New teacher bio',
            qualifications: 'MSc in Mathematics',
            hourly_rate: 40.00
        };

        it('should create teacher successfully', async () => {
            // Arrange
            TeachersValidator.validateCreateData.mockReturnValue(true);
            TeachersRepository.locationExists.mockResolvedValue(true);
            TeachersRepository.create.mockResolvedValue({ ...mockTeacher, ...validTeacherData });

            // Act
            const result = await teachersService.createTeacher(validTeacherData);

            // Assert
            expect(TeachersValidator.validateCreateData).toHaveBeenCalledWith(validTeacherData);
            expect(TeachersRepository.locationExists).toHaveBeenCalledWith(1);
            expect(TeachersRepository.create).toHaveBeenCalledWith(validTeacherData);
            expect(result).toEqual({ ...mockTeacher, ...validTeacherData });
        });

        it('should create teacher without location successfully', async () => {
            // Arrange
            const teacherDataWithoutLocation = { ...validTeacherData };
            delete teacherDataWithoutLocation.location_id;
            
            TeachersValidator.validateCreateData.mockReturnValue(true);
            TeachersRepository.create.mockResolvedValue({ ...mockTeacher, ...teacherDataWithoutLocation });

            // Act
            const result = await teachersService.createTeacher(teacherDataWithoutLocation);

            // Assert
            expect(TeachersValidator.validateCreateData).toHaveBeenCalledWith(teacherDataWithoutLocation);
            expect(TeachersRepository.locationExists).not.toHaveBeenCalled();
            expect(TeachersRepository.create).toHaveBeenCalledWith(teacherDataWithoutLocation);
            expect(result).toEqual({ ...mockTeacher, ...teacherDataWithoutLocation });
        });

        it('should throw error when location not found', async () => {
            // Arrange
            TeachersValidator.validateCreateData.mockReturnValue(true);
            TeachersRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(teachersService.createTeacher(validTeacherData))
                .rejects
                .toThrow('Failed to create teacher: Location not found');
            
            expect(TeachersRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            TeachersValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid teacher data');
            });

            // Act & Assert
            await expect(teachersService.createTeacher(validTeacherData))
                .rejects
                .toThrow('Failed to create teacher: Invalid teacher data');
            
            expect(TeachersRepository.locationExists).not.toHaveBeenCalled();
            expect(TeachersRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateTeacher', () => {
        const updateData = {
            bio: 'Updated bio',
            hourly_rate: 55.00
        };

        const updateDataWithLocation = {
            ...updateData,
            location_id: 2
        };

        it('should update teacher successfully', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersValidator.validateUpdateData.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(true);
            TeachersRepository.locationExists.mockResolvedValue(true);
            TeachersRepository.update.mockResolvedValue({ ...mockTeacher, ...updateData });

            // Act
            const result = await teachersService.updateTeacher(1, updateData);

            // Assert
            expect(TeachersValidator.validateId).toHaveBeenCalledWith(1);
            expect(TeachersValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(TeachersRepository.exists).toHaveBeenCalledWith(1);
            expect(TeachersRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockTeacher, ...updateData });
        });

        it('should update teacher with location successfully', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersValidator.validateUpdateData.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(true);
            TeachersRepository.locationExists.mockResolvedValue(true);
            TeachersRepository.update.mockResolvedValue({ ...mockTeacher, ...updateDataWithLocation });

            // Act
            const result = await teachersService.updateTeacher(1, updateDataWithLocation);

            // Assert
            expect(TeachersValidator.validateId).toHaveBeenCalledWith(1);
            expect(TeachersValidator.validateUpdateData).toHaveBeenCalledWith(updateDataWithLocation);
            expect(TeachersRepository.exists).toHaveBeenCalledWith(1);
            expect(TeachersRepository.locationExists).toHaveBeenCalledWith(2);
            expect(TeachersRepository.update).toHaveBeenCalledWith(1, updateDataWithLocation);
            expect(result).toEqual({ ...mockTeacher, ...updateDataWithLocation });
        });

        it('should throw error when teacher not found', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersValidator.validateUpdateData.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(teachersService.updateTeacher(999, updateData))
                .rejects
                .toThrow('Failed to update teacher: Teacher not found');
            
            expect(TeachersRepository.locationExists).not.toHaveBeenCalled();
            expect(TeachersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when location not found', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersValidator.validateUpdateData.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(true);
            TeachersRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(teachersService.updateTeacher(1, updateDataWithLocation))
                .rejects
                .toThrow('Failed to update teacher: Location not found');
            
            expect(TeachersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            TeachersValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid teacher ID');
            });

            // Act & Assert
            await expect(teachersService.updateTeacher(-1, updateData))
                .rejects
                .toThrow('Failed to update teacher: Invalid teacher ID');
            
            expect(TeachersRepository.exists).not.toHaveBeenCalled();
            expect(TeachersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersValidator.validateUpdateData.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(true);
            TeachersRepository.locationExists.mockResolvedValue(true);
            TeachersRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(teachersService.updateTeacher(1, updateData))
                .rejects
                .toThrow('Failed to update teacher: Failed to update teacher');
        });
    });

    describe('deleteTeacher', () => {
        it('should delete teacher successfully', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(true);
            TeachersRepository.delete.mockResolvedValue(true);

            // Act
            const result = await teachersService.deleteTeacher(1);

            // Assert
            expect(TeachersValidator.validateId).toHaveBeenCalledWith(1);
            expect(TeachersRepository.exists).toHaveBeenCalledWith(1);
            expect(TeachersRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when teacher not found', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(teachersService.deleteTeacher(999))
                .rejects
                .toThrow('Failed to delete teacher: Teacher not found');
            
            expect(TeachersRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            TeachersValidator.validateId.mockReturnValue(true);
            TeachersRepository.exists.mockResolvedValue(true);
            TeachersRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(teachersService.deleteTeacher(1))
                .rejects
                .toThrow('Failed to delete teacher: Failed to delete teacher');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            TeachersValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid teacher ID');
            });

            // Act & Assert
            await expect(teachersService.deleteTeacher(-1))
                .rejects
                .toThrow('Failed to delete teacher: Invalid teacher ID');
            
            expect(TeachersRepository.exists).not.toHaveBeenCalled();
            expect(TeachersRepository.delete).not.toHaveBeenCalled();
        });
    });
});