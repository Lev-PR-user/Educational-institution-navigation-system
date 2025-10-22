const FloorsService = require('../services/FloorsService');

jest.mock('../repositories/LocationsRepository', () => ({
    findByFloor_number: jest.fn()
}));

const LocationsRepository = require('../repositories/LocationsRepository');

describe('FloorsService', () => {
    let floorsService;
    let mockFloorsRepository;
    let mockValidator;
    
    const mockFloor = {
        floor_number: 1,
        floor_name: 'First Floor',
        description: 'Ground level floor',
        is_accessible: true,
        created_at: '2023-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        mockFloorsRepository = {
            findAll: jest.fn(),
            findByNumber: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        mockValidator = {
            validateFloorNumber: jest.fn(),
            validateCreateData: jest.fn(),
            validateUpdateData: jest.fn()
        };

        floorsService = new FloorsService({
            floorsRepository: mockFloorsRepository,
            floorsValidator: mockValidator
        });

        jest.clearAllMocks();
    });

    describe('getAllFloors', () => {
        it('should return all floors successfully', async () => {
            // Arrange
            const mockFloors = [mockFloor, { ...mockFloor, floor_number: 2, floor_name: 'Second Floor' }];
            mockFloorsRepository.findAll.mockResolvedValue(mockFloors);

            // Act
            const result = await floorsService.getAllFloors();

            // Assert
            expect(mockFloorsRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockFloors);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            mockFloorsRepository.findAll.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(floorsService.getAllFloors())
                .rejects
                .toThrow('Failed to get floors: Database connection failed');
        });
    });

    describe('getFloorByNumber', () => {
        it('should return floor by number successfully', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockFloorsRepository.findByNumber.mockResolvedValue(mockFloor);

            // Act
            const result = await floorsService.getFloorByNumber(1);

            // Assert
            expect(mockValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(mockFloorsRepository.findByNumber).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockFloor);
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockFloorsRepository.findByNumber.mockResolvedValue(null);

            // Act & Assert
            await expect(floorsService.getFloorByNumber(999))
                .rejects
                .toThrow('Failed to get floor: Floor not found');
        });

        it('should throw error when floor number validation fails', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(floorsService.getFloorByNumber(-1))
                .rejects
                .toThrow('Failed to get floor: Invalid floor number');
            
            expect(mockFloorsRepository.findByNumber).not.toHaveBeenCalled();
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
            mockValidator.validateCreateData.mockReturnValue(true);
            mockFloorsRepository.exists.mockResolvedValue(false);
            mockFloorsRepository.create.mockResolvedValue({ ...mockFloor, ...validFloorData });

            // Act
            const result = await floorsService.createFloor(validFloorData);

            // Assert
            expect(mockValidator.validateCreateData).toHaveBeenCalledWith(validFloorData);
            expect(mockFloorsRepository.exists).toHaveBeenCalledWith(3);
            expect(mockFloorsRepository.create).toHaveBeenCalledWith(validFloorData);
            expect(result).toEqual({ ...mockFloor, ...validFloorData });
        });

        it('should throw error when floor already exists', async () => {
            // Arrange
            mockValidator.validateCreateData.mockReturnValue(true);
            mockFloorsRepository.exists.mockResolvedValue(true);

            // Act & Assert
            await expect(floorsService.createFloor(validFloorData))
                .rejects
                .toThrow('Failed to create floor: Floor already exists');
            
            expect(mockFloorsRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid floor data');
            });

            // Act & Assert
            await expect(floorsService.createFloor(validFloorData))
                .rejects
                .toThrow('Failed to create floor: Invalid floor data');
            
            expect(mockFloorsRepository.exists).not.toHaveBeenCalled();
            expect(mockFloorsRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateFloor', () => {
        const updateData = {
            floor_name: 'Updated Floor Name',
            description: 'Updated description'
        };

        it('should update floor successfully', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockFloorsRepository.exists.mockResolvedValue(true);
            mockFloorsRepository.update.mockResolvedValue({ ...mockFloor, ...updateData });

            // Act
            const result = await floorsService.updateFloor(1, updateData);

            // Assert
            expect(mockValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(mockValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(mockFloorsRepository.exists).toHaveBeenCalledWith(1);
            expect(mockFloorsRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockFloor, ...updateData });
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockFloorsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(floorsService.updateFloor(999, updateData))
                .rejects
                .toThrow('Failed to update floor: Floor not found');
            
            expect(mockFloorsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(floorsService.updateFloor(-1, updateData))
                .rejects
                .toThrow('Failed to update floor: Invalid floor number');
            
            expect(mockFloorsRepository.exists).not.toHaveBeenCalled();
            expect(mockFloorsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockFloorsRepository.exists.mockResolvedValue(true);
            mockFloorsRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(floorsService.updateFloor(1, updateData))
                .rejects
                .toThrow('Failed to update floor: Failed to update floor');
        });
    });

   describe('deleteFloor', () => {
        it('should delete floor successfully when no related locations exist', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockFloorsRepository.exists.mockResolvedValue(true);
            LocationsRepository.findByFloor_number.mockResolvedValue([]); // Используем глобальный мок
            mockFloorsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await floorsService.deleteFloor(1);

            // Assert
            expect(mockValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(mockFloorsRepository.exists).toHaveBeenCalledWith(1);
            expect(LocationsRepository.findByFloor_number).toHaveBeenCalledWith(1); // Проверяем глобальный мок
            expect(mockFloorsRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when floor has related locations', async () => {
            // Arrange
            const mockLocations = [
                { location_id: 1, location_name: 'Room 101' },
                { location_id: 2, location_name: 'Room 102' }
            ];
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockFloorsRepository.exists.mockResolvedValue(true);
            LocationsRepository.findByFloor_number.mockResolvedValue(mockLocations); // Используем глобальный мок

            // Act & Assert
            await expect(floorsService.deleteFloor(1))
                .rejects
                .toThrow('Failed to delete floor: Cannot delete floor with existing locations. Delete locations first.');
            
            expect(mockFloorsRepository.delete).not.toHaveBeenCalled();
        });
    });
});