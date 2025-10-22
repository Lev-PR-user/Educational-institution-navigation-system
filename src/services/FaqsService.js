class FaqsService {
    constructor({ faqsValidator, fagRepository }) {
        this.faqsValidator = faqsValidator;
        this.fagRepository = fagRepository;
    }
    async getAllFaq() {
        try {
            return await this.fagRepository.findAll();
        } catch (error) {
            throw new Error(`Failed to get FAQ: ${error.message}`);
        }
    }

    async getFaqById(faq_id) {
        try {
           await this.faqsValidator.validateId(faq_id);
            
            const faq = await this.fagRepository.findById(faq_id);
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
           await this.faqsValidator.validateCategory(category);
            
            const faqs = await this.fagRepository.findByCategory(category);
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
           await this.faqsValidator.validateCreateData(faqData);
            
            return await this.fagRepository.create(faqData);
        } catch (error) {
            throw new Error(`Failed to create FAQ: ${error.message}`);
        }
    }

    async updateFaq(faq_id, faqData) {
        try {
           await this.faqsValidator.validateId(faq_id);
           await this.faqsValidator.validateUpdateData(faqData);
            
            const faqExists = await this.fagRepository.exists(faq_id);
            if (!faqExists) {
                throw new Error('FAQ not found');
            }

            const updatedFaq = await this.fagRepository.update(faq_id, faqData);
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
           await this.faqsValidator.validateId(faq_id);
            
            const faqExists = await this.fagRepository.exists(faq_id);
            if (!faqExists) {
                throw new Error('FAQ not found');
            }
            
            const isDeleted = await this.fagRepository.delete(faq_id);
            if (!isDeleted) {
                throw new Error('Failed to delete FAQ');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete FAQ: ${error.message}`);
        }
    }
}

module.exports =  FaqsService;