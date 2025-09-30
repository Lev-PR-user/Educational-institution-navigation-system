const RoomsRepository = require('../repositories/RoomsRepository');
const RoomsValidator = require('../validators/RoomsValidator')

class RoomService {
    async getAllRooms() {
        try {
            return await RoomsRepository.findAllWithDetails();
        } catch (error) {
            throw new Error(`Failed to get rooms: ${error.message}`);
        }
    }

    async getRoomByNumber(room_number) {  
        try {
            RoomsValidator.validateRoomNumber(room_number);
            
            const room = await RoomsRepository.findByNumber(room_number);
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
            RoomsValidator.validateFloorNumber(floor_number);
            
            return await RoomsRepository.findByFloorNumber(floor_number);
        } catch (error) {
            throw new Error(`Failed to get rooms by floor: ${error.message}`);
        }
    }

    async createRoom(roomData) {
        try {
            RoomsValidator.validateCreateData(roomData);
            
            const roomExists = await RoomsRepository.exists(roomData.room_number);
            if (roomExists) {
                throw new Error('Room with this number already exists');
            }

            return await RoomsRepository.create(roomData);
        } catch (error) {
            throw new Error(`Failed to create room: ${error.message}`);
        }
    }

    async updateRoom(room_number, roomData) {
        try {
            RoomsValidator.validateRoomNumber(room_number);
            RoomsValidator.validateUpdateData(roomData);
            
            const roomExists = await RoomsRepository.exists(room_number);
            if (!roomExists) {
                throw new Error('Room not found');
            }

            if (roomData.room_number) {
                const roomExists = await RoomsRepository.existsByNumber(
                    roomData.room_number, 
                    room_number
                );
                if (roomExists) {
                    throw new Error('Room with this number already exists');
                }
            }

            const updatedRoom = await RoomsRepository.update(room_number, roomData);
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
            RoomsValidator.validateRoomNumber(room_number);
            
            const roomExists = await RoomsRepository.exists(room_number);
            if (!roomExists) {
                throw new Error('Room not found');
            }
            
            const isDeleted = await RoomsRepository.delete(room_number);
            if (!isDeleted) {
                throw new Error('Failed to delete room');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete room: ${error.message}`);
        }
    }
}

module.exports = new RoomService();