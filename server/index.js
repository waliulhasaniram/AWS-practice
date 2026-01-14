const express = require('express')
const app = express()
const port = 3200

const cors = require('cors')

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], // your frontend url
    optionsSuccessStatus: 200,
    credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())

app.get('/get-presigned-url', (req, res) => {
    // get the presigned URL logic here from s3

    res.json({ url: '' })
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
