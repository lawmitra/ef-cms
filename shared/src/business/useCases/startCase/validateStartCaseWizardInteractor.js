/**
 * validateStartCaseWizardInteractor
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {object} providers.petition the petition data
 * @returns {object} errors (null if no errors)
 */
exports.validateStartCaseWizardInteractor = ({
  applicationContext,
  petition,
}) => {
  const errors = new (applicationContext.getEntityConstructors().CaseExternalInformationFactory)(
    petition,
  ).getFormattedValidationErrors();
  return errors || null;
};
