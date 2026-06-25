export const sampleStates = [
  { id: 'default', label: '默认态' },
  { id: 'drawer', label: '抽屉态' }
];

export const secondaryExampleStates = [
  { id: 'default', label: '默认态' },
  { id: 'sheet', label: 'Sheet 态' },
  { id: 'modal', label: '弹窗态' },
  { id: 'toast', label: 'Toast 态' }
];

export const pageStateOptions = {
  sample: sampleStates,
  secondaryExample: secondaryExampleStates,
  components: [{ id: 'default', label: '默认态' }]
};

export const getStateOptions = (page) => pageStateOptions[page] || [{ id: 'default', label: '默认态' }];
