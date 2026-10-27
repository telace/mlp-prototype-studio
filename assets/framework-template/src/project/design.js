export const designContract = {
  version: 2,
  prd: {
    path: 'docs/PRD.md',
    status: 'synced',
    version: '0.13',
    syncedAt: '2026-10-26'
  },
  notes: ''
};

export const isPrdSynced = () => designContract.prd?.status === 'synced';

// Compatibility export: design notes no longer form a separate approval gate.
export const isDesignBriefReady = isPrdSynced;
