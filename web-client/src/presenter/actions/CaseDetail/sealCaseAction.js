import { state } from 'cerebral';

/**
 * mark a case as sealed
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {Function} providers.get the cerebral get helper function
 * @param {object} providers.path the next object in the path
 * @returns {Promise<object>} the next path based on if update was successful or error
 */
export const sealCaseAction = async ({ applicationContext, get, path }) => {
  const { caseId } = get(state.caseDetail);

  let result;
  try {
    result = await applicationContext.getUseCases().sealCaseInteractor({
      applicationContext,
      caseId,
    });
  } catch (err) {
    return path.error();
  }

  return path.success({
    alertSuccess: {
      message: 'Access to this case will be limited to authorized parties',
      title: 'This case is now sealed',
    },
    caseDetail: result,
  });
};
