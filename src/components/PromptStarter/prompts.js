import prompts from "@site/static/prompts/index.json";

export const promptDetails = Object.fromEntries(
  Object.entries(prompts).map(([key, prompt]) => [
    key,
    {
      description: prompt.description,
      short: prompt.detailedDescription,
      features: prompt.features,
    },
  ])
);

export function getPromptDetails(key) {
  return promptDetails[key] || null;
}
