const {
  applicationContext,
} = require('../../../business/test/createTestApplicationContext');
const {
  updateAttorneyUser,
  updateUserRecords,
} = require('./updateAttorneyUser');
const { User } = require('../../../business/entities/User');

const userId = '9b52c605-edba-41d7-b045-d5f992a499d3';

describe('updateAttorneyUser', () => {
  it('attempts to update a private practitioner user to inactivePractitioner', async () => {
    const oldUser = {
      barNumber: 'PT1234',
      name: 'Test Private Practitioner',
      role: User.ROLES.privatePractitioner,
      section: 'privatePractitioner',
    };
    const updatedUser = {
      barNumber: 'PT1234',
      name: 'Test Private Practitioner',
      role: User.ROLES.inactivePractitioner,
      section: 'inactivePractitioner',
    };

    await updateUserRecords({
      applicationContext,
      oldUser,
      updatedUser,
      userId,
    });

    expect(
      applicationContext.getDocumentClient().delete.mock.calls[0][0],
    ).toMatchObject({
      Key: {
        pk: 'section|privatePractitioner',
        sk: `user|${userId}`,
      },
    });
    expect(
      applicationContext.getDocumentClient().put.mock.calls[0][0],
    ).toMatchObject({
      Item: {
        pk: 'section|inactivePractitioner',
        sk: `user|${userId}`,
      },
    });
    expect(
      applicationContext.getDocumentClient().put.mock.calls[1][0],
    ).toMatchObject({
      Item: {
        pk: `user|${userId}`,
        sk: `user|${userId}`,
        ...updatedUser,
        userId,
      },
    });
    expect(
      applicationContext.getDocumentClient().delete.mock.calls[1][0],
    ).toMatchObject({
      Key: {
        pk: 'privatePractitioner|Test Private Practitioner',
        sk: `user|${userId}`,
      },
    });
    expect(
      applicationContext.getDocumentClient().delete.mock.calls[2][0],
    ).toMatchObject({
      Key: {
        pk: 'privatePractitioner|PT1234',
        sk: `user|${userId}`,
      },
    });
    expect(
      applicationContext.getDocumentClient().put.mock.calls[2][0],
    ).toMatchObject({
      Item: {
        pk: 'inactivePractitioner|Test Private Practitioner',
        sk: `user|${userId}`,
      },
    });
    expect(
      applicationContext.getDocumentClient().put.mock.calls[3][0],
    ).toMatchObject({
      Item: {
        pk: 'inactivePractitioner|PT1234',
        sk: `user|${userId}`,
      },
    });
  });
});

describe('updateAttorneyUser', () => {
  it('should log an error', async () => {
    applicationContext.getDocumentClient().get.mockReturnValue({
      promise: async () => ({
        Item: {
          barNumber: 'PT1234',
          name: 'Test Practitioner',
          role: User.ROLES.inactivePractitioner,
          section: 'inactivePractitioner',
        },
      }),
    });
    const updatedUser = {
      barNumber: 'PT1234',
      name: 'Test Practitioner',
      role: User.ROLES.inactivePractitioner,
      section: 'inactivePractitioner',
    };

    await updateAttorneyUser({
      applicationContext,
      user: updatedUser,
    });

    expect(applicationContext.logger.error).toHaveBeenCalled();
  });
});

describe('updateAttorneyUser', () => {
  it('should not log an error', async () => {
    applicationContext.getCognito().adminGetUser.mockReturnValue({
      promise: () => null,
    });
    applicationContext.getDocumentClient().get.mockReturnValue({
      promise: async () => ({
        Item: {
          barNumber: 'PT1234',
          name: 'Test Practitioner',
          role: User.ROLES.inactivePractitioner,
          section: 'inactivePractitioner',
        },
      }),
    });
    const updatedUser = {
      barNumber: 'PT1234',
      name: 'Test Practitioner',
      role: User.ROLES.inactivePractitioner,
      section: 'inactivePractitioner',
    };

    await updateAttorneyUser({
      applicationContext,
      user: updatedUser,
    });

    expect(applicationContext.logger.error).not.toHaveBeenCalled();
  });
});

describe('updateAttorneyUser - with a cognito response', () => {
  it('should not log an error', async () => {
    const updatedUser = {
      barNumber: 'PT1234',
      name: 'Test Practitioner',
      role: User.ROLES.inactivePractitioner,
      section: 'inactivePractitioner',
    };

    await updateAttorneyUser({
      applicationContext,
      user: updatedUser,
    });

    expect(applicationContext.logger.error).not.toHaveBeenCalled();
  });
});
