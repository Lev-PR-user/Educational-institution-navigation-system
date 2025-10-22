class AdministrationService{
    constructor({ administrationValidator, administrationRepository }) {
        this.administrationValidator = administrationValidator;
        this.administrationRepository = administrationRepository;
    }

    async getAllAdministration(){
        try{
            return await this.administrationRepository.getAllAdministration();
        } catch (error) {
            throw new Error(`Failed to get administration: ${error.message}`)
        };
    } 
    
     async getAdministrationById(administration_id) {
        try {
            this.administrationValidator.validateId(administration_id);
            
            const administration = await this.administrationRepository.findById(administration_id);
            if (!administration) {
                throw new Error('Administration not found');
            }
            
            return administration;
        } catch (error) {
            throw new Error(`Failed to get administration: ${error.message}`);
        }
    }

     async createAdministration(administrationData) {
        try {
            this.administrationValidator.validateCreateData(administrationData);
            
            const existingAdmin = await this.administrationRepository.findById(administrationData.administration_id);
            if (existingAdmin) {
                throw new Error('Administration with this ID already exists');
            }
            
            return await this.administrationRepository.create(administrationData);
        } catch (error) {
            throw new Error(`Failed to create administration: ${error.message}`);
        }
    }

   async updateAdministration(administration_id, administrationData) {
    try {
        this.administrationValidator.validateId(administration_id); 
        this.administrationValidator.validateUpdateData(administrationData); 
            
        const existingAdmin = await this.administrationRepository.findById(administration_id);
        if (!existingAdmin) {
            throw new Error('Administration not found');
        }
        
        const updatedAdmin = await this.administrationRepository.update(administration_id, administrationData);
        if (!updatedAdmin) {
            throw new Error('Failed to update administration');
        }
        
        return updatedAdmin;
    } catch (error) {
        throw new Error(`Failed to update administration: ${error.message}`);
    }
}

    async deleteAdministration(administration_id) {
        try {
            this.administrationValidator.validateId(administration_id);
            
            const existingAdmin = await this.administrationRepository.findById(administration_id);
            if (!existingAdmin) {
                throw new Error('Administration not found');
            }
            
            const isDeleted = await this.administrationRepository.delete(administration_id);
            if (!isDeleted) {
                throw new Error('Failed to delete administration');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete administration: ${error.message}`);
        }
    }
}

module.exports =  AdministrationService;