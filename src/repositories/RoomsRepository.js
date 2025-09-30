const pool = require('../config/db');

class RoomsRepository {
    async findAllWithDetails() {
        const query = `
            SELECT 
                r.room_number,
                r.room_url
            FROM rooms r
            ORDER BY r.room_number
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async findByNumber(room_number) {  
        const query = `
            SELECT 
                r.room_number,
                r.room_url
            FROM rooms r
            WHERE r.room_number = $1
        `;
        
        const result = await pool.query(query, [room_number]);
        return result.rows[0] || null;
    }

    async findByFloorNumber(floor_number) {  
        const query = `
            SELECT 
                r.room_number,
                r.room_url,
                l.description as location_description,
                f.floor_number
            FROM rooms r
            LEFT JOIN locations l ON r.room_number = l.room_number  -- исправлено!
            LEFT JOIN floors f ON l.floor_number = f.floor_number
            WHERE l.floor_number = $1
        `;
        
        const result = await pool.query(query, [floor_number]);
        return result.rows;
    }

    async create(roomData) {
        const { room_number, room_url } = roomData;  
        
        const result = await pool.query(
            `INSERT INTO rooms (room_number, room_url) 
             VALUES ($1, $2) RETURNING *`,  
            [room_number, room_url]
        );
        
        return result.rows[0];
    }

    async update(room_number, roomData) {
        const { room_number: new_room_number, room_url } = roomData;
        
        const result = await pool.query(
            `UPDATE rooms 
             SET room_number = COALESCE($1, room_number),
                 room_url = COALESCE($2, room_url)
             WHERE room_number = $3
             RETURNING *`,
            [new_room_number, room_url, room_number]  
        );
        
        return result.rows[0] || null;
    }

    async delete(room_number) {
        const result = await pool.query(
            'DELETE FROM rooms WHERE room_number = $1 RETURNING *',
            [room_number]
        );
        return result.rows.length > 0;
    }

    async exists(room_number) {
        const result = await pool.query(
            'SELECT room_number FROM rooms WHERE room_number = $1',  
            [room_number]
        );
        return result.rows.length > 0;
    }

    async existsByNumber(room_number, exclude_room_number = null) {
        let query = 'SELECT room_number FROM rooms WHERE room_number = $1';
        const params = [room_number];
        
        if (exclude_room_number) {
            query += ' AND room_number != $2';
            params.push(exclude_room_number);
        }
        
        const result = await pool.query(query, params);
        return result.rows.length > 0;
    }
}

module.exports = new RoomsRepository();
