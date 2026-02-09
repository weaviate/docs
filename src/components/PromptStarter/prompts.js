import prompts from "@site/static/prompts/prompts.json";

export const promptDetails = Object.fromEntries(
  Object.entries(prompts).map(([key, prompt]) => [
    key,
    {
      description: prompt.description,
      short: prompt.short,
      features: prompt.features,
    },
  ])
);

export function getPromptDetails(key) {
  return promptDetails[key] || null;
}
