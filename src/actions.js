export const change_found_summoners = 'update found summoners'
export const change_loading_status = 'update loading screen status'
export const change_summoner = 'update chosen summoner'
export const change_matchHistory = 'update match history'
export const change_errorMsg = 'change the error message'

export function updateFoundSummoners(data) {
    return {
        type: change_found_summoners,
        payload: data
    }
}

export function updateLoadingStatus(data) {
    return {
        type: change_loading_status,
        payload: data
    }
}

export function updateSummoner(data) {
    return {
        type: change_summoner,
        payload: data
    }
}

export function updateMatchHistory(data) {
    return {
        type: change_matchHistory,
        payload: data
    }
}

export function updateErrorMsg(data) {
    return {
        type: change_errorMsg,
        payload: data
    }
}
