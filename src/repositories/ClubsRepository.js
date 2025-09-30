const pool = require('../config/db');

class ClubsRepository {
    async findAll() {
        const query = `
            SELECT 
                club_id,
                name_clubs,
                description,
                contact_info,
                image_url,
                location_id
            FROM clubs
            ORDER BY name_clubs;
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(club_id) {
        const result = await pool.query(
            'SELECT * FROM clubs WHERE club_id = $1',
            [club_id]
        );
        return result.rows[0] || null;
    }

    async create(clubData) {
        const { name_clubs, description, contact_info, image_url, location_id } = clubData;
        
        const result = await pool.query(
            `INSERT INTO clubs (name_clubs, description, contact_info, image_url, location_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name_clubs, description, contact_info, image_url, location_id]
        );
        
        return result.rows[0];
    }

    async update(club_id, clubData) {
        const { name_clubs, description, contact_info, image_url, location_id } = clubData;
        
        const result = await pool.query(
            `UPDATE clubs 
             SET name_clubs = COALESCE($1, name_clubs),
                 description = COALESCE($2, description),
                 contact_info = COALESCE($3, contact_info),
                 image_url = COALESCE($4, image_url),
                 location_id = COALESCE($5, location_id)
             WHERE club_id = $6
             RETURNING *`,
            [name_clubs, description, contact_info, image_url, location_id, club_id]
        );
        
        return result.rows[0] || null;
    }

    async delete(club_id) {
        const result = await pool.query(
            'DELETE FROM clubs WHERE club_id = $1 RETURNING *',
            [club_id]
        );
        return result.rows.length > 0;
    }

    async exists(club_id) {
        const result = await pool.query(
            'SELECT club_id FROM clubs WHERE club_id = $1',
            [club_id]
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

module.exports = new ClubsRepository();