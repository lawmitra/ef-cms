const client = require('../../dynamodbClientService');
const { User } = require('../../../business/entities/User');

exports.createUserRecords = async ({ applicationContext, user, userId }) => {
  delete user.password;

  if (user.barNumber === '') {
    delete user.barNumber;
  }

  if (user.section) {
    await client.put({
      Item: {
        pk: `section|${user.section}`,
        sk: `user|${userId}`,
      },
      applicationContext,
    });

    if (user.role === User.ROLES.judge) {
      await client.put({
        Item: {
          pk: 'section|judge',
          sk: `user|${userId}`,
        },
        applicationContext,
      });
    }
  }

  await client.put({
    Item: {
      pk: `user|${userId}`,
      sk: `user|${userId}`,
      ...user,
      userId,
    },
    applicationContext,
  });

  if (
    (user.role === User.ROLES.privatePractitioner ||
      user.role === User.ROLES.irsPractitioner) &&
    user.name &&
    user.barNumber
  ) {
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

exports.createUser = async ({ applicationContext, user }) => {
  let userId;

  try {
    const response = await applicationContext
      .getCognito()
      .adminCreateUser({
        MessageAction: 'SUPPRESS',
        TemporaryPassword: user.password,
        UserAttributes: [
          {
            Name: 'email_verified',
            Value: 'true',
          },
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
    userId = response.User.Username;
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

    userId = response.Username;
  }

  return await exports.createUserRecords({
    applicationContext,
    user,
    userId,
  });
};
