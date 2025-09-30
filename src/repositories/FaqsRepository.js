const pool = require('../config/db');

class FaqsRepository {
    async findAll() {
        const query = `
            SELECT 
                faq_id,
                question,
                answer,
                category
            FROM faq
            ORDER BY category, faq_id;
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(faq_id) {
        const result = await pool.query(
            'SELECT * FROM faq WHERE faq_id = $1',
            [faq_id]
        );
        return result.rows[0] || null;
    }

    async findByCategory(category) {
        const result = await pool.query(
            'SELECT * FROM faq WHERE category = $1 ORDER BY faq_id',
            [category]
        );
        return result.rows;
    }

    async create(faqData) {
        const { question, answer, category } = faqData;
        
        const result = await pool.query(
            `INSERT INTO faq (question, answer, category) 
             VALUES ($1, $2, $3) RETURNING *`,
            [question, answer, category]
        );
        
        return result.rows[0];
    }

    async update(faq_id, faqData) {
        const { question, answer, category } = faqData;
        
        const result = await pool.query(
            `UPDATE faq 
             SET question = COALESCE($1, question),
                 answer = COALESCE($2, answer),
                 category = COALESCE($3, category)
             WHERE faq_id = $4
             RETURNING *`,
            [question, answer, category, faq_id]
        );
        
        return result.rows[0] || null;
    }

    async delete(faq_id) {
        const result = await pool.query(
            'DELETE FROM faq WHERE faq_id = $1 RETURNING *',
            [faq_id]
        );
        return result.rows.length > 0;
    }

    async exists(faq_id) {
        const result = await pool.query(
            'SELECT faq_id FROM faq WHERE faq_id = $1',
            [faq_id]
        );
        return result.rows.length > 0;
    }
}

module.exports = new FaqsRepository();