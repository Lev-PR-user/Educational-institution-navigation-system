const pool = require('../config/db');

class FloorsController {
  async getAllFloors(req, res) {
    try {
      const result = await pool.query('SELECT * FROM floors ORDER BY floor_number');
      res.json(result.rows);
    } catch (error) {
      console.error('Get floors error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createFloor(req, res) {
    try {
      const { floor_number, map_image_url } = req.body;

      if (!floor_number || !map_image_url) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const floorCheck = await pool.query(
        'SELECT floor_number FROM floors WHERE floor_number = $1',
        [floor_number]
      );
      if (floorCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Floor already exists' });
      }

      const newFloor = await pool.query(
        'INSERT INTO floors (floor_number, map_image_url) VALUES ($1, $2) RETURNING *',
        [floor_number, map_image_url]
      );

      res.status(201).json(newFloor.rows[0]);
    } catch (error) {
      console.error('Create floor error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateFloor(req, res) {
    try {
      const { id } = req.params;
      const { map_image_url } = req.body;

      const floorCheck = await pool.query(
        'SELECT floor_number FROM floors WHERE floor_number = $1',
        [id]
      );
      if (floorCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Floor not found' });
      }

      const updatedFloor = await pool.query(
        'UPDATE floors SET map_image_url = COALESCE($1, map_image_url) WHERE floor_number = $2 RETURNING *',
        [map_image_url, id]
      );

      res.json(updatedFloor.rows[0]);
    } catch (error) {
      console.error('Update floor error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteFloor(req, res) {
    try {
      const { id } = req.params;

      const floorCheck = await pool.query(
        'SELECT floor_number FROM floors WHERE floor_number = $1',
        [id]
      );
      if (floorCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Floor not found' });
      }

      await pool.query('DELETE FROM floors WHERE floor_number = $1', [id]);
      res.json({ message: 'Floor deleted successfully' });
    } catch (error) {
      console.error('Delete floor error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new FloorsController();