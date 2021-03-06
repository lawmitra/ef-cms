import { Case } from '../../../../shared/src/business/entities/cases/Case';
import { MOCK_CASE } from '../../../../shared/src/test/mockCase';
import { applicationContext } from '../../applicationContext';
import { presenter } from '../presenter';
import { runAction } from 'cerebral/test';
import { saveCaseDetailInternalEditAction } from './saveCaseDetailInternalEditAction';

let saveCaseDetailInternalEditStub = jest.fn().mockReturnValue({});
const updateCaseTrialSortTagsStub = jest.fn();

presenter.providers.applicationContext = {
  ...applicationContext,
  getUseCases: () => ({
    saveCaseDetailInternalEditInteractor: saveCaseDetailInternalEditStub,
    updateCaseTrialSortTagsInteractor: updateCaseTrialSortTagsStub,
  }),
};

describe('saveCaseDetailInternalEditAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the updateCaseTrialSortTags use case if case status is ready for trial', async () => {
    const caseDetail = {
      ...MOCK_CASE,
      createdAt: '2019-03-01T21:40:46.415Z',
      status: Case.STATUS_TYPES.generalDocketReadyForTrial,
    };
    saveCaseDetailInternalEditStub = jest.fn().mockReturnValue(caseDetail);

    await runAction(saveCaseDetailInternalEditAction, {
      modules: {
        presenter,
      },
      props: {},
      state: {
        caseDetail,
      },
    });
    expect(updateCaseTrialSortTagsStub.mock.calls[0][0].caseId).toEqual(
      'c54ba5a9-b37b-479d-9201-067ec6e335bb',
    );
  });

  it('should not call the updateCaseTrialSortTags use case if case status is not ready for trial', async () => {
    const caseDetail = {
      ...MOCK_CASE,
      status: Case.STATUS_TYPES.new,
    };
    saveCaseDetailInternalEditStub = jest.fn().mockReturnValue(caseDetail);

    await runAction(saveCaseDetailInternalEditAction, {
      modules: {
        presenter,
      },
      props: {},
      state: {
        caseDetail,
      },
    });
    expect(updateCaseTrialSortTagsStub).not.toBeCalled();
  });
});
