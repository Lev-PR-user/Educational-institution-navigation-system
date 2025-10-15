const FloorsService = require('../services/FloorsService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/FloorsRepository', () => ({
    findAll: jest.fn(),
    findByNumber: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/FloorsValidator', () => ({
    validateFloorNumber: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn()
}));

jest.mock('../repositories/LocationsRepository', () => ({
    findByFloor_number: jest.fn()
}));

// Теперь импортируем моки
const FloorsRepository = require('../repositories/FloorsRepository');
const FloorsValidator = require('../validators/FloorsValidator');
const LocationsRepository = require('../repositories/LocationsRepository');

describe('FloorsService', () => {
    let floorsService;
    
    const mockFloor = {
        floor_number: 1,
        floor_name: 'First Floor',
        description: 'Ground level floor',
        is_accessible: true,
        created_at: '2023-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        floorsService = new FloorsService();
        jest.clearAllMocks();
    });

    describe('getAllFloors', () => {
        it('should return all floors successfully', async () => {
            // Arrange
            const mockFloors = [mockFloor, { ...mockFloor, floor_number: 2, floor_name: 'Second Floor' }];
            FloorsRepository.findAll.mockResolvedValue(mockFloors);

            // Act
            const result = await floorsService.getAllFloors();

            // Assert
            expect(FloorsRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockFloors);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            FloorsRepository.findAll.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(floorsService.getAllFloors())
                .rejects
                .toThrow('Failed to get floors: Database connection failed');
        });
    });

    describe('getFloorByNumber', () => {
        it('should return floor by number successfully', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsRepository.findByNumber.mockResolvedValue(mockFloor);

            // Act
            const result = await floorsService.getFloorByNumber(1);

            // Assert
            expect(FloorsValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(FloorsRepository.findByNumber).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockFloor);
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsRepository.findByNumber.mockResolvedValue(null);

            // Act & Assert
            await expect(floorsService.getFloorByNumber(999))
                .rejects
                .toThrow('Failed to get floor: Floor not found');
        });

        it('should throw error when floor number validation fails', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(floorsService.getFloorByNumber(-1))
                .rejects
                .toThrow('Failed to get floor: Invalid floor number');
            
            expect(FloorsRepository.findByNumber).not.toHaveBeenCalled();
        });
    });

    describe('createFloor', () => {
        const validFloorData = {
            floor_number: 3,
            floor_name: 'Third Floor',
            description: 'Third level floor',
            is_accessible: true
        };

        it('should create floor successfully', async () => {
            // Arrange
            FloorsValidator.validateCreateData.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(false);
            FloorsRepository.create.mockResolvedValue({ ...mockFloor, ...validFloorData });

            // Act
            const result = await floorsService.createFloor(validFloorData);

            // Assert
            expect(FloorsValidator.validateCreateData).toHaveBeenCalledWith(validFloorData);
            expect(FloorsRepository.exists).toHaveBeenCalledWith(3);
            expect(FloorsRepository.create).toHaveBeenCalledWith(validFloorData);
            expect(result).toEqual({ ...mockFloor, ...validFloorData });
        });

        it('should throw error when floor already exists', async () => {
            // Arrange
            FloorsValidator.validateCreateData.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(true);

            // Act & Assert
            await expect(floorsService.createFloor(validFloorData))
                .rejects
                .toThrow('Failed to create floor: Floor already exists');
            
            expect(FloorsRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            FloorsValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid floor data');
            });

            // Act & Assert
            await expect(floorsService.createFloor(validFloorData))
                .rejects
                .toThrow('Failed to create floor: Invalid floor data');
            
            expect(FloorsRepository.exists).not.toHaveBeenCalled();
            expect(FloorsRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateFloor', () => {
        const updateData = {
            floor_name: 'Updated Floor Name',
            description: 'Updated description'
        };

        it('should update floor successfully', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsValidator.validateUpdateData.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(true);
            FloorsRepository.update.mockResolvedValue({ ...mockFloor, ...updateData });

            // Act
            const result = await floorsService.updateFloor(1, updateData);

            // Assert
            expect(FloorsValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(FloorsValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(FloorsRepository.exists).toHaveBeenCalledWith(1);
            expect(FloorsRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockFloor, ...updateData });
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsValidator.validateUpdateData.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(floorsService.updateFloor(999, updateData))
                .rejects
                .toThrow('Failed to update floor: Floor not found');
            
            expect(FloorsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(floorsService.updateFloor(-1, updateData))
                .rejects
                .toThrow('Failed to update floor: Invalid floor number');
            
            expect(FloorsRepository.exists).not.toHaveBeenCalled();
            expect(FloorsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsValidator.validateUpdateData.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(true);
            FloorsRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(floorsService.updateFloor(1, updateData))
                .rejects
                .toThrow('Failed to update floor: Failed to update floor');
        });
    });

    describe('deleteFloor', () => {
        it('should delete floor successfully when no related locations exist', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(true);
            LocationsRepository.findByFloor_number.mockResolvedValue([]);
            FloorsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await floorsService.deleteFloor(1);

            // Assert
            expect(FloorsValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(FloorsRepository.exists).toHaveBeenCalledWith(1);
            expect(LocationsRepository.findByFloor_number).toHaveBeenCalledWith(1);
            expect(FloorsRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(floorsService.deleteFloor(999))
                .rejects
                .toThrow('Failed to delete floor: Floor not found');
            
            expect(LocationsRepository.findByFloor_number).not.toHaveBeenCalled();
            expect(FloorsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when floor has related locations', async () => {
            // Arrange
            const mockLocations = [
                { location_id: 1, location_name: 'Room 101' },
                { location_id: 2, location_name: 'Room 102' }
            ];
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(true);
            LocationsRepository.findByFloor_number.mockResolvedValue(mockLocations);

            // Act & Assert
            await expect(floorsService.deleteFloor(1))
                .rejects
                .toThrow('Failed to delete floor: Cannot delete floor with existing locations. Delete locations first.');
            
            expect(FloorsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockReturnValue(true);
            FloorsRepository.exists.mockResolvedValue(true);
            LocationsRepository.findByFloor_number.mockResolvedValue([]);
            FloorsRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(floorsService.deleteFloor(1))
                .rejects
                .toThrow('Failed to delete floor: Failed to delete floor');
        });

        it('should throw error when floor number validation fails', async () => {
            // Arrange
            FloorsValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(floorsService.deleteFloor(-1))
                .rejects
                .toThrow('Failed to delete floor: Invalid floor number');
            
            expect(FloorsRepository.exists).not.toHaveBeenCalled();
            expect(FloorsRepository.delete).not.toHaveBeenCalled();
        });
    });
});