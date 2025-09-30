const pool = require('../config/db');

class FloorsRepository {
    async findAll() {
        const result = await pool.query('SELECT * FROM floors ORDER BY floor_number');
        return result.rows;
    }

    async findByNumber(floor_number) {
        const result = await pool.query(
            'SELECT * FROM floors WHERE floor_number = $1',
            [floor_number]
        );
        return result.rows[0] || null;
    }

    async create(floorData) {
        const { floor_number, map_image_url } = floorData;
        
        const result = await pool.query(
            'INSERT INTO floors (floor_number, map_image_url) VALUES ($1, $2) RETURNING *',
            [floor_number, map_image_url]
        );
        
        return result.rows[0];
    }

    async update(floor_number, floorData) {
        const { map_image_url } = floorData;
        
        const result = await pool.query(
            'UPDATE floors SET map_image_url = COALESCE($1, map_image_url) WHERE floor_number = $2 RETURNING *',
            [map_image_url, floor_number]
        );
        
        return result.rows[0] || null;
    }

    async delete(floor_number) {
        const result = await pool.query(
            'DELETE FROM floors WHERE floor_number = $1 RETURNING *',
            [floor_number]
        );
        return result.rows.length > 0;
    }

    async exists(floor_number) {
        const result = await pool.query(
            'SELECT floor_number FROM floors WHERE floor_number = $1',
            [floor_number]
        );
        return result.rows.length > 0;
    }
}

module.exports = new FloorsRepository();