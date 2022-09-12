const { fetch } = require('./fetch_historic_data')
const fs = require("fs")

fetch("USD", "MXN").then((data) => {
  fs.writeFileSync("./dummy/USDMXN.json", JSON.stringify(data))
})