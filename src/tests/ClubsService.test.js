const ContactsService = require('../services/ContactsService');

// Мокаем зависимости ДО импорта сервиса
jest.mock('../repositories/ContactsRepository', () => ({
    findAllWithAdminInfo: jest.fn(),
    findById: jest.fn(),
    adminExists: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

jest.mock('../validators/ContactsValidator', () => ({
    validateId: jest.fn(),
    validateCreateData: jest.fn(),
    validateUpdateData: jest.fn()
}));

// Теперь импортируем моки
const ContactsRepository = require('../repositories/ContactsRepository');
const ContactsValidator = require('../validators/ContactsValidator');

describe('ContactsService', () => {
    let contactsService;
    
    const mockContact = {
        contacts_id: 1,
        administration_id: 1,
        phone_number: '+1234567890',
        email: 'contact@example.com',
        address: '123 Main Street, City, Country',
        is_active: true,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
    };

    // Убираем неиспользуемую переменную из этого блока
    beforeEach(() => {
        contactsService = new ContactsService();
        jest.clearAllMocks();
    });

    describe('getAllContacts', () => {
        // Объявляем переменную только в том тесте, где она используется
        const mockContactWithAdminInfo = {
            ...mockContact,
            administration: {
                admin_name: 'Main Administration',
                admin_type: 'general'
            }
        };

        it('should return all contacts with admin info successfully', async () => {
            // Arrange
            const mockContacts = [
                mockContactWithAdminInfo,
                { 
                    ...mockContactWithAdminInfo, 
                    contacts_id: 2, 
                    phone_number: '+0987654321',
                    email: 'contact2@example.com'
                }
            ];
            ContactsRepository.findAllWithAdminInfo.mockResolvedValue(mockContacts);

            // Act
            const result = await contactsService.getAllContacts();

            // Assert
            expect(ContactsRepository.findAllWithAdminInfo).toHaveBeenCalled();
            expect(result).toEqual(mockContacts);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            ContactsRepository.findAllWithAdminInfo.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(contactsService.getAllContacts())
                .rejects
                .toThrow('Failed to get contacts: Database connection failed');
        });
    });

    describe('getContactById', () => {
        // Объявляем переменную только в том тесте, где она используется
        const mockContactWithAdminInfo = {
            ...mockContact,
            administration: {
                admin_name: 'Main Administration',
                admin_type: 'general'
            }
        };

        it('should return contact by id successfully', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsRepository.findById.mockResolvedValue(mockContactWithAdminInfo);

            // Act
            const result = await contactsService.getContactById(1);

            // Assert
            expect(ContactsValidator.validateId).toHaveBeenCalledWith(1);
            expect(ContactsRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockContactWithAdminInfo);
        });

        it('should throw error when contact not found', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(contactsService.getContactById(999))
                .rejects
                .toThrow('Failed to get contact: Contact not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            ContactsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid contact ID');
            });

            // Act & Assert
            await expect(contactsService.getContactById(-1))
                .rejects
                .toThrow('Failed to get contact: Invalid contact ID');
            
            expect(ContactsRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('createContact', () => {
        const validContactData = {
            administration_id: 2,
            phone_number: '+1111111111',
            email: 'newcontact@example.com',
            address: '456 New Street, City, Country',
            is_active: true
        };

        it('should create contact successfully', async () => {
            // Arrange
            ContactsValidator.validateCreateData.mockReturnValue(true);
            ContactsRepository.adminExists.mockResolvedValue(true);
            ContactsRepository.exists.mockResolvedValue(false);
            ContactsRepository.create.mockResolvedValue({ ...mockContact, ...validContactData });

            // Act
            const result = await contactsService.createContact(validContactData);

            // Assert
            expect(ContactsValidator.validateCreateData).toHaveBeenCalledWith(validContactData);
            expect(ContactsRepository.adminExists).toHaveBeenCalled();
            expect(ContactsRepository.exists).toHaveBeenCalled();
            expect(ContactsRepository.create).toHaveBeenCalledWith(validContactData);
            expect(result).toEqual({ ...mockContact, ...validContactData });
        });

        it('should throw error when administration not found', async () => {
            // Arrange
            ContactsValidator.validateCreateData.mockReturnValue(true);
            ContactsRepository.adminExists.mockResolvedValue(false);

            // Act & Assert
            await expect(contactsService.createContact(validContactData))
                .rejects
                .toThrow('Failed to create contact: Administration not found');
            
            expect(ContactsRepository.exists).not.toHaveBeenCalled();
            expect(ContactsRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when contact already exists for administration', async () => {
            // Arrange
            ContactsValidator.validateCreateData.mockReturnValue(true);
            ContactsRepository.adminExists.mockResolvedValue(true);
            ContactsRepository.exists.mockResolvedValue(true);

            // Act & Assert
            await expect(contactsService.createContact(validContactData))
                .rejects
                .toThrow('Failed to create contact: Contact already exists for this administration');
            
            expect(ContactsRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            ContactsValidator.validateCreateData.mockImplementation(() => {
                throw new Error('Invalid contact data');
            });

            // Act & Assert
            await expect(contactsService.createContact(validContactData))
                .rejects
                .toThrow('Failed to create contact: Invalid contact data');
            
            expect(ContactsRepository.adminExists).not.toHaveBeenCalled();
            expect(ContactsRepository.exists).not.toHaveBeenCalled();
            expect(ContactsRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateContact', () => {
        const updateData = {
            phone_number: '+9999999999',
            email: 'updated@example.com',
            address: '789 Updated Street, City, Country'
        };

        it('should update contact successfully', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsValidator.validateUpdateData.mockReturnValue(true);
            ContactsRepository.exists.mockResolvedValue(true);
            ContactsRepository.update.mockResolvedValue({ ...mockContact, ...updateData });

            // Act
            const result = await contactsService.updateContact(1, updateData);

            // Assert
            expect(ContactsValidator.validateId).toHaveBeenCalledWith(1);
            expect(ContactsValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(ContactsRepository.exists).toHaveBeenCalledWith(1);
            expect(ContactsRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockContact, ...updateData });
        });

        it('should throw error when contact not found', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsValidator.validateUpdateData.mockReturnValue(true);
            ContactsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(contactsService.updateContact(999, updateData))
                .rejects
                .toThrow('Failed to update contact: Contact not found');
            
            expect(ContactsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            ContactsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid contact ID');
            });

            // Act & Assert
            await expect(contactsService.updateContact(-1, updateData))
                .rejects
                .toThrow('Failed to update contact: Invalid contact ID');
            
            expect(ContactsRepository.exists).not.toHaveBeenCalled();
            expect(ContactsRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when update fails', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsValidator.validateUpdateData.mockReturnValue(true);
            ContactsRepository.exists.mockResolvedValue(true);
            ContactsRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(contactsService.updateContact(1, updateData))
                .rejects
                .toThrow('Failed to update contact: Failed to update contact');
        });
    });

    describe('deleteContact', () => {
        it('should delete contact successfully', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsRepository.exists.mockResolvedValue(true);
            ContactsRepository.delete.mockResolvedValue(true);

            // Act
            const result = await contactsService.deleteContact(1);

            // Assert
            expect(ContactsValidator.validateId).toHaveBeenCalledWith(1);
            expect(ContactsRepository.exists).toHaveBeenCalledWith(1);
            expect(ContactsRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when contact not found', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(contactsService.deleteContact(999))
                .rejects
                .toThrow('Failed to delete contact: Contact not found');
            
            expect(ContactsRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            ContactsValidator.validateId.mockReturnValue(true);
            ContactsRepository.exists.mockResolvedValue(true);
            ContactsRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(contactsService.deleteContact(1))
                .rejects
                .toThrow('Failed to delete contact: Failed to delete contact');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            ContactsValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid contact ID');
            });

            // Act & Assert
            await expect(contactsService.deleteContact(-1))
                .rejects
                .toThrow('Failed to delete contact: Invalid contact ID');
            
            expect(ContactsRepository.exists).not.toHaveBeenCalled();
            expect(ContactsRepository.delete).not.toHaveBeenCalled();
        });
    });
});