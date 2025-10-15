const sequelize = require('../config/db');

class AnswersRepository {
    async findByQuestionId(question_id) {
        const result = await sequelize.models.answers.findAll({
            attributes: [
                'answer_id',
                ['text', 'answer_text'],
                ['created_at', 'answer_created_at'],
                'is_solution',
                [sequelize.literal('"answer_author"."login_name"'), 'answer_author'],
                [sequelize.literal('"question"."title"'), 'question_title'],
                [sequelize.literal('"question"."text"'), 'question_text'],
                [sequelize.literal('"question_author"."login_name"'), 'question_author']
            ],
            include: [
                {
                    model: sequelize.models.users,
                    as: 'answer_author',
                    attributes: []
                },
                {
                    model: sequelize.models.questions,
                    as: 'question',
                    attributes: [],
                    include: [
                        {
                            model: sequelize.models.users,
                            as: 'question_author',
                            attributes: []
                        }
                    ]
                }
            ],
            where: { question_id },
            order: [['created_at', 'DESC']]
        });
        return result;
    }

    async findById(answer_id) {
        const result = await sequelize.models.answers.findOne({
            where: { answer_id }
        });
        return result;
    }

    async create(answerData) {
        const { question_id, user_id, text } = answerData;
        
        const result = await sequelize.models.answers.create({
            question_id,
            user_id,
            text
        });
        
        return result;
    }

    async update(answer_id, answerData) {
        const { text } = answerData;
        
        await sequelize.models.answers.update({
            text
        }, {
            where: { answer_id }
        });

        const updatedAnswer = await sequelize.models.answers.findOne({
            where: { answer_id }
        });
        
        return updatedAnswer;
    }

    async delete(answer_id) {
        const result = await sequelize.models.answers.destroy({
            where: { answer_id }
        });
        return result > 0;
    }

    async exists(answer_id) {
        const result = await sequelize.models.answers.findOne({
            where: { answer_id },
            attributes: ['answer_id']
        });
        return result !== null;
    }

    async questionExists(question_id) {
        const result = await sequelize.models.questions.findOne({
            where: { question_id },
            attributes: ['question_id']
        });
        return result !== null;
    }

    async isAuthor(answer_id, user_id) {
        const result = await sequelize.models.answers.findOne({
            where: { 
                answer_id,
                user_id
            },
            attributes: ['user_id']
        });
        return result !== null;
    }

    async getAnswerWithQuestionInfo(answer_id) {
        const result = await sequelize.models.answers.findOne({
            include: [
                {
                    model: sequelize.models.questions,
                    as: 'question',
                    attributes: ['user_id']
                }
            ],
            where: { answer_id }
        });

        if (result && result.question) {
            return {
                ...result.toJSON(),
                question_author_id: result.question.user_id
            };
        }
        return null;
    }

    async unmarkOtherSolutions(question_id, exclude_answer_id) {
        await sequelize.models.answers.update({
            is_solution: false
        }, {
            where: { 
                question_id,
                answer_id: {
                    [sequelize.Op.ne]: exclude_answer_id
                }
            }
        });
    }

    async markAsSolution(answer_id) {
        await sequelize.models.answers.update({
            is_solution: true
        }, {
            where: { answer_id }
        });

        const updatedAnswer = await sequelize.models.answers.findOne({
            where: { answer_id }
        });
        
        return updatedAnswer;
    }

    async getUserRole(user_id) {
        const result = await sequelize.models.roles.findOne({
            where: { user_id },
            attributes: ['role_name']
        });
        return result ? result.role_name : null;
    }
}

module.exports =  AnswersRepository;