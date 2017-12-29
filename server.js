import express from 'express'
const app = express()
import {PORT} from './config'
import router from './routes'
import path from 'path'

//Static folder
app.use(express.static(path.join(__dirname, 'build')))

//Routes
app.use(router)


var server
export default function runServer() {
    server = app.listen(PORT, () => {
        console.log(`App is listening on port: ${PORT}`)
    })
}

export function closeServer() {
    server.close()
}

//Runs server
if(require.main === module) runServer()
