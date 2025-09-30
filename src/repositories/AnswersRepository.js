const pool = require('../config/db');

class AnswersRepository {
    async findByQuestionId(question_id) {
        const query = `
            SELECT 
                a.answer_id,
                a.text as answer_text,
                a.created_at as answer_created_at,
                a.is_solution,
                u.login_name as answer_author,
                q.title as question_title,
                q.text as question_text,
                q_user.login_name as question_author
            FROM answers a
            LEFT JOIN users u ON a.user_id = u.user_id
            LEFT JOIN questions q ON a.question_id = q.question_id
            LEFT JOIN users q_user ON q.user_id = q_user.user_id
            WHERE a.question_id = $1
            ORDER BY a.created_at DESC
        `;
        
        const result = await pool.query(query, [question_id]);
        return result.rows;
    }

    async findById(answer_id) {
        const result = await pool.query(
            'SELECT * FROM answers WHERE answer_id = $1',
            [answer_id]
        );
        return result.rows[0] || null;
    }

    async create(answerData) {
        const { question_id, user_id, text } = answerData;
        
        const result = await pool.query(
            `INSERT INTO answers (question_id, user_id, text) 
             VALUES ($1, $2, $3) RETURNING *`,
            [question_id, user_id, text]
        );
        
        return result.rows[0];
    }

    async update(answer_id, answerData) {
        const { text } = answerData;
        
        const result = await pool.query(
            `UPDATE answers 
             SET text = COALESCE($1, text)
             WHERE answer_id = $2
             RETURNING *`,
            [text, answer_id]
        );
        
        return result.rows[0] || null;
    }

    async delete(answer_id) {
        const result = await pool.query(
            'DELETE FROM answers WHERE answer_id = $1 RETURNING *',
            [answer_id]
        );
        return result.rows.length > 0;
    }

    async exists(answer_id) {
        const result = await pool.query(
            'SELECT answer_id FROM answers WHERE answer_id = $1',
            [answer_id]
        );
        return result.rows.length > 0;
    }

    async questionExists(question_id) {
        const result = await pool.query(
            'SELECT question_id FROM questions WHERE question_id = $1',
            [question_id]
        );
        return result.rows.length > 0;
    }

    async isAuthor(answer_id, user_id) {
        const result = await pool.query(
            'SELECT user_id FROM answers WHERE answer_id = $1 AND user_id = $2',
            [answer_id, user_id]
        );
        return result.rows.length > 0;
    }

    async getAnswerWithQuestionInfo(answer_id) {
        const result = await pool.query(`
            SELECT a.*, q.user_id as question_author_id
            FROM answers a
            JOIN questions q ON a.question_id = q.question_id
            WHERE a.answer_id = $1
        `, [answer_id]);
        
        return result.rows[0] || null;
    }

    async unmarkOtherSolutions(question_id, exclude_answer_id) {
        await pool.query(
            'UPDATE answers SET is_solution = false WHERE question_id = $1 AND answer_id != $2',
            [question_id, exclude_answer_id]
        );
    }

    async markAsSolution(answer_id) {
        const result = await pool.query(
            'UPDATE answers SET is_solution = true WHERE answer_id = $1 RETURNING *',
            [answer_id]
        );
        return result.rows[0] || null;
    }

    async getUserRole(user_id) {
        const result = await pool.query(
            'SELECT role_name FROM roles WHERE user_id = $1',
            [user_id]
        );
        return result.rows[0] ? result.rows[0].role_name : null;
    }
}

module.exports = new AnswersRepository();