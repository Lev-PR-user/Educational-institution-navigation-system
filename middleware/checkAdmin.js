const pool = require('../config/db');

const checkAdmin = async (req, res, next) => {
  try {
    const role = await pool.query(
      'SELECT role_name FROM roles WHERE user_id = $1',
      [req.user.user_id] 
    );

    if (role.rows.length === 0 || !role.rows[0].role_name) {
      return res.status(403).json({ 
        success: false,
        message: 'Доступ запрещен. Требуются права администратора' 
      });
    }

    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при проверке прав доступа' 
    });
  }
};

module.exports = checkAdmin;