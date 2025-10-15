const sequelize = require('../config/db');
const { Sequelize } = require('sequelize');

class QuestionsRepository {
    async findAllWithDetails() {
        const result = await sequelize.models.questions.findAll({
            attributes: [
                'question_id',
                'user_id',
                'title',
                'text',
                'created_at',
                'is_closed',
                [sequelize.literal('"author"."login_name"'), 'author_name'],
                [Sequelize.fn('COUNT', Sequelize.col('answers.answer_id')), 'answer_count']
            ],
            include: [
                {
                    model: sequelize.models.users,
                    as: 'author',
                    attributes: []
                },
                {
                    model: sequelize.models.answers,
                    as: 'answers',
                    attributes: [],
                    required: false
                }
            ],
            group: ['question_id', 'author.user_id'],
            order: [['created_at', 'DESC']]
        });
        return result;
    }

    async findById(question_id) {
        const result = await sequelize.models.questions.findOne({
            attributes: [
                'question_id',
                'user_id',
                'title',
                'text',
                'created_at',
                'is_closed',
                [sequelize.literal('"author"."login_name"'), 'author_name']
            ],
            include: [
                {
                    model: sequelize.models.users,
                    as: 'author',
                    attributes: []
                }
            ],
            where: { question_id }
        });
        return result;
    }

    async create(questionData) {
        const { user_id, title, text } = questionData;
        
        const result = await sequelize.models.questions.create({
            user_id,
            title,
            text
        });
        
        return result;
    }

    async update(question_id, questionData) {
        const { title, text } = questionData;
        
        await sequelize.models.questions.update({
            title,
            text
        }, {
            where: { question_id }
        });

        const updatedQuestion = await sequelize.models.questions.findOne({
            where: { question_id }
        });
        
        return updatedQuestion;
    }

    async updateStatus(question_id, is_closed) {
        await sequelize.models.questions.update({
            is_closed
        }, {
            where: { question_id }
        });

        const updatedQuestion = await sequelize.models.questions.findOne({
            where: { question_id }
        });
        
        return updatedQuestion;
    }

    async delete(question_id) {
        const result = await sequelize.models.questions.destroy({
            where: { question_id }
        });
        return result > 0;
    }

    async exists(question_id) {
        const result = await sequelize.models.questions.findOne({
            where: { question_id },
            attributes: ['question_id']
        });
        return result !== null;
    }

    async isAuthor(question_id, user_id) {
        const result = await sequelize.models.questions.findOne({
            where: { 
                question_id,
                user_id
            },
            attributes: ['user_id']
        });
        return result !== null;
    }

    async getUserRole(user_id) {
        const result = await sequelize.models.roles.findOne({
            where: { user_id },
            attributes: ['role_name']
        });
        return result ? result.role_name : null;
    }
}

module.exports =  QuestionsRepository;