const connectBtn = document.getElementById("connectWallet");
const refreshBtn = document.getElementById("refreshBtn");

const addressText = document.getElementById("walletAddress");
const balanceText = document.getElementById("balance");
const lastUpdatedText = document.getElementById("lastUpdated");
const marketStatusText = document.getElementById("marketStatus");

const btcPriceText = document.getElementById("btcPrice");
const ethPriceText = document.getElementById("ethPrice");
const usdtPriceText = document.getElementById("usdtPrice");
const bnbPriceText = document.getElementById("bnbPrice");
const xrpPriceText = document.getElementById("xrpPrice");

let prices = {
  bitcoin: 0,
  ethereum: 0,
  tether: 0,
  binancecoin: 0,
  ripple: 0
};

let previousPrices = {};
let btcChartInstance = null;



// WALLET CONNECT
async function connectWallet() {

  if (!window.ethereum) {
    alert("MetaMask or Trust Wallet not detected");
    return;
  }

  try {

    const web3 = new Web3(window.ethereum);

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const account = accounts[0];

    addressText.innerText =
      "Connected: " +
      account.slice(0,6) +
      "..." +
      account.slice(-4);

    const balanceWei = await web3.eth.getBalance(account);
    const balanceEth = web3.utils.fromWei(balanceWei,"ether");

    balanceText.innerText =
      "Balance: " +
      Number(balanceEth).toFixed(4) +
      " ETH";

  } catch(error) {
    console.log(error);
  }

}



// PRICE COLORS
function setPriceText(element,currentPrice,previousPrice){

  element.innerText = "$" + currentPrice;

  element.classList.remove("price-up","price-down");

  if(previousPrice !== undefined){

    if(currentPrice > previousPrice){
      element.classList.add("price-up");
    }

    if(currentPrice < previousPrice){
      element.classList.add("price-down");
    }

  }

}



// FETCH CRYPTO PRICES
async function getPrices(){

  try{

    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,ripple&vs_currencies=usd"
    );

    const data = await res.json();

    previousPrices = {...prices};

    prices = {
      bitcoin:data.bitcoin.usd,
      ethereum:data.ethereum.usd,
      tether:data.tether.usd,
      binancecoin:data.binancecoin.usd,
      ripple:data.ripple.usd
    };

    setPriceText(btcPriceText,prices.bitcoin,previousPrices.bitcoin);
    setPriceText(ethPriceText,prices.ethereum,previousPrices.ethereum);
    setPriceText(usdtPriceText,prices.tether,previousPrices.tether);
    setPriceText(bnbPriceText,prices.binancecoin,previousPrices.binancecoin);
    setPriceText(xrpPriceText,prices.ripple,previousPrices.ripple);

    const now = new Date();
    lastUpdatedText.innerText = "Last updated: " + now.toLocaleTimeString();
    marketStatusText.innerText = "Market data loaded";

  }catch(err){

    console.log(err);
    marketStatusText.innerText = "Failed to load prices";

  }

}



// BITCOIN CHART
async function loadChart(){

  try{

    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
    );

    const data = await res.json();

    const labels = data.prices.map(p => {
      const date = new Date(p[0]);
      return (date.getMonth()+1)+"/"+date.getDate();
    });

    const prices = data.prices.map(p => p[1]);

    const ctx = document.getElementById("btcChart").getContext("2d");

    btcChartInstance = new Chart(ctx,{
      type:"line",
      data:{
        labels:labels,
        datasets:[{
          label:"Bitcoin Price",
          data:prices,
          borderColor:"#f59e0b",
          backgroundColor:"rgba(245,158,11,0.2)",
          fill:true
        }]
      },
      options:{
        responsive:true,
        plugins:{
          legend:{
            labels:{color:"white"}
          }
        },
        scales:{
          x:{ticks:{color:"white"}},
          y:{ticks:{color:"white"}}
        }
      }
    });

  }catch(err){
    console.log(err);
  }

}



// EVENTS
connectBtn.addEventListener("click",connectWallet);
refreshBtn.addEventListener("click",getPrices);



// INIT
getPrices();
loadChart();
setInterval(getPrices,15000);