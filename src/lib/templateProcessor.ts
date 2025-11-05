/**
 * Template processor with support for variables and conditional blocks
 */

interface VariableValues {
  [key: string]: string;
}

/**
 * Process conditional blocks in template text
 * Supports: {if variable > value}text{/if} and {if variable > value}text{else}alternative{/if}
 * Operators: <, >, <=, >=, ==, !=
 */
function processConditionals(text: string, variables: VariableValues): string {
  // Match conditional blocks: {if condition}content{else}alternative{/if} or {if condition}content{/if}
  const conditionalRegex = /\{if\s+(\w+)\s*(==|!=|<=|>=|<|>)\s*(\d+)\}([\s\S]*?)(?:\{else\}([\s\S]*?))?\{\/if\}/g;
  
  return text.replace(conditionalRegex, (match, variable, operator, value, ifContent, elseContent) => {
    const variableValue = parseFloat(variables[variable] || "0");
    const compareValue = parseFloat(value);
    
    let conditionMet = false;
    
    switch (operator) {
      case ">":
        conditionMet = variableValue > compareValue;
        break;
      case "<":
        conditionMet = variableValue < compareValue;
        break;
      case ">=":
        conditionMet = variableValue >= compareValue;
        break;
      case "<=":
        conditionMet = variableValue <= compareValue;
        break;
      case "==":
        conditionMet = variableValue === compareValue;
        break;
      case "!=":
        conditionMet = variableValue !== compareValue;
        break;
    }
    
    return conditionMet ? ifContent : (elseContent || "");
  });
}

/**
 * Replace template variables and process conditional blocks
 */
export function processTemplate(text: string, variables: VariableValues): string {
  // First process conditionals
  let result = processConditionals(text, variables);
  
  // Then replace simple variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Check if template contains conditional blocks
 */
export function hasConditionals(text: string): boolean {
  return /\{if\s+\w+\s*(==|!=|<=|>=|<|>)\s*\d+\}/.test(text);
}

/**
 * Check if template contains any dynamic content (variables or conditionals)
 */
export function hasDynamicContent(text: string): boolean {
  return /\{[\w\s]+\}/.test(text);
}
