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
        if(!this.props.summoner) {
            let parsed = queryString.parse(this.props.location.search)
            let url = `/account?accountId=${parsed.accountId}&region=${parsed.region}`
            return axios.get(url)
            .then(res => {
                this.props.updateSummoner(res.data)
            })
            .then(() => {
                this.getMatchHistory()
            })
        }else this.getMatchHistory()
    }

    render() {
        let props = this.props
        if(props.loading || !props.matchHistory || !props.summoner) {
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
    getSummoner(accountId) {
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
        },
        updateSummoner: data => {
            dispatch(actions.updateSummoner(data))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MatchList)
