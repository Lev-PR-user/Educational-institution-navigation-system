const ContactsService = require('../services/ContactsService');

class ContactsController {
    async getContacts(req, res) {
        try {
            const contacts = await ContactsService.getAllContacts();
            res.json(contacts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getContactById(req, res) {
        try {
            const { id } = req.params;
            const contact = await ContactsService.getContactById(id);
            res.json(contact);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createContact(req, res) {
        try {
            const contact = await ContactsService.createContact(req.body);
            res.status(201).json({
                message: 'Contact created successfully',
                contact
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('already exists')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async updateContact(req, res) {
        try {
            const { id } = req.params;
            const contact = await ContactsService.updateContact(id, req.body);
            res.json({
                message: 'Contact updated successfully',
                contact
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteContact(req, res) {
        try {
            const { id } = req.params;
            await ContactsService.deleteContact(id);
            res.json({ message: 'Contact deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new ContactsController();