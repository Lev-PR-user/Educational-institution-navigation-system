/**
 * @swagger
 * tags:
 *   name: Room
 *   description: Управление комнатами
 */

class RoomsController {
    constructor({ roomsService }){
        this.roomsService = roomsService
    }; 

    /**
     * @swagger
     * /api/rooms:
     *   get:
     *     summary: Получить список всех комнат
     *     tags: [Room]
     *     responses:
     *       200:
     *         description: Список комнат получен успешно
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Room'
     *       500:
     *         description: Внутренняя ошибка сервера
     */

    async getAllRooms(req, res) {
        try {
            const rooms = await this.roomsService.getAllRooms();
            res.json(rooms);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    
     /**
     * @swagger
     * /api/rooms/{roomNumber}:
     *   get:
     *     summary: Получить комнату по номеру
     *     tags: [Room]
     *     parameters:
     *       - in: path
     *         name: roomNumber
     *         required: true
     *         schema:
     *           type: string
     *         description: Номер комнаты
     *     responses:
     *       200:
     *         description: Данные комнаты
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Room'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Комната не найдена
     */

    async getRoomByNumber(req, res) {
        try {
            const { id } = req.params;
            const room = await this.roomsService.getRoomByNumber(id);
            res.json(room);
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
     * /api/rooms/location/{locationId}:
     *   get:
     *     summary: Получить комнаты по локации
     *     tags: [Room]
     *     parameters:
     *       - in: path
     *         name: locationId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID локации
     *     responses:
     *       200:
     *         description: Список комнат в указанной локации
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Room'
     *       400:
     *         description: Неверный запрос
     *       404:
     *         description: Локация не найдена
     */

    async getRoomsByLocation(req, res) {
        try {
            const { locationId } = req.params;
            const rooms = await this.roomsService.getRoomsByLocation(locationId);
            res.json(rooms);
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
     * /api/rooms:
     *   post:
     *     summary: Создать новую комнату
     *     tags: [Room]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - room_number
     *             properties:
     *               room_number:
     *                 type: string
     *                 example: "101"
     *               room_url:
     *                 type: string
     *                 format: uri
     *                 example: "/rooms/101.jpg"
     *               floor_number:
     *                 type: integer
     *                 example: 1
     *               location_id:
     *                 type: integer
     *                 example: 1
     *     responses:
     *       201:
     *         description: Комната успешно создана
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Room created successfully"
     *                 room:
     *                   $ref: '#/components/schemas/Room'
     *       400:
     *         description: Ошибка валидации или комната уже существует
     *       404:
     *         description: Связанная сущность не найдена (например, location_id)
     */

    async createRoom(req, res) {
        try {
            const room = await this.roomsService.createRoom(req.body);
            res.status(201).json({
                message: 'Room created successfully',
                room
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                res.status(400).json({ message: error.message });
            } else if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

      /**
     * @swagger
     * /api/rooms/{roomNumber}:
     *   put:
     *     summary: Обновить данные комнаты
     *     tags: [Room]
     *     parameters:
     *       - in: path
     *         name: roomNumber
     *         required: true
     *         schema:
     *           type: string
     *         description: Номер комнаты
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               room_number:
     *                 type: string
     *                 example: "102"
     *               room_url:
     *                 type: string
     *                 format: uri
     *                 example: "/rooms/102_updated.jpg"
     *               floor_number:
     *                 type: integer
     *                 example: 1
     *               location_id:
     *                 type: integer
     *                 example: 2
     *     responses:
     *       200:
     *         description: Данные комнаты обновлены
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Room updated successfully"
     *                 room:
     *                   $ref: '#/components/schemas/Room'
     *       400:
     *         description: Ошибка валидации или комната с таким номером уже существует
     *       404:
     *         description: Комната не найдена
     */

    async updateRoom(req, res) {
        try {
            const { id } = req.params;
            const room = await this.roomsService.updateRoom(id, req.body);
            res.json({
                message: 'Room updated successfully',
                room
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
     * /api/rooms/{roomNumber}:
     *   delete:
     *     summary: Удалить комнату
     *     tags: [Room]
     *     parameters:
     *       - in: path
     *         name: roomNumber
     *         required: true
     *         schema:
     *           type: string
     *         description: Номер комнаты
     *     responses:
     *       200:
     *         description: Комната успешно удалена
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Room deleted successfully"
     *       400:
     *         description: Ошибка при удалении
     *       404:
     *         description: Комната не найдена
     */

    async deleteRoom(req, res) {
        try {
            const { id } = req.params;
            await this.roomsService.deleteRoom(id);
            res.json({ message: 'Room deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports =  RoomsController;