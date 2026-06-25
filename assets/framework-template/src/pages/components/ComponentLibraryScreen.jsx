import { useState } from 'react';
import {
  Grid2X2,
  Home,
  ImagePlus,
  Settings,
  Share2,
  User
} from 'lucide-react';
import { bindInteraction } from '../../framework/interaction.js';
import {
  BottomSheet,
  BottomTabBar,
  Button,
  ChipScroller,
  EmptyState,
  FormField,
  IconButton,
  LoadingState,
  Modal,
  PhonePage,
  PlaceholderImage,
  SegmentedControl,
  TemplateCard,
  Toast,
  TopBar
} from '../../prototype-ui/components/index.jsx';

export default function ComponentLibraryScreen({ setActiveInteraction }) {
  const [segment, setSegment] = useState('a');
  const [chip, setChip] = useState('hot');

  return (
    <PhonePage className="component-screen" {...bindInteraction('components-preview', setActiveInteraction)}>
      <h2>组件库</h2>
      <p>保留框架内置低保真组件，新业务页面优先复用。</p>

      <section className="component-section">
        <h3>页面与导航</h3>
        <TopBar title="二级页面标题" onBack={() => {}} right={<IconButton icon={<Settings size={17} />} label="设置" />} />
        <BottomTabBar
          active="home"
          onChange={() => {}}
          tabs={[
            { id: 'home', label: '首页', icon: Home },
            { id: 'create', label: '创作', icon: Grid2X2 },
            { id: 'profile', label: '我的', icon: User }
          ]}
        />
      </section>

      <section className="component-section">
        <h3>按钮与切换</h3>
        <Button icon={<ImagePlus size={18} />} block>主操作按钮</Button>
        <Button variant="secondary" icon={<Share2 size={17} />} block>次操作按钮</Button>
        <SegmentedControl value={segment} onChange={setSegment} options={[{ value: 'a', label: '选项一' }, { value: 'b', label: '选项二' }]} />
        <ChipScroller active={chip} onChange={setChip} chips={[{ id: 'hot', label: '热门' }, { id: 'video', label: '视频' }, { id: 'photo', label: '写真' }, { id: 'travel', label: '旅行' }]} />
      </section>

      <section className="component-section">
        <h3>封面与模板</h3>
        <PlaceholderImage ratio="16/7" tone={1} />
        <div className="card-row">
          <TemplateCard title="图片模板" tone={0} />
          <TemplateCard title="视频模板" tone={1} video selected />
        </div>
      </section>

      <section className="component-section">
        <h3>表单</h3>
        <FormField label="邮箱" helper="最多 64 个字符"><input value="pm@example.com" readOnly /></FormField>
        <FormField label="验证码" action={<button>获取</button>}><input value="" readOnly placeholder="输入验证码" /></FormField>
      </section>

      <section className="component-section">
        <h3>状态</h3>
        <EmptyState title="暂无内容" description="数据为空时展示此状态" />
        <LoadingState title="加载中" description="请求或生成处理中展示此状态" />
      </section>

      <section className="component-section">
        <h3>弹层</h3>
        <div className="component-layer-demo"><Toast>保存成功</Toast></div>
        <div className="component-layer-demo"><Modal title="确认操作" description="这里展示标准弹窗样式" actions={<Button size="sm" block>确认</Button>} /></div>
        <div className="component-layer-demo sheet-demo">
          <BottomSheet title="底部 Sheet" actions={<Button size="sm" block>完成</Button>}>
            <Button variant="secondary" block>相册</Button>
            <Button variant="secondary" block>拍照</Button>
          </BottomSheet>
        </div>
      </section>
    </PhonePage>
  );
}
