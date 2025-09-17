const express = require('express');
const router = express.Router();
const ContactsController = require('../controllers/ContactsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/',  ContactsController.getContacts);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', ContactsController.createContacts);
router.put('/:id',  ContactsController.updateContacts);
router.delete('/:id', ContactsController.deleteContacts);

module.exports = router;