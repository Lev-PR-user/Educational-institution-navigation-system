const express = require('express');

function createContactsRoutes(contactsController, authMiddleware, checkAdmin) {
  const router = express.Router();

  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => contactsController.getContacts(req, res));
  router.get('/:id', (req, res) => contactsController.getContactById(req, res));

  router.use(checkAdmin);
  router.post('/', (req, res) => contactsController.createContact(req, res));
  router.put('/update/:id', (req, res) => contactsController.updateContact(req, res));
  router.delete('/delete/:id', (req, res) => contactsController.deleteContact(req, res));

  return router;
}

module.exports = createContactsRoutes;