/**
 * validates the forward message
 *
 * @param {object} providers the providers object
 * @param {object} providers.path the cerebral path which contains the next path in the sequence (path of success or failure)
 * @param {object} providers.props the cerebral props object
 * @param {object} providers.applicationContext the application context needed for getting the validateForwardMessage use case
 * @returns {object} path.success or path.error
 */
export const validateInitialWorkItemMessageAction = ({
  applicationContext,
  path,
  props,
}) => {
  const { message } = props;

  const errors = applicationContext
    .getUseCases()
    .validateInitialWorkItemMessageInteractor({
      applicationContext,
      message,
    });

  if (!errors) {
    return path.success();
  } else {
    return path.error({ errors });
  }
};
