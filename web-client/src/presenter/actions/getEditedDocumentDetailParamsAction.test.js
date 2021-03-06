import { getEditedDocumentDetailParamsAction } from './getEditedDocumentDetailParamsAction';
import { runAction } from 'cerebral/test';

describe('getEditedDocumentDetailParamsAction', () => {
  it('gets the caseId and documentId for the recently edited document', async () => {
    const result = await runAction(getEditedDocumentDetailParamsAction, {
      state: {
        caseDetail: {
          caseId: '123',
        },
        documentToEdit: {
          documentId: '321',
        },
      },
    });
    expect(result.output).toMatchObject({
      caseId: '123',
      documentId: '321',
    });
  });
});
