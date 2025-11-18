/**
 * WeaviateConfigurator - Main entry point
 *
 * Usage in Docusaurus:
 * import WeaviateConfigurator from '@site/src/components/WeaviateConfigurator';
 *
 * <WeaviateConfigurator />
 */

import React, { useState, useEffect, useMemo } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { getVisibleParameters } from './utils/conditionEvaluator';
import { generateDockerCompose } from './utils/dockerComposeGenerator';
import './styles.css';

// Import parameters
import parametersData from './parameters.json';

// Accordion components
function AccordionItem({ title, summary, children, isOpen, onToggle }) {
  return (
    <div className={`wc-accordion-item ${isOpen ? 'open' : ''}`}>
      <button className="wc-accordion-header" onClick={onToggle}>
        <div className="wc-accordion-title-group">
          <span className="wc-accordion-title">{title}</span>
          {summary && <span className="wc-accordion-summary">{summary}</span>}
        </div>
        <span className="wc-accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="wc-accordion-content">{children}</div>}
    </div>
  );
}

// This component will render individual parameters and their children
function ParameterRenderer({
  parameter,
  selections,
  onSelectionChange,
  allParameters,
  isBaseConfig,
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

  if (isBaseConfig && type === 'select-multiline') {
    return (
      <div className="wc-form-group-inline">
        <label className="wc-form-label">{displayName}</label>
        <InputComponent />
      </div>
    );
  }

  return (
    <div className="wc-form-group">
      <div className="wc-form-group-header">
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
  const [openAccordion, setOpenAccordion] = useState(['base-config']);

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

  // Generate Docker compose automatically
  useEffect(() => {
    const content = generateDockerCompose(selections);
    setDockerCompose(content);
  }, [selections]);

  const handleAccordionToggle = (id) => {
    setOpenAccordion(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectionChange = (name, value) => {
    setSelections((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  // Group parameters for accordion
  const parameterGroups = useMemo(() => {
    const groups = {
      'base-config': { title: 'Base Configuration', params: [] },
      'local-inference': { title: 'Local Inference', params: [] },
      'additional-modules': { title: 'Additional Modules', params: [] },
    };

    visibleParameters.forEach(param => {
      if (['weaviate_version', 'weaviate_volume'].includes(param.name)) {
        groups['base-config'].params.push(param);
      } else if (param.name === 'local_modules') {
        groups['local-inference'].params.push(param);
      } else if (param.name === 'additional_modules') {
        groups['additional-modules'].params.push(param);
      }
    });

    return Object.entries(groups).filter(([, group]) => group.params.length > 0);
  }, [visibleParameters]);

  // Generate summaries for accordion items
  const summaries = useMemo(() => {
    const getDisplayName = (paramName, optionName) => {
      const param = parameters.find(p => p.name === paramName);
      const option = param?.options.find(o => o.name === optionName);
      return option?.displayName || optionName;
    };

    const baseConfigParts = [];
    if (selections.weaviate_version) {
      baseConfigParts.push(`Version ${selections.weaviate_version}`);
    }
    if (selections.weaviate_volume) {
      let volumeName = getDisplayName('weaviate_volume', selections.weaviate_volume);
      if (volumeName.includes(' with ')) {
        volumeName = volumeName.split(' with ')[1];
      }
      baseConfigParts.push(volumeName);
    }

    const localModulesCount = selections.local_modules?.length || 0;
    const additionalModulesCount = selections.additional_modules?.length || 0;

    return {
      'base-config': baseConfigParts.join(' | '),
      'local-inference': localModulesCount > 0 ? `${localModulesCount} selected` : 'Not enabled',
      'additional-modules': additionalModulesCount > 0 ? `${additionalModulesCount} selected` : 'Not enabled',
    };
  }, [selections, parameters]);

  if (loading) return <div className="weaviate-configurator-loading">Loading...</div>;
  if (error) return <div className="weaviate-configurator-error">{error}</div>;

  return (
    <div className="weaviate-configurator">
      <div className="wc-header">
        <p>
          Use this tool to generate a `docker-compose.yml` file for your Weaviate instance.
        </p>
      </div>
      <div className="wc-form">
        <div className="wc-accordion">
          {parameterGroups.map(([id, group]) => (
            <AccordionItem
              key={id}
              title={group.title}
              summary={summaries[id]}
              isOpen={openAccordion.includes(id)}
              onToggle={() => handleAccordionToggle(id)}
            >
              {group.params.map(param => (
                <ParameterRenderer
                  key={param.name}
                  parameter={param}
                  selections={selections}
                  onSelectionChange={handleSelectionChange}
                  allParameters={parameters}
                  isBaseConfig={id === 'base-config'}
                />
              ))}
            </AccordionItem>
          ))}
        </div>
      </div>

      {dockerCompose && (
        <div className="wc-result">
          <div className="wc-result-header">
            <h2>Generated docker-compose.yml</h2>
          </div>
          <CodeBlock language="yaml">{dockerCompose}</CodeBlock>
        </div>
      )}
    </div>
  );
}

export default WeaviateConfigurator;

