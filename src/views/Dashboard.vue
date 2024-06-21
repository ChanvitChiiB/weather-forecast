<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" style="padding-top: 20px; padding-inline: 40px">
        <h2>Weather Forecast</h2>
        <p class="font-weight-light">{{ current_date }}</p>
      </v-col>
      <v-col cols="8" class="init-col">
        <div class="weather-card">
          <p class="status font-weight-light">{{ status }}</p>
          <div class="detail d-flex">
            <h1 style="font-size: 60px">{{ temp }}</h1>
            <v-divider vertical class="divider"></v-divider>
            <p class="text-body-1 mt-5">
              {{ time }} <br />
              <v-icon style="margin-left: -5px">mdi-map-marker</v-icon> Thailand
            </p>
          </div>
        </div>

        <div class="tab mt-3">
          <v-tabs
            v-model="tab"
            color="black"
            slider-color="black"
            slider-size="3"
          >
            <v-tab v-for="(element, index) in type" :key="index" class="mt-3">
              {{ element }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <div class="meteorological mt-1">
                <v-row no-gutters>
                  <v-col
                    cols="3"
                    v-for="(element, index) in meteorological"
                    :key="index"
                  >
                    <card
                      :title="element.title"
                      :value="element.value"
                      :icon="element.icon"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-tab-item>
            <v-tab-item>
              <div class="pollutants mt-1">
                <v-row no-gutters>
                  <v-col
                    cols="3"
                    v-for="(element, index) in pollutants"
                    :key="index"
                  >
                    <card
                      :title="element.title"
                      :value="element.value"
                      :icon="element.icon"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </div>
      </v-col>

      <v-divider vertical class="divider"></v-divider>

      <v-col cols="4" class="init-col">
        <div class="rain">
          <h2>Rain Forecast</h2>
          <rain_card
            style="margin-top: 20px"
            v-for="(element, index) in rain"
            :key="index"
            :time="element.time"
            :value="element.value"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import card from "@/components/card/card.vue";
import rain_card from "@/components/card/rain_card.vue";

export default {
  components: {
    card,
    rain_card,
  },

  created() {
    this.getWeather();
    // this.getAir();
    const date = new Date();
    this.time = this.calTime(date);
    this.current_date = this.calDate(date);

    this.intervalId = setInterval(() => {
      const date = new Date();
      this.time = this.calTime(date);
      this.current_date = this.calDate(date);
    }, 1000 * 60);
  },

  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  },

  data() {
    return {
      intervalId: null,
      tab: null,
      time: "",
      temp: 0,
      status: "",
      current_date: "",
      type: ["Meteorological", "Pollutants"],
      meteorological: [],
      rain: [],
      pollutants: [
        {
          title: "PM 2.5",
          value: "0",
          icon: "wu wu-64 wu-black wu-cloudy",
        },
        {
          title: "PM 10",
          value: "0",
          icon: "wu wu-64 wu-black wu-cloudy",
        },
        {
          title: "O₃",
          value: "0",
          icon: "wu wu-64 wu-black wu-cloudy",
        },
        {
          title: "NO₂",
          value: "0",
          icon: "wu wu-64 wu-black wu-cloudy",
        },
        {
          title: "SO₂",
          value: "0",
          icon: "wu wu-64 wu-black wu-cloudy",
        },
        {
          title: "CO",
          value: "0",
          icon: "wu wu-64 wu-black wu-cloudy",
        },
      ],
    };
  },
  methods: {
    async getAir() {
      const options = {
        method: "GET",
        url: "https://air-quality.p.rapidapi.com/history/airquality",
        params: {
          lon: `${String(process.env.VUE_APP_LON)}`,
          lat: `${String(process.env.VUE_APP_LAT)}`,
        },
        headers: {
          "x-rapidapi-key":
            "e2bb90784emsh9468ee1f6406c76p1a3d4bjsn627e421dc78d",
          "x-rapidapi-host": "air-quality.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        this.pollutants = [];
        this.pollutants.push(
          {
            title: "PM 2.5",
            value: `${response.data.data[0].pm25}`,
            icon: "wu wu-64 wu-black wu-cloudy",
          },
          {
            title: "PM 10",
            value: `${response.data.data[0].pm10}`,
            icon: "wu wu-64 wu-black wu-cloudy",
          },
          {
            title: "O₃",
            value: `${response.data.data[0].o3}`,
            icon: "wu wu-64 wu-black wu-cloudy",
          },
          {
            title: "NO₂",
            value: `${response.data.data[0].no2}`,
            icon: "wu wu-64 wu-black wu-cloudy",
          },
          {
            title: "SO₂",
            value: `${response.data.data[0].so2}`,
            icon: "wu wu-64 wu-black wu-cloudy",
          },
          {
            title: "CO",
            value: `${response.data.data[0].co}`,
            icon: "wu wu-64 wu-black wu-cloudy",
          }
        );
      } catch (error) {
        console.error(error);
      }
    },
    async getWeather() {
      const options = {
        method: "GET",
        url: "https://ai-weather-by-meteosource.p.rapidapi.com/hourly",
        params: {
          lat: `${String(process.env.VUE_APP_LAT)}`,
          lon: `${String(process.env.VUE_APP_LON)}`,
          timezone: "auto",
          language: "en",
          units: "auto",
        },
        headers: {
          "x-rapidapi-key": `${process.env.VUE_APP_RAPIDAPI_KEY}`,
          "x-rapidapi-host": `${process.env.VUE_APP_RAPIDAPI_HOST}`,
        },
      };

      try {
        const response = await axios.request(options);
        let count = 0;
        this.meteorological = [];
        this.rain = [];
        response.data.hourly.data.forEach((element) => {
          if (count == 0) {
            this.temp = `${element.feels_like}` + `°C`;
            this.status = element.summary;
            this.meteorological.push(
              {
                title: "Humidity",
                value: `${element.humidity}%`,
                icon: "wu wu-black wu-64 humudity",
              },
              {
                title: "Dew Point",
                value: `${element.dew_point}°C`,
                icon: "wu wu-black wu-64 dew-point",
              },
              {
                title: "Wind",
                value: `${element.wind.speed} km/h`,
                icon: "wu wu-black wu-64 wind",
              },
              {
                title: "Pressure",
                value: `${element.pressure} hPa`,
                icon: "wu wu-black wu-64 pressure",
              },
              {
                title: "Visibility",
                value: `${element.visibility} km`,
                icon: "wu wu-black wu-64 visibility",
              },
              {
                title: "UV Index",
                value: `${element.uv_index}`,
                icon: "wu wu-black wu-64 uv-index",
              }
            );
            this.sendData2influxdb();
          }
          if (count < 5) {
            const date = new Date(element.date);
            const timeString = this.calTime(date);

            this.rain.push({
              time: timeString,
              value: `${element.precipitation.total * 100}%`,
            });

            count += 1;
          }
        });
      } catch (error) {
        console.error(error);
      }
    },

    calTime(date) {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // ชั่วโมง 0 ควรจะเป็น 12

      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    },

    calDate(isoString) {
      const date = new Date(isoString);
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const day = weekdays[date.getDay()];
      const dayNumber = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const formattedDate = `${day} ${dayNumber}, ${month} ${year}`;
      return formattedDate;
    },
    sendData2influxdb() {
      axios
        .post("http://localhost:5100/api/data", {
          temp: this.temp,
          humidity: this.meteorological[0].value,
          dew_point: this.meteorological[1].value,
          wind: this.meteorological[2].value,
          pressure: this.meteorological[3].value,
          visibility: this.meteorological[4].value,
          uv_index: this.meteorological[5].value,
          pm25: this.pollutants[0].value,
          pm10: this.pollutants[1].value,
          o3: this.pollutants[2].value,
          no2: this.pollutants[3].value,
          so2: this.pollutants[4].value,
          co: this.pollutants[5].value,
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.init-col {
  margin-top: 0px;
  padding-top: 0px;
  padding-inline: 40px;
}
.weather-card {
  height: 250px;
  border-radius: 10px;
  padding-left: 40px;
  padding-top: 20px;
  background: rgb(255, 233, 144);
  background: linear-gradient(
    45deg,
    rgba(255, 233, 144, 1) 0%,
    rgba(255, 190, 130, 1) 51%,
    rgba(255, 166, 119, 1) 100%
  );
}
.weather-card .status {
  font-size: 30px;
  margin-top: 30px;
}
.weather-card .detail {
  margin-top: 50px;
}
.weather-card .detail .divider {
  margin-inline: 20px;
}
.rain {
  padding-inline: 20px;
  padding-bottom: 20px;
}
</style>
