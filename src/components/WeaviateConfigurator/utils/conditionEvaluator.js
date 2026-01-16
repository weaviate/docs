/**
 * Evaluates conditions against current selections
 * Supports: ==, !=, >=, <=, >, <, and, or
 */

function compareVersions(v1, v2) {
  // Remove 'v' prefix if present
  const clean1 = v1.replace(/^v/, '');
  const clean2 = v2.replace(/^v/, '');

  const parts1 = clean1.split('.').map(Number);
  const parts2 = clean2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

function evaluateSingleCondition(condition, selections) {
  // New "contains" operator
  if (condition.includes('~~')) {
    const [key, value] = condition.split('~~');
    return selections[key] && Array.isArray(selections[key]) && selections[key].includes(value);
  }

  // Handle version comparisons (e.g., "weaviate_version>=v1.21.0")
  const versionMatch = condition.match(/^(\w+)(>=|<=|>|<)(.+)$/);
  if (versionMatch) {
    const [, key, op, value] = versionMatch;
    const selectedValue = selections[key];
    if (!selectedValue) return false;

    const cmp = compareVersions(selectedValue, value);
    switch (op) {
      case '>=': return cmp >= 0;
      case '<=': return cmp <= 0;
      case '>': return cmp > 0;
      case '<': return cmp < 0;
      default: return false;
    }
  }

  // Handle equality/inequality (e.g., "modules==modules", "wcs!=true")
  const eqMatch = condition.match(/^(\w+)(==|!=)(.+)$/);
  if (eqMatch) {
    const [, key, op, value] = eqMatch;
    const selectedValue = selections[key];

    if (op === '==') {
      return selectedValue === value;
    } else if (op === '!=') {
      return selectedValue !== value;
    }
  }

  return false;
}

export function evaluateConditions(conditions, selections) {
  if (!conditions) return true;

  // Handle 'and' conditions
  if (conditions.and) {
    return conditions.and.every(cond => evaluateSingleCondition(cond, selections));
  }

  // Handle 'or' conditions
  if (conditions.or) {
    return conditions.or.some(cond => evaluateSingleCondition(cond, selections));
  }

  return true;
}

export function getVisibleParameters(allParameters, selections) {
  return allParameters.filter(param => {
    return evaluateConditions(param.conditions, selections);
  });
}

export function getVisibleOptions(options, selections) {
  if (!options) return [];

  return options.filter(option => {
    return evaluateConditions(option.conditions, selections);
  });
}


