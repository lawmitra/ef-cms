import { state } from 'cerebral';

/**
 * calls the prioritizeCaseAction to prioritize a case
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {Function} providers.get the cerebral get function
 * @returns {object} the alertSuccess and updated caseDetail object
 */
export const prioritizeCaseAction = async ({ applicationContext, get }) => {
  const { caseId } = get(state.caseDetail);
  const { reason } = get(state.modal);

  const caseDetail = await applicationContext
    .getUseCases()
    .prioritizeCaseInteractor({
      applicationContext,
      caseId,
      reason,
    });

  return {
    alertSuccess: {
      message: 'This case will be set for trial when the calendar is set.',
      title: 'This case has been added to eligible cases.',
    },
    caseDetail,
  };
};
