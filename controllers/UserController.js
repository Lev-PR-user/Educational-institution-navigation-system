const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
      async register(req, res) {
     try {
      const { login_name, email_users, password_hash, photo_url } = req.body;

      const userExists = await pool.query('SELECT * FROM users WHERE email_users = $1', [email_users]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(password_hash, salt);

      const newUser = await pool.query(
        'INSERT INTO users (login_name, email_users, password_hash, photo_url) VALUES ($1, $2, $3, $4 ) RETURNING *',
        [login_name, email_users, password, photo_url]
      );

      await pool.query(
        'INSERT INTO roles (user_id, role_name) VALUES ($1, $2)',
        [newUser.rows[0].user_id, false] 
      );

      res.json(newUser.rows[0]);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }    

  async login(req, res) {
    try {
      const { email_users, password_hash } = req.body;
    if (!email_users || !password_hash) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await pool.query('SELECT * FROM users WHERE email_users = $1', [email_users]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password_hash, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_SECRET || 'default_secret', 
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        user_id: user.rows[0].user_id,
        email_users: user.rows[0].email_users
      }
    });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async GetUserProfile(req, res) {
    try {
      const { user_id } = req.user;

      const user = await pool.query(
        'SELECT login_name, email_users, password_hash, photo_url FROM users WHERE user_id = $1',
        [user_id]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user.rows[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async UpdateUser(req, res) {
    try {
      const { user_id } = req.user; 
      const { login_name, email_users, password_hash, photo_url } = req.body;

      const users = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
      if (users.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      let passwordHash = users.rows[0].password_hash;
      
      if (password_hash) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password_hash, salt);
      }

      const updatedUser = await pool.query(
        `UPDATE users SET 
          login_name = COALESCE($1, login_name),
          email_users = COALESCE($2, email_users),
          password_hash = COALESCE($3, password_hash),
          photo_url = COALESCE($4, photo_url)
         WHERE user_id = $5
         RETURNING user_id, login_name, email_users, photo_url`,
        [login_name, email_users, passwordHash, photo_url, user_id] 
      );

      res.json(updatedUser.rows[0]);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
async DeleteUser(req, res) {
  try{
    const { user_id } = req.user; 
    
    const user = await pool.query(`Select * From users Where user_id = $1`, [user_id]);
    if(user.rowCount.lenght === 0){
      return res.status(404).json({message: 'User not found'});
    }

    await pool.query(`Delete From users Where user_id =$1`, [user_id]);
    res.json({message: 'User deleted successfully'});
  } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
}
}


module.exports = new UserController();