var config = require('../../config');
var navigationService = require('./navigation.service');

function url(path) {
  return config.api_host + (config.api_port ? ':' + config.api_port : '') + path;
}

function doFetch(task, noRetry) {
  var tryTask = function(retrying) {
    var statusCode;
    return task()
      .then(function(res) {
        statusCode = res.status;
        if (res.status !== 200) {
          // try to deserialize the error, otherwise just throw as text
          return res.json().then((error) => { throw error; }, () => { throw new Error(res._bodyText) });
        } else {
          return res.json().catch((e) => { return {ok: true}; });
        }
      }).catch(function(err) {
        if (!noRetry && !retrying && statusCode === 401) {
          return new Promise(function(resolve, reject) {
            navigationService.showLogin(() => {
              return tryTask(true)
                .then(resolve, reject);
            });
          });
        } else {
          console.log(err);
          throw err;
        }
      });
  };
  return tryTask();
}

exports.post = function(path, data, noRetry) {
  data = data || {};

  return doFetch(() => {
    return fetch(url(path), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
        'Connection': 'Keep-Alive'
      },
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
  }, noRetry);
};

exports.get = function(path, noRetry) {
  return doFetch(() => {
    return fetch(url(path), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }, noRetry);
};

exports.del = function(path, noRetry) {
  return doFetch(() => {
    return fetch(url(path), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }, noRetry);
};

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

exports.durable = function(tasks) {
  // Execute web service requests in a durable manner
  // That is, if a task fails, retry it after a few seconds
  // NOTE: tasks must be idempotent

  var tries = 0;
  var MAX_TRIES = 3;

  return new Promise(function(resolve, reject) {
    async function runTasks() {
      if (tasks.length === 0) {
        // base case
        return resolve(null);
      } else {
        // run next task
        var task = tasks.shift();
        try {
          await task();
        } catch(e) {
          if (tries > MAX_TRIES) {
            return reject(e);
          } else {
            tries += 1;
            await sleep(2000); // wait a couple seconds and retry
          }
        }
        runTasks();
      }
    }
    runTasks();
  });
};

exports.formatMoney = function(value) {
  if (value != null) {
    value = value.toString();
    value = value.replace(/[^0-9]/g, '');
    var num = value.replace(/,/gi, '');
    var num2 = num.replace(/\d(?=(?:\d{3})+$)/g, '$&,');
    return '$' + num2;
  } else {
    return 'N/A';
  }
};

exports.formatNumber = function(value) {
  if (value != null) {
    value = value.toString();
    value = value.replace(/[^0-9]/g, '');
    var num = value.replace(/,/gi, '');
    var num2 = num.replace(/\d(?=(?:\d{3})+$)/g, '$&,');
    return num2;
  } else {
    return '';
  }
};

exports.moneyToInt = function(string) {
  if (string) {
    var num = parseInt(string.replace(/[^0-9]/g, ''));
    if (isNaN(num)) {
      return 0;
    }
    return num;
  } else {
    return 0;
  }
};

exports.capitalizeAllWords = function(string){
  if(string.length < 3) {
    return string;
  }
  var words = string.toLowerCase().split(" ");
  return words.map(function(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(" ");
};
