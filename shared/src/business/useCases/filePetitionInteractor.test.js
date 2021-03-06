const { filePetitionInteractor } = require('./filePetitionInteractor');
const { User } = require('../entities/User');

let uploadDocumentStub;
let createCaseStub;
let validatePdfStub;
let virusScanPdfStub;

describe('filePetitionInteractor', () => {
  const createApplicationContext = options => {
    uploadDocumentStub = jest
      .fn()
      .mockResolvedValue('c54ba5a9-b37b-479d-9201-067ec6e335bb');

    createCaseStub = jest.fn().mockResolvedValue(null);
    validatePdfStub = jest.fn().mockResolvedValue(null);
    virusScanPdfStub = jest.fn().mockResolvedValue(null);

    return {
      environment: { stage: 'local' },
      getCurrentUser: () => ({
        role: User.ROLES.petitioner,
        userId: 'petitioner',
      }),
      getPersistenceGateway: () => ({
        uploadDocumentFromClient: uploadDocumentStub,
      }),
      getUseCases: () => ({
        createCaseInteractor: createCaseStub,
        validatePdfInteractor: validatePdfStub,
        virusScanPdfInteractor: virusScanPdfStub,
      }),
      ...options,
    };
  };

  it('throws an error when a null user tries to access the case', async () => {
    let error;
    try {
      await filePetitionInteractor({
        applicationContext: createApplicationContext({
          getCurrentUser: () => ({
            userId: '',
          }),
        }),
        petitionFile: null,
        petitionMetadata: null,
      });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it('throws an error when an unauthorized user tries to access the case', async () => {
    let error;
    try {
      await filePetitionInteractor({
        applicationContext: createApplicationContext({
          getCurrentUser: () => ({
            role: User.ROLES.irsPractitioner,
            userId: 'irsPractitioner',
          }),
        }),
        petitionFile: null,
        petitionMetadata: null,
      });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it('calls upload on a Petition file', async () => {
    await filePetitionInteractor({
      applicationContext: createApplicationContext(),
      petitionFile: 'this petition file',
      petitionMetadata: null,
    });
    expect(uploadDocumentStub.mock.calls[0][0].document).toEqual(
      'this petition file',
    );
  });

  it('calls upload on an ODS file', async () => {
    await filePetitionInteractor({
      applicationContext: createApplicationContext(),
      ownershipDisclosureFile: 'this ods file',
    });
    expect(uploadDocumentStub.mock.calls[1][0].document).toEqual(
      'this ods file',
    );
  });

  it('calls upload on a STIN file', async () => {
    await filePetitionInteractor({
      applicationContext: createApplicationContext(),
      stinFile: 'this stin file',
    });
    expect(uploadDocumentStub.mock.calls[1][0].document).toEqual(
      'this stin file',
    );
  });

  it('uploads a Petition file and a STIN file', async () => {
    await filePetitionInteractor({
      applicationContext: createApplicationContext(),
      petitionFile: 'something1',
      petitionMetadata: 'something2',
      stinFile: 'something3',
    });
    expect(createCaseStub.mock.calls[0][0]).toMatchObject({
      ownershipDisclosureFileId: undefined,
      petitionFileId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
      stinFileId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
    });
  });

  it('uploads an Ownership Disclosure Statement file', async () => {
    await filePetitionInteractor({
      applicationContext: createApplicationContext(),
      ownershipDisclosureFile: 'something',
      petitionFile: 'something1',
      petitionMetadata: 'something2',
      stinFile: 'something3',
    });
    expect(createCaseStub.mock.calls[0][0]).toMatchObject({
      ownershipDisclosureFileId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
      petitionFileId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
      stinFileId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
    });
  });
});
