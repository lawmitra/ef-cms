import { Case } from '../../../shared/src/business/entities/cases/Case';
import { getFormattedDocumentQCSectionOutbox, wait } from '../helpers';

export default test => {
  it('should allow edits to an in progress case', async () => {
    await test.runSequence('gotoDocumentDetailSequence', {
      docketNumber: test.docketNumber,
      documentId: test.documentId,
    });

    await test.runSequence('updateFormValueSequence', {
      key: 'partyType',
      value: 'Guardian',
    });

    await test.runSequence('validatePetitionFromPaperSequence');

    expect(test.getState('alertError')).toBeUndefined();
    expect(test.getState('validationErrors')).toEqual({});
  });

  it('should save edits to an in progress case', async () => {
    await test.runSequence('navigateToReviewPetitionFromPaperSequence');
    await test.runSequence('gotoReviewPetitionFromPaperSequence');

    expect(test.getState('currentPage')).toEqual('ReviewPetitionFromPaper');

    await test.runSequence('saveSavedCaseForLaterSequence');
    await wait(5000);

    expect(test.getState('currentPage')).toEqual('Messages');
  });

  it('should display a confirmation modal before serving to irs', async () => {
    await test.runSequence('gotoDocumentDetailSequence', {
      docketNumber: test.docketNumber,
      documentId: test.documentId,
    });
    await test.runSequence('openConfirmServeToIrsModalSequence');

    expect(test.getState('modal.showModal')).toBe('ConfirmServeToIrsModal');
  });

  it('should redirect to case detail after successfully serving to irs', async () => {
    await test.runSequence('saveCaseAndServeToIrsSequence');
    await wait(5000);

    expect(test.currentRouteUrl).toEqual(`/case-detail/${test.caseId}`);
    expect(test.getState('modal.showModal')).toEqual('PaperServiceConfirmModal');
  });

  it('should add served case to individual served queue', async () => {
    await test.runSequence('chooseWorkQueueSequence', {
      box: 'outbox',
      queue: 'my',
      workQueueIsInternal: false,
    });
    await wait(5000);

    const workQueueToDisplay = test.getState('workQueueToDisplay');

    expect(workQueueToDisplay.workQueueIsInternal).toBeFalsy();
    expect(workQueueToDisplay.queue).toEqual('my');
    expect(workQueueToDisplay.box).toEqual('outbox');

    const servedCase = test
      .getState('workQueue')
      .find(x => x.docketNumber === test.docketNumber);

    expect(servedCase).toMatchObject({
      caseTitle: 'Mona Schultz',
    });
    expect(servedCase.caseStatus).toEqual(Case.STATUS_TYPES.generalDocket);
  });

  it('should add served case to section served queue', async () => {
    await test.runSequence('chooseWorkQueueSequence', {
      box: 'outbox',
      queue: 'section',
      workQueueIsInternal: false,
    });
    await wait(5000);

    const sectionWorkQueueToDisplay = test.getState('workQueueToDisplay');

    expect(sectionWorkQueueToDisplay).toMatchObject({
      box: 'outbox',
      queue: 'section',
      workQueueIsInternal: false,
    });

    const sectionServedCase = test
      .getState('workQueue')
      .find(x => x.docketNumber === test.docketNumber);

    expect(sectionServedCase).toMatchObject({
      caseTitle: 'Mona Schultz',
    });
    expect(sectionServedCase.caseStatus).toEqual(
      Case.STATUS_TYPES.generalDocket,
    );
  });

  it('should indicate who served the case', async () => {
    const outboxItems = await getFormattedDocumentQCSectionOutbox(test);
    const desiredItem = outboxItems.find(
      x => x.docketNumber === test.docketNumber,
    );
    expect(desiredItem.sentBy).toEqual('Test Petitionsclerk');
  });
};
