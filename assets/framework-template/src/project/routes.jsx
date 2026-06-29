import {
  AiVideoScreen,
  ComponentLibraryScreen,
  CreditsScreen,
  HomeScreen,
  MemberScreen,
  ProfileScreen,
  WorkDetailScreen,
  WorksScreen
} from '../pages/index.js';

export function renderPhoneScreen({ page, activeState, setPage, setActiveState, setActiveInteraction }) {
  switch (page) {
    case 'components':
      return <ComponentLibraryScreen setActiveInteraction={setActiveInteraction} />;
    case 'profile':
      return <ProfileScreen activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
    case 'works':
      return <WorksScreen activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
    case 'member':
      return <MemberScreen activeState={activeState} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
    case 'credits':
      return <CreditsScreen activeState={activeState} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
    case 'aiVideo':
      return <AiVideoScreen activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
    case 'workDetail':
      return <WorkDetailScreen activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
    case 'home':
    default:
      return <HomeScreen activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
  }
}
