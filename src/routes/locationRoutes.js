const express = require('express');
const router = express.Router();
const LocationsController = require('../controllers/LocationsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/', LocationsController.getAllLocations);
router.get('/:id', LocationsController.getLocationById);
router.get('/floor/:floorNumber', LocationsController.getLocationsByFloor);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', LocationsController.createLocation);
router.put('/:id', LocationsController.updateLocation);
router.delete('/:id', LocationsController.deleteLocation);

module.exports = router;

