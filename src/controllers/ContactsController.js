/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Контакты администрации
 */

class ContactsController {
    constructor({ contactsService }){
        this.contactsService = contactsService
    };

    /**
     * @swagger
     * /api/contacts:
     *   get:
     *     summary: Получить все контакты
     *     tags: [Contact]
     *     responses:
     *       200:
     *         description: Список всех контактов получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Contact'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getContacts(req, res) {
        try {
            const contacts = await this.contactsService.getAllContacts();
            res.json(contacts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/contacts/{id}:
     *   get:
     *     summary: Получить контакт по ID
     *     tags: [Contact]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID контакта
     *     responses:
     *       200:
     *         description: Данные контакта
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Contact'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Контакт не найден
     */

    async getContactById(req, res) {
        try {
            const { id } = req.params;
            const contact = await this.contactsService.getContactById(id);
            res.json(contact);
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
     * /api/contacts:
     *   post:
     *     summary: Создать новый контакт
     *     tags: [Contact]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phone_number:
     *                 type: string
     *                 nullable: true
     *                 example: "+7 (999) 123-45-67"
     *               administration_email:
     *                 type: string
     *                 format: email
     *                 nullable: true
     *                 example: "director@mail.ru"
     *               administration_id:
     *                 type: integer
     *                 description: ID связанной записи администрации
     *                 example: 1
     *     responses:
     *       201:
     *         description: Контакт успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Contact created successfully"
     *                 contact:
     *                   $ref: '#/components/schemas/Contact'
     *       400:
     *         description: Ошибка валидации или контакт уже существует
     *       404:
     *         description: Связанная запись администрации не найдена
     */

    async createContact(req, res) {
        try {
            const contact = await this.contactsService.createContact(req.body);
            res.status(201).json({
                message: 'Contact created successfully',
                contact
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('already exists')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    /**
     * @swagger
     * /api/contacts/{id}:
     *   put:
     *     summary: Обновить контакт
     *     tags: [Contact]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID контакта
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phone_number:
     *                 type: string
     *                 nullable: true
     *                 example: "+7 (999) 987-65-43"
     *               administration_email:
     *                 type: string
     *                 format: email
     *                 nullable: true
     *                 example: "new_director@mail.ru"
     *               administration_id:
     *                 type: integer
     *                 description: ID связанной записи администрации
     *                 example: 2
     *     responses:
     *       200:
     *         description: Контакт успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Contact updated successfully"
     *                 contact:
     *                   $ref: '#/components/schemas/Contact'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Контакт не найден
     */

    async updateContact(req, res) {
        try {
            const { id } = req.params;
            const contact = await this.contactsService.updateContact(id, req.body);
            res.json({
                message: 'Contact updated successfully',
                contact
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
     * /api/contacts/{id}:
     *   delete:
     *     summary: Удалить контакт
     *     tags: [Contact]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID контакта
     *     responses:
     *       200:
     *         description: Контакт успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Contact deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: Контакт не найден
     */

    async deleteContact(req, res) {
        try {
            const { id } = req.params;
            await this.contactsService.deleteContact(id);
            res.json({ message: 'Contact deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  ContactsController;