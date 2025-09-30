const ContactsRepository = require('../repositories/ContactsRepository');
const ContactsValidator = require('../validators/ContactsValidator');

class ContactsService {
    async getAllContacts() {
        try {
            return await ContactsRepository.findAllWithAdminInfo();
        } catch (error) {
            throw new Error(`Failed to get contacts: ${error.message}`);
        }
    }

    async getContactById(contacts_id) {
        try {
            ContactsValidator.validateId(contacts_id);
            
            const contact = await ContactsRepository.findById(contacts_id);
            if (!contact) {
                throw new Error('Contact not found');
            }
            
            return contact;
        } catch (error) {
            throw new Error(`Failed to get contact: ${error.message}`);
        }
    }

    async createContact(contactData) {
        try {
            ContactsValidator.validateCreateData(contactData);
            
            const adminExists = await ContactsRepository.adminExists(contactData.contacts_id);
            if (!adminExists) {
                throw new Error('Administration not found');
            }

            const contactExists = await ContactsRepository.exists(contactData.contacts_id);
            if (contactExists) {
                throw new Error('Contact already exists for this administration');
            }

            return await ContactsRepository.create(contactData);
        } catch (error) {
            throw new Error(`Failed to create contact: ${error.message}`);
        }
    }

    async updateContact(contacts_id, contactData) {
        try {
            ContactsValidator.validateId(contacts_id);
            ContactsValidator.validateUpdateData(contactData);
            
            const contactExists = await ContactsRepository.exists(contacts_id);
            if (!contactExists) {
                throw new Error('Contact not found');
            }

            const updatedContact = await ContactsRepository.update(contacts_id, contactData);
            if (!updatedContact) {
                throw new Error('Failed to update contact');
            }
            
            return updatedContact;
        } catch (error) {
            throw new Error(`Failed to update contact: ${error.message}`);
        }
    }

    async deleteContact(contacts_id) {
        try {
            ContactsValidator.validateId(contacts_id);
            
            const contactExists = await ContactsRepository.exists(contacts_id);
            if (!contactExists) {
                throw new Error('Contact not found');
            }
            
            const isDeleted = await ContactsRepository.delete(contacts_id);
            if (!isDeleted) {
                throw new Error('Failed to delete contact');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete contact: ${error.message}`);
        }
    }
}

module.exports = new ContactsService();