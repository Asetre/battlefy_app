import React from 'react'
import {connect} from 'react-redux'

function Match(props) {
    let match = props.match
    let gameLength = match.gameDuration / 60
    let participant = match.participants[props.participantId -1]
    let stats = participant.stats
    let champion = participant.champion
    let spell1 = participant.spell1
    let spell2 = participant.spell2
    let items = participant.items

    return(
        <div className="Match">
            <div className="info-container">
                <h2>{match.gameMode}</h2>
                <h2>{`${gameLength.toFixed()}mins`}</h2>

                {participant.stats.win ?
                    <h2>Win</h2>
                    : <h2>Lose</h2>
                }
            </div>

            <div className="info-container">
                <h2>{champion.name}</h2>
                <h2>{spell1.name}</h2>
                <h2>{spell2.name}</h2>
            </div>
            <div className="info-container">
                <h2>{stats.kills}</h2>
                <h2>{stats.deaths}</h2>
                <h2>{stats.assists}</h2>
            </div>
            <div className="info-container">
                <h2>{`Level ${stats.champLevel}`}</h2>
                <h2>{`${stats.totalMinionsKilled}`}</h2>
                <h2>{`${(stats.totalMinionsKilled / gameLength).toFixed()}/min`}</h2>
            </div>
            <div className="info-container">
                <ul>
                    {items.map(item => {
                        if(item) {
                            return(
                                <li>
                                    <h3>{item.name}</h3>
                                </li>
                            )
                        }
                    })}
                </ul>
            </div>
        </div>
    )
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
