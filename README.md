This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Below you will find some information on how to perform common tasks.<br>
You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Table of Contents

- [Application][]
- [React Components][]
- [Folder Structure][]

## Application
    **The config file contains the api key, and port**
    ```javascript
    //config.js
    export const PORT = 3000
    export const apiKey = 'RGAPI-8a3c2622-23fc-46e0-93f4-8f680252d482'
    ```
    1. **First User Searches for a summoner**
    We make a request to this route with the `summoner name` as a query string
    ```javascript
    router.get('/summoner', async (req, res) => {
        let summonerName = req.query.name
        let summonersFound = await getSummonersAcrossRegion(summonerName)
        return res.send(JSON.stringify(summonersFound))
    })
    ```
    The router calls this function finding the possible summoners by region
    ```javascript
    async function getSummonersAcrossRegion(name) {
        let foundSummoners = []
        //check regions for possible summoners
        let region
        for(region in Regions) {
            let summoner = await getSummoner(name, Regions[region])
            if(summoner) foundSummoners.push(includeSummonerRegion(summoner, region))
        }
        return foundSummoners

    }
    ```
    Which in turn calls:
    ```javascript
    function getSummoner(name, region) {
        let url = `https://${region}.${Uri}/lol/summoner/v3/summoners/by-name/${name}`
        let options = {
            uri: url,
            qs: {
                api_key: apiKey
            },
            json: true
        }
        return rp(options)
        .catch(err => {
            //If user was not found return null
            if(err.statusCode === 404) return null
            //If error is not user was not found in region throw the error
            throw err
        })
    }
    ```
    2. **Select Summoner and Render match history**
        After the user has selected the summoner they would like to view, we send a request to this route with the `accountId region` as query strings.
        ```javascript
        router.get('/matchlist', async (req, res) => {
            let accountId = req.query.accountId
            let region = Regions[req.query.region]

            let gameHistoryIds = await getSummonerMatchHistoryIds(accountId, region)
            let matchHistory = await convertGameIdsToMatches(gameHistoryIds, region, accountId)
            return res.send(matchHistory)
        })
        ```

        First we get the summoners match history as ids
        ```javascript
        function getSummonerMatchHistoryIds(accountId, region) {
            let url = `https://${region}.${Uri}/lol/match/v3/matchlists/by-account/${accountId}/recent`
            let options = {
                uri: url,
                qs: {
                    api_key: apiKey
                },
                json: true
            }
            return rp(options)
            .then(res => {
                //only get the game ids
                return res.matches.reduce((acc, curr) => {
                    acc.push(curr.gameId)
                    return acc
                }, [])
            })
        }
        ```
        Then we convert the game ids to matches by making two batch requests of 10

        ```javascript
        async function convertGameIdsToMatches(gameIds, region, accountId) {
            let apiRequests = []
            //Due to rate limit split array into two, and make a delayed request
            let middle = Math.floor(gameIds.length / 2)
            let firstHalf = gameIds.slice(0, middle)
            let secondHalf = gameIds.slice(middle)

            //Delay function for await
            const timeout = ms => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        secondHalf.forEach(id => {
                            apiRequests.push(getMatch(id, region))
                        })
                        resolve()
                    }, ms)
                })
            }

            //First call
            firstHalf.forEach(id => {
                apiRequests.push(getMatch(id, region))
            })

            //Second call
            await timeout(1000)

            return Promise.all(apiRequests)
            .then(data => {
                return data
            })
        }
        ```
        In this block we map the data of match histories to include `champion spells items`
        ```javascript

        //function convertGameIdsToMatches
        return Promise.all(apiRequests)
        .then(data => {
            return data
            //return data.map(match => convertMatchData(match))
        })

        function convertMatchData(match, accountId) {
            /*
            participant.spell1 = findSpellById(participant.spell1Id)
            participant.spell2 = findSpellById(participant.spell2Id)
            participant.champion = findChampionById(participant.championId)

            let copy = JSON.stringify(match)
            console.log(copy.participants[participantId])
            return copy
            */
            let participantId = findParticipantId(match.participantIdentities, accountId)
            let participant = match.participants[participantId]

            participant.spell1 = findSpellById(participant.spell1Id)
            participant.spell2 = findSpellById(participant.spell2Id)
            participant.champion = findChampionById(participant.championId)

            return match
        }
        ```
## React Components


**Home/Landing page**
```jsx
import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actions'
import axios from 'axios'

