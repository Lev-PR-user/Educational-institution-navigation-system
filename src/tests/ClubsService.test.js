const ClubsService = require('../services/ClubsService');

describe('ClubsService', () => {
    let clubsService;
    let mockValidator;
    let mockRepository;
    
    const mockClub = {
        club_id: 1,
        club_name: 'Test Club',
        description: 'Test Description',
        established_date: '2020-01-01',
        contact_email: 'club@example.com',
        phone_number: '+1234567890',
        address: '123 Club Street, City, Country',
        is_active: true
    };

    beforeEach(() => {
        // Создаем моки для зависимостей
        mockValidator = {
            validateId: jest.fn(),
            validateCreateData: jest.fn(),
            validateUpdateData: jest.fn()
        };

        mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            locationExists: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        clubsService = new ClubsService({
            clubsValidator: mockValidator,  
            clubsRepository: mockRepository   
        });

        jest.clearAllMocks();
    });

    describe('getAllClubs', () => {
        it('should return all clubs successfully', async () => {
            // Arrange
            const mockClubs = [
                mockClub,
                { 
                    ...mockClub, 
                    club_id: 2, 
                    club_name: 'Second Club',
                    contact_email: 'club2@example.com'
                }
            ];
            mockRepository.findAll.mockResolvedValue(mockClubs);

            // Act
            const result = await clubsService.getAllClubs();

            // Assert
            expect(mockRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockClubs);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            mockRepository.findAll.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(clubsService.getAllClubs())
                .rejects
                .toThrow('Failed to get clubs: Database connection failed');
        });
    });

    describe('getClubById', () => {
        it('should return club by id successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(mockClub);

            // Act
            const result = await clubsService.getClubById(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockClub);
        });

        it('should throw error when club not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(clubsService.getClubById(999))
                .rejects
                .toThrow('Failed to get club: Club not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid club ID');
            });

            // Act & Assert
            await expect(clubsService.getClubById(-1))
                .rejects
                .toThrow('Failed to get club: Invalid club ID');
            
            expect(mockRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('createClub', () => {
        const validClubData = {
            club_name: 'New Club',
            description: 'New Club Description',
            established_date: '2023-01-01',
            contact_email: 'newclub@example.com',
            phone_number: '+1111111111',
            address: '456 New Street, City, Country',
            is_active: true
        };

        it('should create club successfully', async () => {
            // Arrange
            mockValidator.validateCreateData.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.create.mockResolvedValue({ ...mockClub, ...validClubData });

            // Act
            const result = await clubsService.createClub(validClubData);

            // Assert
            expect(mockValidator.validateCreateData).toHaveBeenCalledWith(validClubData);
            expect(mockRepository.locationExists).toHaveBeenCalledWith(validClubData.location_id);
            expect(mockRepository.create).toHaveBeenCalledWith(validClubData);
            expect(result).toEqual({ ...mockClub, ...validClubData });
        });

        it('should throw error when location not found', async () => {
            // Arrange
            mockValidator.validateCreateData.mockReturnValue(true);
            mockRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(clubsService.createClub(validClubData))
                .rejects
                .toThrow('Failed to create club: Location not found');
            
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid club data');
            });

            // Act & Assert
            await expect(clubsService.createClub(validClubData))
                .rejects
                .toThrow('Failed to create club: Invalid club data');
            
            expect(mockRepository.locationExists).not.toHaveBeenCalled();
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateClub', () => {
        const updateData = {
            club_name: 'Updated Club Name',
            description: 'Updated Description',
            contact_email: 'updated@example.com'
        };

        const updateDataWithLocation = {
            ...updateData,
            location_id: 2
        };

        it('should update club successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue({ ...mockClub, ...updateData });

            // Act
            const result = await clubsService.updateClub(1, updateData);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockClub, ...updateData });
        });

        it('should update club with location successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.locationExists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue({ ...mockClub, ...updateDataWithLocation });

            // Act
            const result = await clubsService.updateClub(1, updateDataWithLocation);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockValidator.validateUpdateData).toHaveBeenCalledWith(updateDataWithLocation);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.locationExists).toHaveBeenCalledWith(2);
            expect(mockRepository.update).toHaveBeenCalledWith(1, updateDataWithLocation);
            expect(result).toEqual({ ...mockClub, ...updateDataWithLocation });
        });

        it('should throw error when club not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(clubsService.updateClub(999, updateData))
                .rejects
                .toThrow('Failed to update club: Club not found');
            
            expect(mockRepository.locationExists).not.toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when location not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.locationExists.mockResolvedValue(false);

            // Act & Assert
            await expect(clubsService.updateClub(1, updateDataWithLocation))
                .rejects
                .toThrow('Failed to update club: Location not found');
            
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid club ID');
            });

            // Act & Assert
            await expect(clubsService.updateClub(-1, updateData))
                .rejects
                .toThrow('Failed to update club: Invalid club ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(clubsService.updateClub(1, updateData))
                .rejects
                .toThrow('Failed to update club: Failed to update club');
        });
    });

    describe('deleteClub', () => {
        it('should delete club successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(true);

            // Act
            const result = await clubsService.deleteClub(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when club not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(clubsService.deleteClub(999))
                .rejects
                .toThrow('Failed to delete club: Club not found');
            
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(clubsService.deleteClub(1))
                .rejects
                .toThrow('Failed to delete club: Failed to delete club');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid club ID');
            });

            // Act & Assert
            await expect(clubsService.deleteClub(-1))
                .rejects
                .toThrow('Failed to delete club: Invalid club ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });
    });
});