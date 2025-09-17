const pool = require('../config/db');

class AnswersController {
  async getAnswersByQuestion(req, res) {
    try {
      const { questionId } = req.params;
      
      const query = `
        SELECT 
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
      
      const result = await pool.query(query, [questionId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get answers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createAnswer(req, res) {
    try {
      const { question_id, text } = req.body;
      const user_id = req.user.user_id;

      if (!question_id || !text) {
        return res.status(400).json({ message: 'Question ID and text are required' });
      }

      const questionCheck = await pool.query(
        'SELECT question_id FROM questions WHERE question_id = $1',
        [question_id]
      );
      if (questionCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const newAnswer = await pool.query(
        `INSERT INTO answers (question_id, user_id, text) 
         VALUES ($1, $2, $3) RETURNING *`,
        [question_id, user_id, text]
      );

      res.status(201).json(newAnswer.rows[0]);
    } catch (error) {
      console.error('Create answer error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateAnswer(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const user_id = req.user.user_id;

      const answerCheck = await pool.query(
        'SELECT user_id FROM answers WHERE answer_id = $1',
        [id]
      );
      if (answerCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      if (answerCheck.rows[0].user_id !== user_id) {
        return res.status(403).json({ message: 'You can only edit your own answers' });
      }

      const updatedAnswer = await pool.query(
        `UPDATE answers 
         SET text = COALESCE($1, text)
         WHERE answer_id = $2
         RETURNING *`,
        [text, id]
      );

      res.json(updatedAnswer.rows[0]);
    } catch (error) {
      console.error('Update answer error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteAnswer(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;

      const answerCheck = await pool.query(
        'SELECT user_id FROM answers WHERE answer_id = $1',
        [id]
      );
      if (answerCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      const isAuthor = answerCheck.rows[0].user_id === user_id;
      
      if (!isAuthor) {
        const userRole = await pool.query(
          'SELECT role_name FROM roles WHERE user_id = $1',
          [user_id]
        );
        
        if (userRole.rows.length === 0 || !userRole.rows[0].role_name) {
          return res.status(403).json({ message: 'You can only delete your own answers' });
        }
      }

      await pool.query('DELETE FROM answers WHERE answer_id = $1', [id]);
      res.json({ message: 'Answer deleted successfully' });
    } catch (error) {
      console.error('Delete answer error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async markAsSolution(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.user_id;

      const answerInfo = await pool.query(`
        SELECT a.*, q.user_id as question_author
        FROM answers a
        JOIN questions q ON a.question_id = q.question_id
        WHERE a.answer_id = $1
      `, [id]);

      if (answerInfo.rows.length === 0) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      const answer = answerInfo.rows[0];

      if (answer.question_author !== user_id) {
        return res.status(403).json({ message: 'Only question author can mark as solution' });
      }

      await pool.query(
        'UPDATE answers SET is_solution = false WHERE question_id = $1 AND answer_id != $2',
        [answer.question_id, id]
      );

      const updatedAnswer = await pool.query(
        'UPDATE answers SET is_solution = true WHERE answer_id = $1 RETURNING *',
        [id]
      );

      res.json(updatedAnswer.rows[0]);
    } catch (error) {
      console.error('Mark as solution error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new AnswersController();