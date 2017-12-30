import React from 'react';
import ReactDOM from 'react-dom';
import reducers from './reducers'
import { shallow, mount } from 'enzyme'


///components
import App from './App';
import Home from './components/home'

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
