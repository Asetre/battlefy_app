import {apiKey} from './config'
import rp from 'request-promise-native'
import express from 'express'
import path from 'path'
import {Regions, Uri} from './config'
import Spells from './spells'
import Champions from './champions'
import Items from './items'

const router = express.Router()

/*--------------------------------
    Custom Errors
--------------------------------*/
class SummonerError extends Error {
    constructor(msg) {
        super()
        this.message = msg
        this.name = 'Summoner Error'
        this.status_code = 503
    }
}

class MatchError extends Error {
    constructor(msg) {
        super()
        this.message = msg
        this.name = 'Match Error'
        this.status_code = 503
    }
}

/*--------------------------------
    Functions
--------------------------------*/
function includeSummonerRegion(summoner, region) {
    return {
        ...summoner,
        region: region
    }
}

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
        throw new SummonerError('There was a problem fetching data from the api')
    })
}

async function getSummonersAcrossRegion(name) {
    let foundSummoners = []
    //check regions for possible summoners
    let region
    //search through the regions for the summoner
    for(region in Regions) {
        let summoner = await getSummoner(name, Regions[region])
        //include the region with the summoner
        if(summoner) foundSummoners.push(includeSummonerRegion(summoner, region))
    }
    return foundSummoners

}

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
    .catch(err => {
        throw new MatchError('Failed to get match history Ids from api')
    })
}

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

    //return data after it has been fetched
    return Promise.all(apiRequests)
    .then(data => {
        //If match history array is empty throw an error
        if(data.length === 0) throw new MatchError('No match history found')
        //Convert the matches to include spells, items and champion
        return data.map(match => {
            return convertMatchData(match, accountId)
        })
    })
}

function getMatch(gameId, region) {
    let url = `https://${region}.${Uri}/lol/match/v3/matches/${gameId}`
    let options = {
        uri: url,
        qs: {
            api_key: apiKey
        },
        json: true
    }
    return rp(options)
    .catch(err => {
        //Not sure why we are getting a 429 error
    })
}

function findSpellById(id) {
    let spell
    for(spell in Spells) {
        if(Spells[spell].id == id) return Spells[spell]
    }
}

function findChampionById(id) {
    let champ
    for(champ in Champions) {
        if(Champions[champ].id == id) {
            return Champions[champ]
        }
    }
}

function findParticipantItems(stats) {
    //Filter stats keys to only items ~> convert item ids to items
    return Object.keys(stats).filter(key => key.match(/item[0-7]/g)).map(key => {
        let itemId = stats[key]
        return Items[itemId]
    })
}


function convertMatchData(match, accountId) {
    let participantId = findParticipantId(match.participantIdentities, accountId)
    let participant = match.participants[participantId -1]

    participant.champion = findChampionById(participant.championId)
    participant.spell1 = findSpellById(participant.spell1Id)
    participant.spell2 = findSpellById(participant.spell2Id)
    participant.items = findParticipantItems(participant.stats)

    return match
}

function findParticipantId(participantIdentities, accountId) {
    return participantIdentities.find(participant => participant.player.accountId == accountId).participantId
}
/*--------------------------------
Routes
--------------------------------*/

//Find summoner across regions
router.get('/summoner', async (req, res) => {
    try {
        let summonerName = req.query.name
        let summonersFound = await getSummonersAcrossRegion(summonerName)
        return res.send(JSON.stringify(summonersFound))
    }catch(err) {
        //If error was a SummonerError
        if(err.name === 'Summoner Error') {
            return res.status(err.status_code).send(err)
        }
        //Server error
        return res.status(500).send('Internal Server Error')
    }
})

//Find summoner match history
router.get('/matchlist', async (req, res) => {
    try {
        let accountId = req.query.accountId
        let region = Regions[req.query.region]

        //retrieve the summoners match history as ids
        let gameHistoryIds = await getSummonerMatchHistoryIds(accountId, region)
        //convert each id into match data
        let matchHistory = await convertGameIdsToMatches(gameHistoryIds, region, accountId)
        return res.send(matchHistory)
    }catch(err) {
        //If error was a Matcherror
        if(err.name == 'Match Error') {
            return res.status(err.status_code).send(err)
        }
        //Server error
        return res.status(500).send('Internal Server Error')
    }
})

router.get('/account', async (req, res) => {
    let accountId = req.query.accountId
    let region = req.query.region
    let url = `https://${Regions[region]}.${Uri}/lol/summoner/v3/summoners/by-account/${accountId}`
    let options = {
        uri: url,
        qs: {
            api_key: apiKey
        },
        json: true
    }

    await rp(options)
    .then(data => {
        return res.send(includeSummonerRegion(data))
    })
    .catch(err => {
        throw new SummonerError('Failed to get summoner')
    })
    .catch(err => {
        //If SummonerError
        if(err.name === 'Summoner Error') return res.status(err.status_code).send(err)
        //Server error
        return res.status(500).send('Internal server error')
    })
})

//React app
router.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

export default router
