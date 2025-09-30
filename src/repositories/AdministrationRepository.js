const pool = require('../config/db');

class AdministrationRepository{
    async getAllAdministration() {
    const query = `
        SELECT 
            a.administration_id,
            a.name_administration,
            a.position,
            a.photo_url,
            COALESCE(c.phone_number::text, '-') as phone_number,
            COALESCE(c.administration_email, '-') as email,
            COALESCE(l.room_number, '-') as room_number,  -- исправлено: room_number вместо room
            COALESCE(l.description, '-') as location_description,
            COALESCE(f.floor_number::text, '-') as floor_number
        FROM administration a
        LEFT JOIN contacts c ON a.administration_id = c.contacts_id
        LEFT JOIN locations l ON a.location_id = l.location_id  -- исправлено: location_id
        LEFT JOIN floors f ON l.floor_number = f.floor_number
        ORDER BY a.name_administration;
    `;
    
    const result = await pool.query(query);  
    return result.rows;
}

     async findById(administration_id) {
        const result = await pool.query(
            'SELECT * FROM administration WHERE administration_id = $1',
            [administration_id]
        );
        return result.rows[0] || null;
    }

   async create(adminData) {
    const { name_administration, position, photo_url, location_id } = adminData;

    const result = await pool.query(
        `INSERT INTO administration (name_administration, position, photo_url, location_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name_administration, position, photo_url, location_id]
    );

    const newAdmin = result.rows[0];
    
    await pool.query(
        'INSERT INTO contacts (contacts_id) VALUES ($1)',
        [newAdmin.administration_id]  
    );

    return newAdmin;
}

    async update(administration_id, adminData) {
    const { name_administration, position, photo_url, location_id } = adminData; // добавил недостающие поля

    const result = await pool.query(
        `UPDATE administration 
         SET name_administration = COALESCE($1, name_administration),
             position = COALESCE($2, position),
             photo_url = COALESCE($3, photo_url),
             location_id = COALESCE($4, location_id)
         WHERE administration_id = $5
         RETURNING *`,
        [name_administration, position, photo_url, location_id, administration_id] // правильный порядок
    );
    return result.rows[0] || null;
}
     async delete(administration_id){
        const result = await pool.query(
            'DELETE FROM administration WHERE administration_id = $1 RETURNING *',
            [administration_id]
        );
        return result.rows.length > 0;
     }
}

module.exports = new AdministrationRepository();