import {apiKey} from './config'
import rp from 'request-promise-native'
import express from 'express'
import path from 'path'

const router = express.Router()

export default router

/*--------------------------------
    Config
--------------------------------*/
const Regions = {
    BR: 'br1',
    EUNE: 'eun1',
    EUW: 'euw1',
    JP: 'jp1',
    KR: 'kr',
    NA: 'na1',
    RU: 'ru'
}

const Uri = 'api.riotgames.com'

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
        throw err
    })
}

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

async function convertGameIdsToMatches(gameIds, region) {
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
    .then(data => data)
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
}
/*--------------------------------
    Routes
--------------------------------*/

router.get('/summoner', async (req, res) => {
    let summonerName = req.query.name
    let summonersFound = await getSummonersAcrossRegion(summonerName)
    res.send(JSON.stringify(summonersFound))
})

router.get('/matchlist', async (req, res) => {
    let accountId = req.query.accountId
    let region = Regions[req.query.region]

    let gameHistoryIds = await getSummonerMatchHistoryIds(accountId, region)
    let matchHistory = await convertGameIdsToMatches(gameHistoryIds, region)
    console.log(matchHistory)
})

//React app
//NOTEchange to build directory
router.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src'))
})
