// tests/AdministrationService.test.js
const AdministrationService = require('../services/AdministrationService');

// Mock dependencies
const mockAdministrationValidator = {
  validateId: jest.fn(),
  validateCreateData: jest.fn(),
  validateUpdateData: jest.fn()
};

const mockAdministrationRepository = {
  getAllAdministration: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('AdministrationService', () => {
  let administrationService;

  beforeEach(() => {
    administrationService = new AdministrationService({
      administrationValidator: mockAdministrationValidator,
      administrationRepository: mockAdministrationRepository
    });
    
    jest.clearAllMocks();
  });

  describe('getAllAdministration', () => {
    it('should return all administration successfully', async () => {
      // Arrange
      const mockData = [{ id: 1, name: 'Admin 1' }, { id: 2, name: 'Admin 2' }];
      mockAdministrationRepository.getAllAdministration.mockResolvedValue(mockData);

      // Act
      const result = await administrationService.getAllAdministration();

      // Assert
      expect(mockAdministrationRepository.getAllAdministration).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const errorMessage = 'Database error';
      mockAdministrationRepository.getAllAdministration.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(administrationService.getAllAdministration())
        .rejects
        .toThrow(`Failed to get administration: ${errorMessage}`);
    });
  });

  describe('getAdministrationById', () => {
    it('should return administration by id successfully', async () => {
      // Arrange
      const adminId = 1;
      const mockAdmin = { id: adminId, name: 'Test Admin' };
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(mockAdmin);

      // Act
      const result = await administrationService.getAdministrationById(adminId);

      // Assert
      expect(mockAdministrationValidator.validateId).toHaveBeenCalledWith(adminId);
      expect(mockAdministrationRepository.findById).toHaveBeenCalledWith(adminId);
      expect(result).toEqual(mockAdmin);
    });

    it('should throw error when administration not found', async () => {
      // Arrange
      const adminId = 999;
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(administrationService.getAdministrationById(adminId))
        .rejects
        .toThrow('Failed to get administration: Administration not found');
    });

    it('should throw error when id validation fails', async () => {
      // Arrange
      const adminId = 'invalid';
      mockAdministrationValidator.validateId.mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      // Act & Assert
      await expect(administrationService.getAdministrationById(adminId))
        .rejects
        .toThrow('Failed to get administration: Invalid ID');
    });
  });

  describe('createAdministration', () => {
    const validAdminData = {
      administration_id: 1,
      name: 'Test Admin',
      role: 'Manager'
    };

    it('should create administration successfully', async () => {
      // Arrange
      const createdAdmin = { ...validAdminData, id: 1 };
      mockAdministrationValidator.validateCreateData.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(null);
      mockAdministrationRepository.create.mockResolvedValue(createdAdmin);

      // Act
      const result = await administrationService.createAdministration(validAdminData);

      // Assert
      expect(mockAdministrationValidator.validateCreateData).toHaveBeenCalledWith(validAdminData);
      expect(mockAdministrationRepository.findById).toHaveBeenCalledWith(validAdminData.administration_id);
      expect(mockAdministrationRepository.create).toHaveBeenCalledWith(validAdminData);
      expect(result).toEqual(createdAdmin);
    });

    it('should throw error when administration already exists', async () => {
      // Arrange
      const existingAdmin = { id: 1, name: 'Existing Admin' };
      mockAdministrationValidator.validateCreateData.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(existingAdmin);

      // Act & Assert
      await expect(administrationService.createAdministration(validAdminData))
        .rejects
        .toThrow('Failed to create administration: Administration with this ID already exists');
    });

    it('should throw error when validation fails', async () => {
      // Arrange
      mockAdministrationValidator.validateCreateData.mockImplementation(() => {
        throw new Error('Invalid data');
      });

      // Act & Assert
      await expect(administrationService.createAdministration(validAdminData))
        .rejects
        .toThrow('Failed to create administration: Invalid data');
    });
  });

  describe('updateAdministration', () => {
    const adminId = 1;
    const updateData = { name: 'Updated Admin' };

    it('should update administration successfully', async () => {
      // Arrange
      const existingAdmin = { id: adminId, name: 'Old Admin' };
      const updatedAdmin = { ...existingAdmin, ...updateData };
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationValidator.validateUpdateData.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(existingAdmin);
      mockAdministrationRepository.update.mockResolvedValue(updatedAdmin);

      // Act
      const result = await administrationService.updateAdministration(adminId, updateData);

      // Assert
      expect(mockAdministrationValidator.validateId).toHaveBeenCalledWith(adminId);
      expect(mockAdministrationValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
      expect(mockAdministrationRepository.findById).toHaveBeenCalledWith(adminId);
      expect(mockAdministrationRepository.update).toHaveBeenCalledWith(adminId, updateData);
      expect(result).toEqual(updatedAdmin);
    });

    it('should throw error when administration not found', async () => {
      // Arrange
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationValidator.validateUpdateData.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(administrationService.updateAdministration(adminId, updateData))
        .rejects
        .toThrow('Failed to update administration: Administration not found');
    });

    it('should throw error when validation fails', async () => {
      // Arrange
      mockAdministrationValidator.validateId.mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      // Act & Assert
      await expect(administrationService.updateAdministration(adminId, updateData))
        .rejects
        .toThrow('Failed to update administration: Invalid ID');
    });

    it('should throw error when update fails', async () => {
      // Arrange
      const existingAdmin = { id: adminId, name: 'Old Admin' };
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationValidator.validateUpdateData.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(existingAdmin);
      mockAdministrationRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(administrationService.updateAdministration(adminId, updateData))
        .rejects
        .toThrow('Failed to update administration: Failed to update administration');
    });
  });

  describe('deleteAdministration', () => {
    const adminId = 1;

    it('should delete administration successfully', async () => {
      // Arrange
      const existingAdmin = { id: adminId, name: 'Test Admin' };
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(existingAdmin);
      mockAdministrationRepository.delete.mockResolvedValue(true);

      // Act
      const result = await administrationService.deleteAdministration(adminId);

      // Assert
      expect(mockAdministrationValidator.validateId).toHaveBeenCalledWith(adminId);
      expect(mockAdministrationRepository.findById).toHaveBeenCalledWith(adminId);
      expect(mockAdministrationRepository.delete).toHaveBeenCalledWith(adminId);
      expect(result).toBe(true);
    });

    it('should throw error when administration not found', async () => {
      // Arrange
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(administrationService.deleteAdministration(adminId))
        .rejects
        .toThrow('Failed to delete administration: Administration not found');
    });

    it('should throw error when deletion fails', async () => {
      // Arrange
      const existingAdmin = { id: adminId, name: 'Test Admin' };
      mockAdministrationValidator.validateId.mockReturnValue(true);
      mockAdministrationRepository.findById.mockResolvedValue(existingAdmin);
      mockAdministrationRepository.delete.mockResolvedValue(false);

      // Act & Assert
      await expect(administrationService.deleteAdministration(adminId))
        .rejects
        .toThrow('Failed to delete administration: Failed to delete administration');
    });

    it('should throw error when id validation fails', async () => {
      // Arrange
      mockAdministrationValidator.validateId.mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      // Act & Assert
      await expect(administrationService.deleteAdministration(adminId))
        .rejects
        .toThrow('Failed to delete administration: Invalid ID');
    });
  });
});