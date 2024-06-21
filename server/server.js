const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

let dataInflux;
let query;

async function concatData() {
  let dataInflux_1 = [],
    dataInflux_3 = [],
    status = false;
  await dataInflux.forEach((element, index) => {
    if (status) {
      return;
    }
    if (index === 0 && element[1] !== null) {
      return;
    } else if (element[1] !== null) {
      dataInflux_1 = dataInflux.slice(0, index - 1);
      status = true;
    }
  });
  status = false;
  dataInflux.reverse().forEach((element, index) => {
    if (status) {
      return;
    }
    if (index === 0 && element[1] !== null) {
      return;
    } else if (element[1] !== null) {
      const temp = dataInflux.length - index;
      dataInflux.reverse();
      dataInflux_3 = dataInflux.slice(temp, dataInflux.length);
      status = true;
    }
  });
  const dataInflux_2 = dataInflux.filter((element) => element[1] !== null);
  dataInflux_2.forEach((element) => {
    element[1] = element[1].toFixed(2);
    element[2] = element[2].toFixed(2);
    element[3] = element[3].toFixed(2);
    element[4] = element[4].toFixed(2);
    element[5] = element[5].toFixed(2);
    element[6] = element[6].toFixed(2);
    element[7] = element[7].toFixed(2);
  });
  dataInflux = dataInflux_1.concat(dataInflux_2, dataInflux_3);
}

function absoluteTime(interval) {
  const start = interval.split(" ")[0];
  const end = interval.split(" ")[1];
  const date1 = new Date(start);
  const date2 = new Date(end);

  const isSameYear = date1.getUTCFullYear() === date2.getUTCFullYear();
  const isSameMonth = date1.getUTCMonth() === date2.getUTCMonth();
  const isSameDate = date1.getUTCDate() === date2.getUTCDate();
  const isSameHour = date1.getUTCHours() === date2.getUTCHours();

  let time = 0;

  if (isSameYear && isSameMonth && isSameDate && isSameHour) {
    time = Math.abs(date2.getUTCMinutes() - date1.getUTCMinutes()) * 167;
  } else if (isSameYear && isSameMonth && isSameDate) {
    time = Math.abs(date2.getUTCHours() - date1.getUTCHours()) * 10000 +
           Math.abs(date2.getUTCMinutes() - date1.getUTCMinutes()) * 166.67;
  } else if (isSameYear && isSameMonth) {
    time = Math.abs((date2.getUTCDate() - date1.getUTCDate()) * 24 +
           (date2.getUTCHours() - date1.getUTCHours())) * 10000 +
           Math.abs(date2.getUTCMinutes() - date1.getUTCMinutes()) * 166.67;
  } else if (isSameYear) {
    time = Math.abs((date2.getUTCMonth() - date1.getUTCMonth()) * 30 * 24 +
           (date2.getUTCDate() - date1.getUTCDate()) * 24 +
           (date2.getUTCHours() - date1.getUTCHours())) * 10000 +
           Math.abs(date2.getUTCMinutes() - date1.getUTCMinutes()) * 166.67;
  } else {
    time = Math.abs((date2.getUTCFullYear() - date1.getUTCFullYear()) * 365 * 24 +
           (date2.getUTCMonth() - date1.getUTCMonth()) * 30 * 24 +
           (date2.getUTCDate() - date1.getUTCDate()) * 24 +
           (date2.getUTCHours() - date1.getUTCHours())) * 10000 +
           Math.abs(date2.getUTCMinutes() - date1.getUTCMinutes()) * 166.67;
  }

  time = parseInt(time);

  query = `
      SELECT mean(*) 
      FROM "weather"
      WHERE time > '${start}'
        AND time < '${end}'
      GROUP BY time(${time}ms)
      FILL(null)
      `;
}

function reletiveTime(interval) {
  let group_by, multipy;
  if (interval[interval.length - 1] === "m") {
    group_by = interval[0] == "5" ? 833 : 2500;
    multipy = 1;
  } else if (interval[interval.length - 1] === "h") {
    group_by = 10000;
    multipy = Number(interval.slice(0, -1));
  }

  query = `
      SELECT mean(*) 
      FROM "weather"
      WHERE time > now() - ${interval}
        AND time < now()
      GROUP BY time(${group_by * multipy}ms)
      FILL(null)
      `;
}

async function callInfluxDB() {
  try {
    const response = await axios.get(
      `http://${process.env.INFLUXDB_URL}:${
        process.env.INFLUXDB_PORT
      }/query?db=${process.env.INFLUXDB_DATABASE}&q=${encodeURIComponent(
        query
      )}`
    );
    dataInflux = response.data.results[0].series[0].values;
    await concatData();
    return dataInflux;
  } catch (error) {
    return (dataInflux = []);
  }
}

app.post("/interval", async (req, res) => {
  try {
    if (req.body.interval.length <= 3) {
      reletiveTime(req.body.interval);
    } else {
      absoluteTime(req.body.interval);
    }
    const result = await callInfluxDB();
    console.log(result);
    res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    res.status(400).json({ message: "Error" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
