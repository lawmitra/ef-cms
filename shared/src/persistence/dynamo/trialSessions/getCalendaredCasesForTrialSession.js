const client = require('../../dynamodbClientService');

exports.getCalendaredCasesForTrialSession = async ({
  applicationContext,
  trialSessionId,
}) => {
  const trialSession = await client.get({
    Key: {
      pk: `trial-session|${trialSessionId}`,
      sk: `trial-session|${trialSessionId}`,
    },
    applicationContext,
  });

  const { caseOrder } = trialSession;

  const results = await client.batchGet({
    applicationContext,
    keys: caseOrder.map(({ caseId }) => ({
      pk: `case|${caseId}`,
      sk: `case|${caseId}`,
    })),
  });

  console.log('all cases', results);

  const afterMapping = caseOrder.map(myCase => ({
    ...myCase,
    ...results.find(r => myCase.caseId === r.caseId),
  }));

  console.log('afterMapping', afterMapping);

  return afterMapping;
};
