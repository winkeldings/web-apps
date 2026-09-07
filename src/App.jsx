import { BrowserRouter } from 'react-router-dom';
import Wireframe from './Wireframe/Wireframe';

function App() {
  const basename = import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <BrowserRouter basename={basename}>
      <Wireframe />
    </BrowserRouter>
  );
}

export default App;
