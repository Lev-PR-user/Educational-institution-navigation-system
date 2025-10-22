/**
 * @swagger
 * tags:
 *   name: Administration
 *   description: Управление администрацией
 */

class AdministrationController {
    constructor({administrationService}){
        this.administrationService = administrationService;
    }

     /**
     * @swagger
     * /api/administration:
     *   get:
     *     summary: Получить всю администрацию
     *     tags: [Administration]
     *     responses:
     *       200:
     *         description: Список администрации получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Administration'
     *       404:
     *         description: Администрация не найдена
     */

     async getAllAdministration(req, res){
        try {
        const administration = await this.administrationService.getAllAdministration();
        res.json(administration);
    }catch (error){
        res.status(404).json({ message: error.message }); 
    }
  }; 

   /**
     * @swagger
     * /api/administration/{id}:
     *   get:
     *     summary: Получить администрацию по ID
     *     tags: [Administration]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID администрации
     *     responses:
     *       200:
     *         description: Данные администрации
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Administration'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Администрация не найдена
     */

    async getAdministrationById(req, res) {
        try {
            const { id } = req.params;
            const administration = await this.administrationService.getAdministrationById(id);
            res.json(administration);
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
     * /api/administration:
     *   post:
     *     summary: Создать новую запись администрации
     *     tags: [Administration]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name_administration
     *               - position
     *             properties:
     *               name_administration:
     *                 type: string
     *                 example: "Петрова Мария Сергеевна"
     *               position:
     *                 type: string
     *                 example: "Директор"
     *               photo_url:
     *                 type: string
     *                 format: uri
     *                 example: "/administration/director.jpg"
     *               location_id:
     *                 type: integer
     *                 nullable: true
     *                 example: 1
     *     responses:
     *       201:
     *         description: Запись администрации успешно создана
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Administration created successfully"
     *                 administration:
     *                   $ref: '#/components/schemas/Administration'
     *       400:
     *         description: Ошибка валидации
     */

    async createAdministration(req, res) {
        try {
            const administration = await this.administrationService.createAdministration(req.body);
            res.status(201).json({
                message: 'Administration created successfully',
                administration
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

     /**
     * @swagger
     * /api/administration/{id}:
     *   put:
     *     summary: Обновить запись администрации
     *     tags: [Administration]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID администрации
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name_administration:
     *                 type: string
     *                 example: "Иванов Иван Иванович"
     *               position:
     *                 type: string
     *                 example: "Заместитель директора"
     *               photo_url:
     *                 type: string
     *                 format: uri
     *                 example: "/administration/deputy_director.jpg"
     *               location_id:
     *                 type: integer
     *                 nullable: true
     *                 example: 2
     *     responses:
     *       200:
     *         description: Запись администрации успешно обновлена
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Administration updated successfully"
     *                 administration:
     *                   $ref: '#/components/schemas/Administration'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Администрация не найдена
     */

    async updateAdministration(req, res) {
        try {
            const { id } = req.params;
            const administration = await this.administrationService.updateAdministration(id, req.body);
            res.json({
                message: 'Administration updated successfully',
                administration
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
     * /api/administration/{id}:
     *   delete:
     *     summary: Удалить запись администрации
     *     tags: [Administration]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID администрации
     *     responses:
     *       200:
     *         description: Запись администрации успешно удалена
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Administration deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: Администрация не найдена
     */

    async deleteAdministration(req, res) {
        try {
            const { id } = req.params;
            await this.administrationService.deleteAdministration(id);
            res.json({ message: 'Administration deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  AdministrationController;