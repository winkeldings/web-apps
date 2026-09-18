import Home, { appMetadata as homeMetadata } from './Home/Home';
import RandomPickerWheel, { appMetadata as randomPickerWheelMetadata } from './RandomPickerWheel/RandomPickerWheel';
import TestAppA, { appMetadata as testAppAMetadata } from './Test/TestA/TestAppA';
import TestAppB, { appMetadata as testAppBMetadata } from './Test/TestB/TestAppB';

const homeApp = { ...homeMetadata, Component: Home };
const randomPickerWheelApp = { ...randomPickerWheelMetadata, Component: RandomPickerWheel };

const topLevelApps = [homeApp, randomPickerWheelApp];

const appGroups = [
  {
    name: 'Test',
    icon: '⌘',
    apps: [
      { ...testAppAMetadata, Component: TestAppA },
      { ...testAppBMetadata, Component: TestAppB },
    ],
  },
];

const apps = [...topLevelApps, ...appGroups.flatMap((group) => group.apps)];

export { appGroups, apps, homeApp, topLevelApps };