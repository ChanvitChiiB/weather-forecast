<!-- eslint-disable vue/valid-template-root -->
<template>
  <div>
    <v-row>
      <!-- visualization -->
      <v-dialog v-model="visualization" persistent max-width="290">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
            class="btn-size"
            elevation="0"
          >
            Visualization
          </v-btn>
        </template>
        <v-card>
          <v-card-actions class="d-flex justify-center">
            <v-btn
              :color="visua_type === 'line' ? 'green darken-1' : 'primary'"
              text
              @click="selectchartType('line')"
            >
              Line
            </v-btn>
            <v-btn
              :color="visua_type === 'bar' ? 'green darken-1' : 'primary'"
              text
              @click="selectchartType('bar')"
            >
              Bar
            </v-btn>
            <v-btn
              :color="visua_type === 'scatter' ? 'green darken-1' : 'primary'"
              text
              @click="selectchartType('scatter')"
            >
              Scatter
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-spacer></v-spacer>

      <!-- time convert -->
      <v-btn-toggle
        mandatory
        v-model="btn_selected"
        color="primary"
        class="mr-3"
      >
        <v-btn class="btn-size" value="UTC" @click="timeConvert('UTC')">
          <p style="margin-block: auto">UTC</p>
        </v-btn>
        <v-btn class="btn-size" value="Local" @click="timeConvert('Local')">
          <p style="margin-block: auto">Local</p>
        </v-btn>
      </v-btn-toggle>

      <!-- refresh rate -->
      <v-menu offset-y>
        <template v-slot:activator="{ attrs, on }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            class="btn-size mr-3"
            style="padding-inline: 5px"
            elevation="0"
          >
            <v-icon small style="margin-right: 5px; margin-left: 5px"
              >mdi-refresh</v-icon
            >
            <span class="align-self-center"> {{ text_refresh_rate }} </span>
            <v-icon style="margin-left: 15px">mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            class="menu-size"
            v-for="(item, index) in refresh_rate"
            :key="index"
            @click="sendRefashRate(item.text, item.value)"
            link
          >
            <v-list-item-title class="menu-text-size">
              {{ item.text }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- refresh graph -->
      <v-btn
        v-if="text_refresh_rate === 'paused'"
        class="btn-size mr-3"
        elevation="0"
        color="primary"
        @click="$emit('resetZoom')"
      >
        <v-icon small>mdi-refresh</v-icon>
      </v-btn>

      <!-- interval -->
      <v-menu offset-y>
        <template v-slot:activator="{ attrs, on }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            class="btn-size"
            style="width: auto; padding-inline: 5px"
            elevation="0"
          >
            <div class="d-flex" style="width: 100%">
              <v-icon small style="margin-right: 5px"
                >mdi-clock-time-three</v-icon
              >
              <span class="align-self-center"> {{ text_interval }} </span>
              <v-icon style="margin-left: auto">mdi-menu-down</v-icon>
            </div>
          </v-btn>
        </template>

        <!-- absolute time -->
        <v-dialog v-model="date_time_picker" persistent width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-list>
              <v-subheader class="subheader">Absolute Time</v-subheader>
              <v-list-item
                class="menu-size menu-item"
                v-bind="attrs"
                v-on="on"
                link
              >
                <v-list-item-title> Date Picker </v-list-item-title>
              </v-list-item>
            </v-list>
          </template>

          <div class="dialog">
            <h1 class="text-center mb-1">Start Picker</h1>
            <div class="d-flex justify-center">
              <v-date-picker
                style="margin-right: 20px"
                v-model="start_date"
                :allowed-dates="allowed_dates_1"
              >
              </v-date-picker>
              <v-time-picker
                format="24hr"
                use-seconds
                v-model="start_time"
              ></v-time-picker>
            </div>

            <h1 class="text-center mb-1">End Picker</h1>
            <div class="d-flex justify-center">
              <v-date-picker
                style="margin-right: 20px"
                v-model="end_date"
                :allowed-dates="allowed_dates_2"
              >
              </v-date-picker>
              <v-time-picker
                format="24hr"
                use-seconds
                v-model="end_time"
              ></v-time-picker>
            </div>
            <div class="d-flex justify-end">
              <v-btn class="ma-3" color="primary" @click="combineDateTime"
                >Done</v-btn
              >
            </div>
          </div>
        </v-dialog>

        <!-- relative time -->
        <v-list>
          <v-subheader class="subheader">Relative Time</v-subheader>
          <v-list-item
            class="menu-size menu-item"
            v-for="(item, index) in interval"
            :key="index"
            @click="sendInterval(item.text)"
            link
          >
            <v-list-item-title class="menu-text-size">
              {{ item.text }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-row>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line no-undef
  name: "analytic_sidebar",

  data() {
    return {
      visua_type: "line",
      date_time_picker: false,
      data: null,
      btn_selected: "UTC",
      visualization: false,
      text_interval: "5m",
      text_refresh_rate: "paused",
      start_time: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(11, 8),
      end_time: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(11, 8),
      start_date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      end_date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      refresh_rate: [
        { text: "paused", value: 0 },
        { text: "5s", value: 5 },
        { text: "15s", value: 15 },
        { text: "30s", value: 30 },
        { text: "60s", value: 60 },
      ],
      interval: [
        { text: "5m" },
        { text: "15m" },
        { text: "1h" },
        { text: "6h" },
        { text: "12h" },
        { text: "24h" },
      ],
    };
  },

  methods: {
    sendRefashRate(text, rate) {
      this.text_refresh_rate = text;
      // eslint-disable-next-line no-undef
      this.$emit("refreshRate", rate);
    },
    selectchartType(type) {
      this.visualization = false;
      this.visua_type = type;
      // eslint-disable-next-line no-undef
      this.$emit("chartType", type);
    },
    combineDateTime() {
      this.date_time_picker = false;
      if (this.btn_selected === "UTC") {
        const start = new Date(
          this.start_date + "T" + this.start_time
        ).toUTCString();
        const end = new Date(this.end_date + "T" + this.end_time).toUTCString();
        let combine =
          new Date(start).toISOString().substring(0, 16) +
          " - " +
          new Date(end).toISOString().substring(0, 16);
        this.text_interval = combine.replace(/T/g, " ");
        combine =
          new Date(start).toISOString() + " " + new Date(end).toISOString();
        this.sendInterval(combine);
      } else {
        let start = this.start_date + "T" + this.start_time.substring(0, 5);
        let end = this.end_date + "T" + this.end_time.substring(0, 5);
        let combine = start + " - " + end;
        this.text_interval = combine.replace(/T/g, " ");
        start = this.start_date + "T" + this.start_time + ".000Z";
        end = this.end_date + "T" + this.end_time + ".000Z";
        combine = start + " " + end;
        this.sendInterval(combine);
      }
    },
    allowed_dates_1: (val) => {
      const currentDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10);
      return val <= currentDate;
    },
    allowed_dates_2: (val) => {
      const currentDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10);
      return val >= currentDate;
    },
    sendInterval(interval) {
      if (interval.length < 10) {
        this.text_interval = interval;
      }
      // eslint-disable-next-line no-undef
      this.$emit("interval", interval);
    },
    timeConvert(time) {
      (this.btn_selected = time),
        // eslint-disable-next-line no-undef
        this.$emit("timeConvert", this.btn_selected);
    },
  },
};
</script>

<style scoped>
.dialog {
  background-color: white;
}
.subheader {
  font-weight: bold;
  font-size: 16px;
}
.menu-item {
  cursor: pointer;
}
.btn-size {
  max-height: 30px;
}
.menu-size {
  min-height: 30px;
}
.menu-text-size {
  font-size: 13px;
}
</style>
