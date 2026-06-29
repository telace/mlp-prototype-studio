export const pageStateOptions = {
  home: [{ id: 'default', label: '默认态' }],
  works: [
    { id: 'default', label: '作品流' },
    { id: 'empty', label: '空状态' }
  ],
  profile: [
    { id: 'loggedIn', label: '已登录' },
    { id: 'loggedOut', label: '未登录' }
  ],
  aiVideo: [
    { id: 'default', label: '未上传' },
    { id: 'uploaded', label: '已上传' },
    { id: 'template', label: '模板选中' },
    { id: 'album', label: '相册选择' },
    { id: 'loading', label: '生成加载' },
    { id: 'noCredits', label: '积分不足' }
  ],
  workDetail: [
    { id: 'generating', label: '生成中' },
    { id: 'success', label: '完成' },
    { id: 'failed', label: '失败' }
  ],
  member: [
    { id: 'android', label: 'Android' },
    { id: 'ios', label: 'iOS' },
    { id: 'retention', label: '挽留弹窗' },
    { id: 'countdown', label: '倒计时优惠' }
  ],
  credits: [
    { id: 'default', label: '默认态' },
    { id: 'paying', label: '支付确认' }
  ],
  components: [{ id: 'default', label: '默认态' }]
};

export const getStateOptions = (page) => pageStateOptions[page] || [{ id: 'default', label: '默认态' }];
