import { RandomPickerWheelProvider } from './State/RandomPickerWheelContext';
import SectionList from './Components/SectionList';
import Wheel from './Components/Wheel';
import './RandomPickerWheel.css';

export const appMetadata = {
  AppId: 'random-picker-wheel',
  MenuIcon: '🎡',
  MenuName: 'Glücksrad',
  AppName: 'Glücksrad',
  AppUrl: '/random-picker-wheel',
};

function RandomPickerWheel() {
  return (
    <RandomPickerWheelProvider>
      <div className="randomPickerWheel">
        <div className="wheelLayout">
          <Wheel />
          <SectionList />
        </div>
      </div>
    </RandomPickerWheelProvider>
  );
}

export default RandomPickerWheel;
