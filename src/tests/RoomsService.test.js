const RoomService = require('../services/RoomsService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/RoomsRepository', () => ({
    findAllWithDetails: jest.fn(),
    findByNumber: jest.fn(),
    findByFloorNumber: jest.fn(),
    exists: jest.fn(),
    existsByNumber: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/RoomsValidator', () => ({
    validateRoomNumber: jest.fn(),
    validateFloorNumber: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn()
}));

// Теперь импортируем моки
const RoomsRepository = require('../repositories/RoomsRepository');
const RoomsValidator = require('../validators/RoomsValidator');

describe('RoomService', () => {
    let roomService;
    
    const mockRoom = {
        room_id: 1,
        room_number: '101',
        floor_number: 1,
        capacity: 30,
        room_type: 'lecture',
        equipment: ['projector', 'whiteboard'],
        is_available: true,
        created_at: '2023-01-01T00:00:00.000Z'
    };

    const mockRoomWithDetails = {
        ...mockRoom,
        location: {
            location_name: 'Main Building'
        }
    };

    beforeEach(() => {
        roomService = new RoomService();
        jest.clearAllMocks();
    });

    describe('getAllRooms', () => {
        it('should return all rooms with details successfully', async () => {
            // Arrange
            const mockRooms = [mockRoomWithDetails, { ...mockRoomWithDetails, room_id: 2, room_number: '102' }];
            RoomsRepository.findAllWithDetails.mockResolvedValue(mockRooms);

            // Act
            const result = await roomService.getAllRooms();

            // Assert
            expect(RoomsRepository.findAllWithDetails).toHaveBeenCalled();
            expect(result).toEqual(mockRooms);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            RoomsRepository.findAllWithDetails.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(roomService.getAllRooms())
                .rejects
                .toThrow('Failed to get rooms: Database connection failed');
        });
    });

    describe('getRoomByNumber', () => {
        it('should return room by number successfully', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsRepository.findByNumber.mockResolvedValue(mockRoomWithDetails);

            // Act
            const result = await roomService.getRoomByNumber('101');

            // Assert
            expect(RoomsValidator.validateRoomNumber).toHaveBeenCalledWith('101');
            expect(RoomsRepository.findByNumber).toHaveBeenCalledWith('101');
            expect(result).toEqual(mockRoomWithDetails);
        });

        it('should throw error when room not found', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsRepository.findByNumber.mockResolvedValue(null);

            // Act & Assert
            await expect(roomService.getRoomByNumber('999'))
                .rejects
                .toThrow('Failed to get room: Room not found');
        });

        it('should throw error when room number validation fails', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockImplementation(() => {
                throw new Error('Invalid room number');
            });

            // Act & Assert
            await expect(roomService.getRoomByNumber(''))
                .rejects
                .toThrow('Failed to get room: Invalid room number');
            
            expect(RoomsRepository.findByNumber).not.toHaveBeenCalled();
        });
    });

    describe('getRoomsByFloor', () => {
        it('should return rooms by floor number successfully', async () => {
            // Arrange
            const mockRooms = [mockRoomWithDetails, { ...mockRoomWithDetails, room_number: '102' }];
            RoomsValidator.validateFloorNumber.mockReturnValue(true);
            RoomsRepository.findByFloorNumber.mockResolvedValue(mockRooms);

            // Act
            const result = await roomService.getRoomsByFloor(1);

            // Assert
            expect(RoomsValidator.validateFloorNumber).toHaveBeenCalledWith(1);
            expect(RoomsRepository.findByFloorNumber).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockRooms);
        });

        it('should return empty array when no rooms on floor', async () => {
            // Arrange
            RoomsValidator.validateFloorNumber.mockReturnValue(true);
            RoomsRepository.findByFloorNumber.mockResolvedValue([]);

            // Act
            const result = await roomService.getRoomsByFloor(5);

            // Assert
            expect(RoomsValidator.validateFloorNumber).toHaveBeenCalledWith(5);
            expect(RoomsRepository.findByFloorNumber).toHaveBeenCalledWith(5);
            expect(result).toEqual([]);
        });

        it('should throw error when floor number validation fails', async () => {
            // Arrange
            RoomsValidator.validateFloorNumber.mockImplementation(() => {
                throw new Error('Invalid floor number');
            });

            // Act & Assert
            await expect(roomService.getRoomsByFloor(-1))
                .rejects
                .toThrow('Failed to get rooms by floor: Invalid floor number');
            
            expect(RoomsRepository.findByFloorNumber).not.toHaveBeenCalled();
        });
    });

    describe('createRoom', () => {
        const validRoomData = {
            room_number: '201',
            floor_number: 2,
            capacity: 25,
            room_type: 'seminar',
            equipment: ['projector'],
            is_available: true
        };

        it('should create room successfully', async () => {
            // Arrange
            RoomsValidator.validateCreateData.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(false);
            RoomsRepository.create.mockResolvedValue({ ...mockRoom, ...validRoomData });

            // Act
            const result = await roomService.createRoom(validRoomData);

            // Assert
            expect(RoomsValidator.validateCreateData).toHaveBeenCalledWith(validRoomData);
            expect(RoomsRepository.exists).toHaveBeenCalledWith('201');
            expect(RoomsRepository.create).toHaveBeenCalledWith(validRoomData);
            expect(result).toEqual({ ...mockRoom, ...validRoomData });
        });

        it('should throw error when room already exists', async () => {
            // Arrange
            RoomsValidator.validateCreateData.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(true);

            // Act & Assert
            await expect(roomService.createRoom(validRoomData))
                .rejects
                .toThrow('Failed to create room: Room with this number already exists');
            
            expect(RoomsRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            RoomsValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid room data');
            });

            // Act & Assert
            await expect(roomService.createRoom(validRoomData))
                .rejects
                .toThrow('Failed to create room: Invalid room data');
            
            expect(RoomsRepository.exists).not.toHaveBeenCalled();
            expect(RoomsRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateRoom', () => {
        const updateData = {
            capacity: 35,
            equipment: ['projector', 'whiteboard', 'sound_system']
        };

        const updateDataWithNumber = {
            ...updateData,
            room_number: '101A'
        };

        it('should update room successfully', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsValidator.validateUpdateData.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(true);
            RoomsRepository.existsByNumber.mockResolvedValue(false);
            RoomsRepository.update.mockResolvedValue({ ...mockRoom, ...updateData });

            // Act
            const result = await roomService.updateRoom('101', updateData);

            // Assert
            expect(RoomsValidator.validateRoomNumber).toHaveBeenCalledWith('101');
            expect(RoomsValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(RoomsRepository.exists).toHaveBeenCalledWith('101');
            expect(RoomsRepository.update).toHaveBeenCalledWith('101', updateData);
            expect(result).toEqual({ ...mockRoom, ...updateData });
        });

        it('should update room with new number successfully', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsValidator.validateUpdateData.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(true);
            RoomsRepository.existsByNumber.mockResolvedValue(false);
            RoomsRepository.update.mockResolvedValue({ ...mockRoom, ...updateDataWithNumber });

            // Act
            const result = await roomService.updateRoom('101', updateDataWithNumber);

            // Assert
            expect(RoomsValidator.validateRoomNumber).toHaveBeenCalledWith('101');
            expect(RoomsValidator.validateUpdateData).toHaveBeenCalledWith(updateDataWithNumber);
            expect(RoomsRepository.exists).toHaveBeenCalledWith('101');
            expect(RoomsRepository.existsByNumber).toHaveBeenCalledWith('101A', '101');
            expect(RoomsRepository.update).toHaveBeenCalledWith('101', updateDataWithNumber);
            expect(result).toEqual({ ...mockRoom, ...updateDataWithNumber });
        });

        it('should throw error when room not found', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsValidator.validateUpdateData.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(roomService.updateRoom('999', updateData))
                .rejects
                .toThrow('Failed to update room: Room not found');
            
            expect(RoomsRepository.existsByNumber).not.toHaveBeenCalled();
            expect(RoomsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when new room number already exists', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsValidator.validateUpdateData.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(true);
            RoomsRepository.existsByNumber.mockResolvedValue(true);

            // Act & Assert
            await expect(roomService.updateRoom('101', updateDataWithNumber))
                .rejects
                .toThrow('Failed to update room: Room with this number already exists');
            
            expect(RoomsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockImplementation(() => {
                throw new Error('Invalid room number');
            });

            // Act & Assert
            await expect(roomService.updateRoom('', updateData))
                .rejects
                .toThrow('Failed to update room: Invalid room number');
            
            expect(RoomsRepository.exists).not.toHaveBeenCalled();
            expect(RoomsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsValidator.validateUpdateData.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(true);
            RoomsRepository.existsByNumber.mockResolvedValue(false);
            RoomsRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(roomService.updateRoom('101', updateData))
                .rejects
                .toThrow('Failed to update room: Failed to update room');
        });
    });

    describe('deleteRoom', () => {
        it('should delete room successfully', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(true);
            RoomsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await roomService.deleteRoom('101');

            // Assert
            expect(RoomsValidator.validateRoomNumber).toHaveBeenCalledWith('101');
            expect(RoomsRepository.exists).toHaveBeenCalledWith('101');
            expect(RoomsRepository.delete).toHaveBeenCalledWith('101');
            expect(result).toBe(true);
        });

        it('should throw error when room not found', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(roomService.deleteRoom('999'))
                .rejects
                .toThrow('Failed to delete room: Room not found');
            
            expect(RoomsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockReturnValue(true);
            RoomsRepository.exists.mockResolvedValue(true);
            RoomsRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(roomService.deleteRoom('101'))
                .rejects
                .toThrow('Failed to delete room: Failed to delete room');
        });

        it('should throw error when room number validation fails', async () => {
            // Arrange
            RoomsValidator.validateRoomNumber.mockImplementation(() => {
                throw new Error('Invalid room number');
            });

            // Act & Assert
            await expect(roomService.deleteRoom(''))
                .rejects
                .toThrow('Failed to delete room: Invalid room number');
            
            expect(RoomsRepository.exists).not.toHaveBeenCalled();
            expect(RoomsRepository.delete).not.toHaveBeenCalled();
        });
    });
});