const pool = require('../config/db');

class ContactsController {
  async getContacts(req, res) {
    try {
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
      res.json(result.rows);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createContacts(req, res) {
    try {
      const { contacts_id, phone_number, administration_email } = req.body;

      if (!contacts_id) {
        return res.status(400).json({ message: 'Contacts ID is required' });
      }

      const adminCheck = await pool.query(
        'SELECT administration_id FROM administration WHERE administration_id = $1',
        [contacts_id]
      );
      if (adminCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Administration not found' });
      }

      const newContact = await pool.query(
        `INSERT INTO contacts (contacts_id, phone_number, administration_email) 
         VALUES ($1, $2, $3) RETURNING *`,
        [contacts_id, phone_number, administration_email]
      );

      res.status(201).json(newContact.rows[0]);
    } catch (error) {
      console.error('Create contacts error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateContacts(req, res) {
    try {
      const { id } = req.params;
      const { phone_number, administration_email } = req.body;

      const contactCheck = await pool.query(
        'SELECT contacts_id FROM contacts WHERE contacts_id = $1',
        [id]
      );
      if (contactCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      const updatedContact = await pool.query(
        `UPDATE contacts 
         SET phone_number = COALESCE($1, phone_number),
             administration_email = COALESCE($2, administration_email)
         WHERE contacts_id = $3
         RETURNING *`,
        [phone_number, administration_email, id]
      );

      res.json(updatedContact.rows[0]);
    } catch (error) {
      console.error('Update contacts error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteContacts(req, res) {
    try {
      const { id } = req.params;

      const contactCheck = await pool.query(
        'SELECT contacts_id FROM contacts WHERE contacts_id = $1',
        [id]
      );
      if (contactCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      await pool.query('DELETE FROM contacts WHERE contacts_id = $1', [id]);
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Delete contacts error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new ContactsController();