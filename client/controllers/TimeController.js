// Get and format current time.
var getTime = function() {
  var date = new Date();
  var hours = date.getHours().toString();
  var minutes = date.getMinutes().toString();
  if (hours.length < 2) {
    hours = '0' + hours;
  }
  if (minutes.length < 2) {
    minutes = '0' + minutes;
  }
  return hours + minutes;
};

// Handles conversion of times to/from human-readable formats.
var timeController = {

  // Takes a time string as input and returns a date object for that time today.
  timeToDate: function (time) {
    var now = new Date();
    var month = now.getMonth() + 1,
        day = now.getDate(),
        year = now.getFullYear();
    if (now.getHours() > time.split(':')[0]) day++;
    var input = [month, day, year, time].join(" ");
    return new Date(Date.parse(input));
  },

  timeToMS: function (time) {
    if (time) {
      return timeController.timeToDate(time).getTime();
    } else {
      return undefined;
    }
  },

  msToTime: function (ms) {
    if (typeof ms === "string") ms = Number(ms);
    var date = new Date(ms);
    var output = [date.getHours()];
    if (date.getMinutes()) {
      output.push(':' + ('0' + date.getMinutes()).slice(-2));
    }
    if (output[0] < 12) {
      output.push(' AM');
    } else {
      output.push(' PM');
    }
    if (output[0] > 12) {
      output[0] -= 12;
    }
    if (output[0] === 0) {
      output[0] = 12;
    }
    return output.join('');
  },

  hoursToMS: function(hours) {
    hours = hours || 0;
    return hours * 3600000;
  },

  minutesToMS: function(minutes) {
    minutes = minutes || 0;
    return minutes * 60000;
  },

  msToDuration: function(ms) {
    var hourStr = " hour ";
    var convertMin, minutes, hours, minStr;

    if(!Number.isInteger(ms / 3600000)) {
      minStr = " minutes";
      minutes = ms % 3600000;
      hours = Math.floor(ms / 3600000);
      if(hours > 1) {
        hourStr = " hours ";
      }
      convertMin = Math.floor(minutes/60000);
      if (convertMin === 1) {
        minStr = " minute";
      }
      if (hours > 0) {
        return hours + hourStr + convertMin + minStr;
      } else {
        return convertMin + minStr;
      }
    } else {
      hours = Math.floor(ms / 3600000);

      if(hours > 1) {
        hourStr = " hours";
      }
      return hours + hourStr;
    }
  },

  stringifyTime: function(spot, flag) {
    console.log(spot);
    var timeString = "";
    if (spot.start && Number(spot.start) > new Date().getTime()) {
      if (flag) {
        timeString += "Happening ";
      }
      timeString += "in " + timeController.msToDuration(Number(spot.start) - new Date());
    } else if (spot.end) {
      if (flag) {
        timeString += "Ending in ";
      }
      console.log("END", spot.end);
      console.log("START", Number(spot.start));
      timeString += timeController.msToDuration(Number(spot.end) + Number(spot.start) - new Date().getTime());
      if (!flag) {
        timeString += " left";
      }
    } else {
      if (!spot.start) {
        return "";
      }
      if (flag) {
        timeString += "Started ";
      }
      timeString += timeController.msToDuration(new Date() - Number(spot.start)) + " ago";
    }
    return timeString;
  },

  timestampToTime: function (timestamp) {
  	var time = new Date(timestamp).toLocaleTimeString();
  	return time.substring(0, time.length - 6) + time.substring(time.length - 3);
  }
}
