const pool = require('../config/db');

class FaqController {
  async getfaq(req, res) {
    try {
      const query = `
        SELECT 
      question ,
      answer ,
      category
      From faq`;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Get faq error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createFaq(req, res) {
    try {
      const { question, answer, category } = req.body;

      if (!question || !answer || !category) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const newAdmin = await pool.query(
        `INSERT INTO faq (question, answer, category) 
         VALUES ($1, $2, $3) RETURNING *`,
        [question, answer, category]
      );

      res.status(201).json(newAdmin.rows[0]);
    } catch (error) {
      console.error('Create faq error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateFaq(req, res) {
    try {
      const { id } = req.params;
      const { question, answer, category } = req.body;

      const adminCheck = await pool.query(
        'SELECT faq_id FROM faq WHERE faq_id = $1',
        [id]
      );
      if (adminCheck.rows.length === 0) {
        return res.status(404).json({ message: 'faq not found' });
      }

      const updatedAdmin = await pool.query(
        `UPDATE faq 
         SET question = COALESCE($1, question),
             answer = COALESCE($2, answer),
             category = COALESCE($3, category)
         WHERE faq_id = $4
         RETURNING *`,
        [question, answer, category, id]
      );

      res.json(updatedAdmin.rows[0]);
    } catch (error) {
      console.error('Update faq error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteFaq(req, res) {
    try {
      const { id } = req.params;

      const adminCheck = await pool.query(
        'SELECT faq_id FROM faq WHERE faq_id = $1',
        [id]
      );
      if (adminCheck.rows.length === 0) {
        return res.status(404).json({ message: 'faq not found' });
      }

      await pool.query('DELETE FROM faq WHERE faq_id = $1', [id]);
      res.json({ message: 'faq deleted successfully' });
    } catch (error) {
      console.error('Delete faq error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new FaqController();