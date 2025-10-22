/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Управление преподавателями
 */

class TeachersController {
        constructor({ teacherService }){
        this.teacherService = teacherService
    };

     /**
     * @swagger
     * /api/teachers:
     *   get:
     *     summary: Получить список всех преподавателей
     *     tags: [Teachers]
     *     responses:
     *       200:
     *         description: Список преподавателей получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Teacher'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getAllTeachers(req, res) {
        try {
            const teachers = await this.teacherService.getAllTeachers();
            res.json(teachers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/teachers/{id}:
     *   get:
     *     summary: Получить преподавателя по ID
     *     tags: [Teachers]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID преподавателя
     *     responses:
     *       200:
     *         description: Данные преподавателя
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Teacher'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Преподаватель не найден
     */

    async getTeacherById(req, res) {
        try {
            const { id } = req.params;
            const teacher = await this.teacherService.getTeacherById(id);
            res.json(teacher);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

      /**
     * @swagger
     * /api/teachers:
     *   post:
     *     summary: Создать нового преподавателя
     *     tags: [Teachers]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name_teacher
     *               - position
     *             properties:
     *               name_teacher:
     *                 type: string
     *                 example: "Иванов Иван Иванович"
     *               position:
     *                 type: string
     *                 example: "Профессор"
     *               photo_url:
     *                 type: string
     *                 format: uri
     *                 example: "/teachers/teacher1.jpg"
     *               location_id:
     *                 type: integer
     *                 nullable: true
     *                 example: 1
     *     responses:
     *       201:
     *         description: Преподаватель успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Teacher created successfully"
     *                 teacher:
     *                   $ref: '#/components/schemas/Teacher'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Связанная сущность не найдена (например, location_id)
     */

    async createTeacher(req, res) {
        try {
            const teacher = await this.teacherService.createTeacher(req.body);
            res.status(201).json({
                message: 'Teacher created successfully',
                teacher
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

     /**
     * @swagger
     * /api/teachers/{id}:
     *   put:
     *     summary: Обновить данные преподавателя
     *     tags: [Teachers]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID преподавателя
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name_teacher:
     *                 type: string
     *                 example: "Петров Петр Петрович"
     *               position:
     *                 type: string
     *                 example: "Доцент"
     *               photo_url:
     *                 type: string
     *                 format: uri
     *                 example: "/teachers/teacher_updated.jpg"
     *               location_id:
     *                 type: integer
     *                 nullable: true
     *                 example: 2
     *     responses:
     *       200:
     *         description: Данные преподавателя обновлены
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Teacher updated successfully"
     *                 teacher:
     *                   $ref: '#/components/schemas/Teacher'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Преподаватель не найден
     */

    async updateTeacher(req, res) {
        try {
            const { id } = req.params;
            const teacher = await this.teacherService.updateTeacher(id, req.body);
            res.json({
                message: 'Teacher updated successfully',
                teacher
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

     /**
     * @swagger
     * /api/teachers/{id}:
     *   delete:
     *     summary: Удалить преподавателя
     *     tags: [Teachers]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID преподавателя
     *     responses:
     *       200:
     *         description: Преподаватель успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Teacher deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: Преподаватель не найден
     */

    async deleteTeacher(req, res) {
        try {
            const { id } = req.params;
            await this.teacherService.deleteTeacher(id);
            res.json({ message: 'Teacher deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  TeachersController;