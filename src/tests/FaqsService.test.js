const FaqsService = require('../services/FaqsService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/FaqsRepository', () => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCategory: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/FaqsValidator', () => ({
    validateId: jest.fn(),
    validateCategory: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn()
}));

// Теперь импортируем моки
const FaqsRepository = require('../repositories/FaqsRepository');
const FaqsValidator = require('../validators/FaqsValidator');

describe('FaqsService', () => {
    let faqsService;
    
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
        faqsService = new FaqsService();
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
            FaqsRepository.findAll.mockResolvedValue(mockFaqs);

            // Act
            const result = await faqsService.getAllFaq();

            // Assert
            expect(FaqsRepository.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockFaqs);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            FaqsRepository.findAll.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(faqsService.getAllFaq())
                .rejects
                .toThrow('Failed to get FAQ: Database connection failed');
        });
    });

    describe('getFaqById', () => {
        it('should return FAQ by id successfully', async () => {
            // Arrange
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsRepository.findById.mockResolvedValue(mockFaq);

            // Act
            const result = await faqsService.getFaqById(1);

            // Assert
            expect(FaqsValidator.validateId).toHaveBeenCalledWith(1);
            expect(FaqsRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockFaq);
        });

        it('should throw error when FAQ not found', async () => {
            // Arrange
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(faqsService.getFaqById(999))
                .rejects
                .toThrow('Failed to get FAQ: FAQ not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            FaqsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid FAQ ID');
            });

            // Act & Assert
            await expect(faqsService.getFaqById(-1))
                .rejects
                .toThrow('Failed to get FAQ: Invalid FAQ ID');
            
            expect(FaqsRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('getFaqByCategory', () => {
        it('should return FAQs by category successfully', async () => {
            // Arrange
            const mockFaqs = [
                mockFaq,
                { ...mockFaq, faq_id: 2, question: 'What is MongoDB?' }
            ];
            FaqsValidator.validateCategory.mockReturnValue(true);
            FaqsRepository.findByCategory.mockResolvedValue(mockFaqs);

            // Act
            const result = await faqsService.getFaqByCategory('technology');

            // Assert
            expect(FaqsValidator.validateCategory).toHaveBeenCalledWith('technology');
            expect(FaqsRepository.findByCategory).toHaveBeenCalledWith('technology');
            expect(result).toEqual(mockFaqs);
        });

        it('should throw error when no FAQs found for category', async () => {
            // Arrange
            FaqsValidator.validateCategory.mockReturnValue(true);
            FaqsRepository.findByCategory.mockResolvedValue([]);

            // Act & Assert
            await expect(faqsService.getFaqByCategory('nonexistent'))
                .rejects
                .toThrow('Failed to get FAQ by category: No FAQ found for this category');
        });

        it('should throw error when category validation fails', async () => {
            // Arrange
            FaqsValidator.validateCategory.mockImplementation(() => {
                throw new Error('Invalid category');
            });

            // Act & Assert
            await expect(faqsService.getFaqByCategory(''))
                .rejects
                .toThrow('Failed to get FAQ by category: Invalid category');
            
            expect(FaqsRepository.findByCategory).not.toHaveBeenCalled();
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
            FaqsValidator.validateCreateData.mockReturnValue(true);
            FaqsRepository.create.mockResolvedValue({ ...mockFaq, ...validFaqData });

            // Act
            const result = await faqsService.createFaq(validFaqData);

            // Assert
            expect(FaqsValidator.validateCreateData).toHaveBeenCalledWith(validFaqData);
            expect(FaqsRepository.create).toHaveBeenCalledWith(validFaqData);
            expect(result).toEqual({ ...mockFaq, ...validFaqData });
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            FaqsValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid FAQ data');
            });

            // Act & Assert
            await expect(faqsService.createFaq(validFaqData))
                .rejects
                .toThrow('Failed to create FAQ: Invalid FAQ data');
            
            expect(FaqsRepository.create).not.toHaveBeenCalled();
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
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsValidator.validateUpdateData.mockReturnValue(true);
            FaqsRepository.exists.mockResolvedValue(true);
            FaqsRepository.update.mockResolvedValue({ ...mockFaq, ...updateData });

            // Act
            const result = await faqsService.updateFaq(1, updateData);

            // Assert
            expect(FaqsValidator.validateId).toHaveBeenCalledWith(1);
            expect(FaqsValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(FaqsRepository.exists).toHaveBeenCalledWith(1);
            expect(FaqsRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockFaq, ...updateData });
        });

        it('should throw error when FAQ not found', async () => {
            // Arrange
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsValidator.validateUpdateData.mockReturnValue(true);
            FaqsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(faqsService.updateFaq(999, updateData))
                .rejects
                .toThrow('Failed to update FAQ: FAQ not found');
            
            expect(FaqsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            FaqsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid FAQ ID');
            });

            // Act & Assert
            await expect(faqsService.updateFaq(-1, updateData))
                .rejects
                .toThrow('Failed to update FAQ: Invalid FAQ ID');
            
            expect(FaqsRepository.exists).not.toHaveBeenCalled();
            expect(FaqsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsValidator.validateUpdateData.mockReturnValue(true);
            FaqsRepository.exists.mockResolvedValue(true);
            FaqsRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(faqsService.updateFaq(1, updateData))
                .rejects
                .toThrow('Failed to update FAQ: Failed to update FAQ');
        });
    });

    describe('deleteFaq', () => {
        it('should delete FAQ successfully', async () => {
            // Arrange
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsRepository.exists.mockResolvedValue(true);
            FaqsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await faqsService.deleteFaq(1);

            // Assert
            expect(FaqsValidator.validateId).toHaveBeenCalledWith(1);
            expect(FaqsRepository.exists).toHaveBeenCalledWith(1);
            expect(FaqsRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when FAQ not found', async () => {
            // Arrange
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(faqsService.deleteFaq(999))
                .rejects
                .toThrow('Failed to delete FAQ: FAQ not found');
            
            expect(FaqsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            FaqsValidator.validateId.mockReturnValue(true);
            FaqsRepository.exists.mockResolvedValue(true);
            FaqsRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(faqsService.deleteFaq(1))
                .rejects
                .toThrow('Failed to delete FAQ: Failed to delete FAQ');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            FaqsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid FAQ ID');
            });

            // Act & Assert
            await expect(faqsService.deleteFaq(-1))
                .rejects
                .toThrow('Failed to delete FAQ: Invalid FAQ ID');
            
            expect(FaqsRepository.exists).not.toHaveBeenCalled();
            expect(FaqsRepository.delete).not.toHaveBeenCalled();
        });
    });
});