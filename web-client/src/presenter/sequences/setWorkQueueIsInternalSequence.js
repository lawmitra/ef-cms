import { navigateToDashboardAction } from '../actions/navigateToDashboardAction';
import { set } from 'cerebral/factories';
import { state } from 'cerebral';

export const setWorkQueueIsInternalSequence = [
  set(state.workQueueToDisplay.workQueueIsInternal, true),
  navigateToDashboardAction,
];
