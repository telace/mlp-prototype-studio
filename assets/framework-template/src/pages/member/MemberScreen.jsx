import { Check, Clock, Crown, ShieldCheck } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { Button, Modal, SegmentedControl } from '../../prototype-ui/components/index.jsx';

const benefits = ['高清无水印导出', '会员模板不限量', '生成排队加速', '每月赠送积分'];

export default function MemberScreen({ activeState, setActiveState, setActiveInteraction }) {
  const platform = activeState === 'ios' ? 'ios' : 'android';
  const retention = activeState === 'retention';
  const countdown = activeState === 'countdown';

  return (
    <section className="app-page member-screen">
      <section className="member-visual" {...bindElement('member-hero', setActiveInteraction)}>
        <Crown size={34} />
        <span>{platform === 'ios' ? 'App Store 订阅' : '会员订阅'}</span>
        <strong>3 天免费试用</strong>
        <em>{platform === 'ios' ? '通过 Apple 购买，可恢复购买' : '支持支付宝 / 微信支付，需同意协议'}</em>
      </section>
      <SegmentedControl
        options={[{ value: 'android', label: 'Android' }, { value: 'ios', label: 'iOS' }]}
        value={platform}
        onChange={(value) => setActiveState(value)}
        {...bindInteraction('member-platform-switch', setActiveInteraction)}
      />
      <section className="benefit-list" {...bindElement('member-benefits', setActiveInteraction)}>
        {benefits.map((item) => <article key={item}><Check size={16} /><span>{item}</span></article>)}
      </section>
      <section className="plan-list" {...bindInteraction('member-plan-list', setActiveInteraction)}>
        <button type="button" className="selected"><strong>连续包月</strong><span>¥28.00 / 月</span></button>
        <button type="button"><strong>连续包年</strong><span>¥198.00 / 年</span></button>
      </section>
      {platform === 'android' ? (
        <label className="agreement-row" {...bindInteraction('member-agreement', setActiveInteraction)}>
          <input type="checkbox" />
          <span>同意《会员协议》《续费协议》</span>
        </label>
      ) : (
        <article className="ios-note" {...bindElement('member-ios-note', setActiveInteraction)}><ShieldCheck size={16} />支持首周优惠、恢复购买和 App Store 订阅提醒</article>
      )}
      <footer className="bottom-actions single">
        <Button block onClick={() => setActiveState(countdown ? platform : 'countdown')} {...bindInteraction('member-pay-button', setActiveInteraction)}>
          3 天免费试用
        </Button>
        <button type="button" className="text-link" onClick={() => setActiveState('retention')} {...bindInteraction('member-leave', setActiveInteraction)}>暂不开通</button>
      </footer>
      <Modal
        open={retention}
        title="确认离开？"
        description="离开后本次限时优惠会保留 10 分钟，可稍后继续开通。"
        onClose={() => setActiveState(platform)}
        actions={<><Button block variant="ghost" onClick={() => setActiveState(platform)}>离开</Button><Button block onClick={() => setActiveState('countdown')}>继续查看</Button></>}
      />
      <Modal
        open={countdown}
        title="限时优惠"
        description="10:00 内完成开通，可保留当前试用权益。"
        onClose={() => setActiveState(platform)}
        actions={<Button block onClick={() => setActiveState(platform)} icon={<Clock size={16} />}>继续支付</Button>}
      />
    </section>
  );
}
