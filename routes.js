import {apiKey} from './config'
import rp from 'request-promise-native'
import express from 'express'
import path from 'path'
import {Spells, Champions} from './config'

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
        return data
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
}

function findSpellById(id) {
    let spellToReturn
    let spell
    for(spell in Spells) {
        if(Spells[spell].id == id) {
            spellToReturn = Spells[spell]
            break
        }
    }
    return spellToReturn
}

function findChampionById(id) {
    let champToReturn
    let champ
    for(champ in Champions) {
        if(Champions[champ].id == id) {
            champToReturn = Champions[champ]
            break
        }
    }
    return champToReturn
}

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

function findParticipantId(participantIdentities, accountId) {
    return participantIdentities.find(part => part.player.accountId == accountId).participantId
}
/*--------------------------------
Routes
--------------------------------*/

router.get('/summoner', async (req, res) => {
    let summonerName = req.query.name
    let summonersFound = await getSummonersAcrossRegion(summonerName)
    return res.send(JSON.stringify(summonersFound))
})

router.get('/matchlist', async (req, res) => {
    let accountId = req.query.accountId
    let region = Regions[req.query.region]

    //retrieve the summoners match history as ids
    let gameHistoryIds = await getSummonerMatchHistoryIds(accountId, region)
    //convert each id into match data
    let matchHistory = await convertGameIdsToMatches(gameHistoryIds, region, accountId)
    return res.send(matchHistory)
})

router.get('/spell', (req, res) => {
    let spellId = req.query.spellId
    return res.send(findSpellById(spellId))
})

router.get('/champion', (req, res) => {
    let championId = req.query.championId
    return res.send(findChampionById(championId))
})

//React app
router.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
