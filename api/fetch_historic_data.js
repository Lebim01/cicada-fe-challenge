const axios = require("axios");
const fs = require("fs")

const options = {
  method: 'GET',
  url: 'https://alpha-vantage.p.rapidapi.com/query',
  params: {
    from_symbol: 'EUR',
    function: 'FX_DAILY',
    to_symbol: 'USD',
    outputsize: 'compact',
    datatype: 'json'
  },
  headers: {
    'X-RapidAPI-Key': '5211ae4886msh599984862fd9053p1a5f32jsn4d86187ea1bd',
    'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
  }
};


function fetch(from, to){
  return new Promise((resolve, reject) => {
    options.params.from_symbol = from
    options.params.to_symbol = to

    axios.request(options).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      console.error(error);
      reject(error)
    });
  })
}

module.exports = {
  fetch
}