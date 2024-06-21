<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-container fluid>
    <div class="pa-5">
      <analytic_sidebar
        @resetZoom="resetZoomChart"
        @interval="sendInterval"
        @timeConvert="timeConvert"
        @chartType="chartType"
        @refreshRate="refreshRate"
      />
    </div>
    <div class="chart">
      <canvas
        v-if="raw_data.length !== 0"
        id="mychart"
        style="height: 300px; width: 100%;"
      ></canvas>
      <div class="no-result" v-else>
        <h1>No Results</h1>
      </div>
    </div>
  </v-container>
</template>

<script>
import axios from "axios";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import analytic_sidebar from "@/components/sidebar/analytic_sidebar.vue";

export default {
  components: {
    analytic_sidebar,
  },

  created() {
    this.sendInterval(this.interval);
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    clearInterval();
  },

  watch: {
    raw_data: {
      handler() {
        if (this.raw_data.length === 0 && this.chart !== null) {
          this.chart.destroy();
          this.chart = null;
        }
      },
      deep: true,
    },
  },

  data() {
    return {
      raw_data: [],
      data: {
        temperature: [],
        humidity: [],
        dew_point: [],
        pressure: [],
        uv_index: [],
        visibility: [],
        wind: [],
      },
      chart_type: 'line',
      interval: "5m",
      chart: null,
      timezone: "UTC",
      refresh_rate: 0,
    };
  },

  methods: {
    refreshRate(rate){
      this.refresh_rate = rate;
      if (this.chart) {
        if (this.refresh_rate !== 0) {
          setInterval(() => {
            this.sendInterval(this.interval);
          }, this.refresh_rate * 1000);
        }
        else {
          clearInterval();
        }
      }
    },
    chartType(type) {
      this.chart_type = type;
      if (this.chart) {
        this.chart.config._config.type = this.chart_type;
        this.chart.update();
      }
    },
    resetZoomChart() {
      if (this.chart) {
        this.chart.resetZoom();
      }
    },
    timeConvert(time) {
      this.timezone = time;
      if (this.chart) {
        this.provideData(this.timezone);
      }
    },

    provideData(timezone) {
      this.chart.config._config.data.datasets[0].data.length = 0;
      this.chart.config._config.data.datasets[1].data.length = 0;
      this.chart.config._config.data.datasets[2].data.length = 0;
      this.chart.config._config.data.datasets[3].data.length = 0;
      this.chart.config._config.data.datasets[4].data.length = 0;
      this.chart.config._config.data.datasets[5].data.length = 0;
      this.chart.config._config.data.datasets[6].data.length = 0;

      if (timezone === "UTC") {
        this.raw_data.forEach((element) => {
          const temp = element[0].replace("Z", "");
          this.chart.config._config.data.datasets[0].data.push({ x: temp, y: element[4] });
          this.chart.config._config.data.datasets[1].data.push({ x: temp, y: element[2] });
          this.chart.config._config.data.datasets[2].data.push({ x: temp, y: element[3] });
          this.chart.config._config.data.datasets[3].data.push({ x: temp, y: element[1] });
          this.chart.config._config.data.datasets[4].data.push({ x: temp, y: element[5] });
          this.chart.config._config.data.datasets[5].data.push({ x: temp, y: element[6] });
          this.chart.config._config.data.datasets[6].data.push({ x: temp, y: element[7] });
        });
      } else if (timezone === "Local") {
        this.raw_data.forEach((element) => {
          const temp = new Date(element[0]);
          const datetime = new Date(temp.toLocaleString()).toISOString();
          this.chart.config._config.data.datasets[0].data.push({ x: datetime, y: element[4] });
          this.chart.config._config.data.datasets[1].data.push({ x: datetime, y: element[2] });
          this.chart.config._config.data.datasets[2].data.push({ x: datetime, y: element[3] });
          this.chart.config._config.data.datasets[3].data.push({ x: datetime, y: element[1] });
          this.chart.config._config.data.datasets[4].data.push({ x: datetime, y: element[5] });
          this.chart.config._config.data.datasets[5].data.push({ x: datetime, y: element[6] });
          this.chart.config._config.data.datasets[6].data.push({ x: datetime, y: element[7] });
        });
      }
      this.chart.update();
      this.resetZoomChart();
    },

    sendInterval(interval) {
      this.interval = interval;
      axios
        .post("http://localhost:5000/interval", {
          interval: interval,
        })
        .then((response) => {
          this.raw_data.length = 0;
          this.raw_data = this.raw_data.concat(response.data.data);

          if (this.raw_data.length !== 0 && this.chart !== null) {
            this.$nextTick(() => {
              this.provideData(this.timezone);
            });
          }
          else if (this.raw_data.length !== 0 && this.chart === null) {
            this.$nextTick(() => {
              this.buildChart();
              this.provideData(this.timezone);
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    buildChart() {
      this.chart = new Chart(
        document.getElementById("mychart").getContext("2d"),
        {
          type: this.chart_type,
          data: {
            datasets: [
              {
                label: "Temperature",
                data: this.data.temperature,
                fill: 'start',
              },
              {
                label: "Huminity",
                data: this.data.humidity,
                fill: 'start',
              },
              {
                label: "Pressure",
                data: this.data.pressure,
                fill: 'start',
              },
              {
                label: "Dew Point",
                data: this.data.dew_point,
                fill: 'start',
              },
              {
                label: "UV_index",
                data: this.data.uv_index,
                fill: 'start',
              },
              {
                label: "Visibility",
                data: this.data.visibility,
                fill: 'start',
              },
              {
                label: "Wind",
                data: this.data.wind,
                fill: 'start',
              },
            ],
          },
          options: {
            scales: {
              x: {
                type: "time",
                time: {
                  displayFormats: {
                    millisecond: "HH:mm:ss.SSS",
                    second: "HH:mm:ss",
                    minute: "HH:mm:ss",
                    hour: "HH:mm",
                    day: "d MMM",
                    week: "MMM d",
                    month: "MMM yyyy",
                    quarter: "MMM yyyy",
                    year: "yyyy",
                  },
                },
                ticks: {
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 15,
                },
              },
              y: {
                ticks: {
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 7,
                },
              },
            },
            plugins: {
              zoom: {
                zoom: {
                  mode: "x",
                  drag: {
                    enabled: true,
                  },
                },
              },
            },
            interaction: {
              intersect: false,
              mode: "nearest",
              axis: "x",
            },
          },
        }
      );
    },
  },
};
Chart.register(zoomPlugin);
</script>

<style scoped>
.chart {
  height: 340px;
  width: 100%;
  padding: 20px;
  margin-top: 10px;
  border-radius: 10px;
  background-color: antiquewhite;
}
.no-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
