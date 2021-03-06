const {
  applicationContext,
} = require('../../../business/test/createTestApplicationContext');
const { deleteUserFromCase } = require('./deleteUserFromCase');

describe('deleteUserFromCase', () => {
  beforeAll(() => {
    applicationContext.environment.stage = 'dev';
  });

  it('attempts to delete the user from the case', async () => {
    await deleteUserFromCase({
      applicationContext,
      caseId: '456',
      userId: '123',
    });

    expect(
      applicationContext.getDocumentClient().delete.mock.calls[0][0],
    ).toMatchObject({
      Key: {
        pk: 'user|123',
        sk: 'case|456',
      },
      TableName: 'efcms-dev',
    });
  });
});
