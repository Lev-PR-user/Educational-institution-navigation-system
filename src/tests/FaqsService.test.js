const FaqsService = require('../services/FaqsService');

describe('FaqsService', () => {
    let faqsService;
    let mockRepository;
    let mockValidator;
    
    const mockFaq = {
        faq_id: 1,
        question: 'What is Node.js?',
        answer: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
        category: 'technology',
        is_active: true,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        // Создаем моки для зависимостей
        mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCategory: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        mockValidator = {
            validateId: jest.fn(),
            validateCategory: jest.fn(),
            validateCreateData: jest.fn(),
            validateUpdateData: jest.fn()
        };

        faqsService = new FaqsService({
            faqsValidator: mockValidator,
            fagRepository: mockRepository 
        });

        jest.clearAllMocks();
    });

      describe('getAllFaq', () => {
        it('should return all FAQs successfully', async () => {
            // Arrange
            const mockFaqs = [
                mockFaq,
                { 
                    ...mockFaq, 
                    faq_id: 2, 
                    question: 'What is Express.js?',
                    answer: 'Express.js is a web application framework for Node.js.'
                }
            ];
            mockRepository.findAll.mockResolvedValue(mockFaqs);

            // Act
            const result = await faqsService.getAllFaq();

            // Assert
            expect(mockRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockFaqs);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            mockRepository.findAll.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(faqsService.getAllFaq())
                .rejects
                .toThrow('Failed to get FAQ: Database connection failed');
        });
    });

    describe('getFaqById', () => {
        it('should return FAQ by id successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(mockFaq);

            // Act
            const result = await faqsService.getFaqById(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockFaq);
        });

        it('should throw error when FAQ not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(faqsService.getFaqById(999))
                .rejects
                .toThrow('Failed to get FAQ: FAQ not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid FAQ ID');
            });

            // Act & Assert
            await expect(faqsService.getFaqById(-1))
                .rejects
                .toThrow('Failed to get FAQ: Invalid FAQ ID');
            
            expect(mockRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('getFaqByCategory', () => {
        it('should return FAQs by category successfully', async () => {
            // Arrange
            const mockFaqs = [
                mockFaq,
                { ...mockFaq, faq_id: 2, question: 'What is MongoDB?' }
            ];
            mockValidator.validateCategory.mockReturnValue(true);
            mockRepository.findByCategory.mockResolvedValue(mockFaqs);

            // Act
            const result = await faqsService.getFaqByCategory('technology');

            // Assert
            expect(mockValidator.validateCategory).toHaveBeenCalledWith('technology');
            expect(mockRepository.findByCategory).toHaveBeenCalledWith('technology');
            expect(result).toEqual(mockFaqs);
        });

        it('should throw error when no FAQs found for category', async () => {
            // Arrange
            mockValidator.validateCategory.mockReturnValue(true);
            mockRepository.findByCategory.mockResolvedValue([]);

            // Act & Assert
            await expect(faqsService.getFaqByCategory('nonexistent'))
                .rejects
                .toThrow('Failed to get FAQ by category: No FAQ found for this category');
        });

        it('should throw error when category validation fails', async () => {
            // Arrange
            mockValidator.validateCategory.mockImplementation(() => {
                throw new Error('Invalid category');
            });

            // Act & Assert
            await expect(faqsService.getFaqByCategory(''))
                .rejects
                .toThrow('Failed to get FAQ by category: Invalid category');
            
            expect(mockRepository.findByCategory).not.toHaveBeenCalled();
        });
    });

    describe('createFaq', () => {
        const validFaqData = {
            question: 'How to install Node.js?',
            answer: 'You can download Node.js from the official website and follow the installation instructions.',
            category: 'installation',
            is_active: true
        };

        it('should create FAQ successfully', async () => {
            // Arrange
            mockValidator.validateCreateData.mockReturnValue(true);
            mockRepository.create.mockResolvedValue({ ...mockFaq, ...validFaqData });

            // Act
            const result = await faqsService.createFaq(validFaqData);

            // Assert
            expect(mockValidator.validateCreateData).toHaveBeenCalledWith(validFaqData);
            expect(mockRepository.create).toHaveBeenCalledWith(validFaqData);
            expect(result).toEqual({ ...mockFaq, ...validFaqData });
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid FAQ data');
            });

            // Act & Assert
            await expect(faqsService.createFaq(validFaqData))
                .rejects
                .toThrow('Failed to create FAQ: Invalid FAQ data');
            
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateFaq', () => {
        const updateData = {
            question: 'Updated question?',
            answer: 'Updated answer.',
            category: 'updated-category'
        };

        it('should update FAQ successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue({ ...mockFaq, ...updateData });

            // Act
            const result = await faqsService.updateFaq(1, updateData);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockFaq, ...updateData });
        });

        it('should throw error when FAQ not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(faqsService.updateFaq(999, updateData))
                .rejects
                .toThrow('Failed to update FAQ: FAQ not found');
            
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid FAQ ID');
            });

            // Act & Assert
            await expect(faqsService.updateFaq(-1, updateData))
                .rejects
                .toThrow('Failed to update FAQ: Invalid FAQ ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(faqsService.updateFaq(1, updateData))
                .rejects
                .toThrow('Failed to update FAQ: Failed to update FAQ');
        });
    });

    describe('deleteFaq', () => {
        it('should delete FAQ successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(true);

            // Act
            const result = await faqsService.deleteFaq(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when FAQ not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(faqsService.deleteFaq(999))
                .rejects
                .toThrow('Failed to delete FAQ: FAQ not found');
            
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(faqsService.deleteFaq(1))
                .rejects
                .toThrow('Failed to delete FAQ: Failed to delete FAQ');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid FAQ ID');
            });

            // Act & Assert
            await expect(faqsService.deleteFaq(-1))
                .rejects
                .toThrow('Failed to delete FAQ: Invalid FAQ ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });
    });
});