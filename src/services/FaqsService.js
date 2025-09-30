const FaqsRepository = require('../repositories/FaqsRepository');
const FaqsValidator = require('../validators/FaqsValidator');

class FaqsService {
    async getAllFaq() {
        try {
            return await FaqsRepository.findAll();
        } catch (error) {
            throw new Error(`Failed to get FAQ: ${error.message}`);
        }
    }

    async getFaqById(faq_id) {
        try {
            FaqsValidator.validateId(faq_id);
            
            const faq = await FaqsRepository.findById(faq_id);
            if (!faq) {
                throw new Error('FAQ not found');
            }
            
            return faq;
        } catch (error) {
            throw new Error(`Failed to get FAQ: ${error.message}`);
        }
    }

    async getFaqByCategory(category) {
        try {
            FaqsValidator.validateCategory(category);
            
            const faqs = await FaqsRepository.findByCategory(category);
            if (faqs.length === 0) {
                throw new Error('No FAQ found for this category');
            }
            
            return faqs;
        } catch (error) {
            throw new Error(`Failed to get FAQ by category: ${error.message}`);
        }
    }

    async createFaq(faqData) {
        try {
            FaqsValidator.validateCreateData(faqData);
            
            return await FaqsRepository.create(faqData);
        } catch (error) {
            throw new Error(`Failed to create FAQ: ${error.message}`);
        }
    }

    async updateFaq(faq_id, faqData) {
        try {
            FaqsValidator.validateId(faq_id);
            FaqsValidator.validateUpdateData(faqData);
            
            const faqExists = await FaqsRepository.exists(faq_id);
            if (!faqExists) {
                throw new Error('FAQ not found');
            }

            const updatedFaq = await FaqsRepository.update(faq_id, faqData);
            if (!updatedFaq) {
                throw new Error('Failed to update FAQ');
            }
            
            return updatedFaq;
        } catch (error) {
            throw new Error(`Failed to update FAQ: ${error.message}`);
        }
    }

    async deleteFaq(faq_id) {
        try {
            FaqsValidator.validateId(faq_id);
            
            const faqExists = await FaqsRepository.exists(faq_id);
            if (!faqExists) {
                throw new Error('FAQ not found');
            }
            
            const isDeleted = await FaqsRepository.delete(faq_id);
            if (!isDeleted) {
                throw new Error('Failed to delete FAQ');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete FAQ: ${error.message}`);
        }
    }
}

module.exports = new FaqsService();