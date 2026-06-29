import { ChevronRight, Coins, Crown, ImagePlus, Play, Sparkles, User } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { Button, ChipScroller, PlaceholderImage, TemplateCard } from '../../prototype-ui/components/index.jsx';

const groups = [
  { id: 'recommend', label: '推荐' },
  { id: 'video', label: '视频' },
  { id: 'portrait', label: '写真' },
  { id: 'ootd', label: 'OOTD' }
];

const templates = ['复古胶片', '赛博街拍', '氛围短片', '职业头像', '旅行大片', '节日祝福'];

export default function HomeScreen({ setPage, setActiveState, setActiveInteraction }) {
  const go = (page, state = 'default') => {
    setActiveState(state);
    setPage(page);
  };

  return (
    <section className="app-page home-screen">
      <header className="home-hero" {...bindElement('home-hero', setActiveInteraction)}>
        <span className="eyebrow">AI CREATION</span>
        <h1>开始创作</h1>
        <button type="button" className="member-mini" onClick={() => go('member', 'android')} {...bindInteraction('home-member-entry', setActiveInteraction)}>
          <Crown size={14} />
          会员
        </button>
      </header>

      <section className="quick-grid" aria-label="功能入口">
        <button type="button" className="quick-card quick-card--main" onClick={() => go('aiVideo')} {...bindInteraction('home-ai-video-entry', setActiveInteraction)}>
          <Sparkles size={28} />
          <strong>AI 视频</strong>
          <span>上传图片生成短片</span>
        </button>
        <button type="button" className="quick-card" onClick={() => go('works')} {...bindInteraction('home-works-entry', setActiveInteraction)}>
          <Play size={18} />
          <strong>作品</strong>
        </button>
        <button type="button" className="quick-card" onClick={() => go('credits')} {...bindInteraction('home-credits-entry', setActiveInteraction)}>
          <Coins size={18} />
          <strong>积分</strong>
        </button>
        <button type="button" className="quick-card" onClick={() => go('profile')} {...bindInteraction('home-profile-entry', setActiveInteraction)}>
          <User size={18} />
          <strong>我的</strong>
        </button>
      </section>

      <section className="banner-strip" {...bindInteraction('home-activity-banner', setActiveInteraction)}>
        <div>
          <strong>限时生成包</strong>
          <span>今日剩余 3 次免费体验</span>
        </div>
        <ChevronRight size={16} />
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>你可能需要</h2>
          <Button size="sm" variant="ghost" onClick={() => go('aiVideo')} {...bindInteraction('home-create-more', setActiveInteraction)}>去制作</Button>
        </div>
        <ChipScroller chips={groups} active="recommend" onChange={() => {}} {...bindInteraction('home-template-groups', setActiveInteraction)} />
        <div className="template-feed" {...bindElement('home-template-feed', setActiveInteraction)}>
          {templates.map((item, index) => (
            <TemplateCard
              key={item}
              title={item}
              video={index % 2 === 0}
              tone={index % 3}
              onClick={() => go('aiVideo', 'template')}
              {...bindInteraction(`home-template-${index + 1}`, setActiveInteraction)}
            />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>最近作品</h2>
          <button type="button" className="text-link" onClick={() => go('works')} {...bindInteraction('home-recent-more', setActiveInteraction)}>查看全部</button>
        </div>
        <div className="recent-row">
          {[0, 1, 2].map((item) => (
            <button type="button" key={item} className="recent-item" onClick={() => go('workDetail', item === 0 ? 'generating' : 'success')} {...bindInteraction(`home-recent-${item + 1}`, setActiveInteraction)}>
              <PlaceholderImage ratio="1 / 1" tone={item} video={item !== 1} />
            </button>
          ))}
          <button type="button" className="recent-item recent-upload" onClick={() => go('aiVideo')} {...bindInteraction('home-upload-shortcut', setActiveInteraction)}>
            <ImagePlus size={22} />
          </button>
        </div>
      </section>
    </section>
  );
}
