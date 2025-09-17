const pool = require('../config/db');

class LocationsController {
  async getAllLocations(req, res) {
    try {
      const query = `
        SELECT 
          l.location_id,
          l.description,
          l.room,
          l.floor_number,
          f.map_image_url as floor_map
        FROM locations l
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        ORDER BY l.floor_number, l.room
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Get locations error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getLocationById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          l.location_id,
          l.description,
          l.room,
          l.floor_number,
          f.map_image_url as floor_map
        FROM locations l
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        WHERE l.location_id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Location not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get location error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createLocation(req, res) {
    try {
      const { description, room, floor_number } = req.body;

      if (!description || !room || !floor_number) {
        return res.status(400).json({ message: 'Description, room and floor number are required' });
      }

      const floorCheck = await pool.query(
        'SELECT floor_number FROM floors WHERE floor_number = $1',
        [floor_number]
      );
      if (floorCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Floor not found' });
      }

      const newLocation = await pool.query(
        `INSERT INTO locations (description, room, floor_number) 
         VALUES ($1, $2, $3) RETURNING *`,
        [description, room, floor_number]
      );

      res.status(201).json(newLocation.rows[0]);
    } catch (error) {
      console.error('Create location error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const { description, room, floor_number } = req.body;

      const locationCheck = await pool.query(
        'SELECT location_id FROM locations WHERE location_id = $1',
        [id]
      );
      if (locationCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Location not found' });
      }

      if (floor_number) {
        const floorCheck = await pool.query(
          'SELECT floor_number FROM floors WHERE floor_number = $1',
          [floor_number]
        );
        if (floorCheck.rows.length === 0) {
          return res.status(400).json({ message: 'Floor not found' });
        }
      }

      const updatedLocation = await pool.query(
        `UPDATE locations 
         SET description = COALESCE($1, description),
             room = COALESCE($2, room),
             floor_number = COALESCE($3, floor_number)
         WHERE location_id = $4
         RETURNING *`,
        [description, room, floor_number, id]
      );

      res.json(updatedLocation.rows[0]);
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteLocation(req, res) {
    try {
      const { id } = req.params;

      const locationCheck = await pool.query(
        'SELECT location_id FROM locations WHERE location_id = $1',
        [id]
      );
      if (locationCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Location not found' });
      }

      await pool.query('DELETE FROM locations WHERE location_id = $1', [id]);
      res.json({ message: 'Location deleted successfully' });
    } catch (error) {
      console.error('Delete location error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getLocationsByFloor(req, res) {
    try {
      const { floorNumber } = req.params;
      
      const query = `
        SELECT 
          l.location_id,
          l.description,
          l.room,
          l.floor_number
        FROM locations l
        WHERE l.floor_number = $1
        ORDER BY l.room
      `;
      
      const result = await pool.query(query, [floorNumber]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get locations by floor error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new LocationsController();