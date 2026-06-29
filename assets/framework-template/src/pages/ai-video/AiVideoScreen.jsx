import { ImagePlus, Loader2, Send, Sparkles, X } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { BottomSheet, Button, ChipScroller, FormField, Modal, PlaceholderImage, TemplateCard } from '../../prototype-ui/components/index.jsx';

const styles = ['日落视频', '服装视频', '口播视频', '剧情视频', '美女视频'];
const cases = ['丰胸', '腹肌', '增加锁骨', '瘦身', '瘦腿', '直角肩'];

export default function AiVideoScreen({ activeState, setPage, setActiveState, setActiveInteraction }) {
  const hasImage = activeState === 'uploaded' || activeState === 'loading';
  const create = () => setActiveState(hasImage ? 'loading' : 'album');

  return (
    <section className="app-page ai-video-screen">
      <ChipScroller chips={styles.map((label, index) => ({ id: `s${index}`, label }))} active="s2" onChange={() => {}} {...bindInteraction('ai-video-style-tabs', setActiveInteraction)} />
      <section className="video-canvas" {...bindInteraction('ai-video-upload', setActiveInteraction)}>
        {hasImage ? (
          <PlaceholderImage ratio="4 / 5" tone={1} video>
            <button type="button" className="remove-media"><X size={14} /></button>
          </PlaceholderImage>
        ) : (
          <div className="upload-empty">
            <ImagePlus size={34} />
            <strong>上传参考图片</strong>
            <span>支持 JPG/PNG/HEIC，上传后可生成 AI 视频</span>
          </div>
        )}
      </section>
      <section className="template-case-strip" {...bindElement('ai-video-template-cases', setActiveInteraction)}>
        {cases.map((item, index) => (
          <TemplateCard key={item} title={item} tone={index % 3} selected={index === 2} ratio="3 / 4" {...bindInteraction(`ai-video-case-${index + 1}`, setActiveInteraction)} />
        ))}
      </section>
      <section className="prompt-dock" {...bindInteraction('ai-video-prompt-box', setActiveInteraction)}>
        <button type="button" className="aux-upload" onClick={() => setActiveState('album')}><ImagePlus size={18} /></button>
        <FormField label="提示词">
          <textarea placeholder="输入想生成的内容，如“戴上墨镜”" rows={2} />
        </FormField>
        <button type="button" className="send-btn" onClick={create} {...bindInteraction('ai-video-generate', setActiveInteraction)}><Send size={18} /></button>
      </section>

      <BottomSheet open={activeState === 'album'} title="选择照片" onClose={() => setActiveState('default')} className="album-sheet">
        <div className="album-grid" {...bindInteraction('ai-video-album-sheet', setActiveInteraction)}>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <button key={item} type="button" onClick={() => setActiveState('uploaded')}><PlaceholderImage ratio="1 / 1" tone={item % 3} /></button>
          ))}
        </div>
      </BottomSheet>
      <Modal
        open={activeState === 'loading'}
        title="作品生成中"
        description="预计 20-60 秒完成，生成期间可停留等待。"
        className="generating-modal"
        actions={<Button block onClick={() => { setActiveState('generating'); setPage('workDetail'); }}>查看作品详情</Button>}
      >
        <div className="progress-line"><span /></div>
        <div className="modal-icon"><Loader2 size={28} className="spin" /></div>
      </Modal>
      <Modal
        open={activeState === 'noCredits'}
        title="积分不足"
        description="当前积分不足以生成视频，请先充值或开通会员。"
        onClose={() => setActiveState('default')}
        actions={<Button block onClick={() => { setActiveState('default'); setPage('credits'); }}>去充值</Button>}
      />
    </section>
  );
}
