import { connect } from '@cerebral/react';
import { sequences, state, props } from 'cerebral';
import React from 'react';

export default connect(
  {
    form: state.form,
    constants: state.constants,
    type: props.type,
    updateFormValueSequence: sequences.updateFormValueSequence,
    validateStartCaseSequence: sequences.validateStartCaseSequence,
    validationErrors: state.validationErrors,
  },
  function Country({
    form,
    constants,
    type,
    updateFormValueSequence,
    validateStartCaseSequence,
    validationErrors,
  }) {
    return (
      <React.Fragment>
        <div
          className={
            'usa-form-group ' +
            (validationErrors &&
            validationErrors[type] &&
            validationErrors[type].countryType
              ? 'usa-input-error'
              : '')
          }
        >
          <label htmlFor={`${type}.countryType`}>Country</label>
          <select
            className={
              `usa-input-inline ${type}-country-type ` +
              (validationErrors &&
              validationErrors[type] &&
              validationErrors[type].countryType
                ? 'ustc-input-error'
                : '')
            }
            id={`${type}.countryType`}
            name={`${type}.countryType`}
            value={form[type].countryType}
            onChange={e => {
              updateFormValueSequence({
                key: e.target.name,
                value: e.target.value,
              });
              validateStartCaseSequence();
            }}
          >
            <option value={constants.COUNTRY_TYPES.DOMESTIC}>
              - United States -
            </option>
            <option value={constants.COUNTRY_TYPES.INTERNATIONAL}>
              - International -
            </option>
          </select>
          {validationErrors && validationErrors[type] && (
            <div className="usa-input-error-message beneath">
              {validationErrors[type].countryType}
            </div>
          )}
        </div>
        {form[type].countryType === constants.COUNTRY_TYPES.INTERNATIONAL && (
          <div
            className={
              'usa-form-group ' +
              (validationErrors &&
              validationErrors[type] &&
              validationErrors[type].country
                ? 'usa-input-error'
                : '')
            }
          >
            <label htmlFor={`${type}.country`}>Country Name</label>
            <input
              id={`${type}.country`}
              type="text"
              name={`${type}.country`}
              autoCapitalize="none"
              value={form[type].country || ''}
              onChange={e => {
                updateFormValueSequence({
                  key: e.target.name,
                  value: e.target.value,
                });
              }}
              onBlur={() => {
                validateStartCaseSequence();
              }}
            />
            {validationErrors && validationErrors[type] && (
              <div className="usa-input-error-message beneath">
                {validationErrors[type].country}
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  },
);
