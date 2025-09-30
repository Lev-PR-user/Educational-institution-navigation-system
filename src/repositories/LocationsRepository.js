const pool = require(`../config/db`);

class LocationsRepository{

    async findAllWithFloorInfo() {
        const query = `
            SELECT 
                l.description,
                l.room_number,
                l.floor_number,
                f.map_image_url as floor_map,
                r.room_url as room_map
            FROM locations l
            LEFT JOIN rooms r ON l.room_number = r.room_number
            LEFT JOIN floors f ON l.floor_number = f.floor_number
            ORDER BY l.floor_number, l.room_number
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(location_id){
        const result = await pool.query('Select * FROM locations WHERE location_id = $1', [location_id]);

        return result.rows[0] || null;
    }

    async findByFloorNumber(floor_number) {  
    const result = await pool.query(
        'SELECT * FROM locations WHERE floor_number = $1 ORDER BY room_number', 
        [floor_number]
    );
    return result.rows;  
}
        async findByFloor_number(floor_number) {
        const result = await pool.query('SELECT * FROM locations WHERE floor_number = $1', [floor_number]);
        return result.rows[0] || null;
    }

    async create(locationData) {
        const { description, room_number, floor_number } = locationData;
        const result = await pool.query(
            'INSERT INTO locations (description, room_number, floor_number) VALUES ($1, $2, $3 ) RETURNING *',
            [description, room_number, floor_number]
        );

        return result.rows;
    }


    async update(locationData) {
    const { location_id, description, room_number, floor_number } = locationData;
    
    const result = await pool.query(
        `UPDATE locations 
         SET description = COALESCE($1, description),
             room_number = COALESCE($2, room_number),
             floor_number = COALESCE($3, floor_number)
         WHERE location_id = $4
         RETURNING *`,
        [description, room_number, floor_number, location_id]
    );

    return result.rows[0] || null;
}

   async delete(location_id) {
        const result = await pool.query(
            'DELETE FROM locations WHERE location_id = $1 RETURNING *',
            [location_id]
        );
        return result.rows.length > 0;
    }

    async floorExists(floor_number) {
        const result = await pool.query(
            'SELECT floor_number FROM floors WHERE floor_number = $1',
            [floor_number]
        );
        return result.rows.length > 0;
    }

    async locationExists(location_id) {
        const result = await pool.query(
            'SELECT location_id FROM locations WHERE location_id = $1',
            [location_id]
        );
        return result.rows.length > 0;
    }
}

module.exports = new LocationsRepository();