const pool = require('../config/db');

class TeachersRepository {
    async findAllWithDetails() {
        const query = `
            SELECT 
                t.teacher_id,
                t.name_teacher, 
                t.position, 
                t.photo_url, 
                l.room_number as room, 
                l.description as location_description,
                f.floor_number
            FROM teachers t
            LEFT JOIN locations l ON t.location_id = l.location_id
            LEFT JOIN floors f ON l.floor_number = f.floor_number
            ORDER BY t.name_teacher;
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(teacher_id) {
        const query = `
            SELECT 
                t.teacher_id,
                t.name_teacher, 
                t.position, 
                t.photo_url, 
                l.room_number as room, 
                l.description as location_description,
                f.floor_number
            FROM teachers t
            LEFT JOIN locations l ON t.location_id = l.location_id
            LEFT JOIN floors f ON l.floor_number = f.floor_number
            WHERE t.teacher_id = $1
        `;
        
        const result = await pool.query(query, [teacher_id]);
        return result.rows[0] || null;
    }

    async create(teacherData) {
        const { name_teacher, position, photo_url, location_id } = teacherData;
        
        const result = await pool.query(
            `INSERT INTO teachers (name_teacher, position, photo_url, location_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name_teacher, position, photo_url, location_id || null]
        );
        
        return result.rows[0];
    }

    async update(teacher_id, teacherData) {
        const { name_teacher, position, photo_url, location_id } = teacherData;
        
        const result = await pool.query(
            `UPDATE teachers 
             SET name_teacher = COALESCE($1, name_teacher),
                 position = COALESCE($2, position),
                 photo_url = COALESCE($3, photo_url),
                 location_id = COALESCE($4, location_id)
             WHERE teacher_id = $5
             RETURNING *`,
            [name_teacher, position, photo_url, location_id, teacher_id]
        );
        
        return result.rows[0] || null;
    }

    async delete(teacher_id) {
        const result = await pool.query(
            'DELETE FROM teachers WHERE teacher_id = $1 RETURNING *',
            [teacher_id]
        );
        return result.rows.length > 0;
    }

    async exists(teacher_id) {
        const result = await pool.query(
            'SELECT teacher_id FROM teachers WHERE teacher_id = $1',
            [teacher_id]
        );
        return result.rows.length > 0;
    }

    async locationExists(location_id) {
        if (!location_id) return true; // location_id может быть null
        
        const result = await pool.query(
            'SELECT location_id FROM locations WHERE location_id = $1',
            [location_id]
        );
        return result.rows.length > 0;
    }
}

module.exports = new TeachersRepository();