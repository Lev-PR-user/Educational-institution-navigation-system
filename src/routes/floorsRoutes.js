const express = require('express');
const router = express.Router();
const FloorsController = require('../controllers/FloorsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/', FloorsController.getAllFloors);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', FloorsController.createFloor);
router.put('/:floor_number', FloorsController.updateFloor);
router.delete('/:floor_number', FloorsController.deleteFloor);

module.exports = router;