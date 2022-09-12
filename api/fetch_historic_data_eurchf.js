const { fetch } = require('./fetch_historic_data')
const fs = require("fs")

fetch("EUR", "CHF").then((data) => {
  fs.writeFileSync("./dummy/EURCHF.json", JSON.stringify(data))
})