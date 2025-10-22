/**
 * @swagger
 * tags:
 *   name: Answer
 *   description: Управление ответами на вопросы
 */

class AnswersController {    
    constructor({ answerService }){
        this.answerService = answerService
    };

      /**
     * @swagger
     * /api/answers/question/{questionId}:
     *   get:
     *     summary: Получить ответы по вопросу
     *     tags: [Answer]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID вопроса
     *     responses:
     *       200:
     *         description: Список ответов на вопрос
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Answer'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Вопрос не найден
     */

    async getAnswersByQuestion(req, res) {
        try {
            const { questionId } = req.params;
            const answers = await this.answerService.getAnswersByQuestion(questionId);
            res.json(answers);
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
     * /api/answers:
     *   post:
     *     summary: Создать новый ответ
     *     tags: [Answer]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - question_id
     *               - text
     *             properties:
     *               question_id:
     *                 type: integer
     *                 example: 1
     *               text:
     *                 type: string
     *                 example: "Обратитесь к руководителю клуба в кабинет 305"
     *     responses:
     *       201:
     *         description: Ответ успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Answer created successfully"
     *                 answer:
     *                   $ref: '#/components/schemas/Answer'
     *       400:
     *         description: Ошибка валидации
     *       401:
     *         description: Не авторизован
     *       404:
     *         description: Вопрос не найден
     */

    async createAnswer(req, res) {
        try {
            const answerData = {
                ...req.body,
                user_id: req.user.user_id
            };
            
            const answer = await this.answerService.createAnswer(answerData);
            res.status(201).json({
                message: 'Answer created successfully',
                answer
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
     * /api/answers/{id}:
     *   put:
     *     summary: Обновить ответ
     *     tags: [Answer]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID ответа
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               text:
     *                 type: string
     *                 example: "Обновленный текст ответа - обратитесь в кабинет 305 с 10:00 до 16:00"
     *     responses:
     *       200:
     *         description: Ответ успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Answer updated successfully"
     *                 answer:
     *                   $ref: '#/components/schemas/Answer'
     *       400:
     *         description: Ошибка валидации
     *       401:
     *         description: Не авторизован
     *       403:
     *         description: Недостаточно прав (можно редактировать только свои ответы)
     *       404:
     *         description: Ответ не найден
     */

    async updateAnswer(req, res) {
        try {
            const { id } = req.params;
            const answer = await this.answerService.updateAnswer(id, req.body, req.user.user_id);
            res.json({
                message: 'Answer updated successfully',
                answer
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
     * /api/answers/{id}:
     *   delete:
     *     summary: Удалить ответ
     *     tags: [Answer]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID ответа
     *     responses:
     *       200:
     *         description: Ответ успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Answer deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       401:
     *         description: Не авторизован
     *       403:
     *         description: Недостаточно прав (можно удалять только свои ответы)
     *       404:
     *         description: Ответ не найден
     */

    async deleteAnswer(req, res) {
        try {
            const { id } = req.params;
            await this.answerService.deleteAnswer(id, req.user.user_id);
            res.json({ message: 'Answer deleted successfully' });
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
     * /api/answers/{id}/mark-solution:
     *   patch:
     *     summary: Пометить ответ как решение
     *     tags: [Answer]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID ответа
     *     responses:
     *       200:
     *         description: Ответ помечен как решение
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Answer marked as solution successfully"
     *                 answer:
     *                   $ref: '#/components/schemas/Answer'
     *       400:
     *         description: Ошибка валидации
     *       401:
     *         description: Не авторизован
     *       403:
     *         description: Недостаточно прав (только автор вопроса может помечать ответы как решение)
     *       404:
     *         description: Ответ не найден
     */

    async markAsSolution(req, res) {
        try {
            const { id } = req.params;
            const answer = await this.answerService.markAsSolution(id, req.user.user_id);
            res.json({
                message: 'Answer marked as solution successfully',
                answer
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('question author')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  AnswersController;