/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Управление локациями
 */

class LocationsController {
    constructor({ locationService }){
        this.locationService = locationService
    };

      /**
     * @swagger
     * /api/locations:
     *   get:
     *     summary: Получить список всех локаций
     *     tags: [Locations]
     *     responses:
     *       200:
     *         description: Список локаций получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Location'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getAllLocations(req, res) {
        try {
            const locations = await this.locationService.getAllLocations();
            res.json(locations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/locations/{id}:
     *   get:
     *     summary: Получить локацию по ID
     *     tags: [Locations]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID локации
     *     responses:
     *       200:
     *         description: Данные локации
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Location'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Локация не найдена
     */

    async getLocationById(req, res) {
        try {
            const { id } = req.params;
            const location = await this.locationService.getLocationById(id);
            res.json(location);
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
     * /api/locations/floor/{floorNumber}:
     *   get:
     *     summary: Получить локации по номеру этажа
     *     tags: [Locations]
     *     parameters:
     *       - in: path
     *         name: floorNumber
     *         required: true
     *         schema:
     *           type: integer
     *         description: Номер этажа
     *     responses:
     *       200:
     *         description: Список локаций на указанном этаже
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Location'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Этаж не найден или локации не найдены
     */

    async getLocationsByFloor(req, res) {
        try {
            const { floorNumber } = req.params;
            const locations = await this.locationService.getLocationsByFloor(floorNumber);
            res.json(locations);
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
     * /api/locations:
     *   post:
     *     summary: Создать новую локацию
     *     tags: [Locations]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - description
     *               - room_number
     *               - floor_number
     *             properties:
     *               description:
     *                 type: string
     *                 example: "Главный корпус, первый этаж"
     *               room_number:
     *                 type: string
     *                 example: "101"
     *               floor_number:
     *                 type: integer
     *                 example: 1
     *     responses:
     *       201:
     *         description: Локация успешно создана
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Location created successfully"
     *                 location:
     *                   $ref: '#/components/schemas/Location'
     *       400:
     *         description: Ошибка валидации
     */

    async createLocation(req, res) {
        try {
            const location = await this.locationService.createLocation(req.body);
            res.status(201).json({
                message: 'Location created successfully',
                location
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

     /**
     * @swagger
     * /api/locations/{id}:
     *   put:
     *     summary: Обновить данные локации
     *     tags: [Locations]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID локации
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               description:
     *                 type: string
     *                 example: "Обновленное описание локации"
     *               room_number:
     *                 type: string
     *                 example: "102"
     *               floor_number:
     *                 type: integer
     *                 example: 2
     *     responses:
     *       200:
     *         description: Данные локации обновлены
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Location updated successfully"
     *                 location:
     *                   $ref: '#/components/schemas/Location'
     *       400:
     *         description: Ошибка валидации
     *       404:
     *         description: Локация не найдена
     */

    async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const location = await this.locationService.updateLocation(id, req.body);
            res.json({
                message: 'Location updated successfully',
                location
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
     * /api/locations/{id}:
     *   delete:
     *     summary: Удалить локацию
     *     tags: [Locations]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID локации
     *     responses:
     *       200:
     *         description: Локация успешно удалена
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Location deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: Локация не найдена
     */

    async deleteLocation(req, res) {
        try {
            const { id } = req.params;
            await this.locationService.deleteLocation(id);
            res.json({ message: 'Location deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  LocationsController;