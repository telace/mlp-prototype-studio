import { Home, User, WandSparkles } from 'lucide-react';
import { bindInteraction } from '../../framework/interaction.js';

export default function TabBar({ active, setPage, setActiveState, setActiveInteraction }) {
  const tabs = [
    { id: 'sample', label: '示例', icon: Home },
    { id: 'sample', label: '创作', icon: WandSparkles },
    { id: 'sample', label: '我的', icon: User }
  ];
  return (
    <nav className="tabbar" {...bindInteraction('sample-tabs', setActiveInteraction)}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = active === tab.id && index === 0;
        return <button key={`${tab.label}-${index}`} className={isActive ? 'active' : ''} onClick={() => { setActiveState('default'); setPage(tab.id); }}><Icon size={21} />{tab.label}</button>;
      })}
    </nav>
  );
}

