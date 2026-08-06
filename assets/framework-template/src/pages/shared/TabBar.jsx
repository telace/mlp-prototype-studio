import { Home, Images, User } from 'lucide-react';
import { bindInteraction } from '../../framework/interaction.js';
import { BottomTabBar } from '../../prototype-ui/components/index.jsx';

export default function TabBar({ active, setPage, setActiveState, setActiveInteraction }) {
  const tabs = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'works', label: '作品', icon: Images },
    { id: 'profile', label: '我的', icon: User }
  ];
  return <BottomTabBar className="tabbar" tabs={tabs} active={active} onChange={(id) => { setActiveState('default'); setPage(id); }} {...bindInteraction('global-tabs', setActiveInteraction)} />;
}
