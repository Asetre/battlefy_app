import React from 'react'
import {connect} from 'react-redux'
import axios from 'axios'
import parseMs from 'parse-ms'

class Match extends React.Component {
    constructor(props) {
        super(props)
        let participant = props.match.participants.find(part => part.participantId === props.participantId)
        let gameLength = parseMs(props.match.gameDuration)
        console.log(props.match.gameDuration)
        /*
        let spell1 = await this.getSpell(participant.spell1Id)
        let spell2 = await this.getSpell(participant.spell2Id)
        */

        this.state = {
            participant: participant,
            match: props.match,
            gameLength: gameLength,
            champion: participant.championId,
            spell1: participant.spell1Id,
            spel2: participant.spell2Id,
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
                    {champion ?
                        <h2>{champion.name}</h2>
                        : <h2>Loading</h2>}
                        {spell1 ?
                            <h2>{spell1.name}</h2>
                            : <h2>Loading</h2>}
                            {spell2 ?
                                <h2>{spell2.name}</h2>
                                : <h2>Loading</h2>}
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
