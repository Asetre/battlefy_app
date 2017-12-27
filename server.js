import express from 'express'
const app = express()
import {PORT} from './config'
import router from './routes'
import path from 'path'

//Static folder
app.use(express.static(path.join(__dirname, 'build')))
//Temporary static folder for dev
app.use(express.static(path.join(__dirname, 'src')))

//Routes
app.use(router)

app.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`)
})
