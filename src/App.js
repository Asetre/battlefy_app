import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom'
import './App.css';

import {Provider} from 'react-redux'
import store from './store'

//Components
import Home from './components/home'
import SummonerList from './components/summoner_list'
import MatchList from './components/match_list'
import ErrorScreen from './components/error_screen'
import ChangeKey from './components/change_key'

class App extends Component {
  render() {
    return (
        <Provider store={store}>
            <Router>
                <div className="App">
                    <Route exact path="/" render={props => <Home {...props}/>} />
                    <Route exact path="/summoner-list" render={props => <SummonerList {...props}/>} />
                    <Route exact path="/matchlist" component={MatchList}/>
                    <Route exact path="/error" render={props => <ErrorScreen {...props}/>} />
                    <Route exact path='/change-key' render={props => <ChangeKey {...props} />} />
                </div>
            </Router>
        </Provider>
    );
  }
}

export default App;
