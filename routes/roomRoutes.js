const express = require('express');
const router = express.Router();
const RoomsController = require('../controllers/RoomsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');


router.use(authMiddleware.Protect);
router.get('/', RoomsController.getAllRooms);
router.get('/:id', RoomsController.getRoomById);
router.get('/location/:locationId', RoomsController.getRoomsByLocation);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', RoomsController.createRoom);
router.put('/:id', RoomsController.updateRoom);
router.delete('/:id',  RoomsController.deleteRoom);

module.exports = router;