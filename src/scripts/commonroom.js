// src/scripts/CommonRoom.js
const commonRoomScript = {
  tagName: "script",
  attributes: {
    type: "text/javascript",
  },
  innerHTML: `
    (function() {
      if (typeof window === 'undefined') return;
      if (typeof window.signals !== 'undefined') return;
      
      var script = document.createElement('script');
      script.src = 'https://cdn.cr-relay.com/v1/site/3709e2b3-c0eb-4239-9087-775e484fab16/signals.js';
      script.async = true;
      
      window.signals = Object.assign([], ['page', 'identify', 'form'].reduce(function (acc, method) {
        acc[method] = function () {
          signals.push([method, arguments]);
          return signals;
        };
        return acc;
      }, {}));
      
      document.head.appendChild(script);
    })();
  `,
};

module.exports = commonRoomScript;
