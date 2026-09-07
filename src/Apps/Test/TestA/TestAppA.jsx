import './TestAppA.css';

export const appMetadata = {
  MenuIcon: 'A',
  MenuName: 'Test App A',
  AppName: 'TestAppA',
  Version: '1.0.0',
  AppUrl: '/test/a',
};

function TestAppA() {
  return <div className="app">A</div>;
}

export default TestAppA;