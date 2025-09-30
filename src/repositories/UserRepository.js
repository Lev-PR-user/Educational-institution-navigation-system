const pool = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const result = await pool.query('Select * FROM users WHERE email_users = $1', [email]);
        return result.rows[0] || null;
    }

    async findById(user_id) {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        return result.rows[0] || null;
    }

    async create(userData) {
        const { login_name, email_users, password_hash, photo_url } = userData;
        const result = await pool.query(
            'INSERT INTO users (login_name, email_users, password_hash, photo_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [login_name, email_users, password_hash, photo_url]
        );
          await pool.query(
                'INSERT INTO roles (user_id, role_name) VALUES ($1, $2)',
                [result.rows[0].user_id, false]
            );

        return result.rows[0];
    }

    async update(user_id, userData) {
        const { login_name, email_users, password_hash, photo_url } = userData;
        const result = await pool.query(
            `UPDATE users SET 
                login_name = COALESCE($1, login_name),
                email_users = COALESCE($2, email_users),
                password_hash = COALESCE($3, password_hash),
                photo_url = COALESCE($4, photo_url)
             WHERE user_id = $5 RETURNING *`,
            [login_name, email_users, password_hash, photo_url, user_id]
        );
        return result.rows[0];
    }

    async delete(user_id) {
        await pool.query('DELETE FROM users WHERE user_id = $1', [user_id]);
        return true;
    }
}

module.exports = new UserRepository();