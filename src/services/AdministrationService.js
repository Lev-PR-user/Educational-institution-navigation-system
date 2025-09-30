const AdministrationRepository = require(`../repositories/AdministrationRepository`);
const AdministrationValidator = require(`../validators/AdministrationValidator`);

class AdministrationService{
    async getAllAdministration(){
        try{
            return await AdministrationRepository.getAllAdministration();
        } catch (error) {
            throw new Error(`Failed to get administration: ${error.message}`)
        };
    } 
    
     async getAdministrationById(administration_id) {
        try {
            AdministrationValidator.validateId(administration_id);
            
            const administration = await AdministrationRepository.findById(administration_id);
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
            AdministrationValidator.validateCreateData(administrationData);
            
            const existingAdmin = await AdministrationRepository.findById(administrationData.administration_id);
            if (existingAdmin) {
                throw new Error('Administration with this ID already exists');
            }
            
            return await AdministrationRepository.create(administrationData);
        } catch (error) {
            throw new Error(`Failed to create administration: ${error.message}`);
        }
    }

   async updateAdministration(administration_id, administrationData) {
    try {
        AdministrationValidator.validateId(administration_id); 
        AdministrationValidator.validateUpdateData(administrationData); 
            
        const existingAdmin = await AdministrationRepository.findById(administration_id);
        if (!existingAdmin) {
            throw new Error('Administration not found');
        }
        
        const updatedAdmin = await AdministrationRepository.update(administration_id, administrationData);
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
            AdministrationValidator.validateId(administration_id);
            
            const existingAdmin = await AdministrationRepository.findById(administration_id);
            if (!existingAdmin) {
                throw new Error('Administration not found');
            }
            
            const isDeleted = await AdministrationRepository.delete(administration_id);
            if (!isDeleted) {
                throw new Error('Failed to delete administration');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Failed to delete administration: ${error.message}`);
        }
    }
}

module.exports = new AdministrationService();