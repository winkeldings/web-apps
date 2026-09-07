import './TestAppB.css';

export const appMetadata = {
  AppId: 'test-app-b',
  MenuIcon: 'B',
  MenuName: 'Test App B',
  AppName: 'TestAppB',
  Version: '1.0.0',
  AppUrl: '/test/b',
};

function TestAppB() {
  return <div className="app">B</div>;
}

export default TestAppB;