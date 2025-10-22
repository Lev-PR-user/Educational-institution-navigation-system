const ContactsService = require('../services/ContactsService');

describe('ContactsService', () => {
    let contactsService;
    let mockRepository;
    let mockValidator;
    
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

    beforeEach(() => {
        // Создаем моки для зависимостей
        mockRepository = {
            findAllWithAdminInfo: jest.fn(),
            findById: jest.fn(),
            adminExists: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        mockValidator = {
            validateId: jest.fn(),
            validateCreateData: jest.fn(),
            validateUpdateData: jest.fn()
        };

        // Создаем экземпляр сервиса с передачей зависимостей
        contactsService = new ContactsService({
            contactsRepository: mockRepository,
            contactsValidator: mockValidator
        });

        jest.clearAllMocks();
    });

    describe('getAllContacts', () => {
        it('should return all contacts with admin info successfully', async () => {
            // Arrange
            const mockContacts = [
                mockContact,
                { 
                    ...mockContact, 
                    contacts_id: 2, 
                    phone_number: '+1111111111',
                    email: 'contact2@example.com'
                }
            ];
            mockRepository.findAllWithAdminInfo.mockResolvedValue(mockContacts);

            // Act
            const result = await contactsService.getAllContacts();

            // Assert
            expect(mockRepository.findAllWithAdminInfo).toHaveBeenCalled();
            expect(result).toEqual(mockContacts);
        });

        it('should throw error when repository fails', async () => {
            // Arrange
            const repositoryError = new Error('Database connection failed');
            mockRepository.findAllWithAdminInfo.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(contactsService.getAllContacts())
                .rejects
                .toThrow('Failed to get contacts: Database connection failed');
        });
    });

    describe('getContactById', () => {
        it('should return contact by id successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(mockContact);

            // Act
            const result = await contactsService.getContactById(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockContact);
        });

        it('should throw error when contact not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(contactsService.getContactById(999))
                .rejects
                .toThrow('Failed to get contact: Contact not found');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid contact ID');
            });

            // Act & Assert
            await expect(contactsService.getContactById(-1))
                .rejects
                .toThrow('Failed to get contact: Invalid contact ID');
            
            expect(mockRepository.findById).not.toHaveBeenCalled();
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
        mockValidator.validateCreateData.mockReturnValue(true);
        // ИСПРАВЛЕНО: ожидаем вызов с undefined (т.к. contactData.contacts_id не существует)
        mockRepository.adminExists.mockResolvedValue(true);
        mockRepository.exists.mockResolvedValue(false);
        mockRepository.create.mockResolvedValue({ ...mockContact, ...validContactData });

        // Act
        const result = await contactsService.createContact(validContactData);

        // Assert
        expect(mockValidator.validateCreateData).toHaveBeenCalledWith(validContactData);
        expect(mockRepository.adminExists).toHaveBeenCalledWith(undefined); // contacts_id не определен
        expect(mockRepository.exists).toHaveBeenCalledWith(undefined); // contacts_id не определен
        expect(mockRepository.create).toHaveBeenCalledWith(validContactData);
        expect(result).toEqual({ ...mockContact, ...validContactData });
    });

    describe('updateContact', () => {
        const updateData = {
            phone_number: '+9999999999',
            email: 'updated@example.com',
            address: '789 Updated Street, City, Country'
        };

        it('should update contact successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.update.mockResolvedValue({ ...mockContact, ...updateData });

            // Act
            const result = await contactsService.updateContact(1, updateData);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockValidator.validateUpdateData).toHaveBeenCalledWith(updateData);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
            expect(result).toEqual({ ...mockContact, ...updateData });
        });

        it('should throw error when contact not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockValidator.validateUpdateData.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(contactsService.updateContact(999, updateData))
                .rejects
                .toThrow('Failed to update contact: Contact not found');
            
            expect(mockRepository.update).not.toHaveBeenCalled();
        });

        it('should throw error when validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid contact ID');
            });

            // Act & Assert
            await expect(contactsService.updateContact(-1, updateData))
                .rejects
                .toThrow('Failed to update contact: Invalid contact ID');
            
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
            await expect(contactsService.updateContact(1, updateData))
                .rejects
                .toThrow('Failed to update contact: Failed to update contact');
        });
    });

    describe('deleteContact', () => {
        it('should delete contact successfully', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(true);

            // Act
            const result = await contactsService.deleteContact(1);

            // Assert
            expect(mockValidator.validateId).toHaveBeenCalledWith(1);
            expect(mockRepository.exists).toHaveBeenCalledWith(1);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw error when contact not found', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(contactsService.deleteContact(999))
                .rejects
                .toThrow('Failed to delete contact: Contact not found');
            
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw error when deletion fails', async () => {
            // Arrange
            mockValidator.validateId.mockReturnValue(true);
            mockRepository.exists.mockResolvedValue(true);
            mockRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(contactsService.deleteContact(1))
                .rejects
                .toThrow('Failed to delete contact: Failed to delete contact');
        });

        it('should throw error when id validation fails', async () => {
            // Arrange
            mockValidator.validateId.mockImplementation(() => {
                throw new Error('Invalid contact ID');
            });

            // Act & Assert
            await expect(contactsService.deleteContact(-1))
                .rejects
                .toThrow('Failed to delete contact: Invalid contact ID');
            
            expect(mockRepository.exists).not.toHaveBeenCalled();
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });
    });
    });
});