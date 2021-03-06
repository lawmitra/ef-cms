const client = require('../../dynamodbClientService');
const { User } = require('../../../business/entities/User');

exports.createUserRecords = async ({ applicationContext, user, userId }) => {
  delete user.password;

  if (user.barNumber === '') {
    delete user.barNumber;
  }

  await client.put({
    Item: {
      pk: `section|${user.section}`,
      sk: `user|${userId}`,
    },
    applicationContext,
  });

  await client.put({
    Item: {
      pk: `user|${userId}`,
      sk: `user|${userId}`,
      ...user,
      userId,
    },
    applicationContext,
  });

  if (user.name && user.barNumber) {
    await client.put({
      Item: {
        pk: `${user.role}|${user.name}`,
        sk: `user|${userId}`,
      },
      applicationContext,
    });
    await client.put({
      Item: {
        pk: `${user.role}|${user.barNumber}`,
        sk: `user|${userId}`,
      },
      applicationContext,
    });
  }

  return {
    ...user,
    userId,
  };
};

exports.createAttorneyUser = async ({ applicationContext, user }) => {
  let userId = applicationContext.getUniqueId();

  if (
    ![User.ROLES.privatePractitioner, User.ROLES.irsPractitioner].includes(
      user.role,
    )
  ) {
    throw new Error(
      'Attorney users must have either private or IRS practitioner role',
    );
  }

  if (user.email) {
    try {
      const response = await applicationContext
        .getCognito()
        .adminCreateUser({
          UserAttributes: [
            {
              Name: 'email',
              Value: user.email,
            },
            {
              Name: 'custom:role',
              Value: user.role,
            },
            {
              Name: 'name',
              Value: user.name,
            },
          ],
          UserPoolId: process.env.USER_POOL_ID,
          Username: user.email,
        })
        .promise();

      if (response && response.User && response.User.Username) {
        userId = response.User.Username;
      }
    } catch (err) {
      // the user already exists
      const response = await applicationContext
        .getCognito()
        .adminGetUser({
          UserPoolId: process.env.USER_POOL_ID,
          Username: user.email,
        })
        .promise();

      await applicationContext
        .getCognito()
        .adminUpdateUserAttributes({
          UserAttributes: [
            {
              Name: 'custom:role',
              Value: user.role,
            },
          ],
          UserPoolId: process.env.USER_POOL_ID,
          Username: response.Username,
        })
        .promise();
    }
  }

  return await exports.createUserRecords({
    applicationContext,
    user,
    userId,
  });
};