import LoadingScreen from './loading_screen'

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.handleSummonerSearch = this.handleSummonerSearch.bind(this)
    }

    handleSummonerSearch(e) {
        let props = this.props
        e.preventDefault()
        let summonerName = e.target.name.value
        let url = `/summoner?name=${summonerName}`

        props.updateLoadingStatus({loading: true, loadingMsg: 'looking for summoner'})

        return axios.get(url)
        .then(res => {
            props.updateFoundSummoners(res.data)
            props.updateLoadingStatus({loading: false, loadingMsg: null})
            props.history.push('/summoner-list')
        })
        .catch(err => {
            console.log(err)
        })
    }

    render() {
        let props = this.props
        if(props.loading) return (
            <LoadingScreen msg={props.loadingMsg} />
        )

        return(
            <div className="Home">
                <div className="home-container">
                    <h2>Check your match history</h2>
                    <form action="#" className="summoner-search-form" onSubmit={this.handleSummonerSearch}>
                        <input type="text" name="name" placeholder="Summoner Name"/>
                        <input type="submit" value="Search"/>
                    </form>
                </div>
            </div>
        )

    }
}

function mapStateToProps(state) {
    return  {
        loadingMsg: state.loadingMsg,
        loading: state.loading
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateLoadingStatus: data => {
            dispatch(actions.updateLoadingStatus(data))
        },
        updateFoundSummoners: data => {
            dispatch(actions.updateFoundSummoners(data))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
```

**SummonerList**
```jsx
import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import * as actions from '../actions'

import Summoner from './summoner'

function SummonerList(props) {

    function handleChooseSummoner(summoner) {
        props.updateSummoner(summoner)
        props.updateLoadingStatus({loading: true, loadingMsg: 'Getting match history'})
    }

    return(
        <ul>
            {props.foundSummoners.map(summoner => {
                return(
                    <li>
                        <Link to={`/matchlist?accountId=${summoner.accountId}&region=${summoner.region}`} onClick={() => handleChooseSummoner(summoner)}>
                            <Summoner {...summoner}/>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}

function mapStateToProps(state) {
    return {
        loading: state.loading,
        loadingMsg: state.loadingMsg,
        foundSummoners: state.foundSummoners
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateSummoner: data => {
            dispatch(actions.updateSummoner(data))
        },
        updateLoadingStatus: data => {
            dispatch(actions.updateLoadingStatus(data))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SummonerList)
```

**Summoner**
```jsx
import React from 'react'

export default function Summoner(props) {
    return(
        <div className="Summoner">
            <h2>{props.name}</h2>
            <h2>{props.region}</h2>
            <h2>{props.level}</h2>
        </div>
    )
}
```

**match_list**
```jsx
import React from 'react'
import {connect} from 'react-redux'
import axios from 'axios'
import queryString from 'query-string'
import * as actions from '../actions'

import Match from './match'
import LoadingScreen from './loading_screen'

class MatchList extends React.Component {
    constructor(props) {
        super(props)
        this.getMatchHistory = this.getMatchHistory.bind(this)
        this.findParticipantId = this.findParticipantId.bind(this)
    }
    componentWillMount() {
        //check if summoner was already found if not search for summoner with accountId
        this.getMatchHistory()
    }

    render() {
        let props = this.props
        if(props.loading || !props.matchHistory) {
            return (
                <LoadingScreen msg={props.loadingMsg} />
            )
        }
        return (
            <div className="MatchList">
                <div className="summoner-info">
                    <h2>{`${props.summoner.name} ${props.summoner.summonerLevel}`}</h2>
                </div>
                <ul>
                    {props.matchHistory.map(match => {
                        let participantId = this.findParticipantId(match.participantIdentities)
                        return (
                            <li>
                                <Match match={match} participantId={participantId}/>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    getMatchHistory() {
        let props = this.props
        let parsed = queryString.parse(props.location.search)
        let url = `/matchlist?accountId=${parsed.accountId}&region=${parsed.region}`
        return axios.get(url)
        .then(res => {
            props.updateLoadingStatus({loading: false, loadingMsg: null})
            props.updateMatchHistory(res.data)
        })
        .catch(err => console.log(err))
    }

    findParticipantId(participantIdentities) {
        let props = this.props
        let participantId
        for(let i=0; i < participantIdentities.length; i++) {
            let part = participantIdentities[i]
            if(props.summoner.accountId === part.player.accountId) {
                participantId = part.participantId
                break
            }
        }
        //If participantId is not found throw an error
        return participantId
    }
}

function mapStateToProps(state) {
    return {
        loading: state.loading,
        loadingMsg: state.loadingMsg,
        matchHistory: state.matchHistory,
        summoner: state.summoner
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateLoadingStatus: data => {
            dispatch(actions.updateLoadingStatus(data))
        },
        updateMatchHistory: data => {
            dispatch(actions.updateMatchHistory(data))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MatchList)
```

**match**
```jsx
import React from 'react'
import {connect} from 'react-redux'
import axios from 'axios'
import parseMs from 'parse-ms'

class Match extends React.Component {
    constructor(props) {
        super(props)
        let participant = props.match.participants.find(part => part.participantId === props.participantId)
        let gameLength = parseMs(props.match.gameDuration)

        this.state = {
            participant: participant,
            match: props.match,
            gameLength: gameLength,
            champion: participant.championId,
            spell1: participant.spell1Id,
            spell2: participant.spell2Id,
            items: []
        }
        this.getSpell = this.getSpell.bind(this)
        this.getChampion = this.getChampion.bind(this)
        this.getAllSpells = this.getAllSpells.bind(this)
        this.getAllInfo = this.getAllInfo.bind(this)
    }

    componentDidMount() {
        //this.getAllInfo()
    }

    getAllInfo() {
        this.getAllSpells()
    }

    getSpell(id) {
        let url =`/spell?spellId=${id}`
        return axios.get(url)
        .then(res => res.data)
    }

    getAllSpells() {
        let spell1 = this.getSpell(this.state.participant.spell1Id)
        let spell2 = this.getSpell(this.state.participant.spell2Id)
        this.setState({...this.state}, spell1, spell2)
    }

    getChampion() {
        let url = `/champion?championId=${this.state.participant.championId}`
        return axios.get(url)
        .then(res => res.data)
    }

    getItems() {
    }

    render() {
        let match = this.state.match
        let gameLength = this.state.gameLength
        let champion = this.state.champion
        let participant = this.state.participant
        let stats = participant.stats
        let spell1 = this.state.spell1
        let spell2 = this.state.spell2

        return(
            <div className="Match">
            <div className="info-container">
            <h2>{match.gameMode}</h2>
            <h2>{`${gameLength.minutes}m ${gameLength.seconds}s`}</h2>

            {participant.stats.win ?
                <h2>Win</h2>
                : <h2>Lose</h2>
            }
            </div>

            <div className="info-container">
            <h2>{champion}</h2>
            <h2>{spell1}</h2>
            <h2>{spell2}</h2>
            </div>
            <div className="info-container">
            <h2>{stats.kills}</h2>
            <h2>{stats.deaths}</h2>
            <h2>{stats.assists}</h2>
            </div>
            <div className="info-container">
            <h2>{`Level ${stats.champLevel}`}</h2>
            <h2>{`${stats.totalMinionsKilled}`}</h2>
            <h2>{/* can't get game length cs/mins cs/0*/}</h2>
            </div>
            <div className="info-container"></div>
            </div>
            )
        }
    }

    function mapStateToProps(state) {
        return {
            summoner: state.summoner
        }
    }

    function mapDispatchToProps(dispatch) {
        return {
        }
    }

    export default connect(mapStateToProps, mapDispatchToProps)(Match)
    ```

    **LoadingScreen**
    ```jsx
    import React from 'react'

    export default function LoadingScreen(props) {
        return(
            <div className="Loading">
            <h2>Loading</h2>
            <h3>{props.msg}</h3>
            </div>
            )
        }
        ```

## Folder Structure
```
my-app/
  README.md
  routes.js
  server.js
  config.js
  node_modules/
  package.json
  public/
    index.html
    favicon.ico
  src/
    actions.js
    App.css
    App.js
    App.test.js
    index.css
    index.js
    logo.svg
    reducers.jsx
    store.jsx
    components/
      error_screen.jsx
      home.jsx
      loading_screen.jsx
      match_list.jsx
      summoner_list.jsx
      summoner.jsx

```
