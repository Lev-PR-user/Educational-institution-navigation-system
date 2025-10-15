const sequelize = require('../config/db');

class ContactsRepository {
    async findAllWithAdminInfo() {
        const result = await sequelize.models.contacts.findAll({
            attributes: [
                'contacts_id',
                'phone_number',
                'administration_email',
                [sequelize.literal('"administration"."name_administration"'), 'name_administration'],
                [sequelize.literal('"administration"."position"'), 'position']
            ],
            include: [
                {
                    model: sequelize.models.administration,
                    as: 'administration',
                    attributes: []
                }
            ],
            order: [[sequelize.literal('"administration"."name_administration"'), 'ASC']]
        });
        return result;
    }

    async findById(contacts_id) {
        const result = await sequelize.models.contacts.findOne({
            attributes: [
                'contacts_id',
                'phone_number',
                'administration_email',
                [sequelize.literal('"administration"."name_administration"'), 'name_administration'],
                [sequelize.literal('"administration"."position"'), 'position']
            ],
            include: [
                {
                    model: sequelize.models.administration,
                    as: 'administration',
                    attributes: []
                }
            ],
            where: { contacts_id }
        });
        return result;
    }

    async create(contactData) {
        const { contacts_id, phone_number, administration_email } = contactData;
        
        const result = await sequelize.models.contacts.create({
            contacts_id,
            phone_number,
            administration_email
        });
        
        return result;
    }

    async update(contacts_id, contactData) {
        const { phone_number, administration_email } = contactData;
        
        await sequelize.models.contacts.update({
            phone_number,
            administration_email
        }, {
            where: { contacts_id }
        });

        const updatedContact = await sequelize.models.contacts.findOne({
            where: { contacts_id }
        });
        
        return updatedContact;
    }

    async delete(contacts_id) {
        const result = await sequelize.models.contacts.destroy({
            where: { contacts_id }
        });
        return result > 0;
    }

    async exists(contacts_id) {
        const result = await sequelize.models.contacts.findOne({
            where: { contacts_id },
            attributes: ['contacts_id']
        });
        return result !== null;
    }

    async adminExists(administration_id) {
        const result = await sequelize.models.administration.findOne({
            where: { administration_id },
            attributes: ['administration_id']
        });
        return result !== null;
    }
}

module.exports =  ContactsRepository;