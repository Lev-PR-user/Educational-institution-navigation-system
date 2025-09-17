const pool = require('../config/db');

class TeachersController {
  async getAllTeachers(req, res) {
    try {
      const query = `
      SELECT 
          t.name_teacher, 
          t.position, 
          t.photo_url, 
          l.room, 
          l.description as location_description,
          f.floor_number
        FROM teachers t
        LEFT JOIN locations l ON t.location_id = l.location_id
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        ORDER BY t.name_teacher;
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Get teachers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createTeacher(req, res) {
    try {
      const { name_teacher, position, photo_url, location_id } = req.body;

      if (!name_teacher || !position || !photo_url) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (location_id) {
        const locationCheck = await pool.query(
          'SELECT location_id FROM locations WHERE location_id = $1',
          [location_id]
        );
        if (locationCheck.rows.length === 0) {
          return res.status(400).json({ message: 'Location not found' });
        }
      }

      const newTeacher = await pool.query(
        `INSERT INTO teachers (name_teacher, position, photo_url, location_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name_teacher, position, photo_url, location_id || null]
      );

      res.status(201).json(newTeacher.rows[0]);
    } catch (error) {
      console.error('Create teacher error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateTeacher(req, res) {
    try {
      const { id } = req.params;
      const { name_teacher, position, photo_url, location_id } = req.body;

      const teacherCheck = await pool.query(
        'SELECT teacher_id FROM teachers WHERE teacher_id = $1',
        [id]
      );
      if (teacherCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      if (location_id) {
        const locationCheck = await pool.query(
          'SELECT location_id FROM locations WHERE location_id = $1',
          [location_id]
        );
        if (locationCheck.rows.length === 0) {
          return res.status(400).json({ message: 'Location not found' });
        }
      }

      const updatedTeacher = await pool.query(
        `UPDATE teachers 
         SET name_teacher = COALESCE($1, name_teacher),
             position = COALESCE($2, position),
             photo_url = COALESCE($3, photo_url),
             location_id = COALESCE($4, location_id)
         WHERE teacher_id = $5
         RETURNING *`,
        [name_teacher, position, photo_url, location_id, id]
      );

      res.json(updatedTeacher.rows[0]);
    } catch (error) {
      console.error('Update teacher error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteTeacher(req, res) {
    try {
      const { id } = req.params;

      const teacherCheck = await pool.query(
        'SELECT teacher_id FROM teachers WHERE teacher_id = $1',
        [id]
      );
      if (teacherCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      await pool.query('DELETE FROM teachers WHERE teacher_id = $1', [id]);
      res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
      console.error('Delete teacher error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new TeachersController();