const express = require('express');

function createRoomRoutes(roomsController, authMiddleware, checkAdmin) {
  const router = express.Router();

  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => roomsController.getAllRooms(req, res));
  router.get('/:RoomNumber', (req, res) => roomsController.getRoomByNumber(req, res));
  router.get('/location/:locationId', (req, res) => roomsController.getRoomsByLocation(req, res));

  router.use(checkAdmin);
  router.post('/', (req, res) => roomsController.createRoom(req, res));
  router.put('/update/:RoomNumber', (req, res) => roomsController.updateRoom(req, res));
  router.delete('/delete/:RoomNumber', (req, res) => roomsController.deleteRoom(req, res));

  return router;
}

module.exports = createRoomRoutes;