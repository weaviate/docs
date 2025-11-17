/**
 * WeaviateConfigurator - Main entry point
 *
 * Usage in Docusaurus:
 * import WeaviateConfigurator from '@site/src/components/WeaviateConfigurator';
 *
 * <WeaviateConfigurator />
 */

import React, { useState, useEffect } from 'react';
import ParameterStep from './components/ParameterStep';
import ResultPage from './components/ResultPage';
import { getVisibleParameters } from './utils/conditionEvaluator';
import './styles.css';

// Import parameters - in Docusaurus, you might want to fetch this or import directly
import parametersData from './parameters.json';

function WeaviateConfigurator() {
  const [parameters, setParameters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Get currently visible parameters based on selections
  const visibleParameters = getVisibleParameters(parameters, selections);
  const currentParameter = visibleParameters[currentIndex];
  const isLastStep = currentIndex >= visibleParameters.length - 1;

  const handleNext = (value) => {
    const newSelections = {
      ...selections,
      [currentParameter.name]: value
    };
    setSelections(newSelections);

    if (isLastStep) {
      setIsComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setSelections({});
    setCurrentIndex(0);
    setIsComplete(false);
  };

  if (loading) {
    return (
      <div className="weaviate-configurator">
        <div className="wc-loading">Loading configuration wizard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weaviate-configurator">
        <div className="wc-error">{error}</div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="weaviate-configurator">
        <ResultPage
          selections={selections}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="weaviate-configurator">
      <header className="wc-header">
        <h1>Weaviate Configuration Generator</h1>
        <p>Configure your Weaviate Docker Compose setup</p>
      </header>

      <div className="wc-progress">
        <div className="wc-progress-text">
          Step {currentIndex + 1} of {visibleParameters.length}
        </div>
        <div className="wc-progress-bar">
          <div
            className="wc-progress-fill"
            style={{ width: `${((currentIndex + 1) / visibleParameters.length) * 100}%` }}
          />
        </div>
      </div>

      {currentParameter && (
        <ParameterStep
          parameter={currentParameter}
          selections={selections}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={currentIndex > 0}
          isLastStep={isLastStep}
        />
      )}

      <div className="wc-selections-summary">
        <h3>Current Selections</h3>
        {Object.keys(selections).length === 0 ? (
          <p className="wc-empty-state">No selections yet</p>
        ) : (
          <div className="wc-selections-list">
            {Object.entries(selections).map(([key, value]) => (
              <div key={key} className="wc-selection-item">
                <span className="wc-selection-key">{key}:</span>
                <span className="wc-selection-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeaviateConfigurator;

