import React from 'react';


const IndividualPostSubmissionDetail = ({
    propKey,
    label,
    required,
    minLength,
    submissionDetails,
    onChangeDetail,
  }) => {
  
  const capitalKey = propKey[0].toUpperCase() + propKey.slice(1);
  const id = `submissionPost${capitalKey}`;

  return (
    <div className="submission-detail" id={id}>
      <label className="submissionLabel">{label}</label>
      {
        propKey === 'description' || propKey === 'title'
        ? <textarea
          type={propKey !== 'willDeliver' ? 'text' : 'checkbox'}
          id={`${id}Input`}
          name={`submissionPost${capitalKey}`}
          required={required}
          minLength={minLength}
          className="submissionDetailInput"
          value={submissionDetails[propKey]}
          onChange={(evt) => {
            onChangeDetail(evt, propKey);
          }}
        />
        : <input
          type={propKey !== 'willDeliver' ? 'text' : 'checkbox'}
          id={`${id}Input`}
          name={`submissionPost${capitalKey}`}
          required={required}
          minLength={minLength}
          className="submissionDetailInput"
          value={submissionDetails[propKey]}
          onChange={(evt) => {
            onChangeDetail(evt, propKey);
          }}
        />
      }
    </div>
  )
}

export default IndividualPostSubmissionDetail;