import { addCourtIssuedDocketEntryHelper } from './computeds/addCourtIssuedDocketEntryHelper';
import { addCourtIssuedDocketEntryNonstandardHelper } from './computeds/addCourtIssuedDocketEntryNonstandardHelper';
import { addDocketEntryHelper } from './computeds/addDocketEntryHelper';
import { addEditUserCaseNoteModalHelper } from './computeds/addEditUserCaseNoteModalHelper';
import { addToTrialSessionModalHelper } from './computeds/addToTrialSessionModalHelper';
import { advancedSearchHelper } from './computeds/advancedSearchHelper';
import { alertHelper } from './computeds/alertHelper';
import { batchDownloadHelper } from './computeds/batchDownloadHelper';
import { blockedCasesReportHelper } from './computeds/blockedCasesReportHelper';
import { caseDeadlineReportHelper } from './computeds/caseDeadlineReportHelper';
import { caseDetailEditContactsHelper } from './computeds/caseDetailEditContactsHelper';
import { caseDetailEditHelper } from './computeds/caseDetailEditHelper';
import { caseDetailHeaderHelper } from './computeds/caseDetailHeaderHelper';
import { caseDetailHelper } from './computeds/caseDetailHelper';
import { caseDetailSubnavHelper } from './computeds/caseDetailSubnavHelper';
import { caseInformationHelper } from './computeds/caseInformationHelper';
import { caseInventoryReportHelper } from './computeds/caseInventoryReportHelper';
import { caseTypeDescriptionHelper } from './computeds/caseTypeDescriptionHelper';
import { completeDocumentTypeSectionHelper } from './computeds/completeDocumentTypeSectionHelper';
import { confirmInitiateServiceModalHelper } from './computeds/confirmInitiateServiceModalHelper';
import { contactEditHelper } from './computeds/contactEditHelper';
import { contactsHelper } from './computeds/contactsHelper';
import { createAttorneyUserHelper } from './computeds/createAttorneyUserHelper';
import { createOrderHelper } from './computeds/createOrderHelper';
import { dashboardExternalHelper } from './computeds/dashboardExternalHelper';
import { docketRecordHelper } from './computeds/docketRecordHelper';
import { documentDetailHelper } from './computeds/documentDetailHelper';
import { documentSigningHelper } from './computeds/documentSigningHelper';
import { editDocketEntryHelper } from './computeds/editDocketEntryHelper';
import { editDocketEntryMetaHelper } from './computeds/editDocketEntryMetaHelper';
import { editPetitionerInformationHelper } from './computeds/editPetitionerInformationHelper';
import { extractedDocument } from './computeds/extractDocument';
import { extractedPendingMessagesFromCaseDetail } from './computeds/extractPendingMessagesFromCaseDetail';
import { fileDocumentHelper } from './computeds/fileDocumentHelper';
import { fileUploadStatusHelper } from './computeds/fileUploadStatusHelper';
import {
  formattedCaseDetail,
  formattedCases,
} from './computeds/formattedCaseDetail';
import { formattedDashboardTrialSessions } from './computeds/formattedDashboardTrialSessions';
import { formattedPendingItems } from './computeds/formattedPendingItems';
import { formattedTrialSessionDetails } from './computeds/formattedTrialSessionDetails';
import { formattedTrialSessions } from './computeds/formattedTrialSessions';
import { formattedWorkQueue } from './computeds/formattedWorkQueue';
import { getTrialCityName } from './computeds/formattedTrialCity';
import { headerHelper } from './computeds/headerHelper';
import { internalTypesHelper } from './computeds/internalTypesHelper';
import { loadingHelper } from './computeds/loadingHelper';
import { menuHelper } from './computeds/menuHelper';
import { orderTypesHelper } from './computeds/orderTypesHelper';
import { pdfPreviewModalHelper } from './computeds/PDFPreviewModal/pdfPreviewModalHelper';
import { pdfSignerHelper } from './computeds/pdfSignerHelper';
import { requestAccessHelper } from './computeds/requestAccessHelper';
import { reviewPetitionFromPaperHelper } from './computeds/reviewPetitionFromPaperHelper';
import { reviewSavedPetitionHelper } from './computeds/reviewSavedPetitionHelper';
import { scanBatchPreviewerHelper } from './computeds/scanBatchPreviewerHelper';
import { scanHelper } from './computeds/scanHelper';
import { selectDocumentSelectHelper } from './computeds/selectDocumentSelectHelper';
import { selectDocumentTypeHelper } from './computeds/selectDocumentTypeHelper';
import { showAppTimeoutModalHelper } from './computeds/showAppTimeoutModalHelper';
import { startCaseHelper } from './computeds/startCaseHelper';
import { startCaseInternalContactsHelper } from './computeds/startCaseInternalContactsHelper';
import { startCaseInternalHelper } from './computeds/startCaseInternalHelper';
import { trialCitiesHelper } from './computeds/trialCitiesHelper';
import { trialSessionDetailsHelper } from './computeds/trialSessionDetailsHelper';
import { trialSessionHeaderHelper } from './computeds/trialSessionHeaderHelper';
import { trialSessionWorkingCopyHelper } from './computeds/trialSessionWorkingCopyHelper';
import { trialSessionsHelper } from './computeds/trialSessionsHelper';
import { trialSessionsSummaryHelper } from './computeds/trialSessionsSummaryHelper';
import { updateCaseModalHelper } from './computeds/updateCaseModalHelper';
import { viewAllDocumentsHelper } from './computeds/viewAllDocumentsHelper';
import { workQueueHelper } from './computeds/workQueueHelper';
import { workQueueSectionHelper } from './computeds/workQueueSectionHelper';

