import { Coins, ReceiptText } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { Button, Modal } from '../../prototype-ui/components/index.jsx';

const packages = ['600 积分', '1800 积分', '5000 积分'];

export default function CreditsScreen({ activeState, setActiveState, setActiveInteraction }) {
  return (
    <section className="app-page credits-screen">
      <section className="balance-card" {...bindElement('credits-balance', setActiveInteraction)}>
        <Coins size={28} />
        <span>当前积分</span>
        <strong>1,280</strong>
        <em>用于 AI 视频、高清导出等功能消耗</em>
      </section>
      <section className="home-section">
        <div className="section-head"><h2>充值积分</h2></div>
        <div className="package-grid">
          {packages.map((item, index) => (
            <button type="button" key={item} className={index === 1 ? 'selected' : ''} {...bindInteraction(`credits-package-${index + 1}`, setActiveInteraction)}>
              <strong>{item}</strong>
              <span>¥{[6, 18, 45][index]}.00</span>
            </button>
          ))}
        </div>
        <Button block onClick={() => setActiveState('paying')} {...bindInteraction('credits-pay-button', setActiveInteraction)}>确认充值</Button>
      </section>
      <section className="home-section">
        <div className="section-head"><h2>积分历史</h2></div>
        <div className="history-list" {...bindElement('credits-history', setActiveInteraction)}>
          {['AI 视频生成 -20', '充值到账 +1800', '高清导出 -10'].map((item) => (
            <article key={item}><ReceiptText size={16} /><span>{item}</span><em>06-29</em></article>
          ))}
        </div>
      </section>
      <Modal
        open={activeState === 'paying'}
        title="确认充值"
        description="充值成功后积分实时到账，可在积分历史中查看记录。"
        onClose={() => setActiveState('default')}
        actions={<Button block onClick={() => setActiveState('default')}>完成支付</Button>}
      />
    </section>
  );
}
