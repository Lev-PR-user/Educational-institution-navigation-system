const pool = require('../config/db');

class QuestionsRepository {
    async findAllWithDetails() {
        const query = `
            SELECT 
                q.question_id,
                q.user_id,
                q.title,
                q.text,
                q.created_at,
                q.is_closed,
                u.login_name as author_name,
                COUNT(a.answer_id) as answer_count
            FROM questions q
            LEFT JOIN users u ON q.user_id = u.user_id
            LEFT JOIN answers a ON q.question_id = a.question_id
            GROUP BY q.question_id, u.login_name
            ORDER BY q.created_at DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(question_id) {
        const query = `
            SELECT 
                q.question_id,
                q.user_id,
                q.title,
                q.text,
                q.created_at,
                q.is_closed,
                u.login_name as author_name
            FROM questions q
            LEFT JOIN users u ON q.user_id = u.user_id
            WHERE q.question_id = $1
        `;
        
        const result = await pool.query(query, [question_id]);
        return result.rows[0] || null;
    }

    async create(questionData) {
        const { user_id, title, text } = questionData;
        
        const result = await pool.query(
            `INSERT INTO questions (user_id, title, text) 
             VALUES ($1, $2, $3) RETURNING *`,
            [user_id, title, text]
        );
        
        return result.rows[0];
    }

    async update(question_id, questionData) {
        const { title, text } = questionData;
        
        const result = await pool.query(
            `UPDATE questions 
             SET title = COALESCE($1, title),
                 text = COALESCE($2, text)
             WHERE question_id = $3
             RETURNING *`,
            [title, text, question_id]
        );
        
        return result.rows[0] || null;
    }

    async updateStatus(question_id, is_closed) {
        const result = await pool.query(
            'UPDATE questions SET is_closed = $1 WHERE question_id = $2 RETURNING *',
            [is_closed, question_id]
        );
        
        return result.rows[0] || null;
    }

    async delete(question_id) {
        const result = await pool.query(
            'DELETE FROM questions WHERE question_id = $1 RETURNING *',
            [question_id]
        );
        return result.rows.length > 0;
    }

    async exists(question_id) {
        const result = await pool.query(
            'SELECT question_id FROM questions WHERE question_id = $1',
            [question_id]
        );
        return result.rows.length > 0;
    }

    async isAuthor(question_id, user_id) {
        const result = await pool.query(
            'SELECT user_id FROM questions WHERE question_id = $1 AND user_id = $2',
            [question_id, user_id]
        );
        return result.rows.length > 0;
    }

    async getUserRole(user_id) {
        const result = await pool.query(
            'SELECT role_name FROM roles WHERE user_id = $1',
            [user_id]
        );
        return result.rows[0] ? result.rows[0].role_name : null;
    }
}

module.exports = new QuestionsRepository();