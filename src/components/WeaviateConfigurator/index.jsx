/**
 * WeaviateConfigurator - Main entry point
 *
 * Usage in Docusaurus:
 * import WeaviateConfigurator from '@site/src/components/WeaviateConfigurator';
 *
 * <WeaviateConfigurator />
 */

import React, { useState, useEffect } from 'react';
import { getVisibleParameters } from './utils/conditionEvaluator';
import { generateDockerCompose } from './utils/dockerComposeGenerator';
import './styles.css';

// Import parameters
import parametersData from './parameters.json';

// Helper to render the correct input type
function ParameterInput({ parameter, value, onChange, selections }) {
  // Determine if the parameter should be a dropdown
  const useDropdown =
    (parameter.options && parameter.options.length > 4) ||
    ['weaviate_version', 'weaviate_volume', 'modules'].includes(parameter.name);

  if (useDropdown) {
    return (
      <select
        className="wc-select"
        value={value}
        onChange={(e) => onChange(parameter.name, e.target.value)}
      >
        {parameter.options.map((option) => (
          <option key={option.name} value={option.name}>
            {option.displayName}
          </option>
        ))}
      </select>
    );
  }

  // Render radio buttons for other types
  return (
    <div className="wc-radio-group">
      {parameter.options.map((option) => (
        <label
          key={option.name}
          className={`wc-radio-label ${value === option.name ? 'selected' : ''}`}
        >
          <input
            type="radio"
            name={parameter.name}
            value={option.name}
            checked={value === option.name}
            onChange={(e) => onChange(parameter.name, e.target.value)}
          />
          <span className="wc-radio-title">{option.displayName}</span>
          {option.description && (
            <span className="wc-radio-description">{option.description}</span>
          )}
        </label>
      ))}
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

  // Update handler
  const handleSelectionChange = (name, value) => {
    setSelections((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate Docker Compose file
  const handleGenerate = () => {
    const content = generateDockerCompose(selections);
    setDockerCompose(content);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dockerCompose);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visibleParameters = getVisibleParameters(parameters, selections);

  if (loading) return <div className="weaviate-configurator-loading">Loading...</div>;
  if (error) return <div className="weaviate-configurator-error">{error}</div>;

  return (
    <div className="weaviate-configurator">

      <div className="wc-form">
        {visibleParameters.map((param) => (
          <div key={param.name} className="wc-form-group">
            <label className="wc-form-label">{param.displayName}</label>
            <p className="wc-form-description">{param.description}</p>
            <ParameterInput
              parameter={param}
              value={selections[param.name] || ''}
              onChange={handleSelectionChange}
              selections={selections}
            />
          </div>
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
              {copied ? '✓ Copied!' : 'Copy'}
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