const helpers = {
  addCourtIssuedDocketEntryHelper,
  addCourtIssuedDocketEntryNonstandardHelper,
  addDocketEntryHelper,
  addEditUserCaseNoteModalHelper,
  addToTrialSessionModalHelper,
  advancedSearchHelper,
  alertHelper,
  batchDownloadHelper,
  blockedCasesReportHelper,
  caseDeadlineReportHelper,
  caseDetailEditContactsHelper,
  caseDetailEditHelper,
  caseDetailHeaderHelper,
  caseDetailHelper,
  caseDetailSubnavHelper,
  caseInformationHelper,
  caseInventoryReportHelper,
  caseTypeDescriptionHelper,
  completeDocumentTypeSectionHelper,
  confirmInitiateServiceModalHelper,
  contactEditHelper,
  contactsHelper,
  createAttorneyUserHelper,
  createOrderHelper,
  dashboardExternalHelper,
  docketRecordHelper,
  documentDetailHelper,
  documentSigningHelper,
  editDocketEntryHelper,
  editDocketEntryMetaHelper,
  editPetitionerInformationHelper,
  extractedDocument,
  extractedPendingMessagesFromCaseDetail,
  fileDocumentHelper,
  fileUploadStatusHelper,
  formattedCaseDetail,
  formattedCases,
  formattedDashboardTrialSessions,
  formattedPendingItems,
  formattedTrialSessionDetails,
  formattedTrialSessions,
  formattedWorkQueue,
  getTrialCityName,
  headerHelper,
  internalTypesHelper,
  loadingHelper,
  menuHelper,
  orderTypesHelper,
  pdfPreviewModalHelper,
  pdfSignerHelper,
  requestAccessHelper,
  reviewPetitionFromPaperHelper,
  reviewSavedPetitionHelper,
  scanBatchPreviewerHelper,
  scanHelper,
  selectDocumentSelectHelper,
  selectDocumentTypeHelper,
  showAppTimeoutModalHelper,
  startCaseHelper,
  startCaseInternalContactsHelper,
  startCaseInternalHelper,
  trialCitiesHelper,
  trialSessionDetailsHelper,
  trialSessionHeaderHelper,
  trialSessionWorkingCopyHelper,
  trialSessionsHelper,
  trialSessionsSummaryHelper,
  updateCaseModalHelper,
  viewAllDocumentsHelper,
  workQueueHelper,
  workQueueSectionHelper,
};

export const state = {
  ...helpers,
  advancedSearchForm: {}, // form for advanced search screen, TODO: replace with state.form
  archiveDraftDocument: {
    // used by the delete draft document modal
    caseId: null,
    documentId: null,
    documentTitle: null,
  },
  assigneeId: null, // used for assigning workItems in assignSelectedWorkItemsAction
  batchDownloads: {}, // batch download of PDFs
  caseDetail: {},
  cases: [],
  cognitoLoginUrl: null,
  completeForm: {}, // TODO: replace with state.form
  currentPage: 'Interstitial',
  currentViewMetadata: {
    caseDetail: {},
    documentDetail: {
      tab: '',
    },
    documentSelectedForScan: null,
    documentUploadMode: 'scan',
    messageId: '',
    startCaseInternal: {
      tab: '',
    },
    tab: '',
    trialSessions: {
      tab: null,
    },
  },
  docketRecordIndex: 0, // needs its own object because it's present when other forms are on screen
  documentId: null,
  fieldOrder: [], // TODO: related to errors
  fileUploadProgress: {
    // used for the progress bar shown in modal when uploading files
    isUploading: false,
    percentComplete: 0,
    timeRemaining: Number.POSITIVE_INFINITY,
  },
  form: {}, // shared object for creating new entities, clear before using
  header: {
    searchTerm: '',
    showBetaBar: true,
    showMobileMenu: false,
    showUsaBannerDetails: false,
  },
  modal: {
    pdfPreviewModal: undefined,
    showModal: undefined, // the name of the modal to display
  },
  navigation: {},
  notifications: {},
  pdfForSigning: {
    documentId: null,
    nameForSigning: '',
    pageNumber: 1,
    pdfjsObj: null,
    signatureApplied: false,
    signatureData: null,
  },
  permissions: null,
  previewPdfFile: null,
  progressIndicator: {
    // used for the spinner that shows when waiting for network responses
    waitingForResponse: false,
    waitingForResponseRequests: 0,
  },
  scanner: {
    batchIndexToDelete: null,
    batchIndexToRescan: null, // batch index for re-scanning
    batchToDeletePageCount: null,
    batches: [],
    currentPageIndex: 0, // batches from scanning
    isScanning: false,
    selectedBatchIndex: 0,
  },
  screenMetadata: {},
  sectionInboxCount: 0,
  sectionUsers: [],
  selectedWorkItems: [],
  sessionMetadata: {
    docketRecordSort: [],
  },
  showValidation: false,
  user: null,
  users: [],
  validationErrors: {},
  workItem: {},
  workItemActions: {},
  workItemMetadata: {},
  workQueue: [],
  workQueueToDisplay: { box: 'inbox', queue: 'my', workQueueIsInternal: true },
};
