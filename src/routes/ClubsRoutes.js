const express = require('express');
const router = express.Router();
const ClubsController = require('../controllers/ClubsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/', ClubsController.getClubs);
router.get('/:id', ClubsController.getClubById);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', ClubsController.createClub);
router.put('/:id', ClubsController.updateClub);
router.delete('/:id', ClubsController.deleteClub);

module.exports = router;