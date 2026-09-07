import Home, { appMetadata as homeMetadata } from './Home/Home';
import TestAppA, { appMetadata as testAppAMetadata } from './Test/TestA/TestAppA';
import TestAppB, { appMetadata as testAppBMetadata } from './Test/TestB/TestAppB';

const homeApp = { ...homeMetadata, Component: Home };

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

const apps = [homeApp, ...appGroups.flatMap((group) => group.apps)];

export { appGroups, apps, homeApp };