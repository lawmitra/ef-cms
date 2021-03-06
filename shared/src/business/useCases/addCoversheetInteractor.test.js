const fs = require('fs');
const path = require('path');
const {
  addCoversheetInteractor,
  generateCoverSheetData,
} = require('./addCoversheetInteractor.js');
const {
  createISODateString,
  formatDateString,
  formatNow,
  prepareDateFromString,
} = require('../utilities/DateHandler');
const { Case } = require('../entities/cases/Case');
const { ContactFactory } = require('../entities/contacts/ContactFactory');
const { getChromiumBrowser } = require('../utilities/getChromiumBrowser');
const { MOCK_USERS } = require('../../test/mockUsers');
const { PDFDocument } = require('pdf-lib');

const testAssetsPath = path.join(__dirname, '../../../test-assets/');
const testOutputPath = path.join(__dirname, '../../../test-output/');

const testPdfDocBytes = () => {
  // sample.pdf is a 1 page document
  return fs.readFileSync(testAssetsPath + 'sample.pdf');
};

describe('addCoversheetInteractor', () => {
  let testPdfDoc;

  const testingCaseData = {
    caseId: 'c6b81f4d-1e47-423a-8caf-6d2fdc3d3859',
    contactPrimary: {
      name:
        'Daenerys Stormborn of the House Targaryen, First of Her Name, the Unburnt, Queen of the Andals and the First Men, Khaleesi of the Great Grass Sea, Breaker of Chains, and Mother of Dragons',
    },
    createdAt: '2019-04-19T14:45:15.595Z',
    docketNumber: '101-19',
    documents: [
      {
        certificateOfService: false,
        createdAt: '2019-04-19T14:45:15.595Z',
        documentId: 'a6b81f4d-1e47-423a-8caf-6d2fdc3d3859',
        documentType: 'Answer',
        filingDate: '2019-04-19T14:45:15.595Z',
        isPaper: false,
        processingStatus: 'pending',
        userId: 'petitionsclerk',
      },
    ],
    partyType: ContactFactory.PARTY_TYPES.petitioner,
  };

  const optionalTestingCaseData = {
    ...testingCaseData,
    contactPrimary: {
      name: 'Janie Petitioner',
    },
    contactSecondary: {
      name: 'Janie Petitioner',
    },
    docketNumber: '102-19',
    documents: [
      {
        ...testingCaseData.documents[0],
        addToCoversheet: true,
        additionalInfo: 'Additional Info Something',
        certificateOfService: true,
        documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
        documentType:
          'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
        filingDate: '2019-04-19T14:45:15.595Z',
        isPaper: true,
        lodged: true,
      },
    ],
    irsSendDate: '2019-04-19T14:45:15.595Z',
    partyType: ContactFactory.PARTY_TYPES.petitionerSpouse,
  };

  const updateDocumentProcessingStatusStub = jest.fn(() => null);
  const getObjectStub = jest.fn(() => ({
    promise: async () => ({
      Body: testPdfDoc,
    }),
  }));

  let getChromiumBrowserStub;
  let getCaseByCaseIdStub;
  let saveDocumentFromLambdaStub;
  let applicationContext;

  beforeEach(() => {
    testPdfDoc = testPdfDocBytes();

    getChromiumBrowserStub = jest.fn(async () => {
      return await getChromiumBrowser();
    });

    applicationContext = {
      environment: { documentsBucketName: 'documents' },
      getCaseCaptionNames: Case.getCaseCaptionNames,
      getChromiumBrowser: getChromiumBrowserStub,
      getCurrentUser: () => MOCK_USERS['a7d90c05-f6cd-442c-a168-202db587f16f'],
      getPersistenceGateway: () => ({
        getCaseByCaseId: getCaseByCaseIdStub,
        saveDocumentFromLambda: saveDocumentFromLambdaStub,
        updateDocumentProcessingStatus: updateDocumentProcessingStatusStub,
      }),
      getStorageClient: () => ({
        getObject: getObjectStub,
      }),
      getUtilities: () => {
        return {
          createISODateString,
          formatDateString,
          formatNow,
          prepareDateFromString,
        };
      },
      logger: {
        error: e => console.log(e),
        time: () => null,
        timeEnd: () => null,
      },
    };
  });

  it('adds a cover page to a pdf document', async () => {
    getCaseByCaseIdStub = jest.fn(() => testingCaseData);
    saveDocumentFromLambdaStub = jest.fn(({ document: newPdfData }) => {
      fs.writeFileSync(
        testOutputPath + 'addCoverToPDFDocument_1.pdf',
        newPdfData,
      );
    });

    const params = {
      applicationContext,
      caseId: 'c6b81f4d-1e47-423a-8caf-6d2fdc3d3859',
      documentId: 'a6b81f4d-1e47-423a-8caf-6d2fdc3d3859',
    };

    const newPdfData = await addCoversheetInteractor(params);

    const newPdfDoc = await PDFDocument.load(newPdfData);
    const newPdfDocPages = newPdfDoc.getPages();
    expect(saveDocumentFromLambdaStub).toHaveBeenCalled();
    expect(newPdfDocPages.length).toEqual(2);
    expect(getChromiumBrowserStub).toHaveBeenCalled();
  });

  it('adds a cover page to a pdf document with optional data', async () => {
    getCaseByCaseIdStub = jest.fn(() => optionalTestingCaseData);
    saveDocumentFromLambdaStub = jest.fn(({ document: newPdfData }) => {
      fs.writeFileSync(
        testOutputPath + 'addCoverToPDFDocument_2.pdf',
        newPdfData,
      );
    });

    const params = {
      applicationContext,
      caseId: 'c6b81f4d-1e47-423a-8caf-6d2fdc3d3859',
      documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
    };

    const newPdfData = await addCoversheetInteractor(params);

    const newPdfDoc = await PDFDocument.load(newPdfData);
    const newPdfDocPages = newPdfDoc.getPages();
    expect(saveDocumentFromLambdaStub).toHaveBeenCalled();
    expect(newPdfDocPages.length).toEqual(2);
  });

  describe('coversheet data generator', () => {
    let caseData, applicationContext;
    beforeEach(() => {
      applicationContext = {
        getCaseCaptionNames: Case.getCaseCaptionNames,
        getCurrentUser: () =>
          MOCK_USERS['a7d90c05-f6cd-442c-a168-202db587f16f'],
        getUtilities: () => {
          return {
            formatDateString,
          };
        },
      };
      caseData = {
        ...testingCaseData,
        contactPrimary: {
          name: 'Janie Petitioner',
        },
        contactSecondary: {
          name: 'Janie Petitioner',
        },
        docketNumber: '102-19',
        documents: [
          {
            ...testingCaseData.documents[0],
            addToCoversheet: true,
            additionalInfo: 'Additional Info Something',
            certificateOfService: true,
            documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
            documentType:
              'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
            filingDate: '2019-04-19T14:45:15.595Z',
            isPaper: true,
            lodged: true,
          },
        ],
        irsSendDate: '2019-04-19T14:45:15.595Z',
        partyType: ContactFactory.PARTY_TYPES.petitionerSpouse,
      };
    });

    it('displays Certificate of Service when the document is filed with a certificate of service', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
        },
      });

      expect(result.certificateOfService).toEqual('Certificate of Service');
    });

    it('does NOT display Certificate of Service when the document is filed without a certificate of service', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: false,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: true,
        },
      });

      expect(result.certificateOfService).toEqual('');
    });

    it('generates correct filed date', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: true,
        },
      });
      expect(result.dateFiledLodged).toEqual('04/19/2019');
    });

    it('shows does not show the filing date if the document does not have a valid filingDate', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          createdAt: null,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: null,
        },
      });

      expect(result.dateFiledLodged).toEqual('');
    });

    it('returns a filing date label of Filed if the document was NOT lodged', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
        },
      });

      expect(result.dateFiledLodgedLabel).toEqual('Filed');
    });

    it('returns a filing date label of Lodged if the document was lodged', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
          lodged: true,
        },
      });

      expect(result.dateFiledLodgedLabel).toEqual('Lodged');
    });

    it('shows the received date WITH time if electronically filed', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
        },
      });

      expect(result.dateReceived).toEqual('04/19/2019 10:45 am');
    });

    it('shows does not show the received date if the document does not have a valid createdAt and is electronically filed', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          createdAt: null,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
        },
      });

      expect(result.dateReceived).toEqual('');
    });

    it('shows the received date WITHOUT time if filed by paper', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: true,
        },
      });

      expect(result.dateReceived).toEqual('04/19/2019');
    });

    it('shows does not show the received date if the document does not have a valid createdAt and is filed by paper', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          createdAt: null,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: true,
        },
      });

      expect(result.dateReceived).toEqual('');
    });

    it('displays the date served if present in MMDDYYYY format along with a Served label', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
          lodged: true,
          servedAt: '2019-04-20T14:45:15.595Z',
        },
      });

      expect(result.dateServed).toEqual('Served 04/20/2019');
    });

    it('does not display the service date if servedAt is not present', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
          lodged: true,
        },
      });

      expect(result.dateServed).toEqual('');
    });

    it('returns the docket number along with a Docket Number label', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
          lodged: true,
        },
      });

      expect(result.docketNumber).toEqual('Docket Number: 102-19');
    });

    it('returns the docket number with suffix along with a Docket Number label', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
          docketNumberSuffix: 'S',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
          lodged: true,
        },
      });

      expect(result.docketNumber).toEqual('Docket Number: 102-19S');
    });

    it('displays Electronically Filed when the document is filed electronically', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: false,
        },
      });

      expect(result.electronicallyFiled).toEqual('Electronically Filed');
    });

    it('does NOT display Electronically Filed when the document is filed by paper', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: true,
        },
      });

      expect(result.electronicallyFiled).toEqual('');
    });

    it('returns the mailing date if present', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: true,
          mailingDate: '04/16/2019',
        },
      });
      expect(result.mailingDate).toEqual('04/16/2019');
    });

    it('returns an empty string for the mailing date if NOT present', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          filingDate: '2019-04-19T14:45:15.595Z',
          isPaper: true,
        },
      });
      expect(result.mailingDate).toEqual('');
    });

    it('generates cover sheet data appropriate for multiple petitioners', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner & Janie Petitioner, Petitioners',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          isPaper: true,
          lodged: true,
        },
      });
      expect(result.petitionerLabel).toEqual('Petitioners');
    });

    it('generates cover sheet data appropriate for a single petitioner', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner, Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          isPaper: true,
          lodged: true,
        },
      });
      expect(result.petitionerLabel).toEqual('Petitioner');
    });

    it('generates empty string for caseCaptionPostfix if the caseCaption is not in the proper format', async () => {
      const result = generateCoverSheetData({
        applicationContext,
        caseEntity: {
          ...caseData,
          caseCaption: 'Janie Petitioner',
        },
        documentEntity: {
          ...testingCaseData.documents[0],
          addToCoversheet: true,
          additionalInfo: 'Additional Info Something',
          certificateOfService: true,
          documentId: 'b6b81f4d-1e47-423a-8caf-6d2fdc3d3858',
          documentType:
            'Motion for Entry of Order that Undenied Allegations be Deemed Admitted Pursuant to Rule 37(c)',
          isPaper: true,
          lodged: true,
        },
      });
      expect(result.petitionerLabel).toEqual('');
    });
  });
});
