const AnswersService = require('../services/AnswersService');

describe('AnswersService', () => {
    let answersService;
    let mockRepository;
    let mockValidator;

    beforeEach(() => {
        // Создаем моки для зависимостей
        mockRepository = {
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
        };

        mockValidator = {
            validateId: jest.fn(),
            validateQuestionId: jest.fn(),
            validateCreateData: jest.fn(),
            validateUpdateData: jest.fn()
        };

        // Создаем экземпляр сервиса с передачей зависимостей
        answersService = new AnswersService({
            answersValidator: mockValidator,
            answerRepository: mockRepository
        });

        jest.clearAllMocks();
    });

    describe('getAnswersByQuestion', () => {
        it('should return answers for valid question ID', async () => {
            const questionId = 1;
            const mockAnswers = [
                { id: 1, content: 'Answer 1', question_id: questionId },
                { id: 2, content: 'Answer 2', question_id: questionId }
            ];

            mockValidator.validateQuestionId.mockReturnValue(true);
            mockRepository.questionExists.mockResolvedValue(true);
            mockRepository.findByQuestionId.mockResolvedValue(mockAnswers);

            const result = await answersService.getAnswersByQuestion(questionId);

            expect(mockValidator.validateQuestionId).toHaveBeenCalledWith(questionId);
            expect(mockRepository.questionExists).toHaveBeenCalledWith(questionId);
            expect(mockRepository.findByQuestionId).toHaveBeenCalledWith(questionId);
            expect(result).toEqual(mockAnswers);
        });

        it('should throw error when question does not exist', async () => {
            const questionId = 999;

            mockValidator.validateQuestionId.mockReturnValue(true);
            mockRepository.questionExists.mockResolvedValue(false);

            await expect(answersService.getAnswersByQuestion(questionId))
                .rejects.toThrow('Failed to get answers: Question not found');

            expect(mockValidator.validateQuestionId).toHaveBeenCalledWith(questionId);
            expect(mockRepository.questionExists).toHaveBeenCalledWith(questionId);
        });

        it('should throw error when question ID validation fails', async () => {
            const questionId = 'invalid';

            mockValidator.validateQuestionId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            await expect(answersService.getAnswersByQuestion(questionId))
                .rejects.toThrow('Failed to get answers: Invalid question ID');
        });

        it('should throw error when repository fails', async () => {
            const questionId = 1;

            mockValidator.validateQuestionId.mockReturnValue(true);
            mockRepository.questionExists.mockResolvedValue(true);
            mockRepository.findByQuestionId.mockRejectedValue(new Error('Database error'));

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

            mockValidator.validateCreateData.mockReturnValue(true);
            mockRepository.questionExists.mockResolvedValue(true);
            mockRepository.create.mockResolvedValue(mockAnswer);

            const result = await answersService.createAnswer(answerData);

            expect(mockValidator.validateCreateData).toHaveBeenCalledWith(answerData);
            expect(mockRepository.questionExists).toHaveBeenCalledWith(answerData.question_id);
            expect(mockRepository.create).toHaveBeenCalledWith(answerData);
            expect(result).toEqual(mockAnswer);
        });

        it('should throw error when question does not exist', async () => {
            const answerData = {
                question_id: 999,
                content: 'Test answer',
                author_id: 1
            };

            mockValidator.validateCreateData.mockReturnValue(true);
            mockRepository.questionExists.mockResolvedValue(false);

            await expect(answersService.createAnswer(answerData))
                .rejects.toThrow('Failed to create answer: Question not found');
        });

        it('should throw error when validation fails', async () => {
            const answerData = { question_id: 1 };

            mockValidator.validateCreateData.mockImplementation(() => {
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

            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue(mockUpdatedAnswer);

            const result = await answersService.updateAnswer(answerId, updateData, userId);

            expect(mockValidator.validateId).toHaveBeenCalledWith(answerId);
            expect(mockValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(mockRepository.exists).toHaveBeenCalledWith(answerId);
            expect(mockRepository.isAuthor).toHaveBeenCalledWith(answerId, userId);
            expect(mockRepository.update).toHaveBeenCalledWith(answerId, updateData);
            expect(result).toEqual(mockUpdatedAnswer);
        });

        it('should throw error when answer not found', async () => {
            const answerId = 999;
            const userId = 1;
            const updateData = { content: 'Updated content' };

            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            await expect(answersService.updateAnswer(answerId, updateData, userId))
                .rejects.toThrow('Failed to update answer: Answer not found');
        });

        it('should throw error when user is not author', async () => {
            const answerId = 1;
            const userId = 2;
            const updateData = { content: 'Updated content' };

            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(false);

            await expect(answersService.updateAnswer(answerId, updateData, userId))
                .rejects.toThrow('Failed to update answer: You can only edit your own answers');
        });

        it('should throw error when update fails', async () => {
            const answerId = 1;
            const userId = 1;
            const updateData = { content: 'Updated content' };

            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue(null);

            await expect(answersService.updateAnswer(answerId, updateData, userId))
                .rejects.toThrow('Failed to update answer: Failed to update answer');
        });
    });

    describe('deleteAnswer', () => {
        it('should delete answer successfully when user is author', async () => {
            const answerId = 1;
            const userId = 1;

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(true);

            const result = await answersService.deleteAnswer(answerId, userId);

            expect(mockValidator.validateId).toHaveBeenCalledWith(answerId);
            expect(mockRepository.exists).toHaveBeenCalledWith(answerId);
            expect(mockRepository.isAuthor).toHaveBeenCalledWith(answerId, userId);
            expect(mockRepository.delete).toHaveBeenCalledWith(answerId);
            expect(result).toBe(true);
        });

        it('should delete answer successfully when user is admin', async () => {
            const answerId = 1;
            const userId = 2;

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(false);
            mockRepository.getUserRole.mockResolvedValue('admin');
            mockRepository.delete.mockResolvedValue(true);

            const result = await answersService.deleteAnswer(answerId, userId);

            expect(mockRepository.getUserRole).toHaveBeenCalledWith(userId);
            expect(mockRepository.delete).toHaveBeenCalledWith(answerId);
            expect(result).toBe(true);
        });

        it('should throw error when user is not author or admin', async () => {
            const answerId = 1;
            const userId = 2;

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(false);
            mockRepository.getUserRole.mockResolvedValue('user');

            await expect(answersService.deleteAnswer(answerId, userId))
                .rejects.toThrow('Failed to delete answer: You can only delete your own answers');
        });

        it('should throw error when deletion fails', async () => {
            const answerId = 1;
            const userId = 1;

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(false);

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

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.getAnswerWithQuestionInfo.mockResolvedValue(mockAnswerInfo);
            mockRepository.unmarkOtherSolutions.mockResolvedValue(true);
            mockRepository.markAsSolution.mockResolvedValue(mockUpdatedAnswer);

            const result = await answersService.markAsSolution(answerId, userId);

            expect(mockValidator.validateId).toHaveBeenCalledWith(answerId);
            expect(mockRepository.getAnswerWithQuestionInfo).toHaveBeenCalledWith(answerId);
            expect(mockRepository.unmarkOtherSolutions).toHaveBeenCalledWith(mockAnswerInfo.question_id, answerId);
            expect(mockRepository.markAsSolution).toHaveBeenCalledWith(answerId);
            expect(result).toEqual(mockUpdatedAnswer);
        });

        it('should throw error when answer not found', async () => {
            const answerId = 999;
            const userId = 1;

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.getAnswerWithQuestionInfo.mockResolvedValue(null);

            await expect(answersService.markAsSolution(answerId, userId))
                .rejects.toThrow('Failed to mark as solution: Answer not found');
        });

        it('should throw error when user is not question author', async () => {
            const answerId = 1;
            const userId = 2;
            const mockAnswerInfo = {
                id: answerId,
                question_id: 1,
                question_author_id: 1
            };

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.getAnswerWithQuestionInfo.mockResolvedValue(mockAnswerInfo);

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

            mockValidator.validateId.mockReturnValue(true);
            mockRepository.getAnswerWithQuestionInfo.mockResolvedValue(mockAnswerInfo);
            mockRepository.unmarkOtherSolutions.mockResolvedValue(true);
            mockRepository.markAsSolution.mockResolvedValue(null);

            await expect(answersService.markAsSolution(answerId, userId))
                .rejects.toThrow('Failed to mark as solution: Failed to mark answer as solution');
        });
    });
});