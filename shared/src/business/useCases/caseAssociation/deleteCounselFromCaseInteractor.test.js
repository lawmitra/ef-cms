const {
  deleteCounselFromCaseInteractor,
} = require('./deleteCounselFromCaseInteractor');
const { MOCK_CASE } = require('../../../test/mockCase.js');
const { User } = require('../../entities/User');

let applicationContext;
let updateCaseMock;
let deleteUserFromCaseMock;

const mockPrivatePractitioners = [
  { role: User.ROLES.privatePractitioner, userId: '456' },
  { role: User.ROLES.privatePractitioner, userId: '789' },
  { role: User.ROLES.privatePractitioner, userId: '012' },
];

const mockIrsPractitioners = [
  { role: User.ROLES.irsPractitioner, userId: '654' },
  { role: User.ROLES.irsPractitioner, userId: '987' },
  { role: User.ROLES.irsPractitioner, userId: '210' },
];

const mockPetitioners = [{ role: User.ROLES.petitioner, userId: '111' }];

describe('deleteCounselFromCaseInteractor', () => {
  beforeEach(() => {
    updateCaseMock = jest.fn().mockImplementation(v => v.caseToUpdate);
    deleteUserFromCaseMock = jest.fn();

    applicationContext = {
      getCurrentUser: () => ({
        role: User.ROLES.docketClerk,
        userId: '001',
      }),
      getPersistenceGateway: () => ({
        deleteUserFromCase: deleteUserFromCaseMock,
        getCaseByCaseId: ({ caseId }) => ({
          ...MOCK_CASE,
          caseId,
          irsPractitioners: mockIrsPractitioners,
          privatePractitioners: mockPrivatePractitioners,
        }),
        getUserById: ({ userId }) => {
          return mockPrivatePractitioners
            .concat(mockIrsPractitioners)
            .concat(mockPetitioners)
            .find(user => user.userId === userId);
        },
        updateCase: updateCaseMock,
      }),
      getUniqueId: () => 'unique-id-1',
    };
  });

  it('returns an unauthorized error for a petitioner user', async () => {
    applicationContext = {
      getCurrentUser: () => ({
        role: User.ROLES.petitioner,
      }),
      getUniqueId: () => 'unique-id-1',
    };
    let error;
    try {
      await deleteCounselFromCaseInteractor({
        applicationContext,
        caseId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
        userIdToDelete: '789',
      });
    } catch (err) {
      error = err;
    }
    expect(error.message).toEqual('Unauthorized');
  });

  it('deletes a practitioner with the given userId from the associated case', async () => {
    await deleteCounselFromCaseInteractor({
      applicationContext,
      caseId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
      userIdToDelete: '789',
    });

    expect(updateCaseMock).toHaveBeenCalled();
    expect(deleteUserFromCaseMock).toHaveBeenCalled();
  });

  it('deletes an irsPractitioner with the given userId from the associated case', async () => {
    await deleteCounselFromCaseInteractor({
      applicationContext,
      caseId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
      userIdToDelete: '987',
    });

    expect(updateCaseMock).toHaveBeenCalled();
    expect(deleteUserFromCaseMock).toHaveBeenCalled();
  });

  it('throws an error if the userIdToDelete is not a privatePractitioner or irsPractitioner role', async () => {
    let error;
    try {
      await deleteCounselFromCaseInteractor({
        applicationContext,
        caseId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
        userIdToDelete: '111',
      });
    } catch (err) {
      error = err;
    }
    expect(error.message).toEqual('User is not a practitioner');
  });
});
