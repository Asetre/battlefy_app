import rp from 'request-promise-native'
import runServer, {closeServer} from '../../server'

describe('Route tests', () => {
    beforeAll(() => {
        runServer()
    })
    afterAll(() => {
        closeServer()
    })

    it('Finds Summoners across regions', () => {
        let summonerName = 'BFY Meowington'
        let options = {
            uri: `http://localhost:3000/summoner?name=${summonerName}`,
            json: true
        }

        return rp(options)
        .then(res => {
            expect(res).toMatchSnapshot()
        })
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

})
