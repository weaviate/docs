import React, { useState, useEffect } from 'react';
import { getVisibleOptions } from '../utils/conditionEvaluator';

function ParameterStep({ parameter, selections, onNext, onBack, canGoBack, isLastStep }) {
  const visibleOptions = getVisibleOptions(parameter.options, selections);
  const [selectedValue, setSelectedValue] = useState('');
  const [textValue, setTextValue] = useState('');

  // Set default value when component mounts or parameter changes
  useEffect(() => {
    if (parameter.type === 'text') {
      setTextValue('');
    } else if (visibleOptions.length > 0) {
      setSelectedValue(visibleOptions[0].name);
    }
  }, [parameter.name]); // Only reset when parameter name changes

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parameter.type === 'text' ? textValue : selectedValue;
    if (value) {
      onNext(value);
    }
  };

  const isValid = parameter.type === 'text' ? textValue.trim() !== '' : selectedValue !== '';

  return (
    <div className="wc-parameter-step">
      <form onSubmit={handleSubmit}>
        <div className="wc-parameter-header">
          <h2>{parameter.displayName}</h2>
          {parameter.description && (
            <p className="wc-parameter-description">{parameter.description}</p>
          )}
        </div>

        <div className="wc-parameter-options">
          {parameter.type === 'text' ? (
            <div className="wc-text-input-container">
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Enter value..."
                className="wc-text-input"
                autoFocus
              />
            </div>
          ) : (
            <div className="wc-options-list">
              {visibleOptions.map((option) => (
                <label
                  key={option.name}
                  className={`wc-option-card ${selectedValue === option.name ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={parameter.name}
                    value={option.name}
                    checked={selectedValue === option.name}
                    onChange={(e) => setSelectedValue(e.target.value)}
                  />
                  <div className="wc-option-content">
                    <div className="wc-option-title">{option.displayName}</div>
                    {option.description && (
                      <div className="wc-option-description">{option.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="wc-button-group">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className="wc-button wc-button-secondary"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="wc-button wc-button-primary"
          >
            {isLastStep ? 'Generate Configuration' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ParameterStep;
