const AdministrationService = require(`../services/AdministrationService`);

class AdministrationController {
  async getAllAdministration(req, res){
    try {
    const administration = await AdministrationService.getAllAdministration();
    res.json(administration);
  }catch (error){
    res.status(404).json({ message: error.message }); 
   }
  }; 

  async getAdministrationById(req, res) {
        try {
            const { id } = req.params;
            const administration = await AdministrationService.getAdministrationById(id);
            res.json(administration);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async createAdministration(req, res) {
        try {
            const administration = await AdministrationService.createAdministration(req.body);
            res.status(201).json({
                message: 'Administration created successfully',
                administration
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateAdministration(req, res) {
        try {
            const { id } = req.params;
            const administration = await AdministrationService.updateAdministration(id, req.body);
            res.json({
                message: 'Administration updated successfully',
                administration
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    async deleteAdministration(req, res) {
        try {
            const { id } = req.params;
            await AdministrationService.deleteAdministration(id);
            res.json({ message: 'Administration deleted successfully' });
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }
}

module.exports = new AdministrationController();