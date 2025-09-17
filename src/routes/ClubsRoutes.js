const express = require('express');
const router = express.Router();
const ClubsController = require('../controllers/ClubsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/', ClubsController.getClubs);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', ClubsController.createClubs);
router.put('/:id', ClubsController.updateClubs);
router.delete('/:id', ClubsController.deleteClubs);

module.exports = router;