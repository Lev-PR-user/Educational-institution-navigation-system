class AdministrationValidator{
    static validateCreateData(data) {
         const { name_administration, position, photo_url } = data;
    
    
         if (!name_administration || !position || !photo_url) {
         throw new Error('All fields are required: name_administration, position, photo_url');
        }
        if (name_administration < 2){
            throw new Error('Name must be at least 2 characters long');
        }

        if(position < 2){
            throw new Error('Position must be at least 2 characters long');
        }
        return true;
    }

   static validateUpdateData(data) {
    const { name_administration, position, photo_url } = data;
    
    if (name_administration !== undefined && name_administration !== null) {
        if (name_administration.length < 2) { 
            throw new Error('Name must be at least 2 characters long');
        }
    }

    if (position !== undefined && position !== null) {
        if (position.length < 2) { 
            throw new Error('Position must be at least 2 characters long');
        }
    }

    if (photo_url !== undefined && photo_url !== null) {
        if (photo_url.length < 5) {
            throw new Error('Photo URL must be at least 5 characters long');
        }
    }

    return true;
}

   static validateId(id) {
    const idNumber = parseInt(id);
    if (isNaN(idNumber) || idNumber < 1) {
        throw new Error('Valid administration ID is required');
    }
    return true;
}
}

module.exports = AdministrationValidator;