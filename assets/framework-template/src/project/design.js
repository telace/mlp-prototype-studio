export const designContract = {
  version: 1,
  status: 'draft',
  fidelity: 'low-fi',
  platform: 'mobile-c-end',
  audience: 'Define the primary user and usage context.',
  job: 'Define the core task the user needs to complete.',
  businessGoal: 'Define the product outcome supported by this flow.',
  experienceGoal: 'Define one priority such as clarity, completion, or discovery.',
  reference: 'Record the product, screenshot, codebase, or design system used as context.',
  contentPriority: [],
  constraints: [],
  direction: 'safe',
  palette: {
    mode: 'grayscale',
    accent: 'none',
    tokenSource: 'src/framework/framework.css'
  }
};

export const isDesignBriefReady = () => {
  const required = [
    designContract.audience,
    designContract.job,
    designContract.businessGoal,
    designContract.experienceGoal
  ];
  return required.every((value) => value && !value.startsWith('Define '));
};
