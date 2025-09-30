const express = require('express');
const router = express.Router();
const RoomsController = require('../controllers/RoomsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');


router.use(authMiddleware.Protect);
router.get('/', RoomsController.getAllRooms);
router.get('/:RoomNumber', RoomsController.getRoomByNumber);
router.get('/location/:locationId', RoomsController.getRoomsByLocation);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', RoomsController.createRoom);
router.put('/:RoomNumber', RoomsController.updateRoom);
router.delete('/:RoomNumber',  RoomsController.deleteRoom);

module.exports = router;