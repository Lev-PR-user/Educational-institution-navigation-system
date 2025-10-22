const LocationService = require('../services/LocationService');

describe('LocationService', () => {
    let locationService;
    let mockRepository;
    let mockValidator;
    
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
        // Создаем моки для зависимостей
        mockRepository = {
            findAllWithFloorInfo: jest.fn(),
            findById: jest.fn(),
            floorExists: jest.fn(),
            locationExists: jest.fn(),
            findByFloorNumber: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        mockValidator = {
            validateId: jest.fn(),
            validateFloorNumber: jest.fn(),
            createLocation: jest.fn(),
            updateLocation: jest.fn()
        };

        locationService = new LocationService({
            locationsValidator: mockValidator,
            locationRepository: mockRepository 
        });

        jest.clearAllMocks();
    });

    describe('getAllLocations', () => {
        it('should return all locations with floor info successfully', async () => {
            // Arrange
            const mockLocations = [
                mockLocationWithFloorInfo, 
                { ...mockLocationWithFloorInfo, location_id: 2, location_name: 'Science Building' }
            ];
            mockRepository.findAllWithFloorInfo.mockResolvedValue(mockLocations);

            // Act
            const result = await locationService.getAllLocations();

            // Assert
            expect(mockRepository.findAllWithFloorInfo).toHaveBeenCalled();
            expect(result).toEqual(mockLocations);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            mockRepository.findAllWithFloorInfo.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(locationService.getAllLocations())
                .rejects
                .toThrow('Failed to get locations: Database connection failed');
        });
    });

    describe('getLocationById', () => {
        it('should return location by id successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(mockLocationWithFloorInfo);

            // Act
            const result = await locationService.getLocationById(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockLocationWithFloorInfo);
        });

        it('should throw error when location not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(locationService.getLocationById(999))
                .rejects
                .toThrow('Failed to get location: Location not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid location ID');
            });

            // Act & Assert
            await expect(locationService.getLocationById(-1))
                .rejects
                .toThrow('Failed to get location: Invalid location ID');
            
            expect(mockRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('getLocationsByFloor', () => {
        it('should return locations by floor number successfully', async () => {
            // Arrange
            const mockLocations = [mockLocationWithFloorInfo, { ...mockLocationWithFloorInfo, location_id: 2 }];
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockRepository.floorExists.mockResolvedValue(true);
            mockRepository.findByFloorNumber.mockResolvedValue(mockLocations);

            // Act
            const result = await locationService.getLocationsByFloor(1);

            // Assert
            expect(mockValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(mockRepository.floorExists).toHaveBeenCalledWith(1);
            expect(mockRepository.findByFloorNumber).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockLocations);
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockReturnValue(true);
            mockRepository.floorExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.getLocationsByFloor(999))
                .rejects
                .toThrow('Failed to get locations by floor: Floor not found');
            
            expect(mockRepository.findByFloorNumber).not.toHaveBeenCalled();
        });

        it('should throw error when floor number validation fails', async () => {
            // Arrange
            mockValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(locationService.getLocationsByFloor(-1))
                .rejects
                .toThrow('Failed to get locations by floor: Invalid floor number');
            
            expect(mockRepository.floorExists).not.toHaveBeenCalled();
            expect(mockRepository.findByFloorNumber).not.toHaveBeenCalled();
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
            mockValidator.createLocation.mockReturnValue(true);
            mockRepository.floorExists.mockResolvedValue(true);
            mockRepository.create.mockResolvedValue({ ...mockLocation, ...validLocationData });

            // Act
            const result = await locationService.createLocation(validLocationData);

            // Assert
            expect(mockValidator.createLocation).toHaveBeenCalledWith(validLocationData);
            expect(mockRepository.floorExists).toHaveBeenCalledWith(2);
            expect(mockRepository.create).toHaveBeenCalledWith(validLocationData);
            expect(result).toEqual({ ...mockLocation, ...validLocationData });
        });

        it('should throw error when floor not found', async () => {
            // Arrange
            mockValidator.createLocation.mockReturnValue(true);
            mockRepository.floorExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.createLocation(validLocationData))
                .rejects
                .toThrow('Failed to create location: Floor not found');
            
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.createLocation.mockImplementation(() => {
                throw new Error('Invalid location data');
            });

            // Act & Assert
            await expect(locationService.createLocation(validLocationData))
                .rejects
                .toThrow('Failed to create location: Invalid location data');
            
            expect(mockRepository.floorExists).not.toHaveBeenCalled();
            expect(mockRepository.create).not.toHaveBeenCalled();
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
            mockValidator.updateLocation.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue({ ...mockLocation, ...updateData });

            // Act
            const result = await locationService.updateLocation(locationId, updateData);

            // Assert
            expect(mockValidator.updateLocation).toHaveBeenCalledWith({ ...updateData, location_id: locationId });
            expect(mockRepository.locationExists).toHaveBeenCalledWith(locationId);
            expect(mockRepository.update).toHaveBeenCalledWith({ ...updateData, location_id: locationId });
            expect(result).toEqual({ ...mockLocation, ...updateData });
        });

        it('should update location with new floor successfully', async () => {
            // Arrange
            const locationId = 1;
            mockValidator.updateLocation.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.floorExists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue({ ...mockLocation, ...updateDataWithFloor });

            // Act
            const result = await locationService.updateLocation(locationId, updateDataWithFloor);

            // Assert
            expect(mockValidator.updateLocation).toHaveBeenCalledWith({ ...updateDataWithFloor, location_id: locationId });
            expect(mockRepository.locationExists).toHaveBeenCalledWith(locationId);
            expect(mockRepository.floorExists).toHaveBeenCalledWith(3);
            expect(mockRepository.update).toHaveBeenCalledWith({ ...updateDataWithFloor, location_id: locationId });
            expect(result).toEqual({ ...mockLocation, ...updateDataWithFloor });
        });

        it('should throw error when location not found', async () => {
            // Arrange
            const locationId = 999;
            mockValidator.updateLocation.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateData))
                .rejects
                .toThrow('Failed to update location: Location not found');
            
            expect(mockRepository.floorExists).not.toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when new floor not found', async () => {
            // Arrange
            const locationId = 1;
            mockValidator.updateLocation.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.floorExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateDataWithFloor))
                .rejects
                .toThrow('Failed to update location: Floor not found');
            
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            const locationId = 1;
            mockValidator.updateLocation.mockImplementation(() => {
                throw new Error('Invalid update data');
            });

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateData))
                .rejects
                .toThrow('Failed to update location: Invalid update data');
            
            expect(mockRepository.locationExists).not.toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            const locationId = 1;
            mockValidator.updateLocation.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(locationService.updateLocation(locationId, updateData))
                .rejects
                .toThrow('Failed to update location: Failed to update location');
        });
    });

    describe('deleteLocation', () => {
        it('should delete location successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(true);

            // Act
            const result = await locationService.deleteLocation(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.locationExists).toHaveBeenCalledWith(1);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when location not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.deleteLocation(999))
                .rejects
                .toThrow('Failed to delete location: Location not found');
            
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(locationService.deleteLocation(1))
                .rejects
                .toThrow('Failed to delete location: Failed to delete location');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid location ID');
            });

            // Act & Assert
            await expect(locationService.deleteLocation(-1))
                .rejects
                .toThrow('Failed to delete location: Invalid location ID');
            
            expect(mockRepository.locationExists).not.toHaveBeenCalled();
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });
    });
});