const Applet = imports.ui.applet;
const Gettext = imports.gettext;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const { get_home_dir } = imports.gi.GLib;
const { spawnCommandLineAsyncIO, setTimeout } = require("./lib/util");

const API_LOGIN_URL = "https://api-REGION.libreview.io/llu/auth/login";
const API_MEASUREMENT_URL = "https://api-REGION.libreview.io/llu/connections";
const UUID = "librelinkup@tkorkalainen";
const HOME_DIR = get_home_dir();
const APPLET_DIR = HOME_DIR + "/.local/share/cinnamon/applets/" + UUID;
const SCRIPTS_DIR = APPLET_DIR + "/scripts";

Gettext.bindtextdomain(UUID, get_home_dir() + "/.local/share/locale");

function _(str) {
  return Gettext.dgettext(UUID, str);
}

function MyApplet(orientation, panel_height, instance_id) {
  this._init(orientation, panel_height, instance_id);
}

MyApplet.prototype = {
  __proto__: Applet.TextApplet.prototype,

  _init: function (orientation, panel_height, instance_id) {
    Applet.TextApplet.prototype._init.call(
      this,
      orientation,
      panel_height,
      instance_id
    );

    try {
      this.settings = new Settings.AppletSettings(this, UUID, this.instance_id);

      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "api-update-interval",
        "update_interval",
        this._update_interval,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "api-username",
        "username",
        null,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "api-password",
        "password",
        null,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "api-region",
        "region",
        null,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "color-low",
        "color_low",
        this._update_label,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "color-normal",
        "color_normal",
        this._update_label,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "color-high",
        "color_high",
        this._update_label,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "color-very-high",
        "color_very_high",
        this._update_label,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "value-low",
        "value_low",
        this._update_label,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "value-normal",
        "value_normal",
        this._update_label,
        null
      );
      this.settings.bindProperty(
        Settings.BindingDirection.IN,
        "value-high",
        "value_high",
        this._update_label,
        null
      );

      this.api_token = "";
      this.measurement = 0;
      this.unit = "";
      this.trend = 0;
      this.timestamp = "";
      this.last_updated = new Date().getTime();

      global.log("librelinkup: init");

      this._update_interval();
    } catch (e) {
      global.logError(e);
    }
  },

  on_applet_removed_from_panel: function () {
    if (this._updateLoopID) {
      Mainloop.source_remove(this._updateLoopID);
    }
    this.settings.finalize();
  },

  _pad: function (percent) {
    let str = "";
    let str_length = this.max_percentage.toString().length;

    while (str.length < str_length) {
      str = " " + str;
    }
    return (str + percent.toString()).slice(str_length);
  },

  _refresh_api_token: function () {
    if (this.api_token !== "") return;

    global.log("librelinkup: start refreshing api token");

    let command =
      SCRIPTS_DIR +
      "/get-api-token.sh " +
      API_LOGIN_URL.replace("REGION", this.region) +
      " " +
      this.username +
      " " +
      this.password;

    spawnCommandLineAsyncIO(command, (stdout) => {
      try {
        global.log("librelinkup: api token refreshed");
        this.api_token = stdout;
        global.log("librelinkup: wait 10 seconds");
        setTimeout(() => {
          this._get_api_measurement();
        }, 10000);

      } catch (e) {
        global.logError(e);
      }
    });
  },

  _get_api_measurement: function () {
    if (this.api_token === "") return;

    let current_date = new Date().getTime();
    let ms_since_last_update = current_date - this.last_updated;
    if (ms_since_last_update < 10000) {
      global.log("librelinkup: since last update: " + ms_since_last_update);
      return;
    } 

    global.log("librelinkup: get measurement from api");

    let command =
      SCRIPTS_DIR +
      "/get-api-measurement.sh " +
      API_MEASUREMENT_URL.replace("REGION", this.region) +
      " " +
      this.api_token;

    spawnCommandLineAsyncIO(command, (stdout) => {
      try {
        global.log("librelinkup: received measurement " + stdout + " from api");

        let measurements = stdout.split(";");

        this.measurement = measurements[0];
        this.unit = measurements[1] == 0 ? " mmol/L" : " mg/dL";
        this.trend = measurements[2];
        this.timestamp = measurements[3];

        this.last_updated = new Date().getTime();

        this._update_label();
      } catch (e) {
        global.logError(e);
      }
    });
  },

  _update_label: function () {
    // Text color.
    if (this.measurement < this.value_low) {
      this._applet_label.set_style("color: " + this.color_low);
    } else if (
      this.measurement >= this.value_low &&
      this.measurement < this.value_normal
    ) {
      this._applet_label.set_style("color: " + this.color_normal);
    } else if (
      this.measurement >= this.value_normal &&
      this.measurement < this.value_high
    ) {
      this._applet_label.set_style("color: " + this.color_high);
    } else {
      this._applet_label.set_style("color: " + this.color_very_high);
    }

    // Trends arrow.
    let trend_arrow = " →";
    if (this.trend == 1) trend_arrow = " ↓";
    else if (this.trend == 2) trend_arrow = " ↘";
    else if (this.trend == 3) trend_arrow = " →";
    else if (this.trend == 4) trend_arrow = " ↗";
    else if (this.trend == 5) trend_arrow = " ↑";

    this.set_applet_label(this.measurement + this.unit + trend_arrow);
    this.set_applet_tooltip("Updated " + this.timestamp);
  },

  _update: function () {
    this._refresh_api_token();
    this._get_api_measurement();
  },

  _update_loop: function () {
    this._update();
    this._updateLoopID = Mainloop.timeout_add(
      this.update_interval * 1000 * 60,
      Lang.bind(this, this._update_loop)
    );
  },

  _update_interval: function() {
    global.log("librelinkup: update interval is set to " + this.update_interval + " minute(s)");
    if (this._updateLoopID) {
      Mainloop.source_remove(this._updateLoopID);
    }
    this._update_loop();
  }
};

function main(metadata, orientation, panel_height, instance_id) {
  let myApplet = new MyApplet(orientation, panel_height, instance_id);
  return myApplet;
}
