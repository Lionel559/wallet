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
          borderColor:"#4ade80",
          borderWidth:1.5,
          backgroundColor:"rgba(74,222,128,0.06)",
          fill:true,
          pointRadius:0,
          tension:0.4
        }]
      },
      options:{
        responsive:true,
        plugins:{
          legend:{display:false}
        },
        scales:{
          x:{
            ticks:{color:"#4a4a44", font:{family:"'DM Mono', monospace", size:10}},
            grid:{color:"rgba(255,255,255,0.04)"},
            border:{display:false}
          },
          y:{
            ticks:{
              color:"#4a4a44",
              font:{family:"'DM Mono', monospace", size:10},
              callback: v => "$" + (v/1000).toFixed(0) + "k"
            },
            grid:{color:"rgba(255,255,255,0.04)"},
            border:{display:false}
          }
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

// PORTFOLIO CALCULATE
function calculatePortfolio(){
  const btc = parseFloat(document.getElementById("btcHoldings").value) || 0;
  const eth = parseFloat(document.getElementById("ethHoldings").value) || 0;
  const usdt = parseFloat(document.getElementById("usdtHoldings").value) || 0;
  const bnb = parseFloat(document.getElementById("bnbHoldings").value) || 0;
  const xrp = parseFloat(document.getElementById("xrpHoldings").value) || 0;

  const btcVal = btc * prices.bitcoin;
  const ethVal = eth * prices.ethereum;
  const usdtVal = usdt * prices.tether;
  const bnbVal = bnb * prices.binancecoin;
  const xrpVal = xrp * prices.ripple;
  const total = btcVal + ethVal + usdtVal + bnbVal + xrpVal;

  document.getElementById("btcValue").innerText = "BTC Value: $" + btcVal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById("ethValue").innerText = "ETH Value: $" + ethVal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById("usdtValue").innerText = "USDT Value: $" + usdtVal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById("bnbValue").innerText = "BNB Value: $" + bnbVal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById("xrpValue").innerText = "XRP Value: $" + xrpVal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById("totalValue").innerText = "Total Portfolio Value: $" + total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
}

// SAVE HOLDINGS
function saveHoldings(){
  const holdings = {
    btc: document.getElementById("btcHoldings").value,
    eth: document.getElementById("ethHoldings").value,
    usdt: document.getElementById("usdtHoldings").value,
    bnb: document.getElementById("bnbHoldings").value,
    xrp: document.getElementById("xrpHoldings").value,
  };
  localStorage.setItem("cryptoHoldings", JSON.stringify(holdings));
  const btn = document.getElementById("saveBtn");
  btn.innerText = "Saved!";
  setTimeout(() => btn.innerText = "Save Holdings", 2000);
}

// LOAD SAVED HOLDINGS ON START
function loadHoldings(){
  const saved = localStorage.getItem("cryptoHoldings");
  if(!saved) return;
  const h = JSON.parse(saved);
  document.getElementById("btcHoldings").value = h.btc || "";
  document.getElementById("ethHoldings").value = h.eth || "";
  document.getElementById("usdtHoldings").value = h.usdt || "";
  document.getElementById("bnbHoldings").value = h.bnb || "";
  document.getElementById("xrpHoldings").value = h.xrp || "";
}

document.getElementById("calculateBtn").addEventListener("click", calculatePortfolio);
document.getElementById("saveBtn").addEventListener("click", saveHoldings);
loadHoldings();
