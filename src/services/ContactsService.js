class ContactsService {
    constructor({ contactsValidator, contactsRepository }) {
        this.contactsValidator = contactsValidator;
        this.contactsRepository = contactsRepository;
    }
    async getAllContacts() {
        try {
            return await this.contactsRepository.findAllWithAdminInfo();
        } catch (error) {
            throw new Error(`Failed to get contacts: ${error.message}`);
        }
    }

    async getContactById(contacts_id) {
        try {
            this.contactsValidator.validateId(contacts_id);
            
            const contact = await this.contactsRepository.findById(contacts_id);
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
            this.contactsValidator.validateCreateData(contactData);
            
            const adminExists = await this.contactsRepository.adminExists(contactData.contacts_id);
            if (!adminExists) {
                throw new Error('Administration not found');
            }

            const contactExists = await this.contactsRepository.exists(contactData.contacts_id);
            if (contactExists) {
                throw new Error('Contact already exists for this administration');
            }

            return await this.contactsRepository.create(contactData);
        } catch (error) {
            throw new Error(`Failed to create contact: ${error.message}`);
        }
    }

    async updateContact(contacts_id, contactData) {
        try {
            this.contactsValidator.validateId(contacts_id);
            this.contactsValidator.validateUpdateData(contactData);
            
            const contactExists = await this.contactsRepository.exists(contacts_id);
            if (!contactExists) {
                throw new Error('Contact not found');
            }

            const updatedContact = await this.contactsRepository.update(contacts_id, contactData);
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
            this.contactsValidator.validateId(contacts_id);
            
            const contactExists = await this.contactsRepository.exists(contacts_id);
            if (!contactExists) {
                throw new Error('Contact not found');
            }
            
            const isDeleted = await this.contactsRepository.delete(contacts_id);
            if (!isDeleted) {
                throw new Error('Failed to delete contact');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete contact: ${error.message}`);
        }
    }
}

module.exports =  ContactsService;