import { Download, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { Button, Modal, PlaceholderImage } from '../../prototype-ui/components/index.jsx';

export default function WorkDetailScreen({ activeState, setPage, setActiveState, setActiveInteraction }) {
  const generating = activeState === 'generating';
  const failed = activeState === 'failed';

  return (
    <section className="app-page work-detail-screen">
      <section className="detail-preview" {...bindElement('work-detail-preview', setActiveInteraction)}>
        <PlaceholderImage ratio="9 / 16" tone={failed ? 2 : 1} video={!failed}>
          {generating ? <Loader2 size={34} className="spin" /> : failed ? <strong>生成失败</strong> : null}
        </PlaceholderImage>
      </section>
      <section className="detail-meta" {...bindElement('work-detail-meta', setActiveInteraction)}>
        <span>{generating ? '生成中' : failed ? '失败' : '已完成'}</span>
        <strong>{failed ? '视频生成失败' : 'AI 视频作品'}</strong>
        <p>{generating ? '正在生成，请稍后查看。' : failed ? '本次生成未完成，可重新制作。' : '已自动保存到作品列表。'}</p>
      </section>
      <footer className="bottom-actions">
        {failed ? (
          <Button block icon={<RotateCcw size={16} />} onClick={() => { setActiveState('uploaded'); setPage('aiVideo'); }} {...bindInteraction('work-detail-retry', setActiveInteraction)}>重新制作</Button>
        ) : (
          <>
            <Button block variant="ghost" icon={<Trash2 size={16} />} {...bindInteraction('work-detail-delete', setActiveInteraction)}>删除</Button>
            <Button block icon={<Download size={16} />} disabled={generating} {...bindInteraction('work-detail-download', setActiveInteraction)}>保存作品</Button>
          </>
        )}
      </footer>
      <Modal
        open={activeState === 'generating'}
        title="作品生成中"
        description="生成结果完成后会自动进入完成态，也会同步到作品列表。"
        actions={<Button block variant="ghost" onClick={() => setActiveState('success')}>模拟完成</Button>}
      />
    </section>
  );
}
