const AdministrationService = require('../services/AdministrationService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/AdministrationRepository', () => ({
    getAllAdministration: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/AdministrationValidator', () => ({
    validateId: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn()
}));

// Теперь импортируем моки
const AdministrationRepository = require('../repositories/AdministrationRepository');
const AdministrationValidator = require('../validators/AdministrationValidator');

describe('AdministrationService', () => {
    let administrationService;
    
    const mockAdministration = {
        administration_id: 1,
        admin_name: 'Main Administration',
        admin_type: 'general',
        description: 'Main administration department',
        is_active: true,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        administrationService = new AdministrationService();
        jest.clearAllMocks();
    });

    describe('getAllAdministration', () => {
        it('should return all administration successfully', async () => {
            // Arrange
            const mockAdministrations = [
                mockAdministration,
                { 
                    ...mockAdministration, 
                    administration_id: 2, 
                    admin_name: 'Academic Administration',
                    admin_type: 'academic'
                }
            ];
            AdministrationRepository.getAllAdministration.mockResolvedValue(mockAdministrations);

            // Act
            const result = await administrationService.getAllAdministration();

            // Assert
            expect(AdministrationRepository.getAllAdministration).toHaveBeenCalled();
            expect(result).toEqual(mockAdministrations);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            AdministrationRepository.getAllAdministration.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(administrationService.getAllAdministration())
                .rejects
                .toThrow('Failed to get administration: Database connection failed');
        });
    });

    describe('getAdministrationById', () => {
        it('should return administration by id successfully', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(mockAdministration);

            // Act
            const result = await administrationService.getAdministrationById(1);

            // Assert
            expect(AdministrationValidator.validateId).toHaveBeenCalledWith(1);
            expect(AdministrationRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockAdministration);
        });

        it('should throw error when administration not found', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(administrationService.getAdministrationById(999))
                .rejects
                .toThrow('Failed to get administration: Administration not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            AdministrationValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid administration ID');
            });

            // Act & Assert
            await expect(administrationService.getAdministrationById(-1))
                .rejects
                .toThrow('Failed to get administration: Invalid administration ID');
            
            expect(AdministrationRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('createAdministration', () => {
        const validAdministrationData = {
            administration_id: 3,
            admin_name: 'Financial Administration',
            admin_type: 'financial',
            description: 'Financial department administration',
            is_active: true
        };

        it('should create administration successfully', async () => {
            // Arrange
            AdministrationValidator.validateCreateData.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(null);
            AdministrationRepository.create.mockResolvedValue({ ...mockAdministration, ...validAdministrationData });

            // Act
            const result = await administrationService.createAdministration(validAdministrationData);

            // Assert
            expect(AdministrationValidator.validateCreateData).toHaveBeenCalledWith(validAdministrationData);
            expect(AdministrationRepository.findById).toHaveBeenCalledWith(3);
            expect(AdministrationRepository.create).toHaveBeenCalledWith(validAdministrationData);
            expect(result).toEqual({ ...mockAdministration, ...validAdministrationData });
        });

        it('should throw error when administration already exists', async () => {
            // Arrange
            AdministrationValidator.validateCreateData.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(mockAdministration);

            // Act & Assert
            await expect(administrationService.createAdministration(validAdministrationData))
                .rejects
                .toThrow('Failed to create administration: Administration with this ID already exists');
            
            expect(AdministrationRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            AdministrationValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid administration data');
            });

            // Act & Assert
            await expect(administrationService.createAdministration(validAdministrationData))
                .rejects
                .toThrow('Failed to create administration: Invalid administration data');
            
            expect(AdministrationRepository.findById).not.toHaveBeenCalled();
            expect(AdministrationRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateAdministration', () => {
        const updateData = {
            admin_name: 'Updated Administration Name',
            description: 'Updated description for administration'
        };

        it('should update administration successfully', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationValidator.validateUpdateData.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(mockAdministration);
            AdministrationRepository.update.mockResolvedValue({ ...mockAdministration, ...updateData });

            // Act
            const result = await administrationService.updateAdministration(1, updateData);

            // Assert
            expect(AdministrationValidator.validateId).toHaveBeenCalledWith(1);
            expect(AdministrationValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(AdministrationRepository.findById).toHaveBeenCalledWith(1);
            expect(AdministrationRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockAdministration, ...updateData });
        });

        it('should throw error when administration not found', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationValidator.validateUpdateData.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(administrationService.updateAdministration(999, updateData))
                .rejects
                .toThrow('Failed to update administration: Administration not found');
            
            expect(AdministrationRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            AdministrationValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid administration ID');
            });

            // Act & Assert
            await expect(administrationService.updateAdministration(-1, updateData))
                .rejects
                .toThrow('Failed to update administration: Invalid administration ID');
            
            expect(AdministrationRepository.findById).not.toHaveBeenCalled();
            expect(AdministrationRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationValidator.validateUpdateData.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(mockAdministration);
            AdministrationRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(administrationService.updateAdministration(1, updateData))
                .rejects
                .toThrow('Failed to update administration: Failed to update administration');
        });
    });

    describe('deleteAdministration', () => {
        it('should delete administration successfully', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(mockAdministration);
            AdministrationRepository.delete.mockResolvedValue(true);

            // Act
            const result = await administrationService.deleteAdministration(1);

            // Assert
            expect(AdministrationValidator.validateId).toHaveBeenCalledWith(1);
            expect(AdministrationRepository.findById).toHaveBeenCalledWith(1);
            expect(AdministrationRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when administration not found', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(administrationService.deleteAdministration(999))
                .rejects
                .toThrow('Failed to delete administration: Administration not found');
            
            expect(AdministrationRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            AdministrationValidator.validateId.mockReturnValue(true);
            AdministrationRepository.findById.mockResolvedValue(mockAdministration);
            AdministrationRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(administrationService.deleteAdministration(1))
                .rejects
                .toThrow('Failed to delete administration: Failed to delete administration');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            AdministrationValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid administration ID');
            });

            // Act & Assert
            await expect(administrationService.deleteAdministration(-1))
                .rejects
                .toThrow('Failed to delete administration: Invalid administration ID');
            
            expect(AdministrationRepository.findById).not.toHaveBeenCalled();
            expect(AdministrationRepository.delete).not.toHaveBeenCalled();
        });
    });
});