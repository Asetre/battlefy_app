import * as actions from './actions'

var initialState = {
    summoner: null,
    foundSummoners: null,
    matchHistory: null,
    loadingMsg: null,
    loading: false,
    errorMsg: null
}

export default function matchApp(state=initialState, action) {
    let payload = action.payload
    switch (action.type) {

        case actions.change_loading_status:
        return {...state, ...payload}

        case actions.change_found_summoners:
        return {...state, foundSummoners: payload}

        case actions.change_summoner:
        return {...state, summoner: payload}

        case actions.change_matchHistory:
        return {...state, matchHistory: payload}

        case actions.change_errorMsg:
        return {...state, errorMsg: payload}

        default:
        return state
    }
}
