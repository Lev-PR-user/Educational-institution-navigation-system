const QuestionsService = require('../services/QuestionsService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/QuestionsRepository', () => ({
    findAllWithDetails: jest.fn(),
    findById: jest.fn(),
    exists: jest.fn(),
    isAuthor: jest.fn(),
    getUserRole: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/QuestionsValidator', () => ({
    validateId: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn(),
    validateStatusData: jest.fn()
}));

// Теперь импортируем моки
const QuestionsRepository = require('../repositories/QuestionsRepository');
const QuestionsValidator = require('../validators/QuestionsValidator');

describe('QuestionsService', () => {
    let questionsService;
    
    const mockQuestion = {
        question_id: 1,
        user_id: 1,
        title: 'How to learn JavaScript?',
        content: 'I want to learn JavaScript from scratch. What resources do you recommend?',
        category: 'programming',
        is_closed: false,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    const mockQuestionWithDetails = {
        ...mockQuestion,
        user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
        },
        answers: [
            {
                answer_id: 1,
                content: 'Start with MDN documentation',
                user_id: 2
            }
        ]
    };

    beforeEach(() => {
        questionsService = new QuestionsService();
        jest.clearAllMocks();
    });

    describe('getAllQuestions', () => {
        it('should return all questions with details successfully', async () => {
            // Arrange
            const mockQuestions = [
                mockQuestionWithDetails, 
                { ...mockQuestionWithDetails, question_id: 2, title: 'React vs Vue?' }
            ];
            QuestionsRepository.findAllWithDetails.mockResolvedValue(mockQuestions);

            // Act
            const result = await questionsService.getAllQuestions();

            // Assert
            expect(QuestionsRepository.findAllWithDetails).toHaveBeenCalled();
            expect(result).toEqual(mockQuestions);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            QuestionsRepository.findAllWithDetails.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(questionsService.getAllQuestions())
                .rejects
                .toThrow('Failed to get questions: Database connection failed');
        });
    });

    describe('getQuestionById', () => {
        it('should return question by id successfully', async () => {
            // Arrange
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsRepository.findById.mockResolvedValue(mockQuestionWithDetails);

            // Act
            const result = await questionsService.getQuestionById(1);

            // Assert
            expect(QuestionsValidator.validateId).toHaveBeenCalledWith(1);
            expect(QuestionsRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockQuestionWithDetails);
        });

        it('should throw error when question not found', async () => {
            // Arrange
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(questionsService.getQuestionById(999))
                .rejects
                .toThrow('Failed to get question: Question not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            QuestionsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.getQuestionById(-1))
                .rejects
                .toThrow('Failed to get question: Invalid question ID');
            
            expect(QuestionsRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('createQuestion', () => {
        const validQuestionData = {
            user_id: 2,
            title: 'Best practices for Node.js?',
            content: 'What are the best practices for building Node.js applications?',
            category: 'backend'
        };

        it('should create question successfully', async () => {
            // Arrange
            QuestionsValidator.validateCreateData.mockReturnValue(true);
            QuestionsRepository.create.mockResolvedValue({ ...mockQuestion, ...validQuestionData });

            // Act
            const result = await questionsService.createQuestion(validQuestionData);

            // Assert
            expect(QuestionsValidator.validateCreateData).toHaveBeenCalledWith(validQuestionData);
            expect(QuestionsRepository.create).toHaveBeenCalledWith(validQuestionData);
            expect(result).toEqual({ ...mockQuestion, ...validQuestionData });
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            QuestionsValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid question data');
            });

            // Act & Assert
            await expect(questionsService.createQuestion(validQuestionData))
                .rejects
                .toThrow('Failed to create question: Invalid question data');
            
            expect(QuestionsRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateQuestion', () => {
        const updateData = {
            title: 'Updated title',
            content: 'Updated content'
        };

        it('should update question successfully when user is author', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateUpdateData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(true);
            QuestionsRepository.update.mockResolvedValue({ ...mockQuestion, ...updateData });

            // Act
            const result = await questionsService.updateQuestion(1, updateData, userId);

            // Assert
            expect(QuestionsValidator.validateId).toHaveBeenCalledWith(1);
            expect(QuestionsValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(QuestionsRepository.exists).toHaveBeenCalledWith(1);
            expect(QuestionsRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(QuestionsRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockQuestion, ...updateData });
        });

        it('should throw error when question not found', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateUpdateData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.updateQuestion(999, updateData, userId))
                .rejects
                .toThrow('Failed to update question: Question not found');
            
            expect(QuestionsRepository.isAuthor).not.toHaveBeenCalled();
            expect(QuestionsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when user is not author', async () => {
            // Arrange
            const userId = 2; // Different user
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateUpdateData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.updateQuestion(1, updateData, userId))
                .rejects
                .toThrow('Failed to update question: You can only edit your own questions');
            
            expect(QuestionsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.updateQuestion(-1, updateData, userId))
                .rejects
                .toThrow('Failed to update question: Invalid question ID');
            
            expect(QuestionsRepository.exists).not.toHaveBeenCalled();
            expect(QuestionsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateUpdateData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(true);
            QuestionsRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(questionsService.updateQuestion(1, updateData, userId))
                .rejects
                .toThrow('Failed to update question: Failed to update question');
        });
    });

    describe('deleteQuestion', () => {
        it('should delete question successfully when user is author', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(true);
            QuestionsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await questionsService.deleteQuestion(1, userId);

            // Assert
            expect(QuestionsValidator.validateId).toHaveBeenCalledWith(1);
            expect(QuestionsRepository.exists).toHaveBeenCalledWith(1);
            expect(QuestionsRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(QuestionsRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should delete question successfully when user is admin', async () => {
            // Arrange
            const userId = 2; // Not author but admin
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(false);
            QuestionsRepository.getUserRole.mockResolvedValue('admin');
            QuestionsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await questionsService.deleteQuestion(1, userId);

            // Assert
            expect(QuestionsValidator.validateId).toHaveBeenCalledWith(1);
            expect(QuestionsRepository.exists).toHaveBeenCalledWith(1);
            expect(QuestionsRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(QuestionsRepository.getUserRole).toHaveBeenCalledWith(userId);
            expect(QuestionsRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when question not found', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.deleteQuestion(999, userId))
                .rejects
                .toThrow('Failed to delete question: Question not found');
            
            expect(QuestionsRepository.isAuthor).not.toHaveBeenCalled();
            expect(QuestionsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when user is not author and not admin', async () => {
            // Arrange
            const userId = 3; // Not author and not admin
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(false);
            QuestionsRepository.getUserRole.mockResolvedValue('user');

            // Act & Assert
            await expect(questionsService.deleteQuestion(1, userId))
                .rejects
                .toThrow('Failed to delete question: You can only delete your own questions');
            
            expect(QuestionsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(true);
            QuestionsRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.deleteQuestion(1, userId))
                .rejects
                .toThrow('Failed to delete question: Failed to delete question');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.deleteQuestion(-1, userId))
                .rejects
                .toThrow('Failed to delete question: Invalid question ID');
            
            expect(QuestionsRepository.exists).not.toHaveBeenCalled();
            expect(QuestionsRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('toggleQuestionStatus', () => {
        const statusData = {
            is_closed: true
        };

        it('should toggle question status successfully when user is author', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateStatusData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(true);
            QuestionsRepository.updateStatus.mockResolvedValue({ ...mockQuestion, is_closed: true });

            // Act
            const result = await questionsService.toggleQuestionStatus(1, statusData, userId);

            // Assert
            expect(QuestionsValidator.validateId).toHaveBeenCalledWith(1);
            expect(QuestionsValidator.validateStatusData).toHaveBeenCalledWith(statusData);
            expect(QuestionsRepository.exists).toHaveBeenCalledWith(1);
            expect(QuestionsRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(QuestionsRepository.updateStatus).toHaveBeenCalledWith(1, true);
            expect(result.is_closed).toBe(true);
        });

        it('should throw error when question not found', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateStatusData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(999, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: Question not found');
            
            expect(QuestionsRepository.isAuthor).not.toHaveBeenCalled();
            expect(QuestionsRepository.updateStatus).not.toHaveBeenCalled();
        });

        it('should throw error when user is not author', async () => {
            // Arrange
            const userId = 2; // Different user
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateStatusData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(1, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: You can only edit your own questions');
            
            expect(QuestionsRepository.updateStatus).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(-1, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: Invalid question ID');
            
            expect(QuestionsRepository.exists).not.toHaveBeenCalled();
            expect(QuestionsRepository.updateStatus).not.toHaveBeenCalled();
        });

        it('should throw error when status update fails', async () => {
            // Arrange
            const userId = 1;
            QuestionsValidator.validateId.mockReturnValue(true);
            QuestionsValidator.validateStatusData.mockReturnValue(true);
            QuestionsRepository.exists.mockResolvedValue(true);
            QuestionsRepository.isAuthor.mockResolvedValue(true);
            QuestionsRepository.updateStatus.mockResolvedValue(null);

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(1, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: Failed to update question status');
        });
    });
});