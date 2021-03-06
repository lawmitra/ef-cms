const AWS = require('aws-sdk');
const { createISODateString } = require('../utilities/DateHandler');

const filterRecords = records => {
  const filteredRecords = records.filter(
    record =>
      !record.dynamodb.Keys.pk.S.includes('work-item|') &&
      !record.dynamodb.Keys.pk.S.includes('user|') &&
      ['INSERT', 'MODIFY'].includes(record.eventName),
  );

  return filteredRecords.map(record => {
    if (
      record.dynamodb.NewImage.entityName &&
      record.dynamodb.NewImage.entityName.S === 'Case'
    ) {
      //delete this object because its keys are dynamic and there is a limit to the amount of keys we can map in ES
      delete record.dynamodb.NewImage.qcCompleteForTrial;
    } else if (record.dynamodb.NewImage.workItems) {
      //delete nested work items because they have nested documents that can cause us to hit our mapping limit
      delete record.dynamodb.NewImage.workItems;
    }
    return record;
  });
};

/**
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {Array<object>} providers.recordsToProcess the records to process
 * @returns {object} the results of all the index calls for logging
 */
exports.processStreamRecordsInteractor = async ({
  applicationContext,
  recordsToProcess,
}) => {
  applicationContext.logger.info('Time', createISODateString());
  const searchClient = applicationContext.getSearchClient();

  const filteredRecords = filterRecords(recordsToProcess).map(record => ({
    ...record.dynamodb.NewImage,
  }));

  // fetch entire case persistence
  const body = filteredRecords.flatMap(doc => [
    { index: { _id: `${doc.pk.S}_${doc.sk.S}`, _index: 'efcms' } },
    doc,
  ]);

  if (body && body.length) {
    try {
      const response = await searchClient.bulk({
        body,
        refresh: true,
      });

      if (response.body.errors) {
        for (let i = 0; i < response.body.items.length; i++) {
          const action = response.body.items[i];
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            let record = body[i * 2 + 1];
            let caseId;

            if (
              record.pk.S.includes('case|') &&
              record.sk.S.includes('case|')
            ) {
              caseId = record.pk.S.split('|')[1];

              record = AWS.DynamoDB.Converter.marshall(
                await applicationContext
                  .getPersistenceGateway()
                  .getCaseByCaseId({
                    applicationContext,
                    caseId,
                  }),
              );
            }

            try {
              await searchClient.index({
                body: { ...record },
                id: `${record.pk.S}_${record.sk.S}`,
                index: 'efcms',
              });
            } catch (e) {
              await applicationContext
                .getPersistenceGateway()
                .createElasticsearchReindexRecord({
                  applicationContext,
                  recordPk: record.pk.S,
                  recordSk: record.sk.S,
                });

              applicationContext.logger.info('Error', e);
            }
          }
        }
      }
    } catch {
      //if the bulk index fails, try each single index individually and
      //add the failing ones to the reindex list
      const recordsToReprocess = filterRecords(recordsToProcess);
      for (const record of recordsToReprocess) {
        if (['INSERT', 'MODIFY'].includes(record.eventName)) {
          try {
            let newImage = record.dynamodb.NewImage;
            let caseId;

            if (
              record.dynamodb.Keys.pk.S.includes('case|') &&
              record.dynamodb.Keys.sk.S.includes('case|')
            ) {
              caseId = record.dynamodb.Keys.pk.S.split('|')[1];

              newImage = AWS.DynamoDB.Converter.marshall(
                await applicationContext
                  .getPersistenceGateway()
                  .getCaseByCaseId({
                    applicationContext,
                    caseId,
                  }),
              );
            }

            await searchClient.index({
              body: {
                ...newImage,
              },
              id: `${record.dynamodb.Keys.pk.S}_${record.dynamodb.Keys.sk.S}`,
              index: 'efcms',
            });
          } catch (e) {
            await applicationContext
              .getPersistenceGateway()
              .createElasticsearchReindexRecord({
                applicationContext,
                recordPk: record.dynamodb.Keys.pk.S,
                recordSk: record.dynamodb.Keys.sk.S,
              });

            applicationContext.logger.info('Error', e);
          }
        }
      }
    }
  }

  applicationContext.logger.info('Time', createISODateString());
};
