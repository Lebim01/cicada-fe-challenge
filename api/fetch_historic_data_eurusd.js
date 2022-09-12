const { fetch } = require('./fetch_historic_data')
const fs = require("fs")

fetch("EUR", "USD").then((data) => {
  fs.writeFileSync("./dummy/EURUSD.json", JSON.stringify(data))
})