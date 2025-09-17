const pool = require('../config/db');

class AdministrationController {
  async getAllAdministration(req, res) {
    try {
      const query = `
        SELECT 
          a.name_administration,
          a.position,
          a.photo_url,
          COALESCE(c.phone_number::text, '-') as phone_number,
          COALESCE(c.administration_email, '-') as email,
          COALESCE(l.room, '-') as room,
          COALESCE(l.description, '-') as location_description,
          COALESCE(f.floor_number::text, '-') as floor_number
        FROM administration a
        LEFT JOIN contacts c ON a.administration_id = c.contacts_id
        LEFT JOIN locations l ON a.location_id = l.location_id
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        ORDER BY a.name_administration;
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Get administration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createAdministration(req, res) {
    try {
      const { name_administration, position, photo_url, location_id } = req.body;

      if (!name_administration || !position || !photo_url) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const newAdmin = await pool.query(
        `INSERT INTO administration (name_administration, position, photo_url, location_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name_administration, position, photo_url, location_id]
      );

       await pool.query(
        'INSERT INTO contacts (contacts_id) VALUES ($1)',
        [newAdmin.rows[0].administration_id] 
      );

      res.status(201).json(newAdmin.rows[0]);
    } catch (error) {
      console.error('Create administration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateAdministration(req, res) {
    try {
      const { id } = req.params;
    const { name_administration, position, photo_url, location_id } = req.body;

    const adminCheck = await pool.query(
      'SELECT administration_id FROM administration WHERE administration_id = $1',
      [id]
    );
    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Administration not found' });
    }

    const updatedAdmin = await pool.query(
      `UPDATE administration 
       SET name_administration = COALESCE($1, name_administration),
           position = COALESCE($2, position),
           photo_url = COALESCE($3, photo_url),
           location_id = COALESCE($4, location_id)
       WHERE administration_id = $5
       RETURNING *`,
      [name_administration, position, photo_url, location_id, id]
    );

    res.json(updatedAdmin.rows[0]);
  } catch (error) {
    console.error('Update administration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

  async deleteAdministration(req, res) {
    try {
      const { id } = req.params;

      const adminCheck = await pool.query(
        'SELECT administration_id FROM administration WHERE administration_id = $1',
        [id]
      );
      if (adminCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Administration not found' });
      }

      await pool.query('DELETE FROM administration WHERE administration_id = $1', [id]);
      res.json({ message: 'Administration deleted successfully' });
    } catch (error) {
      console.error('Delete administration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new AdministrationController();