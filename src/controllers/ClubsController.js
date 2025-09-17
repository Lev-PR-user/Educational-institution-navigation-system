const pool = require('../config/db');

class ClubsController {
  async getClubs(req, res) {
    try {
      const query = `
        SELECT 
      club_id,
      name_clubs,
      description,
      contact_info,
      image_url,
      location_id
      From clubs`;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Get clubs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createClubs(req, res) {
    try {
      const { name_clubs, description, contact_info, image_url, location_id } = req.body;

      if (!name_clubs || !description || !contact_info || !location_id) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const newAdmin = await pool.query(
        `INSERT INTO clubs ( name_clubs, description, contact_info, image_url, location_id ) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [ name_clubs, description, contact_info, image_url, location_id ]
      );

      res.status(201).json(newAdmin.rows[0]);
    } catch (error) {
      console.error('Create clubs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateClubs(req, res) {
    try {
      const { id } = req.params;
      const { name_clubs, description, contact_info, image_url, location_id } = req.body;

      const adminCheck = await pool.query(
        'SELECT clubs FROM clubs WHERE club_id = $1',
        [id]
      );
      if (adminCheck.rows.length === 0) {
        return res.status(404).json({ message: 'clubs not found' });
      }

      const updatedAdmin = await pool.query(
        `UPDATE clubs 
         SET name_clubs = COALESCE($1, name_clubs),
             description = COALESCE($2, description)
             contact_info = COALESCE($3, contact_info)
             image_url = COALESCE($4, image_url)
             location_id = COALESCE($5, location_id)

         WHERE club_id = $6
         RETURNING *`,
        [ name_clubs, description, contact_info, image_url, location_id , id]
      );

      res.json(updatedAdmin.rows[0]);
    } catch (error) {
      console.error('Update clubs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteClubs(req, res) {
    try {
      const { id } = req.params;

      const adminCheck = await pool.query(
        'SELECT club_id FROM administration WHERE club_id = $1',
        [id]
      );
      if (adminCheck.rows.length === 0) {
        return res.status(404).json({ message: 'clubs not found' });
      }

      await pool.query('DELETE FROM clubs WHERE club_id = $1', [id]);
      res.json({ message: 'clubs deleted successfully' });
    } catch (error) {
      console.error('Delete clubs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new ClubsController();