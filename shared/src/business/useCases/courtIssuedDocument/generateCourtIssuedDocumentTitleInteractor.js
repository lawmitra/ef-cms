/**
 * generateCourtIssuedDocumentTitleInteractor
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {object} providers.documentMetadata the document metadata
 * @returns {string} document title
 */
exports.generateCourtIssuedDocumentTitleInteractor = ({
  applicationContext,
  documentMetadata,
}) => {
  const {
    CourtIssuedDocumentFactory,
    Document,
  } = applicationContext.getEntityConstructors();

  const filingEvent = Document.COURT_ISSUED_EVENT_CODES.find(
    document => documentMetadata.eventCode === document.eventCode,
  );

  // attempt to reset the document title to its default, bracketed
  // state in the case of re-generating a title
  const resetDocumentTitle =
    (filingEvent && filingEvent.documentTitle) ||
    documentMetadata.documentTitle;

  const courtIssuedDocument = CourtIssuedDocumentFactory.get({
    ...documentMetadata,
    documentTitle: resetDocumentTitle,
  });
  if (courtIssuedDocument) {
    return courtIssuedDocument.getDocumentTitle();
  }
};
