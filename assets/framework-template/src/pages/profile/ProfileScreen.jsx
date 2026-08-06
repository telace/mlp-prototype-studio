import { ChevronRight, Coins, Copy, Crown, Settings, UserRound } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { Button, EmptyState, PlaceholderImage, Pressable } from '../../prototype-ui/components/index.jsx';

export default function ProfileScreen({ activeState, setPage, setActiveState, setActiveInteraction }) {
  const loggedOut = activeState === 'loggedOut';
  const go = (page, state = 'default') => {
    setActiveState(state);
    setPage(page);
  };

  return (
    <section className="app-page profile-screen">
      <header className="profile-top">
        <Pressable className="settings-btn" {...bindInteraction('profile-settings', setActiveInteraction)}><Settings size={18} /></Pressable>
      </header>
      <section className="profile-user" {...bindInteraction('profile-user-card', setActiveInteraction)}>
        <div className="avatar"><UserRound size={26} /></div>
        <div>
          <strong>{loggedOut ? '未登录用户' : 'Mia'}</strong>
          <span>{loggedOut ? '登录后同步作品与积分' : 'ID 839204  ·  普通用户'}</span>
        </div>
        <Pressable className="copy-btn" {...bindInteraction('profile-copy-id', setActiveInteraction)}><Copy size={15} /></Pressable>
      </section>

      <Pressable className="member-card large" onClick={() => go('member', 'android')} {...bindInteraction('profile-member-card', setActiveInteraction)}>
        <div>
          <span>会员中心</span>
          <strong>解锁高清生成、批量处理与会员模板</strong>
          <em>首购可试用 3 天，权益以支付页配置为准</em>
        </div>
        <ChevronRight size={18} />
      </Pressable>

      <section className="profile-metrics">
        <Pressable onClick={() => go('credits')} {...bindInteraction('profile-credits-entry', setActiveInteraction)}>
          <Coins size={18} />
          <strong>积分中心</strong>
          <span>{loggedOut ? '登录后查看' : '剩余 1280'}</span>
        </Pressable>
        <Pressable onClick={() => go('works')} {...bindInteraction('profile-works-entry', setActiveInteraction)}>
          <Crown size={18} />
          <strong>作品列表</strong>
          <span>{loggedOut ? '暂无作品' : '36 个作品'}</span>
        </Pressable>
      </section>

      <section className="home-section">
        <div className="section-head"><h2>我的作品</h2></div>
        {loggedOut ? (
          <EmptyState title="登录后查看作品" description="作品、草稿和购买记录将跟随账号同步。" action={<Button size="sm" onClick={() => setActiveState('loggedIn')}>登录</Button>} />
        ) : (
          <div className="masonry-grid">
            {[0, 1, 2, 3].map((item) => (
              <Pressable key={item} onClick={() => go('workDetail', 'success')} {...bindInteraction(`profile-work-${item + 1}`, setActiveInteraction)}>
                <PlaceholderImage ratio={item % 2 ? '3 / 4' : '1 / 1'} tone={item % 3} video={item % 2 === 0} />
              </Pressable>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
