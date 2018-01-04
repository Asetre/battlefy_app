import React from 'react'
import {connect} from 'react-redux'
import * as actions from '../actions'
import axios from 'axios'
import {Link} from 'react-router-dom'

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
            //if error fetching data from api
            if(err.name === 'Summoner Error') {
                props.updateErrorMsg(err.message)
            }else {
                props.updateErrorMsg('Something went wrong')
            }
            return props.history.push('/error')
        })
    }

    render() {
        let props = this.props
        if(props.loading && !props.error) return (
            <LoadingScreen msg={props.loadingMsg} />
        )

        return(
            <div className="Home">
                <div className="home-container">
                    <h2>Check your match history</h2>
                    <Link to='/change-key' style={{color: 'white'}}>Change the current api key</Link>
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
        loading: state.loading,
        error: state.errorMsg
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateLoadingStatus: data => {
            dispatch(actions.updateLoadingStatus(data))
        },
        updateFoundSummoners: data => {
            dispatch(actions.updateFoundSummoners(data))
        },
        updateErrorMsg: data => {
            dispatch(actions.updateErrorMsg(data))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
