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
