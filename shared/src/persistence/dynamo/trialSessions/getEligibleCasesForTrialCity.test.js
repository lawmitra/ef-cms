const client = require('../../dynamodbClientService');
const {
  getEligibleCasesForTrialCity,
} = require('./getEligibleCasesForTrialCity');

describe('getEligibleCasesForTrialCity', () => {
  beforeEach(() => {
    client.query = jest.fn().mockReturnValue([
      {
        caseId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
        pk: 'eligible-for-trial-case-catalog',
        sk:
          'WashingtonDistrictofColumbia-R-A-20181212000000-c54ba5a9-b37b-479d-9201-067ec6e335bb',
      },
    ]);
  });

  it('should get the cases for a trial city', async () => {
    const applicationContext = {
      environment: {
        stage: 'dev',
      },
    };
    const result = await getEligibleCasesForTrialCity({
      applicationContext,
      procedureType: 'Regular',
      trialCity: 'WashingtonDC',
    });
    expect(result).toEqual([
      {
        caseId: 'c54ba5a9-b37b-479d-9201-067ec6e335bb',
        pk: 'eligible-for-trial-case-catalog',
        sk:
          'WashingtonDistrictofColumbia-R-A-20181212000000-c54ba5a9-b37b-479d-9201-067ec6e335bb',
      },
    ]);
  });
});
