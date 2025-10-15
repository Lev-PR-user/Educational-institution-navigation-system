const AnswersService = require('../services/AnswersService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/AnswersRepository', () => ({
    questionExists: jest.fn(),
    findByQuestionId: jest.fn(),
    exists: jest.fn(),
    isAuthor: jest.fn(),
    getUserRole: jest.fn(),
    getAnswerWithQuestionInfo: jest.fn(),
    unmarkOtherSolutions: jest.fn(),
    markAsSolution: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/AnswersValidator', () => ({
    validateId: jest.fn(),
    validateQuestionId: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn()
}));

// Теперь импортируем моки
const AnswersRepository = require('../repositories/AnswersRepository');
const AnswersValidator = require('../validators/AnswersValidator');

describe('AnswersService', () => {
    let answersService;

    beforeEach(() => {
        answersService = new AnswersService();
        jest.clearAllMocks();
    });

    describe('getAnswersByQuestion', () => {
        it('should return answers for valid question ID', async () => {
            const questionId = 1;
            const mockAnswers = [
                { id: 1, content: 'Answer 1', question_id: questionId },
                { id: 2, content: 'Answer 2', question_id: questionId }
            ];

            AnswersValidator.validateQuestionId.mockReturnValue(true);
            AnswersRepository.questionExists.mockResolvedValue(true);
            AnswersRepository.findByQuestionId.mockResolvedValue(mockAnswers);

            const result = await answersService.getAnswersByQuestion(questionId);

            expect(AnswersValidator.validateQuestionId).toHaveBeenCalledWith(questionId);
            expect(AnswersRepository.questionExists).toHaveBeenCalledWith(questionId);
            expect(AnswersRepository.findByQuestionId).toHaveBeenCalledWith(questionId);
            expect(result).toEqual(mockAnswers);
        });

        it('should throw error when question does not exist', async () => {
            const questionId = 999;

            AnswersValidator.validateQuestionId.mockReturnValue(true);
            AnswersRepository.questionExists.mockResolvedValue(false);

            await expect(answersService.getAnswersByQuestion(questionId))
                .rejects.toThrow('Failed to get answers: Question not found');

            expect(AnswersValidator.validateQuestionId).toHaveBeenCalledWith(questionId);
            expect(AnswersRepository.questionExists).toHaveBeenCalledWith(questionId);
        });

        it('should throw error when question ID validation fails', async () => {
            const questionId = 'invalid';

            AnswersValidator.validateQuestionId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            await expect(answersService.getAnswersByQuestion(questionId))
                .rejects.toThrow('Failed to get answers: Invalid question ID');
        });

        it('should throw error when repository fails', async () => {
            const questionId = 1;

            AnswersValidator.validateQuestionId.mockReturnValue(true);
            AnswersRepository.questionExists.mockResolvedValue(true);
            AnswersRepository.findByQuestionId.mockRejectedValue(new Error('Database error'));

            await expect(answersService.getAnswersByQuestion(questionId))
                .rejects.toThrow('Failed to get answers: Database error');
        });
    });

    describe('createAnswer', () => {
        it('should create answer successfully', async () => {
            const answerData = {
                question_id: 1,
                content: 'Test answer',
                author_id: 1
            };
            const mockAnswer = { id: 1, ...answerData };

            AnswersValidator.validateCreateData.mockReturnValue(true);
            AnswersRepository.questionExists.mockResolvedValue(true);
            AnswersRepository.create.mockResolvedValue(mockAnswer);

            const result = await answersService.createAnswer(answerData);

            expect(AnswersValidator.validateCreateData).toHaveBeenCalledWith(answerData);
            expect(AnswersRepository.questionExists).toHaveBeenCalledWith(answerData.question_id);
            expect(AnswersRepository.create).toHaveBeenCalledWith(answerData);
            expect(result).toEqual(mockAnswer);
        });

        it('should throw error when question does not exist', async () => {
            const answerData = {
                question_id: 999,
                content: 'Test answer',
                author_id: 1
            };

            AnswersValidator.validateCreateData.mockReturnValue(true);
            AnswersRepository.questionExists.mockResolvedValue(false);

            await expect(answersService.createAnswer(answerData))
                .rejects.toThrow('Failed to create answer: Question not found');
        });

        it('should throw error when validation fails', async () => {
            const answerData = { question_id: 1 };

            AnswersValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid answer data');
            });

            await expect(answersService.createAnswer(answerData))
                .rejects.toThrow('Failed to create answer: Invalid answer data');
        });
    });

    describe('updateAnswer', () => {
        it('should update answer successfully when user is author', async () => {
            const answerId = 1;
            const userId = 1;
            const updateData = { content: 'Updated content' };
            const mockUpdatedAnswer = { id: answerId, ...updateData };

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersValidator.validateUpdateData.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(true);
            AnswersRepository.isAuthor.mockResolvedValue(true);
            AnswersRepository.update.mockResolvedValue(mockUpdatedAnswer);

            const result = await answersService.updateAnswer(answerId, updateData, userId);

            expect(AnswersValidator.validateId).toHaveBeenCalledWith(answerId);
            expect(AnswersValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(AnswersRepository.exists).toHaveBeenCalledWith(answerId);
            expect(AnswersRepository.isAuthor).toHaveBeenCalledWith(answerId, userId);
            expect(AnswersRepository.update).toHaveBeenCalledWith(answerId, updateData);
            expect(result).toEqual(mockUpdatedAnswer);
        });

        it('should throw error when answer not found', async () => {
            const answerId = 999;
            const userId = 1;
            const updateData = { content: 'Updated content' };

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersValidator.validateUpdateData.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(false);

            await expect(answersService.updateAnswer(answerId, updateData, userId))
                .rejects.toThrow('Failed to update answer: Answer not found');
        });

        it('should throw error when user is not author', async () => {
            const answerId = 1;
            const userId = 2;
            const updateData = { content: 'Updated content' };

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersValidator.validateUpdateData.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(true);
            AnswersRepository.isAuthor.mockResolvedValue(false);

            await expect(answersService.updateAnswer(answerId, updateData, userId))
                .rejects.toThrow('Failed to update answer: You can only edit your own answers');
        });

        it('should throw error when update fails', async () => {
            const answerId = 1;
            const userId = 1;
            const updateData = { content: 'Updated content' };

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersValidator.validateUpdateData.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(true);
            AnswersRepository.isAuthor.mockResolvedValue(true);
            AnswersRepository.update.mockResolvedValue(null);

            await expect(answersService.updateAnswer(answerId, updateData, userId))
                .rejects.toThrow('Failed to update answer: Failed to update answer');
        });
    });

    describe('deleteAnswer', () => {
        it('should delete answer successfully when user is author', async () => {
            const answerId = 1;
            const userId = 1;

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(true);
            AnswersRepository.isAuthor.mockResolvedValue(true);
            AnswersRepository.delete.mockResolvedValue(true);

            const result = await answersService.deleteAnswer(answerId, userId);

            expect(AnswersValidator.validateId).toHaveBeenCalledWith(answerId);
            expect(AnswersRepository.exists).toHaveBeenCalledWith(answerId);
            expect(AnswersRepository.isAuthor).toHaveBeenCalledWith(answerId, userId);
            expect(AnswersRepository.delete).toHaveBeenCalledWith(answerId);
            expect(result).toBe(true);
        });

        it('should delete answer successfully when user is admin', async () => {
            const answerId = 1;
            const userId = 2;

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(true);
            AnswersRepository.isAuthor.mockResolvedValue(false);
            AnswersRepository.getUserRole.mockResolvedValue('admin');
            AnswersRepository.delete.mockResolvedValue(true);

            const result = await answersService.deleteAnswer(answerId, userId);

            expect(AnswersRepository.getUserRole).toHaveBeenCalledWith(userId);
            expect(AnswersRepository.delete).toHaveBeenCalledWith(answerId);
            expect(result).toBe(true);
        });

        it('should throw error when user is not author or admin', async () => {
            const answerId = 1;
            const userId = 2;

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(true);
            AnswersRepository.isAuthor.mockResolvedValue(false);
            AnswersRepository.getUserRole.mockResolvedValue('user');

            await expect(answersService.deleteAnswer(answerId, userId))
                .rejects.toThrow('Failed to delete answer: You can only delete your own answers');
        });

        it('should throw error when deletion fails', async () => {
            const answerId = 1;
            const userId = 1;

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.exists.mockResolvedValue(true);
            AnswersRepository.isAuthor.mockResolvedValue(true);
            AnswersRepository.delete.mockResolvedValue(false);

            await expect(answersService.deleteAnswer(answerId, userId))
                .rejects.toThrow('Failed to delete answer: Failed to delete answer');
        });
    });

    describe('markAsSolution', () => {
        it('should mark answer as solution successfully when user is question author', async () => {
            const answerId = 1;
            const userId = 1;
            const mockAnswerInfo = {
                id: answerId,
                question_id: 1,
                question_author_id: userId
            };
            const mockUpdatedAnswer = { id: answerId, is_solution: true };

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.getAnswerWithQuestionInfo.mockResolvedValue(mockAnswerInfo);
            AnswersRepository.unmarkOtherSolutions.mockResolvedValue(true);
            AnswersRepository.markAsSolution.mockResolvedValue(mockUpdatedAnswer);

            const result = await answersService.markAsSolution(answerId, userId);

            expect(AnswersValidator.validateId).toHaveBeenCalledWith(answerId);
            expect(AnswersRepository.getAnswerWithQuestionInfo).toHaveBeenCalledWith(answerId);
            expect(AnswersRepository.unmarkOtherSolutions).toHaveBeenCalledWith(mockAnswerInfo.question_id, answerId);
            expect(AnswersRepository.markAsSolution).toHaveBeenCalledWith(answerId);
            expect(result).toEqual(mockUpdatedAnswer);
        });

        it('should throw error when answer not found', async () => {
            const answerId = 999;
            const userId = 1;

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.getAnswerWithQuestionInfo.mockResolvedValue(null);

            await expect(answersService.markAsSolution(answerId, userId))
                .rejects.toThrow('Failed to mark as solution: Answer not found');
        });

        it('should throw error when user is not question author', async () => {
            const answerId = 1;
            const userId = 2;
            const mockAnswerInfo = {
                id: answerId,
                question_id: 1,
                question_author_id: 1 // Different from userId
            };

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.getAnswerWithQuestionInfo.mockResolvedValue(mockAnswerInfo);

            await expect(answersService.markAsSolution(answerId, userId))
                .rejects.toThrow('Failed to mark as solution: Only question author can mark answer as solution');
        });

        it('should throw error when marking fails', async () => {
            const answerId = 1;
            const userId = 1;
            const mockAnswerInfo = {
                id: answerId,
                question_id: 1,
                question_author_id: userId
            };

            AnswersValidator.validateId.mockReturnValue(true);
            AnswersRepository.getAnswerWithQuestionInfo.mockResolvedValue(mockAnswerInfo);
            AnswersRepository.unmarkOtherSolutions.mockResolvedValue(true);
            AnswersRepository.markAsSolution.mockResolvedValue(null);

            await expect(answersService.markAsSolution(answerId, userId))
                .rejects.toThrow('Failed to mark as solution: Failed to mark answer as solution');
        });
    });
});