import ComponentLibraryScreen from '../pages/ComponentLibraryScreen.jsx';
import SampleScreen from '../pages/SampleScreen.jsx';
import SecondaryExampleScreen from '../pages/SecondaryExampleScreen.jsx';

export function renderPhoneScreen({ page, activeState, setPage, setActiveState, setActiveInteraction }) {
  switch (page) {
    case 'components':
      return <ComponentLibraryScreen setActiveInteraction={setActiveInteraction} />;
    case 'secondaryExample':
      return <SecondaryExampleScreen activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
    case 'sample':
    default:
      return <SampleScreen activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} />;
  }
}
