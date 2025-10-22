/**
 * @swagger
 * tags:
 *   name: FAQ
 *   description: Часто задаваемые вопросы
 */

class FaqsController {
    constructor({ fagService }){
        this.fagService = fagService
    };

      /**
     * @swagger
     * /api/faqs:
     *   get:
     *     summary: Получить все FAQ
     *     tags: [FAQ]
     *     responses:
     *       200:
     *         description: Список всех FAQ получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FAQ'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getFaq(req, res) {
        try {
            const faq = await FaqsService.getAllFaq();
            res.json(faq);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/faqs/{id}:
     *   get:
     *     summary: Получить FAQ по ID
     *     tags: [FAQ]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID FAQ
     *     responses:
     *       200:
     *         description: Данные FAQ
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FAQ'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: FAQ не найден
     */

    async getFaqById(req, res) {
        try {
            const { id } = req.params;
            const faq = await this.fagService .getFaqById(id);
            res.json(faq);
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
     * /api/faqs/category/{category}:
     *   get:
     *     summary: Получить FAQ по категории
     *     tags: [FAQ]
     *     parameters:
     *       - in: path
     *         name: category
     *         required: true
     *         schema:
     *           type: string
     *         description: Категория FAQ
     *     responses:
     *       200:
     *         description: Список FAQ по категории
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FAQ'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: FAQ по указанной категории не найдены
     */

    async getFaqByCategory(req, res) {
        try {
            const { category } = req.params;
            const faq = await this.fagService .getFaqByCategory(category);
            res.json(faq);
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
     * /api/faqs:
     *   post:
     *     summary: Создать новый FAQ
     *     tags: [FAQ]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - question
     *               - answer
     *               - category
     *             properties:
     *               question:
     *                 type: string
     *                 example: "Как найти кабинет директора?"
     *               answer:
     *                 type: string
     *                 example: "Кабинет директора находится на втором этаже, комната 201"
     *               category:
     *                 type: string
     *                 example: "Навигация"
     *     responses:
     *       201:
     *         description: FAQ успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "FAQ created successfully"
     *                 faq:
     *                   $ref: '#/components/schemas/FAQ'
     *       400:
     *         description: Ошибка валидации
     */

    async createFaq(req, res) {
        try {
            const faq = await this.fagService .createFaq(req.body);
            res.status(201).json({
                message: 'FAQ created successfully',
                faq
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/faqs/{id}:
     *   put:
     *     summary: Обновить FAQ
     *     tags: [FAQ]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID FAQ
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               question:
     *                 type: string
     *                 example: "Обновленный вопрос о кабинете директора"
     *               answer:
     *                 type: string
     *                 example: "Обновленный ответ о расположении кабинета директора"
     *               category:
     *                 type: string
     *                 example: "Обновленная навигация"
     *     responses:
     *       200:
     *         description: FAQ успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "FAQ updated successfully"
     *                 faq:
     *                   $ref: '#/components/schemas/FAQ'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: FAQ не найден
     */

    async updateFaq(req, res) {
        try {
            const { id } = req.params;
            const faq = await this.fagService .updateFaq(id, req.body);
            res.json({
                message: 'FAQ updated successfully',
                faq
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
     * /api/faqs/{id}:
     *   delete:
     *     summary: Удалить FAQ
     *     tags: [FAQ]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID FAQ
     *     responses:
     *       200:
     *         description: FAQ успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "FAQ deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: FAQ не найден
     */

    async deleteFaq(req, res) {
        try {
            const { id } = req.params;
            await this.fagService .deleteFaq(id);
            res.json({ message: 'FAQ deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  FaqsController;