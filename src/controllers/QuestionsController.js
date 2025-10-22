/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Вопросы и ответы
 */

class QuestionsController {
    constructor({ questionsService }){
        this.questionsService = questionsService
    };

    /**
     * @swagger
     * /api/questions:
     *   get:
     *     summary: Получить список всех вопросов
     *     tags: [Questions]
     *     responses:
     *       200:
     *         description: Список вопросов получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Question'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getAllQuestions(req, res) {
        try {
            const questions = await this.questionsService.getAllQuestions();
            res.json(questions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/questions/{id}:
     *   get:
     *     summary: Получить вопрос по ID
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID вопроса
     *     responses:
     *       200:
     *         description: Данные вопроса
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Question'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Вопрос не найден
     */

    async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            const question = await this.questionsService.getQuestionById(id);
            res.json(question);
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
     * /api/questions:
     *   post:
     *     summary: Создать новый вопрос
     *     tags: [Questions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - text
     *             properties:
     *               title:
     *                 type: string
     *                 example: "Как записаться в клуб?"
     *               text:
     *                 type: string
     *                 example: "Хочу записаться в IT клуб, куда обращаться?"
     *     responses:
     *       201:
     *         description: Вопрос успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Question created successfully"
     *                 question:
     *                   $ref: '#/components/schemas/Question'
     *       400:
     *         description: Ошибка валидации
     *       401:
     *         description: Не авторизован
     */

    async createQuestion(req, res) {
        try {
            const questionData = {
                ...req.body,
                user_id: req.user.user_id
            };
            
            const question = await this.questionsService.createQuestion(questionData);
            res.status(201).json({
                message: 'Question created successfully',
                question
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/questions/{id}:
     *   put:
     *     summary: Обновить вопрос
     *     tags: [Questions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID вопроса
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: "Обновленный вопрос о записи в клуб"
     *               text:
     *                 type: string
     *                 example: "Обновленный текст вопроса о записи в IT клуб"
     *     responses:
     *       200:
     *         description: Вопрос успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Question updated successfully"
     *                 question:
     *                   $ref: '#/components/schemas/Question'
     *       400:
     *         description: Ошибка валидации
     *       401:
     *         description: Не авторизован
     *       403:
     *         description: Недостаточно прав (можно редактировать только свои вопросы)
     *       404:
     *         description: Вопрос не найден
     */

    async updateQuestion(req, res) {
        try {
            const { id } = req.params;
            const question = await this.questionsService.updateQuestion(id, req.body, req.user.user_id);
            res.json({
                message: 'Question updated successfully',
                question
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('your own')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

      /**
     * @swagger
     * /api/questions/{id}:
     *   delete:
     *     summary: Удалить вопрос
     *     tags: [Questions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID вопроса
     *     responses:
     *       200:
     *         description: Вопрос успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Question deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       401:
     *         description: Не авторизован
     *       403:
     *         description: Недостаточно прав (можно удалять только свои вопросы)
     *       404:
     *         description: Вопрос не найден
     */

    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;
            await this.questionsService.deleteQuestion(id, req.user.user_id);
            res.json({ message: 'Question deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('your own')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    
    /**
     * @swagger
     * /api/questions/{id}/toggle-status:
     *   patch:
     *     summary: Переключить статус вопроса (открыт/закрыт)
     *     tags: [Questions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID вопроса
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               is_closed:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       200:
     *         description: Статус вопроса успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Question status updated successfully"
     *                 question:
     *                   $ref: '#/components/schemas/Question'
     *       400:
     *         description: Ошибка валидации
     *       401:
     *         description: Не авторизован
     *       403:
     *         description: Недостаточно прав (можно изменять только свои вопросы)
     *       404:
     *         description: Вопрос не найден
     */

    async toggleQuestionStatus(req, res) {
        try {
            const { id } = req.params;
            const question = await this.questionsService.toggleQuestionStatus(id, req.body, req.user.user_id);
            res.json({
                message: 'Question status updated successfully',
                question
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('your own')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  QuestionsController;