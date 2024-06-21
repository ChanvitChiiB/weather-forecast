const cors = require("cors");
const Influx = require("influx");
const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

const weather = {};

const influx = new Influx.InfluxDB({
  host: process.env.INFLUXDB_URL,
  port: Number(process.env.INFLUXDB_PORT),
  database: process.env.INFLUXDB_DATABASE,
});

app.post("/api/data", (req, res) => {
  const data = req.body;
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      const number = parseFloat(value.match(/[0-9.]+/)[0]);
      weather[key] = number;
    }
  }
  res.send("Done").status(200);
  sendDataToInfluxDB();
});

app.listen(5100, () => {
  console.log("Server is running on port 5100");
});

async function sendDataToInfluxDB() {
  try {
    await influx.writePoints([
      {
        measurement: "weather",
        fields: {
          temperature: weather.temp,
          humidity: weather.humidity,
          dew_point: weather.dew_point,
          pressure: weather.pressure,
          uv_index: weather.uv_index,
          wind: weather.wind,
          visibility: weather.visibility,
        },
      },
      {
        measurement: "pollution",
        fields: {
          pm10: weather.pm10,
          pm25: weather.pm25,
          o3: weather.o3,
          no2: weather.no2,
          so2: weather.so2,
          co: weather.co,
        },
      },
    ]);
    console.log("Data sent successfully");
  } catch (error) {
    console.error("Error sending data:", error);
  }
}
