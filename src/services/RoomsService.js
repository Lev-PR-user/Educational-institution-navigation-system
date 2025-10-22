class RoomService {
    constructor({ roomsValidator, roomsRepository }) {
        this.roomsValidator = roomsValidator;
        this.roomsRepository = roomsRepository;
    }
    async getAllRooms() {
        try {
            return await this.roomsRepository.findAllWithDetails();
        } catch (error) {
            throw new Error(`Failed to get rooms: ${error.message}`);
        }
    }

    async getRoomByNumber(room_number) {  
        try {
            this.roomsValidator.validateRoomNumber(room_number);
            
            const room = await this.roomsRepository.findByNumber(room_number);
            if (!room) {
                throw new Error('Room not found');
            }
            
            return room;
        } catch (error) {
            throw new Error(`Failed to get room: ${error.message}`);
        }
    }

    async getRoomsByFloor(floor_number) { 
        try {
            this.roomsValidator.validateFloorNumber(floor_number);
            
            return await this.roomsRepository.findByFloorNumber(floor_number);
        } catch (error) {
            throw new Error(`Failed to get rooms by floor: ${error.message}`);
        }
    }

    async createRoom(roomData) {
        try {
            this.roomsValidator.validateCreateData(roomData);
            
            const roomExists = await this.roomsRepository.exists(roomData.room_number);
            if (roomExists) {
                throw new Error('Room with this number already exists');
            }

            return await this.roomsRepository.create(roomData);
        } catch (error) {
            throw new Error(`Failed to create room: ${error.message}`);
        }
    }

    async updateRoom(room_number, roomData) {
        try {
            this.roomsValidator.validateRoomNumber(room_number);
            this.roomsValidator.validateUpdateData(roomData);
            
            const roomExists = await this.roomsRepository.exists(room_number);
            if (!roomExists) {
                throw new Error('Room not found');
            }

            if (roomData.room_number) {
                const roomExists = await this.roomsRepository.existsByNumber(
                    roomData.room_number, 
                    room_number
                );
                if (roomExists) {
                    throw new Error('Room with this number already exists');
                }
            }

            const updatedRoom = await this.roomsRepository.update(room_number, roomData);
            if (!updatedRoom) {
                throw new Error('Failed to update room');
            }
            
            return updatedRoom;
        } catch (error) {
            throw new Error(`Failed to update room: ${error.message}`);
        }
    }

    async deleteRoom(room_number) {
        try {
            this.roomsValidator.validateRoomNumber(room_number);
            
            const roomExists = await this.roomsRepository.exists(room_number);
            if (!roomExists) {
                throw new Error('Room not found');
            }
            
            const isDeleted = await this.roomsRepository.delete(room_number);
            if (!isDeleted) {
                throw new Error('Failed to delete room');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete room: ${error.message}`);
        }
    }
}

module.exports =  RoomService;