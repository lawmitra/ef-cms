import { set } from 'cerebral/factories';
import { state } from 'cerebral';

import { getFormValueDocumentAction } from '../actions/getFormValueDocumentAction';
import { getFormValueDocumentSizeAction } from '../actions/getFormValueDocumentSizeAction';
import { selectDocumentForPreviewSequence } from './selectDocumentForPreviewSequence';
import { setDocumentUploadModeSequence } from './setDocumentUploadModeSequence';
import { updateFormValueSequence } from './updateFormValueSequence';
import { updateOrderForDesignatingPlaceOfTrialAction } from '../actions/updateOrderForDesignatingPlaceOfTrialAction';
import { validateFileSizeAction } from '../actions/validateFileSizeAction';
import { validatePetitionFromPaperSequence } from './validatePetitionFromPaperSequence';

export const setDocumentForUploadSequence = [
  validateFileSizeAction,
  {
    invalid: [set(state.scanner.isScanning, false)],
    valid: [
      getFormValueDocumentAction,
      updateFormValueSequence,
      getFormValueDocumentSizeAction,
      updateFormValueSequence,
      updateOrderForDesignatingPlaceOfTrialAction,
      validatePetitionFromPaperSequence,
      selectDocumentForPreviewSequence,
      setDocumentUploadModeSequence,
    ],
  },
];
