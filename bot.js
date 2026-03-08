import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

import { initializeApp } from "firebase/app";
import {
getFirestore,
collection,
doc,
setDoc,
getDocs
} from "firebase/firestore";


// TELEGRAM CONFIG

const token = "8646935592:AAFFV3kTtLXXt0iLPfgvugIE9mjdQ1fvcy8";
const channelId = "-1003783195321";

const bot = new TelegramBot(token);


// FIREBASE CONFIG

const firebaseConfig = {
  apiKey: "AIzaSyD6voprtvighK-ZPX8NpZ8xUYWOFW2PeII",
  authDomain: "prediction-bot-19138.firebaseapp.com",
  projectId: "prediction-bot-19138",
  storageBucket: "prediction-bot-19138.firebasestorage.app",
  messagingSenderId: "1057783234759",
  appId: "1:1057783234759:web:3f1d85fa16b0fb3a58fee2",
  measurementId: "G-Q569JVQ9YY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// API HISTORY FETCH

async function fetchHistory(){

try{

const proxy =
"https://api.codetabs.com/v1/proxy?quest=" +
encodeURIComponent(
"https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageSize=10"
);

const res = await axios.get(proxy,{timeout:10000});

return res.data.data.list;

}catch(e){

console.log("API ERROR");

}

return null;

}


// SAVE HISTORY TO FIREBASE

async function saveHistory(list){

for(const r of list){

const period = String(r.issueNumber);

await setDoc(doc(db,"history",period),{

number:r.number,
period:period

});

}

}


// LOAD HISTORY FROM FIREBASE

async function loadHistory(){

const snap = await getDocs(collection(db,"history"));

let arr=[];

snap.forEach(d=>{

arr.push({
period:d.id,
number:d.data().number
});

});

arr.sort((a,b)=>b.period-a.period);

return arr;

}


// NUMBER ARRAY

function getNumbers(history){

return history.map(h=>h.number);

}


// PATTERN MATCH AI

function findPattern(numbers){

for(let match=9; match>=2; match--){

let pattern = numbers.slice(0,match).join(",");

for(let i=match;i<numbers.length;i++){

let test = numbers.slice(i,i+match).join(",");

if(pattern===test){

let prediction = numbers[i-1];

return {
match,
prediction
};

}

}

}

return null;

}


// BIG SMALL

function bigSmall(n){

if(n>=5) return "BIG";
else return "SMALL";

}


// MAIN BOT FUNCTION

async function runBot(){

const apiHistory = await fetchHistory();

if(!apiHistory) return;

await saveHistory(apiHistory);

const history = await loadHistory();

if(history.length<20) return;

const numbers = getNumbers(history);

const pattern = findPattern(numbers);

if(!pattern) return;

const predictionNumber = pattern.prediction;

const predictionBS = bigSmall(predictionNumber);

const msg = `ðŸ¤– AI PATTERN PREDICTION

Match Length : ${pattern.match}

Prediction Number : ${predictionNumber}

Prediction : ${predictionBS}

History Scan : ${history.length}
`;

await bot.sendMessage(channelId,msg);

}


// RUN EVERY 40 second

setInterval(runBot,4000);

console.log("BOT STARTED");
