const pool = require('../config/db');

class RoomsController {
  async getAllRooms(req, res) {
    try {
      const query = `
        SELECT 
          r.room_number,
          r.room_url,
          l.description as location_description,
          f.floor_number
        FROM rooms r
        LEFT JOIN locations l ON r.location_id = l.location_id
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        ORDER BY r.room_number
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getRoomById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          r.room_number,
          r.room_url,
          l.description as location_description,
          f.floor_number
        FROM rooms r
        LEFT JOIN locations l ON r.location_id = l.location_id
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        WHERE r.room_id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get room error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createRoom(req, res) {
    try {
      const { room_number, room_url, location_id } = req.body;

      if (!room_number || !room_url || !location_id) {
        return res.status(400).json({ message: 'Room number, URL and location ID are required' });
      }

      const locationCheck = await pool.query(
        'SELECT location_id FROM locations WHERE location_id = $1',
        [location_id]
      );
      if (locationCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Location not found' });
      }

      const roomCheck = await pool.query(
        'SELECT room_id FROM rooms WHERE room_number = $1 AND location_id = $2',
        [room_number, location_id]
      );
      if (roomCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Room with this number already exists in this location' });
      }

      const newRoom = await pool.query(
        `INSERT INTO rooms (room_number, room_url, location_id) 
         VALUES ($1, $2, $3) RETURNING *`,
        [room_number, room_url, location_id]
      );

      res.status(201).json(newRoom.rows[0]);
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const { room_number, room_url, location_id } = req.body;

      const roomCheck = await pool.query(
        'SELECT room_id FROM rooms WHERE room_id = $1',
        [id]
      );
      if (roomCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
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

      if (room_number) {
        const roomNumberCheck = await pool.query(
          'SELECT room_id FROM rooms WHERE room_number = $1 AND location_id = COALESCE($2, location_id) AND room_id != $3',
          [room_number, location_id, id]
        );
        if (roomNumberCheck.rows.length > 0) {
          return res.status(400).json({ message: 'Room with this number already exists in this location' });
        }
      }

      const updatedRoom = await pool.query(
        `UPDATE rooms 
         SET room_number = COALESCE($1, room_number),
             room_url = COALESCE($2, room_url),
             location_id = COALESCE($3, location_id)
         WHERE room_id = $4
         RETURNING *`,
        [room_number, room_url, location_id, id]
      );

      res.json(updatedRoom.rows[0]);
    } catch (error) {
      console.error('Update room error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteRoom(req, res) {
    try {
      const { id } = req.params;

      const roomCheck = await pool.query(
        'SELECT room_id FROM rooms WHERE room_id = $1',
        [id]
      );
      if (roomCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }

      await pool.query('DELETE FROM rooms WHERE room_id = $1', [id]);
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getRoomsByLocation(req, res) {
    try {
      const { locationId } = req.params;
      
      const query = `
        SELECT 
          r.room_number,
          r.room_url,
          l.description as location_description,
          f.floor_number
        FROM rooms r
        LEFT JOIN locations l ON r.location_id = l.location_id
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        WHERE r.room_id = $1
      `;
      
      const result = await pool.query(query, [locationId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get rooms by location error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new RoomsController();