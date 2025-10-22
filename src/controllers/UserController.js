/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентификация и авторизация
 */

class UserController {
    constructor({ userService }){
        this.userService = userService
    };

 /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Регистрация нового пользователя
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - login_name
     *               - email_users
     *               - password_hash
     *             properties:
     *               login_name:
     *                 type: string
     *                 example: "john_doe"
     *               email_users:
     *                 type: string
     *                 format: email
     *                 example: "user@mail.ru"
     *               password_hash:
     *                 type: string
     *                 example: "secure_password"
     *               photo_url:
     *                 type: string
     *                 example: "/images/users/user1.jpg"
     *     responses:
     *       201:
     *         description: Пользователь успешно зарегистрирован
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "User registered successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     user_id:
     *                       type: integer
     *                       example: 1
     *                     login_name:
     *                       type: string
     *                       example: "john_doe"
     *                     email_users:
     *                       type: string
     *                       example: "user@mail.ru"
     *       400:
     *         description: Ошибка валидации или пользователь уже существует
     */

    async register(req, res) {
        try {
            const newUser = await this.userService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user_id: newUser.user_id,
                    login_name: newUser.login_name,
                    email_users: newUser.email_users
                }
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

     /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Вход в систему
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - login_name
     *               - password_hash
     *             properties:
     *               login_name:
     *                 type: string
     *                 example: "john_doe"
     *               password_hash:
     *                 type: string
     *                 example: "secure_password"
     *     responses:
     *       200:
     *         description: Успешный вход
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Login successful"
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *       400:
     *         description: Неверные учетные данные
     */

    async login(req, res) {
        try {
            const loginResult = await this.userService.login(req.body);
            res.json({
                success: true,
                message: 'Login successful',
                data: loginResult
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/users/profile:
     *   get:
     *     summary: Получить профиль текущего пользователя
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Профиль пользователя
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/User'
     *       401:
     *         description: Не авторизован
     *       404:
     *         description: Пользователь не найден
     */

    async getProfile(req, res) {
        try {
            const userProfile = await this.userService.getProfile(req.user.user_id);
            res.json({
                success: true,
                data: userProfile
            });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

      /**
     * @swagger
     * /api/users/profile:
     *   put:
     *     summary: Обновить профиль пользователя
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               login_name:
     *                 type: string
     *                 example: "new_john_doe"
     *               email_users:
     *                 type: string
     *                 format: email
     *                 example: "new_email@mail.ru"
     *               photo_url:
     *                 type: string
     *                 example: "/images/users/new_photo.jpg"
     *     responses:
     *       200:
     *         description: Профиль успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Profile updated successfully"
     *                 data:
     *                   $ref: '#/components/schemas/User'
     *       400:
     *         description: Ошибка валидации
     *       401:
     *         description: Не авторизован
     */

    async updateProfile(req, res) {
        try {
            const updatedUser = await this.userService.updateProfile(req.user.user_id, req.body);
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

      /**
     * @swagger
     * /api/users/profile:
     *   delete:
     *     summary: Удалить профиль пользователя
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Пользователь успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "User deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       401:
     *         description: Не авторизован
     */

    async deleteProfile(req, res) {
        try {
            await this.userService.deleteProfile(req.user.user_id);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports =  UserController;