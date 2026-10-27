export const pageStateOptions = {};

export const getStateOptions = (page) => pageStateOptions[page] || [{ id: 'default', label: '默认态' }];
