class ContactsValidator {
    static validateCreateData(data) {
        const { contacts_id, phone_number, administration_email } = data;
        
        if (!contacts_id) {
            throw new Error('Contacts ID is required');
        }

        if (isNaN(parseInt(contacts_id)) || contacts_id < 1) {
            throw new Error('Valid contacts ID is required');
        }

        if (phone_number && phone_number.length > 20) {
            throw new Error('Phone number must be less than 20 characters');
        }

        if (administration_email) {
            const emailRegex = /^[^\s@]+@(mail\.ru|gmail\.com|yandex\.ru|outlook\.com|bk\.ru|inbox\.ru|rambler\.ru)$/;
            if (!emailRegex.test(administration_email)) {
                throw new Error('Invalid email domain');
            }
        }

        return true;
    }

    static validateUpdateData(data) {
        const { phone_number, administration_email } = data;
        
        if (phone_number && phone_number.length > 20) {
            throw new Error('Phone number must be less than 20 characters');
        }

        if (administration_email) {
            const emailRegex = /^[^\s@]+@(mail\.ru|gmail\.com|yandex\.ru|outlook\.com|bk\.ru|inbox\.ru|rambler\.ru)$/;
            if (!emailRegex.test(administration_email)) {
                throw new Error('Invalid email domain');
            }
        }

        return true;
    }

    static validateId(id) {
        if (!id || isNaN(parseInt(id)) || id < 1) {
            throw new Error('Valid contact ID is required');
        }
        return true;
    }
}

module.exports = ContactsValidator;