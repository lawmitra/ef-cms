import { presenter } from '../presenter';
import { runAction } from 'cerebral/test';
import { setDocumentToEditAction } from './setDocumentToEditAction';

const documentIdToEdit = '123';
const documentToMatch = {
  documentId: documentIdToEdit,
  documentType: 'Order',
};

documentToMatch.draftState = { ...documentToMatch };

// TODO: convert to test applicationContext
presenter.providers.applicationContext = {
  getConstants: () => {
    return {
      SIGNED_DOCUMENT_TYPES: {
        signedStipulatedDecision: { documentType: 'Stipulated Decision' },
      },
    };
  },
};

describe('setDocumentToEditAction', () => {
  it('sets state.documentToEdit for the given case and documentIdToEdit', async () => {
    const result = await runAction(setDocumentToEditAction, {
      modules: {
        presenter,
      },
      props: {
        caseDetail: {
          caseId: 'c123',
          documents: [
            {
              documentId: '321',
              documentType: 'Petition',
            },
            documentToMatch,
          ],
        },
        documentIdToEdit: documentIdToEdit,
      },
    });
    expect(result.state.documentToEdit).toEqual(documentToMatch);
  });

  it('sets state.form with the draft state of the documentToEdit', async () => {
    const result = await runAction(setDocumentToEditAction, {
      modules: {
        presenter,
      },
      props: {
        caseDetail: {
          caseId: 'c123',
          documents: [
            {
              documentId: '321',
              documentType: 'Petition',
            },
            documentToMatch,
          ],
        },
        documentIdToEdit: documentIdToEdit,
      },
    });
    expect(result.state.form.documentType).toEqual(
      documentToMatch.documentType,
    );
  });

  it('does nothing if documentIdToEdit is not passed in via props', async () => {
    const result = await runAction(setDocumentToEditAction, {
      modules: {
        presenter,
      },
      props: {
        caseDetail: {
          caseId: 'c123',
          documents: [
            {
              documentId: '321',
              documentType: 'Petition',
            },
            documentToMatch,
          ],
        },
      },
    });
    expect(result.state.documentToEdit).toBeUndefined();
    expect(result.state.form).toBeUndefined();
  });

  it('sets state.documentToEdit and sets state.form to the documentIdToEdit if draftState does not exist for the selected document', async () => {
    const result = await runAction(setDocumentToEditAction, {
      modules: {
        presenter,
      },
      props: {
        caseDetail: {
          caseId: 'c123',
          documents: [
            {
              documentId: '321',
              documentType: 'Petition',
            },
          ],
        },
        documentIdToEdit: '321',
      },
    });
    expect(result.state.documentToEdit).toEqual({
      documentId: '321',
      documentType: 'Petition',
    });
    expect(result.state.form).toEqual({
      documentIdToEdit: '321',
    });
  });
});
