const sequelize = require('../config/db');

class FaqsRepository {
    async findAll() {
        const result = await sequelize.models.faq.findAll({
            attributes: [
                'faq_id',
                'question',
                'answer',
                'category'
            ],
            order: [
                ['category', 'ASC'],
                ['faq_id', 'ASC']
            ]
        });
        return result;
    }

    async findById(faq_id) {
        const result = await sequelize.models.faq.findOne({
            where: { faq_id }
        });
        return result;
    }

    async findByCategory(category) {
        const result = await sequelize.models.faq.findAll({
            where: { category },
            order: [['faq_id', 'ASC']]
        });
        return result;
    }

    async create(faqData) {
        const { question, answer, category } = faqData;
        
        const result = await sequelize.models.faq.create({
            question,
            answer,
            category
        });
        
        return result;
    }

    async update(faq_id, faqData) {
        const { question, answer, category } = faqData;
        
        await sequelize.models.faq.update({
            question,
            answer,
            category
        }, {
            where: { faq_id }
        });

        const updatedFaq = await sequelize.models.faq.findOne({
            where: { faq_id }
        });
        
        return updatedFaq;
    }

    async delete(faq_id) {
        const result = await sequelize.models.faq.destroy({
            where: { faq_id }
        });
        return result > 0;
    }

    async exists(faq_id) {
        const result = await sequelize.models.faq.findOne({
            where: { faq_id },
            attributes: ['faq_id']
        });
        return result !== null;
    }
}

module.exports =  FaqsRepository;