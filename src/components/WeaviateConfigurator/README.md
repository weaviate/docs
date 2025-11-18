# Weaviate Configurator Component

A self-contained React component for generating Weaviate `docker-compose.yml` configurations. This guide explains how to maintain and extend this component.

## How it Works

The configurator is driven by a JSON file and a generator script, which work together to create the user interface and the final configuration file:

1.  **`parameters.json`**: This file defines all the user-selectable options, such as dropdowns and checkboxes. It controls what appears in the UI, including descriptions and conditional visibility for certain options.
2.  **`utils/dockerComposeGenerator.js`**: This script takes the user's selections from the UI and generates the final `docker-compose.yml` string.

To add a new feature, you will typically need to modify both of these files.

## How to Add a New Option

Here’s a step-by-step guide to adding a new selectable module. As an example, let's say we want to add a new module called `new-awesome-module`.

### Step 1: Add the Option to `parameters.json`

First, you need to add the new option so it appears in the UI. Open `parameters.json` and find the appropriate group for your new option. For a new module, you would typically add it to either `local_modules` or `additional_modules`.

To add `new-awesome-module` as a local inference module, you would add a new object to the `options` array of the `local_modules` parameter:

```json
// In parameters.json
{
  "name": "local_modules",
  "displayName": "Local Inference",
  "description": "Enable locally-run model integrations.",
  "type": "checkbox-group",
  "options": [
    // ... other options
    {
      "name": "new-awesome-module",
      "displayName": "new-awesome-module",
      "description": "A description of what this new module does."
    }
  ]
},
```

This change will automatically add a new checkbox for your module in the "Local Inference" section of the UI.

### Step 2: Add the Logic to `dockerComposeGenerator.js`

Next, you need to handle the new option in the Docker Compose generator. Open `utils/dockerComposeGenerator.js`.

1.  **Add Environment Variables (if needed)**: If your new module requires Weaviate to have specific environment variables, you'll need to add logic to include them when the module is selected.

    ```javascript
    // In generateDockerCompose function
    if (local_modules.includes('new-awesome-module')) {
      compose += `      NEW_MODULE_API: http://new-awesome-module:8080\n`;
    }
    ```

2.  **Add the Service Container**: If your module runs in its own Docker container, you need to add a new service definition. The best practice is to create a new function for this.

    ```javascript
    // In generateDockerCompose function
    if (local_modules.includes('new-awesome-module')) {
      compose += getNewAwesomeModuleService();
    }
    ```

3.  **Create the Service Function**: Add a new function at the bottom of the file to generate the service configuration string.

    ```javascript
    // At the end of the file
    function getNewAwesomeModuleService() {
      return `
  new-awesome-module:
    image: cr.weaviate.io/semitechnologies/new-awesome-module:latest
    environment:
      ENABLE_CUDA: '0'
`;
    }
    ```

### Step 3: Test

After making these changes, run the application and test your new option to ensure it generates the correct `docker-compose.yml` file.

## How to Add a Sub-selector (e.g., for models)

If your new module has different models to choose from, you can add a conditional sub-selector that appears only when the module is selected.

### Step 1: Add a New Parameter in `parameters.json`

Create a new top-level parameter for the model selection. Use the `conditions` field to make it visible only when your module is selected.

```json
// In parameters.json
{
  "name": "new_awesome_module_model",
  "displayName": "Awesome Model",
  "description": "Select the model for the new-awesome-module.",
  "type": "select-multiline",
  "conditions": {
    "and": ["local_modules~~new-awesome-module"]
  },
  "options": [
    {
      "name": "model1",
      "displayName": "Model 1 (default)",
      "description": "The first amazing model."
    },
    {
      "name": "model2",
      "displayName": "Model 2",
      "description": "The second amazing model."
    }
  ]
}
```
The condition `local_modules~~new-awesome-module` means: "show this parameter when `new-awesome-module` is selected within the `local_modules` checkbox group."

### Step 2: Update `dockerComposeGenerator.js`

1.  **Destructure the New Model Selection**: Add the new model parameter to the destructuring at the top of the `generateDockerCompose` function.

    ```javascript
    const {
      // ... other selections
      new_awesome_module_model,
    } = selections;
    ```

2.  **Pass the Model to Your Service Function**: When calling the function to generate the service, pass the selected model to it. It's a good idea to provide a default model.

    ```javascript
    if (local_modules.includes('new-awesome-module')) {
      compose += getNewAwesomeModuleService(new_awesome_module_model || 'model1');
    }
    ```

3.  **Update the Service Function to Use the Model**: Modify the service function to accept the model name and use it to construct the Docker image name.

    ```javascript
    function getNewAwesomeModuleService(model) {
      return `
  new-awesome-module:
    image: cr.weaviate.io/semitechnologies/new-awesome-module:${model}
    environment:
      ENABLE_CUDA: '0'
`;
    }
    ```

## File Structure Overview

-   `index.jsx`: The main React component that renders the UI. You should not need to edit this file for most changes.
-   `styles.css`: All component styles are located here.
-   `parameters.json`: Defines the UI and all available options. **This is your starting point for adding new options.**
-   `utils/dockerComposeGenerator.js`: Contains the logic to generate the `docker-compose.yml` file. **This is where you'll handle the logic for new options.**
-   `utils/conditionEvaluator.js`: Contains the logic for showing and hiding conditional parameters. You should not need to edit this file.

