/**
 * @swagger
 * tags:
 *   name: Floor
 *   description: Управление этажами
 */

class FloorsController {
    constructor({ floorsService }){
        this.floorsService = floorsService
    };

    /**
     * @swagger
     * /api/floors:
     *   get:
     *     summary: Получить список всех этажей
     *     tags: [Floor]
     *     responses:
     *       200:
     *         description: Список этажей получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Floor'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getAllFloors(req, res) {
        try {
            const floors = await this.floorsService.getAllFloors();
            res.json(floors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

     /**
     * @swagger
     * /api/floors/{floors_number}:
     *   get:
     *     summary: Получить этаж по номеру
     *     tags: [Floor]
     *     parameters:
     *       - in: path
     *         name: floors_number
     *         required: true
     *         schema:
     *           type: integer
     *         description: Номер этажа
     *     responses:
     *       200:
     *         description: Данные этажа
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Floor'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Этаж не найден
     */

    async getFloorByNumber(req, res) {
        try {
            const { floors_number } = req.params;
            const floor = await this.floorsService.getFloorByNumber(floors_number);
            res.json(floor);
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
     * /api/floors:
     *   post:
     *     summary: Создать новый этаж
     *     tags: [Floor]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - floor_number
     *             properties:
     *               floor_number:
     *                 type: integer
     *                 example: 3
     *               map_image_url:
     *                 type: string
     *                 format: uri
     *                 example: "/maps/floor3.jpg"
     *     responses:
     *       201:
     *         description: Этаж успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Floor created successfully"
     *                 floor:
     *                   $ref: '#/components/schemas/Floor'
     *       400:
     *         description: Ошибка валидации или этаж уже существует
     */

    async createFloor(req, res) {
        try {
            const floor = await this.floorsService.createFloor(req.body);
            res.status(201).json({
                message: 'Floor created successfully',
                floor
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

       /**
     * @swagger
     * /api/floors/{floor_number}:
     *   put:
     *     summary: Обновить данные этажа
     *     tags: [Floor]
     *     parameters:
     *       - in: path
     *         name: floor_number
     *         required: true
     *         schema:
     *           type: integer
     *         description: Номер этажа
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               floor_number:
     *                 type: integer
     *                 example: 4
     *               map_image_url:
     *                 type: string
     *                 format: uri
     *                 example: "/maps/floor4_updated.jpg"
     *     responses:
     *       200:
     *         description: Данные этажа обновлены
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Floor updated successfully"
     *                 floor:
     *                   $ref: '#/components/schemas/Floor'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Этаж не найден
     */

    async updateFloor(req, res) {
        try {
            const { floor_number } = req.params;
            const floor = await this.floorsService.updateFloor(floor_number, req.body);
            res.json({
                message: 'Floor updated successfully',
                floor
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
     * /api/floors/{floor_number}:
     *   delete:
     *     summary: Удалить этаж
     *     tags: [Floor]
     *     parameters:
     *       - in: path
     *         name: floor_number
     *         required: true
     *         schema:
     *           type: integer
     *         description: Номер этажа
     *     responses:
     *       200:
     *         description: Этаж успешно удален
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Floor deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: Этаж не найден
     *       409:
     *         description: Невозможно удалить этаж - есть связанные локации
     */

    async deleteFloor(req, res) {
        try {
            const { floor_number } = req.params;
            await this.floorsService.deleteFloor(floor_number);
            res.json({ message: 'Floor deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('existing locations')) {
                res.status(409).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  FloorsController;