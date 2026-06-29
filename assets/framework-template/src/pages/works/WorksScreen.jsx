import { Plus, Search } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { Button, EmptyState, PlaceholderImage, SegmentedControl } from '../../prototype-ui/components/index.jsx';

export default function WorksScreen({ activeState, setPage, setActiveState, setActiveInteraction }) {
  const empty = activeState === 'empty';
  const openDetail = (state = 'success') => {
    setActiveState(state);
    setPage('workDetail');
  };

  return (
    <section className="app-page works-screen">
      <header className="page-title-row" {...bindElement('works-title', setActiveInteraction)}>
        <div>
          <span className="eyebrow">WORKS</span>
          <h1>作品列表</h1>
        </div>
        <button type="button" className="icon-chip" {...bindInteraction('works-search', setActiveInteraction)}><Search size={17} /></button>
      </header>
      <SegmentedControl
        options={[{ value: 'all', label: '全部' }, { value: 'video', label: '视频' }, { value: 'draft', label: '草稿' }]}
        value="all"
        onChange={() => {}}
        {...bindInteraction('works-tabs', setActiveInteraction)}
      />
      {empty ? (
        <EmptyState title="暂无作品" description="完成一次生成后，作品会自动保存到这里。" action={<Button size="sm" icon={<Plus size={15} />} onClick={() => { setActiveState('default'); setPage('aiVideo'); }}>去制作</Button>} />
      ) : (
        <div className="masonry-grid works-grid" {...bindElement('works-list', setActiveInteraction)}>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <button type="button" key={item} onClick={() => openDetail(item === 0 ? 'generating' : item === 5 ? 'failed' : 'success')} {...bindInteraction(`works-card-${item + 1}`, setActiveInteraction)}>
              <PlaceholderImage ratio={item % 3 === 0 ? '1 / 1' : '3 / 4'} tone={item % 3} video />
              <strong>{item === 0 ? '生成中作品' : item === 5 ? '失败作品' : `AI 短片 ${item}`}</strong>
              <span>{item === 0 ? '处理中' : item === 5 ? '生成失败' : '已完成'}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
