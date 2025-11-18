/**
 * WeaviateConfigurator - Main entry point
 *
 * Usage in Docusaurus:
 * import WeaviateConfigurator from '@site/src/components/WeaviateConfigurator';
 *
 * <WeaviateConfigurator />
 */

import React, { useState, useEffect, useMemo } from 'react';
import { getVisibleParameters } from './utils/conditionEvaluator';
import { generateDockerCompose } from './utils/dockerComposeGenerator';
import './styles.css';

// Import parameters
import parametersData from './parameters.json';

// This component will render individual parameters and their children
function ParameterRenderer({
  parameter,
  selections,
  onSelectionChange,
  allParameters,
}) {
  const { name, displayName, description, type, options } = parameter;
  const value = selections[name] || (type === 'checkbox-group' ? [] : '');

  // Find sub-options for checkbox groups
  const subOptionsMap = useMemo(() => {
    const map = new Map();
    if (type !== 'checkbox-group') return map;

    for (const option of options) {
      const children = allParameters.filter(p =>
        p.conditions &&
        Object.values(p.conditions)
          .flat()
          .includes(`${name}~~${option.name}`)
      );
      if (children.length > 0) {
        map.set(option.name, children);
      }
    }
    return map;
  }, [allParameters, name, options, type]);

  const InputComponent = () => {
    if (type === 'checkbox-group') {
      return (
        <div className="wc-checkbox-group">
          {options.map((option) => {
            const isSelected = value.includes(option.name);
            const subOptions = subOptionsMap.get(option.name);

            return (
              <div key={option.name} className={`wc-checkbox-container ${isSelected ? 'selected' : ''}`}>
                <label className="wc-checkbox-label">
                  <input
                    type="checkbox"
                    name={name}
                    value={option.name}
                    checked={isSelected}
                    onChange={(e) => {
                      const newValues = [...value];
                      if (e.target.checked) {
                        newValues.push(option.name);
                      } else {
                        const index = newValues.indexOf(option.name);
                        if (index > -1) newValues.splice(index, 1);
                      }
                      onSelectionChange(name, newValues);
                    }}
                  />
                  <span className="wc-custom-checkbox" />
                  <span className="wc-checkbox-title">{option.displayName}</span>
                  {option.description && (
                    <span className="wc-checkbox-description">{option.description}</span>
                  )}
                </label>
                {isSelected && subOptions && (
                  <div className="wc-sub-options-container">
                    {subOptions.map(subParam => (
                      <ParameterRenderer
                        key={subParam.name}
                        parameter={subParam}
                        selections={selections}
                        onSelectionChange={onSelectionChange}
                        allParameters={allParameters}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Dropdown (select)
    return (
      <select
        className="wc-select"
        value={value}
        onChange={(e) => onSelectionChange(name, e.target.value)}
      >
        {name === 'default_vectorizer' && <option value="">-- Select a default --</option>}
        {options.map((option) => (
          <option key={option.name} value={option.name}>
            {option.displayName}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="wc-form-group">
      <div className="wc-form-group-header">
        <label className="wc-form-label">{displayName}</label>
        {description && <p className="wc-form-description">{description}</p>}
      </div>
      <div className="wc-form-group-options">
        <InputComponent />
      </div>
    </div>
  );
}


function WeaviateConfigurator() {
  const [parameters, setParameters] = useState([]);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dockerCompose, setDockerCompose] = useState('');
  const [copied, setCopied] = useState(false);

  // Load parameters
  useEffect(() => {
    try {
      setParameters(parametersData.parameters);
      setLoading(false);
    } catch (err) {
      setError('Failed to load parameters');
      setLoading(false);
    }
  }, []);

  const handleSelectionChange = (name, value) => {
    setSelections((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = () => {
    const content = generateDockerCompose(selections);
    setDockerCompose(content);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dockerCompose);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Memoize visible parameters to avoid re-calculating on every render
  const visibleParameters = useMemo(() => {
    // Filter out parameters that are sub-options of checkboxes
    const topLevelParams = parameters.filter(p =>
      !p.conditions ||
      !Object.values(p.conditions)
        .flat()
        .some(c => c.includes('~~'))
    );
    return getVisibleParameters(topLevelParams, selections);
  }, [parameters, selections]);

  if (loading) return <div className="weaviate-configurator-loading">Loading...</div>;
  if (error) return <div className="weaviate-configurator-error">{error}</div>;

  return (
    <div className="weaviate-configurator">
      <div className="wc-form">
        {visibleParameters.map((param) => (
          <ParameterRenderer
            key={param.name}
            parameter={param}
            selections={selections}
            onSelectionChange={handleSelectionChange}
            allParameters={parameters}
          />
        ))}

        <button onClick={handleGenerate} className="wc-button wc-button-primary">
          Generate Configuration
        </button>
      </div>

      {dockerCompose && (
        <div className="wc-result">
          <div className="wc-result-header">
            <h2>Your docker-compose.yml</h2>
            <button onClick={copyToClipboard} className="wc-button wc-button-secondary">
              {copied ? '✓ Copied!' : 'Copied!'}
            </button>
          </div>
          <textarea
            className="wc-docker-compose-output"
            value={dockerCompose}
            readOnly
            rows={20}
          />
        </div>
      )}
    </div>
  );
}

export default WeaviateConfigurator;

