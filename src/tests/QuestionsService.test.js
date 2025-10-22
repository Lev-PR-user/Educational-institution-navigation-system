const QuestionsService = require('../services/QuestionsService');

describe('QuestionsService', () => {
    let questionsService;
    let mockRepository;
    let mockValidator;
    
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
        // Создаем моки для зависимостей
        mockRepository = {
            findAllWithDetails: jest.fn(),
            findById: jest.fn(),
            exists: jest.fn(),
            isAuthor: jest.fn(),
            getUserRole: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn()
        };

        mockValidator = {
            validateId: jest.fn(),
            validateCreateData: jest.fn(),
            validateUpdateData: jest.fn(),
            validateStatusData: jest.fn()
        };

        // Создаем экземпляр сервиса с передачей зависимостей
        questionsService = new QuestionsService({
            questionsRepository: mockRepository,
            questionsValidator: mockValidator
        });

        jest.clearAllMocks();
    });

    describe('getAllQuestions', () => {
        it('should return all questions with details successfully', async () => {
            // Arrange
            const mockQuestions = [
                mockQuestionWithDetails, 
                { ...mockQuestionWithDetails, question_id: 2, title: 'React vs Vue?' }
            ];
            mockRepository.findAllWithDetails.mockResolvedValue(mockQuestions);

            // Act
            const result = await questionsService.getAllQuestions();

            // Assert
            expect(mockRepository.findAllWithDetails).toHaveBeenCalled();
            expect(result).toEqual(mockQuestions);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            mockRepository.findAllWithDetails.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(questionsService.getAllQuestions())
                .rejects
                .toThrow('Failed to get questions: Database connection failed');
        });
    });

    describe('getQuestionById', () => {
        it('should return question by id successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(mockQuestionWithDetails);

            // Act
            const result = await questionsService.getQuestionById(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockQuestionWithDetails);
        });

        it('should throw error when question not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(questionsService.getQuestionById(999))
                .rejects
                .toThrow('Failed to get question: Question not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.getQuestionById(-1))
                .rejects
                .toThrow('Failed to get question: Invalid question ID');
            
            expect(mockRepository.findById).not.toHaveBeenCalled();
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
            mockValidator.validateCreateData.mockReturnValue(true);
            mockRepository.create.mockResolvedValue({ ...mockQuestion, ...validQuestionData });

            // Act
            const result = await questionsService.createQuestion(validQuestionData);

            // Assert
            expect(mockValidator.validateCreateData).toHaveBeenCalledWith(validQuestionData);
            expect(mockRepository.create).toHaveBeenCalledWith(validQuestionData);
            expect(result).toEqual({ ...mockQuestion, ...validQuestionData });
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid question data');
            });

            // Act & Assert
            await expect(questionsService.createQuestion(validQuestionData))
                .rejects
                .toThrow('Failed to create question: Invalid question data');
            
            expect(mockRepository.create).not.toHaveBeenCalled();
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
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue({ ...mockQuestion, ...updateData });

            // Act
            const result = await questionsService.updateQuestion(1, updateData, userId);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockQuestion, ...updateData });
        });

        it('should throw error when question not found', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.updateQuestion(999, updateData, userId))
                .rejects
                .toThrow('Failed to update question: Question not found');
            
            expect(mockRepository.isAuthor).not.toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when user is not author', async () => {
            // Arrange
            const userId = 2;
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.updateQuestion(1, updateData, userId))
                .rejects
                .toThrow('Failed to update question: You can only edit your own questions');
            
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.updateQuestion(-1, updateData, userId))
                .rejects
                .toThrow('Failed to update question: Invalid question ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue(null);

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
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(true);

            // Act
            const result = await questionsService.deleteQuestion(1, userId);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should delete question successfully when user is admin', async () => {
            // Arrange
            const userId = 2; 
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(false);
            mockRepository.getUserRole.mockResolvedValue('admin');
            mockRepository.delete.mockResolvedValue(true);

            // Act
            const result = await questionsService.deleteQuestion(1, userId);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(mockRepository.getUserRole).toHaveBeenCalledWith(userId);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when question not found', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.deleteQuestion(999, userId))
                .rejects
                .toThrow('Failed to delete question: Question not found');
            
            expect(mockRepository.isAuthor).not.toHaveBeenCalled();
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when user is not author and not admin', async () => {
            // Arrange
            const userId = 3;
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(false);
            mockRepository.getUserRole.mockResolvedValue('user');

            // Act & Assert
            await expect(questionsService.deleteQuestion(1, userId))
                .rejects
                .toThrow('Failed to delete question: You can only delete your own questions');
            
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.deleteQuestion(1, userId))
                .rejects
                .toThrow('Failed to delete question: Failed to delete question');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.deleteQuestion(-1, userId))
                .rejects
                .toThrow('Failed to delete question: Invalid question ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('toggleQuestionStatus', () => {
        const statusData = {
            is_closed: true
        };

        it('should toggle question status successfully when user is author', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateStatusData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.updateStatus.mockResolvedValue({ ...mockQuestion, is_closed: true });

            // Act
            const result = await questionsService.toggleQuestionStatus(1, statusData, userId);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockValidator.validateStatusData).toHaveBeenCalledWith(statusData);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.isAuthor).toHaveBeenCalledWith(1, userId);
            expect(mockRepository.updateStatus).toHaveBeenCalledWith(1, true);
            expect(result.is_closed).toBe(true);
        });

        it('should throw error when question not found', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateStatusData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(999, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: Question not found');
            
            expect(mockRepository.isAuthor).not.toHaveBeenCalled();
            expect(mockRepository.updateStatus).not.toHaveBeenCalled();
        });

        it('should throw error when user is not author', async () => {
            // Arrange
            const userId = 2;
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateStatusData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(false);

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(1, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: You can only edit your own questions');
            
            expect(mockRepository.updateStatus).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid question ID');
            });

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(-1, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: Invalid question ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.updateStatus).not.toHaveBeenCalled();
        });

        it('should throw error when status update fails', async () => {
            // Arrange
            const userId = 1;
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateStatusData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.isAuthor.mockResolvedValue(true);
            mockRepository.updateStatus.mockResolvedValue(null);

            // Act & Assert
            await expect(questionsService.toggleQuestionStatus(1, statusData, userId))
                .rejects
                .toThrow('Failed to toggle question status: Failed to update question status');
        });
    });
});