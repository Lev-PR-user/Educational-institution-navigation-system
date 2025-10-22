/**
 * @swagger
 * tags:
 *   name: Clubs
 *   description: Управление клубами
 */

class ClubsController {
    constructor({ clubsService }){
        this.clubsService = clubsService
    };

     /**
     * @swagger
     * /api/clubs:
     *   get:
     *     summary: Получить все клубы
     *     tags: [Clubs]
     *     responses:
     *       200:
     *         description: Список всех клубов получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Club'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getClubs(req, res) {
        try {
            const clubs = await this.clubsService.getAllClubs();
            res.json(clubs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/clubs/{id}:
     *   get:
     *     summary: Получить клуб по ID
     *     tags: [Clubs]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID клуба
     *     responses:
     *       200:
     *         description: Данные клуба
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Club'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Клуб не найден
     */

    async getClubById(req, res) {
        try {
            const { id } = req.params;
            const club = await this.clubsService.getClubById(id);
            res.json(club);
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
     * /api/clubs:
     *   post:
     *     summary: Создать новый клуб
     *     tags: [Clubs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name_clubs
     *               - description
     *             properties:
     *               name_clubs:
     *                 type: string
     *                 example: "IT Клуб"
     *               description:
     *                 type: string
     *                 example: "Клуб для любителей программирования"
     *               contact_info:
     *                 type: string
     *                 example: "it_club@mail.ru"
     *               image_url:
     *                 type: string
     *                 format: uri
     *                 example: "/clubs/it_club.jpg"
     *               location_id:
     *                 type: integer
     *                 nullable: true
     *                 example: 1
     *     responses:
     *       201:
     *         description: Клуб успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Club created successfully"
     *                 club:
     *                   $ref: '#/components/schemas/Club'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Связанная локация не найдена
     */

    async createClub(req, res) {
        try {
            const club = await this.clubsService.createClub(req.body);
            res.status(201).json({
                message: 'Club created successfully',
                club
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
     * /api/clubs/{id}:
     *   put:
     *     summary: Обновить клуб
     *     tags: [Clubs]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID клуба
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name_clubs:
     *                 type: string
     *                 example: "Программирование для начинающих"
     *               description:
     *                 type: string
     *                 example: "Клуб для изучения основ программирования"
     *               contact_info:
     *                 type: string
     *                 example: "programming_club@mail.ru"
     *               image_url:
     *                 type: string
     *                 format: uri
     *                 example: "/clubs/programming_club.jpg"
     *               location_id:
     *                 type: integer
     *                 nullable: true
     *                 example: 2
     *     responses:
     *       200:
     *         description: Клуб успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Club updated successfully"
     *                 club:
     *                   $ref: '#/components/schemas/Club'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Клуб не найден
     */

    async updateClub(req, res) {
        try {
            const { id } = req.params;
            const club = await this.clubsService.updateClub(id, req.body);
            res.json({
                message: 'Club updated successfully',
                club
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
     * /api/clubs/{id}:
     *   delete:
     *     summary: Удалить клуб
     *     tags: [Clubs]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID клуба
     *     responses:
     *       200:
     *         description: Клуб успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Club deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: Клуб не найден
     */

    async deleteClub(req, res) {
        try {
            const { id } = req.params;
            await this.clubsService.deleteClub(id);
            res.json({ message: 'Club deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  ClubsController;