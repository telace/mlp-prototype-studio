import { Home, Images, User } from 'lucide-react';
import { bindInteraction } from '../../framework/interaction.js';

export default function TabBar({ active, setPage, setActiveState, setActiveInteraction }) {
  const tabs = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'works', label: '作品', icon: Images },
    { id: 'profile', label: '我的', icon: User }
  ];
  return (
    <nav className="tabbar" {...bindInteraction('global-tabs', setActiveInteraction)}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return <button key={`${tab.label}-${index}`} className={isActive ? 'active' : ''} onClick={() => { setActiveState('default'); setPage(tab.id); }}><Icon size={21} />{tab.label}</button>;
      })}
    </nav>
  );
}
