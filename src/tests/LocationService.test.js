const LocationService = require('../services/LocationService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/LocationsRepository', () => ({
    findAllWithFloorInfo: jest.fn(),
    findById: jest.fn(),
    floorExists: jest.fn(),
    locationExists: jest.fn(),
    findByFloorNumber: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/LocationsValidator', () => ({
    validateId: jest.fn(),
    validateFloorNumber: jest.fn(),
    createLocation: jest.fn(),
    updateLocation: jest.fn()
}));

// Теперь импортируем моки
const LocationsRepository = require('../repositories/LocationsRepository');
const LocationsValidator = require('../validators/LocationsValidator');

describe('LocationService', () => {
    let locationService;
    
    const mockLocation = {
        location_id: 1,
        location_name: 'Main Building',
        floor_number: 1,
        description: 'Main campus building',
        capacity: 100,
        is_available: true,
        created_at: '2023-01-01T00:00:00.000Z'
    };

    const mockLocationWithFloorInfo = {
        ...mockLocation,
        floor: {
            floor_number: 1,
            floor_name: 'First Floor'
        },
        rooms_count: 5
    };

    beforeEach(() => {
        locationService = new LocationService();
        jest.clearAllMocks();
    });

    describe('getAllLocations', () => {
        it('should return all locations with floor info successfully', async () => {
            // Arrange
            const mockLocations = [
                mockLocationWithFloorInfo, 
                { ...mockLocationWithFloorInfo, location_id: 2, location_name: 'Science Building' }
            ];
            LocationsRepository.findAllWithFloorInfo.mockResolvedValue(mockLocations);

            // Act
            const result = await locationService.getAllLocations();

            // Assert
            expect(LocationsRepository.findAllWithFloorInfo).toHaveBeenCalled();
            expect(result).toEqual(mockLocations);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            LocationsRepository.findAllWithFloorInfo.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(locationService.getAllLocations())
                .rejects
                .toThrow('Failed to get locations: Database connection failed');
        });
    });

    describe('getLocationById', () => {
        it('should return location by id successfully', async () => {
            // Arrange
            LocationsValidator.validateId.mockReturnValue(true);
            LocationsRepository.findById.mockResolvedValue(mockLocationWithFloorInfo);

            // Act
            const result = await locationService.getLocationById(1);

            // Assert
            expect(LocationsValidator.validateId).toHaveBeenCalledWith(1);
            expect(LocationsRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockLocationWithFloorInfo);
        });

        it('should throw error when location not found', async () => {
            // Arrange
            LocationsValidator.validateId.mockReturnValue(true);
            LocationsRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(locationService.getLocationById(999))
                .rejects
                .toThrow('Failed to get location: Location not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            LocationsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid location ID');
            });

            // Act & Assert
            await expect(locationService.getLocationById(-1))
                .rejects
                .toThrow('Failed to get location: Invalid location ID');
            
            expect(LocationsRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('getLocationsByFloor', () => {
        it('should return locations by floor number successfully', async () => {
            // Arrange
            const mockLocations = [mockLocationWithFloorInfo, { ...mockLocationWithFloorInfo, location_id: 2 }];
            LocationsValidator.validateFloorNumber.mockReturnValue(true);
            LocationsRepository.floorExists.mockResolvedValue(true);
            LocationsRepository.findByFloorNumber.mockResolvedValue(mockLocations);

            // Act
            const result = await locationService.getLocationsByFloor(1);

            // Assert
            expect(LocationsValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(LocationsRepository.floorExists).toHaveBeenCalledWith(1);
            expect(LocationsRepository.findByFloorNumber).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockLocations);
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            LocationsValidator.validateFloorNumber.mockReturnValue(true);
            LocationsRepository.floorExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.getLocationsByFloor(999))
                .rejects
                .toThrow('Failed to get locations by floor: Floor not found');
            
            expect(LocationsRepository.findByFloorNumber).not.toHaveBeenCalled();
        });

        it('should throw error when floor number validation fails', async () => {
            // Arrange
            LocationsValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(locationService.getLocationsByFloor(-1))
                .rejects
                .toThrow('Failed to get locations by floor: Invalid floor number');
            
            expect(LocationsRepository.floorExists).not.toHaveBeenCalled();
            expect(LocationsRepository.findByFloorNumber).not.toHaveBeenCalled();
        });
    });

    describe('createLocation', () => {
        const validLocationData = {
            location_name: 'New Building',
            floor_number: 2,
            description: 'New campus building',
            capacity: 50,
            is_available: true
        };

        it('should create location successfully', async () => {
            // Arrange
            LocationsValidator.createLocation.mockReturnValue(true);
            LocationsRepository.floorExists.mockResolvedValue(true);
            LocationsRepository.create.mockResolvedValue({ ...mockLocation, ...validLocationData });

            // Act
            const result = await locationService.createLocation(validLocationData);

            // Assert
            expect(LocationsValidator.createLocation).toHaveBeenCalledWith(validLocationData);
            expect(LocationsRepository.floorExists).toHaveBeenCalledWith(2);
            expect(LocationsRepository.create).toHaveBeenCalledWith(validLocationData);
            expect(result).toEqual({ ...mockLocation, ...validLocationData });
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            LocationsValidator.createLocation.mockReturnValue(true);
            LocationsRepository.floorExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.createLocation(validLocationData))
                .rejects
                .toThrow('Failed to create location: Floor not found');
            
            expect(LocationsRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            LocationsValidator.createLocation.mockImplementation(() => {
                throw new Error('Invalid location data');
            });

            // Act & Assert
            await expect(locationService.createLocation(validLocationData))
                .rejects
                .toThrow('Failed to create location: Invalid location data');
            
            expect(LocationsRepository.floorExists).not.toHaveBeenCalled();
            expect(LocationsRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateLocation', () => {
        const updateData = {
            location_name: 'Updated Building Name',
            description: 'Updated description'
        };

        const updateDataWithFloor = {
            ...updateData,
            floor_number: 3
        };

        it('should update location successfully', async () => {
            // Arrange
            const locationId = 1;
            LocationsValidator.updateLocation.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(true);
            LocationsRepository.update.mockResolvedValue({ ...mockLocation, ...updateData });

            // Act
            const result = await locationService.updateLocation(locationId, updateData);

            // Assert
            expect(LocationsValidator.updateLocation).toHaveBeenCalledWith({ ...updateData, location_id: locationId });
            expect(LocationsRepository.locationExists).toHaveBeenCalledWith(locationId);
            expect(LocationsRepository.update).toHaveBeenCalledWith({ ...updateData, location_id: locationId });
            expect(result).toEqual({ ...mockLocation, ...updateData });
        });

        it('should update location with new floor successfully', async () => {
            // Arrange
            const locationId = 1;
            LocationsValidator.updateLocation.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(true);
            LocationsRepository.floorExists.mockResolvedValue(true);
            LocationsRepository.update.mockResolvedValue({ ...mockLocation, ...updateDataWithFloor });

            // Act
            const result = await locationService.updateLocation(locationId, updateDataWithFloor);

            // Assert
            expect(LocationsValidator.updateLocation).toHaveBeenCalledWith({ ...updateDataWithFloor, location_id: locationId });
            expect(LocationsRepository.locationExists).toHaveBeenCalledWith(locationId);
            expect(LocationsRepository.floorExists).toHaveBeenCalledWith(3);
            expect(LocationsRepository.update).toHaveBeenCalledWith({ ...updateDataWithFloor, location_id: locationId });
            expect(result).toEqual({ ...mockLocation, ...updateDataWithFloor });
        });

        it('should throw error when location not found', async () => {
            // Arrange
            const locationId = 999;
            LocationsValidator.updateLocation.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateData))
                .rejects
                .toThrow('Failed to update location: Location not found');
            
            expect(LocationsRepository.floorExists).not.toHaveBeenCalled();
            expect(LocationsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when new floor not found', async () => {
            // Arrange
            const locationId = 1;
            LocationsValidator.updateLocation.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(true);
            LocationsRepository.floorExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateDataWithFloor))
                .rejects
                .toThrow('Failed to update location: Floor not found');
            
            expect(LocationsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            const locationId = 1;
            LocationsValidator.updateLocation.mockImplementation(() => {
                throw new Error('Invalid update data');
            });

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateData))
                .rejects
                .toThrow('Failed to update location: Invalid update data');
            
            expect(LocationsRepository.locationExists).not.toHaveBeenCalled();
            expect(LocationsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            const locationId = 1;
            LocationsValidator.updateLocation.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(true);
            LocationsRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateData))
                .rejects
                .toThrow('Failed to update location: Failed to update location');
        });
    });

    describe('deleteLocation', () => {
        it('should delete location successfully', async () => {
            // Arrange
            LocationsValidator.validateId.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(true);
            LocationsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await locationService.deleteLocation(1);

            // Assert
            expect(LocationsValidator.validateId).toHaveBeenCalledWith(1);
            expect(LocationsRepository.locationExists).toHaveBeenCalledWith(1);
            expect(LocationsRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when location not found', async () => {
            // Arrange
            LocationsValidator.validateId.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.deleteLocation(999))
                .rejects
                .toThrow('Failed to delete location: Location not found');
            
            expect(LocationsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            LocationsValidator.validateId.mockReturnValue(true);
            LocationsRepository.locationExists.mockResolvedValue(true);
            LocationsRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.deleteLocation(1))
                .rejects
                .toThrow('Failed to delete location: Failed to delete location');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            LocationsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid location ID');
            });

            // Act & Assert
            await expect(locationService.deleteLocation(-1))
                .rejects
                .toThrow('Failed to delete location: Invalid location ID');
            
            expect(LocationsRepository.locationExists).not.toHaveBeenCalled();
            expect(LocationsRepository.delete).not.toHaveBeenCalled();
        });
    });
});