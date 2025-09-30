const FaqsService = require('../services/FaqsService');

class FaqsController {
    async getFaq(req, res) {
        try {
            const faq = await FaqsService.getAllFaq();
            res.json(faq);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getFaqById(req, res) {
        try {
            const { id } = req.params;
            const faq = await FaqsService.getFaqById(id);
            res.json(faq);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async getFaqByCategory(req, res) {
        try {
            const { category } = req.params;
            const faq = await FaqsService.getFaqByCategory(category);
            res.json(faq);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createFaq(req, res) {
        try {
            const faq = await FaqsService.createFaq(req.body);
            res.status(201).json({
                message: 'FAQ created successfully',
                faq
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateFaq(req, res) {
        try {
            const { id } = req.params;
            const faq = await FaqsService.updateFaq(id, req.body);
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

    async deleteFaq(req, res) {
        try {
            const { id } = req.params;
            await FaqsService.deleteFaq(id);
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

module.exports = new FaqsController();