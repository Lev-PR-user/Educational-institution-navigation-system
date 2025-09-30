const pool = require('../config/db');

class ContactsRepository {
    async findAllWithAdminInfo() {
        const query = `
            SELECT 
                c.contacts_id,
                c.phone_number,
                c.administration_email,
                a.name_administration,
                a.position
            FROM contacts c
            LEFT JOIN administration a ON c.contacts_id = a.administration_id
            ORDER BY a.name_administration;
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(contacts_id) {
        const query = `
            SELECT 
                c.contacts_id,
                c.phone_number,
                c.administration_email,
                a.name_administration,
                a.position
            FROM contacts c
            LEFT JOIN administration a ON c.contacts_id = a.administration_id
            WHERE c.contacts_id = $1;
        `;
        
        const result = await pool.query(query, [contacts_id]);
        return result.rows[0] || null;
    }

    async create(contactData) {
        const { contacts_id, phone_number, administration_email } = contactData;
        
        const result = await pool.query(
            `INSERT INTO contacts (contacts_id, phone_number, administration_email) 
             VALUES ($1, $2, $3) RETURNING *`,
            [contacts_id, phone_number, administration_email]
        );
        
        return result.rows[0];
    }

    async update(contacts_id, contactData) {
        const { phone_number, administration_email } = contactData;
        
        const result = await pool.query(
            `UPDATE contacts 
             SET phone_number = COALESCE($1, phone_number),
                 administration_email = COALESCE($2, administration_email)
             WHERE contacts_id = $3
             RETURNING *`,
            [phone_number, administration_email, contacts_id]
        );
        
        return result.rows[0] || null;
    }

    async delete(contacts_id) {
        const result = await pool.query(
            'DELETE FROM contacts WHERE contacts_id = $1 RETURNING *',
            [contacts_id]
        );
        return result.rows.length > 0;
    }

    async exists(contacts_id) {
        const result = await pool.query(
            'SELECT contacts_id FROM contacts WHERE contacts_id = $1',
            [contacts_id]
        );
        return result.rows.length > 0;
    }

    async adminExists(administration_id) {
        const result = await pool.query(
            'SELECT administration_id FROM administration WHERE administration_id = $1',
            [administration_id]
        );
        return result.rows.length > 0;
    }
}

module.exports = new ContactsRepository();