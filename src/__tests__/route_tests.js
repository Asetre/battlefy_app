import rp from 'request-promise-native'
import runServer, {closeServer} from '../../server'

function findSummonerByName(summonerName) {
    let options = {
        uri: `http://localhost:3000/summoner?name=${summonerName}`,
        json: true
    }

    return rp(options)
}

describe('Route tests', () => {
    beforeAll(() => {
        runServer()
    })
    afterAll(() => {
        closeServer()
    })

    it('Finds Summoners across regions', () => {
        let summonerName = 'BFY Meowington'
        return findSummonerByName(summonerName)
        .then(res => expect(res).toMatchSnapshot())
    })

    it('Gets summoner match history', () => {
        let accountId = '215942119'
        let region = 'NA'

        let options = {
            uri: `http://localhost:3000/matchlist?accountId=${accountId}&region=${region}`,
            json: true
        }

        return rp(options)
        .then(res => {
            expect(res).toMatchSnapshot()
        })
    })

    it('Should throw an error finding the summoner', () => {
        let summonerName = 'BFY Meowington'
        let apiRequests = []
        for(let i=0; i<30; i++) {
            apiRequests.push(findSummonerByName(summonerName))
        }

        Promise.all(apiRequests)
        .then(data => {
            if(data) throw new Error()
        })
        .catch(err => {
            expect(err).toMatchSnapshot()
        })
    })
})
