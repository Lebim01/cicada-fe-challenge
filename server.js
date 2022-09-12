const express = require('express');
const cors = require('cors')
const fs = require('fs')
const app = express();
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
const { uuid } = require('uuidv4')
const { generateNewRandomPoint } = require('./historic_random_data')

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const subscriptions = {
  "EURUSD": [],
  "USDMXN": [],
  "CHFMXN": [],
  "EURCHF": []
}

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

const AVAILABLE_PAIRS = [
  {
    id: "EURUSD",
    label: "EUR-USD"
  },
  {
    id: "USDMXN",
    label: "USD-MXN"
  },
  {
    id: "CHFMXN",
    label: "CHF-MXN"
  },
  {
    id: "EURCHF",
    label: "EUR-CHF"
  }
]

app.use(cors())

server.listen(8000, () => {
  console.log("Running HTTP")
});

app.get("/pairs", function(req, res){
  res.send(AVAILABLE_PAIRS)
})

app.get("/historic-data/:id", function(req, res){
  const id = req.params.id
  try {
    if(!AVAILABLE_PAIRS.find(r => r.id == id)){
      throw new Error("Pair not found")
    }
    
    const filepath = `./dummy/${id}.json`

    if(!fs.existsSync(filepath)){
      throw new Error("Has not data")
    }

    res.send(fs.readFileSync(filepath))
  }
  catch(err){
    res.status(400).send(err.toString())
  }
})

wsServer.on("request", (request) =>{
  const connection = request.accept(null, request.origin);

  connection.id = uuid()

  connection.on("message", (message) => {
    const payload = JSON.parse(message.utf8Data)

    if(!["subscribe", "unsubscribe"].includes(payload.action)){
      connection.send("Unexpected Action")
      return;
    }

    if(!payload.pair){
      connection.send("Pair is required")
      return;
    }

    if(!AVAILABLE_PAIRS.find(r => r.id == payload.pair)){
      connection.send("Pair not found")
      return;
    }

    switch(payload.action){
      case "subscribe":
        if(!subscriptions[payload.pair].find(conn => conn.id == connection.id)){  
          subscriptions[payload.pair].push(connection)
          connection.send("Subscribed to " + payload.pair + " (every 3 seconds)")
          emitNewPoint(payload.pair, "initial-payload")
        }else{
          connection.send("Already subscribed to " + payload.pair + " you couldn't subscribe more than once for each pair")
        }
        return;
      case "unsubscribe":
        connection.send("Unsubscribed to " + payload.pair)
        const index = subscriptions[payload.pair].find(conn => conn.id == connection.id)
        if(index > -1) subscriptions[payload.pair].splice(index, 1)
        return;
      default:
        return;
    }
  });

  connection.on("close", (reasonCode, description) => {
    console.log("El cliente se desconecto");
    subscriptions.EURUSD = subscriptions.EURUSD.filter(conn => conn.id != connection.id)
    subscriptions.USDMXN = subscriptions.USDMXN.filter(conn => conn.id != connection.id)
    subscriptions.CHFMXN = subscriptions.CHFMXN.filter(conn => conn.id != connection.id)
    subscriptions.EURCHF = subscriptions.EURCHF.filter(conn => conn.id != connection.id)
  });

  const randomMinutesDisconnect = getRandomArbitrary(1, 3)
  setTimeout(() => connection.close(), randomMinutesDisconnect * 1000 * 60)
});

const emitNewPoint = (currency, message = "new-point") => {
  const point = generateNewRandomPoint(currency)

  subscriptions[currency].forEach((conn) => {
    conn.send(JSON.stringify({
      currency,
      detail: "current-exchange",
      message,
      point
    }))
  })
}

AVAILABLE_PAIRS.filter((pair) => pair.id != "CHFMXN").forEach((pair) => {
  setInterval(() => {
    emitNewPoint(pair.id)
  }, 3000)
})