const pool = require('../config/db');

class QuestionsController {
  async getAllQuestions(req, res) {
    try {
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
      res.json(result.rows);
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      
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
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get question error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createQuestion(req, res) {
    try {
      const { title, text } = req.body;
      const user_id = req.user.user_id;

      if (!title || !text) {
        return res.status(400).json({ message: 'Title and text are required' });
      }

      const newQuestion = await pool.query(
        `INSERT INTO questions (user_id, title, text) 
         VALUES ($1, $2, $3) RETURNING *`,
        [user_id, title, text]
      );

      res.status(201).json(newQuestion.rows[0]);
    } catch (error) {
      console.error('Create question error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const { title, text } = req.body;
      const user_id = req.user.user_id;

      const questionCheck = await pool.query(
        'SELECT user_id FROM questions WHERE question_id = $1',
        [id]
      );
      if (questionCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (questionCheck.rows[0].user_id !== user_id) {
        return res.status(403).json({ message: 'You can only edit your own questions' });
      }

      const updatedQuestion = await pool.query(
        `UPDATE questions 
         SET title = COALESCE($1, title),
             text = COALESCE($2, text)
         WHERE question_id = $3
         RETURNING *`,
        [title, text, id]
      );

      res.json(updatedQuestion.rows[0]);
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;

      const questionCheck = await pool.query(
        'SELECT user_id FROM questions WHERE question_id = $1',
        [id]
      );
      if (questionCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const isAuthor = questionCheck.rows[0].user_id === user_id;
      
      if (!isAuthor) {
        const userRole = await pool.query(
          'SELECT role_name FROM roles WHERE user_id = $1',
          [user_id]
        );
        
        if (userRole.rows.length === 0 || !userRole.rows[0].role_name) {
          return res.status(403).json({ message: 'You can only delete your own questions' });
        }
      }

      await pool.query('DELETE FROM questions WHERE question_id = $1', [id]);
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async toggleQuestionStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_closed } = req.body;
      const user_id = req.user.user_id;

      const questionCheck = await pool.query(
        'SELECT user_id FROM questions WHERE question_id = $1',
        [id]
      );
      if (questionCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (questionCheck.rows[0].user_id !== user_id) {
        return res.status(403).json({ message: 'You can only edit your own questions' });
      }

      const updatedQuestion = await pool.query(
        'UPDATE questions SET is_closed = $1 WHERE question_id = $2 RETURNING *',
        [is_closed, id]
      );

      res.json(updatedQuestion.rows[0]);
    } catch (error) {
      console.error('Toggle question status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new QuestionsController();