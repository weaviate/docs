var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn2, res) => function __init() {
  return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
};
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// node_modules/abort-controller-x/lib/AbortError.js
var require_AbortError = __commonJS({
  "node_modules/abort-controller-x/lib/AbortError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.catchAbortError = exports.rethrowAbortError = exports.throwIfAborted = exports.isAbortError = exports.AbortError = void 0;
    var AbortError = class {
      constructor(message = "The operation has been aborted", captureStackTrace = true) {
        this.message = message;
        this.name = "AbortError";
        this.stack = "";
        if (captureStackTrace) {
          Error.captureStackTrace?.(this, this.constructor);
        }
        Object.setPrototypeOf(this, Error.prototype);
      }
      static [Symbol.hasInstance](instance) {
        return isAbortError2(instance);
      }
    };
    exports.AbortError = AbortError;
    function isAbortError2(error) {
      return typeof error === "object" && error !== null && error.name === "AbortError";
    }
    exports.isAbortError = isAbortError2;
    function throwIfAborted(signal) {
      if (signal.aborted) {
        throw new AbortError();
      }
    }
    exports.throwIfAborted = throwIfAborted;
    function rethrowAbortError(error) {
      if (isAbortError2(error)) {
        throw error;
      }
      return;
    }
    exports.rethrowAbortError = rethrowAbortError;
    function catchAbortError(error) {
      if (isAbortError2(error)) {
        return;
      }
      throw error;
    }
    exports.catchAbortError = catchAbortError;
  }
});

// node_modules/abort-controller-x/lib/execute.js
var require_execute = __commonJS({
  "node_modules/abort-controller-x/lib/execute.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execute = void 0;
    var AbortError_1 = require_AbortError();
    function execute(signal, executor) {
      return new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason ?? new AbortError_1.AbortError());
          return;
        }
        let removeAbortListener;
        let finished = false;
        function finish() {
          if (!finished) {
            finished = true;
            if (removeAbortListener != null) {
              removeAbortListener();
            }
          }
        }
        const callback = executor((value) => {
          resolve(value);
          finish();
        }, (reason) => {
          reject(reason);
          finish();
        });
        if (!finished) {
          const abortListener = () => {
            const callbackResult = callback(signal.reason);
            if (callbackResult == null) {
              reject(signal.reason ?? new AbortError_1.AbortError());
            } else {
              callbackResult.then(() => {
                reject(signal.reason ?? new AbortError_1.AbortError());
              }, (reason) => {
                reject(reason);
              });
            }
            finish();
          };
          signal.addEventListener("abort", abortListener);
          removeAbortListener = () => {
            signal.removeEventListener("abort", abortListener);
          };
        }
      });
    }
    exports.execute = execute;
  }
});

// node_modules/abort-controller-x/lib/abortable.js
var require_abortable = __commonJS({
  "node_modules/abort-controller-x/lib/abortable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.abortable = void 0;
    var execute_1 = require_execute();
    function abortable(signal, promise) {
      if (signal.aborted) {
        const noop = () => {
        };
        promise.then(noop, noop);
      }
      return (0, execute_1.execute)(signal, (resolve, reject) => {
        promise.then(resolve, reject);
        return () => {
        };
      });
    }
    exports.abortable = abortable;
  }
});

// node_modules/abort-controller-x/lib/delay.js
var require_delay = __commonJS({
  "node_modules/abort-controller-x/lib/delay.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.delay = void 0;
    var execute_1 = require_execute();
    function delay(signal, dueTime) {
      return (0, execute_1.execute)(signal, (resolve) => {
        const ms2 = typeof dueTime === "number" ? dueTime : dueTime.getTime() - Date.now();
        const timer = setTimeout(resolve, ms2);
        return () => {
          clearTimeout(timer);
        };
      });
    }
    exports.delay = delay;
  }
});

// node_modules/abort-controller-x/lib/forever.js
var require_forever = __commonJS({
  "node_modules/abort-controller-x/lib/forever.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.forever = void 0;
    var execute_1 = require_execute();
    function forever(signal) {
      return (0, execute_1.execute)(signal, () => () => {
      });
    }
    exports.forever = forever;
  }
});

// node_modules/abort-controller-x/lib/waitForEvent.js
var require_waitForEvent = __commonJS({
  "node_modules/abort-controller-x/lib/waitForEvent.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.waitForEvent = void 0;
    var execute_1 = require_execute();
    function waitForEvent(signal, target, eventName, options) {
      return (0, execute_1.execute)(signal, (resolve) => {
        let unlisten;
        let finished = false;
        const handler = (...args) => {
          resolve(args.length > 1 ? args : args[0]);
          finished = true;
          if (unlisten != null) {
            unlisten();
          }
        };
        unlisten = listen(target, eventName, handler, options);
        if (finished) {
          unlisten();
        }
        return () => {
          finished = true;
          if (unlisten != null) {
            unlisten();
          }
        };
      });
    }
    exports.waitForEvent = waitForEvent;
    function listen(target, eventName, handler, options) {
      if (isEventTarget(target)) {
        target.addEventListener(eventName, handler, options);
        return () => target.removeEventListener(eventName, handler, options);
      }
      if (isJQueryStyleEventEmitter(target)) {
        target.on(eventName, handler);
        return () => target.off(eventName, handler);
      }
      if (isNodeStyleEventEmitter(target)) {
        target.addListener(eventName, handler);
        return () => target.removeListener(eventName, handler);
      }
      throw new Error("Invalid event target");
    }
    function isNodeStyleEventEmitter(sourceObj) {
      return isFunction(sourceObj.addListener) && isFunction(sourceObj.removeListener);
    }
    function isJQueryStyleEventEmitter(sourceObj) {
      return isFunction(sourceObj.on) && isFunction(sourceObj.off);
    }
    function isEventTarget(sourceObj) {
      return isFunction(sourceObj.addEventListener) && isFunction(sourceObj.removeEventListener);
    }
    var isFunction = (obj) => typeof obj === "function";
  }
});

// node_modules/abort-controller-x/lib/all.js
var require_all = __commonJS({
  "node_modules/abort-controller-x/lib/all.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.all = void 0;
    var AbortError_1 = require_AbortError();
    function all(signal, executor) {
      return new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason ?? new AbortError_1.AbortError());
          return;
        }
        const innerAbortController = new AbortController();
        const promises = executor(innerAbortController.signal);
        if (promises.length === 0) {
          resolve([]);
          return;
        }
        const abortListener = () => {
          innerAbortController.abort(signal.reason ?? new AbortError_1.AbortError());
        };
        signal.addEventListener("abort", abortListener);
        let rejection;
        const results = new Array(promises.length);
        let settledCount = 0;
        function settled() {
          settledCount += 1;
          if (settledCount === promises.length) {
            signal.removeEventListener("abort", abortListener);
            if (rejection != null) {
              reject(rejection.reason);
            } else {
              resolve(results);
            }
          }
        }
        for (const [i, promise] of promises.entries()) {
          promise.then((value) => {
            results[i] = value;
            settled();
          }, (reason) => {
            innerAbortController.abort(new AbortError_1.AbortError("One of the promises passed to all() rejected", false));
            if (rejection == null || !(0, AbortError_1.isAbortError)(reason) && (0, AbortError_1.isAbortError)(rejection.reason)) {
              rejection = { reason };
            }
            settled();
          });
        }
      });
    }
    exports.all = all;
  }
});

// node_modules/abort-controller-x/lib/race.js
var require_race = __commonJS({
  "node_modules/abort-controller-x/lib/race.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.race = void 0;
    var AbortError_1 = require_AbortError();
    function race(signal, executor) {
      return new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason ?? new AbortError_1.AbortError());
          return;
        }
        const innerAbortController = new AbortController();
        const promises = executor(innerAbortController.signal);
        const abortListener = () => {
          innerAbortController.abort(signal.reason ?? new AbortError_1.AbortError());
        };
        signal.addEventListener("abort", abortListener);
        let settledCount = 0;
        function settled(result2) {
          innerAbortController.abort(new AbortError_1.AbortError("One of the promises passed to race() settled", false));
          settledCount += 1;
          if (settledCount === promises.length) {
            signal.removeEventListener("abort", abortListener);
            if (result2.status === "fulfilled") {
              resolve(result2.value);
            } else {
              reject(result2.reason);
            }
          }
        }
        let result;
        for (const promise of promises) {
          promise.then((value) => {
            if (result == null) {
              result = { status: "fulfilled", value };
            }
            settled(result);
          }, (reason) => {
            if (result == null || !(0, AbortError_1.isAbortError)(reason) && (result.status === "fulfilled" || (0, AbortError_1.isAbortError)(result.reason))) {
              result = { status: "rejected", reason };
            }
            settled(result);
          });
        }
      });
    }
    exports.race = race;
  }
});

// node_modules/abort-controller-x/lib/retry.js
var require_retry = __commonJS({
  "node_modules/abort-controller-x/lib/retry.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.retry = void 0;
    var delay_1 = require_delay();
    var AbortError_1 = require_AbortError();
    async function retry(signal, fn2, options = {}) {
      const { baseMs = 1e3, maxDelayMs = 3e4, onError, maxAttempts = Infinity } = options;
      let attempt = 0;
      const reset = () => {
        attempt = -1;
      };
      while (true) {
        try {
          return await fn2(signal, attempt, reset);
        } catch (error) {
          (0, AbortError_1.rethrowAbortError)(error);
          if (attempt >= maxAttempts) {
            throw error;
          }
          let delayMs;
          if (attempt === -1) {
            delayMs = 0;
          } else {
            const backoff = Math.min(maxDelayMs, Math.pow(2, attempt) * baseMs);
            delayMs = Math.round(backoff * (1 + Math.random()) / 2);
          }
          if (onError) {
            onError(error, attempt, delayMs);
          }
          if (delayMs !== 0) {
            await (0, delay_1.delay)(signal, delayMs);
          }
          attempt += 1;
        }
      }
    }
    exports.retry = retry;
  }
});

// node_modules/abort-controller-x/lib/spawn.js
var require_spawn = __commonJS({
  "node_modules/abort-controller-x/lib/spawn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.spawn = void 0;
    var AbortError_1 = require_AbortError();
    function spawn(signal, fn2) {
      if (signal.aborted) {
        return Promise.reject(new AbortError_1.AbortError());
      }
      const deferredFunctions = [];
      const spawnAbortController = new AbortController();
      const spawnSignal = spawnAbortController.signal;
      const abortListener = () => {
        spawnAbortController.abort(signal.reason ?? new AbortError_1.AbortError());
      };
      signal.addEventListener("abort", abortListener);
      const removeAbortListener = () => {
        signal.removeEventListener("abort", abortListener);
      };
      const tasks = /* @__PURE__ */ new Set();
      const abortTasks = () => {
        for (const task of tasks) {
          task.abort();
        }
      };
      spawnSignal.addEventListener("abort", abortTasks);
      const removeSpawnAbortListener = () => {
        spawnSignal.removeEventListener("abort", abortTasks);
      };
      let promise = new Promise((resolve, reject) => {
        let result;
        let failure;
        fork((signal2) => fn2(signal2, {
          defer(fn3) {
            deferredFunctions.push(fn3);
          },
          fork
        })).join().then((value) => {
          spawnAbortController.abort(new AbortError_1.AbortError("spawn() function finished", false));
          result = { value };
        }, (error) => {
          spawnAbortController.abort((0, AbortError_1.isAbortError)(error) ? error : new AbortError_1.AbortError("spawn() function threw", false));
          if (!(0, AbortError_1.isAbortError)(error) || failure == null) {
            failure = { error };
          }
        });
        function fork(forkFn) {
          if (spawnSignal.aborted) {
            return {
              abort() {
              },
              async join() {
                throw new AbortError_1.AbortError();
              }
            };
          }
          const taskAbortController = new AbortController();
          const taskSignal = taskAbortController.signal;
          const taskPromise = forkFn(taskSignal);
          const task = {
            abort() {
              taskAbortController.abort();
            },
            join: () => taskPromise
          };
          tasks.add(task);
          taskPromise.catch(AbortError_1.catchAbortError).catch((error) => {
            failure = { error };
            spawnAbortController.abort(new AbortError_1.AbortError("A function forked by spawn() threw", false));
          }).finally(() => {
            tasks.delete(task);
            if (tasks.size === 0) {
              if (failure != null) {
                reject(failure.error);
              } else {
                resolve(result.value);
              }
            }
          });
          return task;
        }
      });
      promise = promise.finally(() => {
        removeAbortListener();
        removeSpawnAbortListener();
        let deferPromise = Promise.resolve();
        for (let i = deferredFunctions.length - 1; i >= 0; i--) {
          deferPromise = deferPromise.finally(deferredFunctions[i]);
        }
        return deferPromise;
      });
      return promise;
    }
    exports.spawn = spawn;
  }
});

// node_modules/abort-controller-x/lib/run.js
var require_run = __commonJS({
  "node_modules/abort-controller-x/lib/run.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.run = void 0;
    var AbortError_1 = require_AbortError();
    function run(fn2) {
      const abortController = new AbortController();
      const promise = fn2(abortController.signal).catch(AbortError_1.catchAbortError);
      return () => {
        abortController.abort();
        return promise;
      };
    }
    exports.run = run;
  }
});

// node_modules/abort-controller-x/lib/proactiveRetry.js
var require_proactiveRetry = __commonJS({
  "node_modules/abort-controller-x/lib/proactiveRetry.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.proactiveRetry = void 0;
    var AbortError_1 = require_AbortError();
    var delay_1 = require_delay();
    var execute_1 = require_execute();
    function proactiveRetry(signal, fn2, options = {}) {
      const { baseMs = 1e3, onError, maxAttempts = Infinity } = options;
      return (0, execute_1.execute)(signal, (resolve, reject) => {
        const innerAbortController = new AbortController();
        let attemptsExhausted = false;
        const promises = /* @__PURE__ */ new Map();
        function handleFulfilled(value) {
          innerAbortController.abort(new AbortError_1.AbortError("One of the proactiveRetry() attempts fulfilled", false));
          promises.clear();
          resolve(value);
        }
        function handleRejected(err, attempt) {
          promises.delete(attempt);
          if (attemptsExhausted && promises.size === 0) {
            reject(err);
            return;
          }
          if ((0, AbortError_1.isAbortError)(err)) {
            return;
          }
          if (onError) {
            try {
              onError(err, attempt);
            } catch (err2) {
              innerAbortController.abort(new AbortError_1.AbortError("Error was thrown from proactiveRetry() onError callback", false));
              promises.clear();
              reject(err2);
            }
          }
        }
        async function makeAttempts(signal2) {
          for (let attempt = 0; ; attempt++) {
            const promise = fn2(signal2, attempt);
            promises.set(attempt, promise);
            promise.then(handleFulfilled, (err) => handleRejected(err, attempt));
            if (attempt + 1 >= maxAttempts) {
              break;
            }
            const backoff = Math.pow(2, attempt) * baseMs;
            const delayMs = Math.round(backoff * (1 + Math.random()) / 2);
            await (0, delay_1.delay)(signal2, delayMs);
          }
          attemptsExhausted = true;
        }
        makeAttempts(innerAbortController.signal).catch(AbortError_1.catchAbortError);
        return (reason) => {
          innerAbortController.abort(reason ?? new AbortError_1.AbortError());
        };
      });
    }
    exports.proactiveRetry = proactiveRetry;
  }
});

// node_modules/abort-controller-x/lib/index.js
var require_lib = __commonJS({
  "node_modules/abort-controller-x/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o, k22, desc);
    } : function(o, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o[k22] = m2[k2];
    });
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding(exports2, m2, p2);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_abortable(), exports);
    __exportStar(require_AbortError(), exports);
    __exportStar(require_delay(), exports);
    __exportStar(require_execute(), exports);
    __exportStar(require_forever(), exports);
    __exportStar(require_waitForEvent(), exports);
    __exportStar(require_all(), exports);
    __exportStar(require_race(), exports);
    __exportStar(require_retry(), exports);
    __exportStar(require_spawn(), exports);
    __exportStar(require_run(), exports);
    __exportStar(require_proactiveRetry(), exports);
  }
});

// node_modules/@datastructures-js/deque/src/deque.js
var require_deque = __commonJS({
  "node_modules/@datastructures-js/deque/src/deque.js"(exports) {
    var Deque2 = class _Deque {
      /**
       * Creates a deque
       * @param {array} [elements]
       */
      constructor(elements) {
        this._backElements = Array.isArray(elements) ? elements : [];
        this._frontElements = [];
        this._backOffset = 0;
        this._frontOffset = 0;
      }
      /**
       * Adds an element at the front of the queue
       * @public
       * @param {number|string|object} element
       */
      pushFront(element) {
        this._frontElements.push(element);
        return this;
      }
      /**
       * Adds an element at the back of the queue
       * @public
       * @param {number|string|object} element
       */
      pushBack(element) {
        this._backElements.push(element);
        return this;
      }
      /**
       * Dequeues the front element in the queue
       * @public
       * @returns {number|string|object}
       */
      popFront() {
        if (this.size() === 0) {
          return null;
        }
        if (this._frontElements.length > 0) {
          const front2 = this._frontElements.pop();
          if (this._frontOffset >= this._frontElements.length) {
            this._frontElements = this._frontElements.slice(this._frontOffset);
            this._frontOffset = 0;
          }
          return front2;
        }
        const front = this.front();
        this._backOffset += 1;
        if (this._backOffset * 2 < this._backElements.length) {
          return front;
        }
        this._backElements = this._backElements.slice(this._backOffset);
        this._backOffset = 0;
        return front;
      }
      /**
       * Dequeues the back element of the queue
       * @public
       * @returns {number|string|object}
       */
      popBack() {
        if (this.size() === 0) {
          return null;
        }
        if (this._backElements.length > 0) {
          const back2 = this._backElements.pop();
          if (this._backOffset >= this._backElements.length) {
            this._backElements = this._backElements.slice(this._backOffset);
            this._backOffset = 0;
          }
          return back2;
        }
        const back = this.back();
        this._frontOffset += 1;
        if (this._frontOffset * 2 < this._frontElements.length) {
          return back;
        }
        this._frontElements = this._frontElements.slice(this._frontOffset);
        this._frontOffset = 0;
        return back;
      }
      /**
       * Returns the front element of the queue
       * @public
       * @returns {number|string|object}
       */
      front() {
        if (this.size() === 0) {
          return null;
        }
        if (this._frontElements.length > 0) {
          return this._frontElements[this._frontElements.length - 1];
        }
        return this._backElements[this._backOffset];
      }
      /**
       * Returns the back element of the queue
       * @public
       * @returns {number|string|object}
       */
      back() {
        if (this.size() === 0) {
          return null;
        }
        if (this._backElements.length > 0) {
          return this._backElements[this._backElements.length - 1];
        }
        return this._frontElements[this._frontOffset];
      }
      /**
       * Returns the number of elements in the deque
       * @public
       * @returns {number}
       */
      size() {
        const frontSize = this._frontElements.length - this._frontOffset;
        const backSize = this._backElements.length - this._backOffset;
        return frontSize + backSize;
      }
      /**
       * Checks if the queue is empty
       * @public
       * @returns {boolean}
       */
      isEmpty() {
        return this.size() === 0;
      }
      /**
       * Returns the remaining elements in the queue as an array
       * @public
       * @returns {array}
       */
      toArray() {
        const backElements = this._backElements.slice(this._backOffset);
        const frontElements = this._frontElements.slice(this._frontOffset);
        return frontElements.reverse().concat(backElements);
      }
      /**
       * Clears the queue
       * @public
       */
      clear() {
        this._backElements = [];
        this._frontElements = [];
        this._backOffset = 0;
        this._frontOffset = 0;
      }
      /**
       * Creates a shallow copy of the queue
       * @public
       * @return {Deque}
       */
      clone() {
        return new _Deque(this.toArray());
      }
      /**
       * Creates a deque from an existing array
       * @public
       * @static
       * @param {array} elements
       * @return {Deque}
       */
      static fromArray(elements) {
        return new _Deque(elements);
      }
    };
    exports.Deque = Deque2;
  }
});

// node_modules/@datastructures-js/deque/index.js
var require_deque2 = __commonJS({
  "node_modules/@datastructures-js/deque/index.js"(exports) {
    var { Deque: Deque2 } = require_deque();
    exports.Deque = Deque2;
  }
});

// node_modules/cross-fetch/dist/browser-ponyfill.js
var require_browser_ponyfill = __commonJS({
  "node_modules/cross-fetch/dist/browser-ponyfill.js"(exports, module2) {
    var __global__ = typeof globalThis !== "undefined" && globalThis || typeof self !== "undefined" && self || typeof global !== "undefined" && global;
    var __globalThis__ = function() {
      function F2() {
        this.fetch = false;
        this.DOMException = __global__.DOMException;
      }
      F2.prototype = __global__;
      return new F2();
    }();
    (function(globalThis2) {
      var irrelevant = function(exports2) {
        var g2 = typeof globalThis2 !== "undefined" && globalThis2 || typeof self !== "undefined" && self || // eslint-disable-next-line no-undef
        typeof global !== "undefined" && global || {};
        var support = {
          searchParams: "URLSearchParams" in g2,
          iterable: "Symbol" in g2 && "iterator" in Symbol,
          blob: "FileReader" in g2 && "Blob" in g2 && function() {
            try {
              new Blob();
              return true;
            } catch (e24) {
              return false;
            }
          }(),
          formData: "FormData" in g2,
          arrayBuffer: "ArrayBuffer" in g2
        };
        function isDataView(obj) {
          return obj && DataView.prototype.isPrototypeOf(obj);
        }
        if (support.arrayBuffer) {
          var viewClasses = [
            "[object Int8Array]",
            "[object Uint8Array]",
            "[object Uint8ClampedArray]",
            "[object Int16Array]",
            "[object Uint16Array]",
            "[object Int32Array]",
            "[object Uint32Array]",
            "[object Float32Array]",
            "[object Float64Array]"
          ];
          var isArrayBufferView = ArrayBuffer.isView || function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
          };
        }
        function normalizeName(name) {
          if (typeof name !== "string") {
            name = String(name);
          }
          if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === "") {
            throw new TypeError('Invalid character in header field name: "' + name + '"');
          }
          return name.toLowerCase();
        }
        function normalizeValue(value) {
          if (typeof value !== "string") {
            value = String(value);
          }
          return value;
        }
        function iteratorFor(items) {
          var iterator = {
            next: function() {
              var value = items.shift();
              return { done: value === void 0, value };
            }
          };
          if (support.iterable) {
            iterator[Symbol.iterator] = function() {
              return iterator;
            };
          }
          return iterator;
        }
        function Headers3(headers) {
          this.map = {};
          if (headers instanceof Headers3) {
            headers.forEach(function(value, name) {
              this.append(name, value);
            }, this);
          } else if (Array.isArray(headers)) {
            headers.forEach(function(header) {
              if (header.length != 2) {
                throw new TypeError("Headers constructor: expected name/value pair to be length 2, found" + header.length);
              }
              this.append(header[0], header[1]);
            }, this);
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
              this.append(name, headers[name]);
            }, this);
          }
        }
        Headers3.prototype.append = function(name, value) {
          name = normalizeName(name);
          value = normalizeValue(value);
          var oldValue = this.map[name];
          this.map[name] = oldValue ? oldValue + ", " + value : value;
        };
        Headers3.prototype["delete"] = function(name) {
          delete this.map[normalizeName(name)];
        };
        Headers3.prototype.get = function(name) {
          name = normalizeName(name);
          return this.has(name) ? this.map[name] : null;
        };
        Headers3.prototype.has = function(name) {
          return this.map.hasOwnProperty(normalizeName(name));
        };
        Headers3.prototype.set = function(name, value) {
          this.map[normalizeName(name)] = normalizeValue(value);
        };
        Headers3.prototype.forEach = function(callback, thisArg) {
          for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
              callback.call(thisArg, this.map[name], name, this);
            }
          }
        };
        Headers3.prototype.keys = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push(name);
          });
          return iteratorFor(items);
        };
        Headers3.prototype.values = function() {
          var items = [];
          this.forEach(function(value) {
            items.push(value);
          });
          return iteratorFor(items);
        };
        Headers3.prototype.entries = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push([name, value]);
          });
          return iteratorFor(items);
        };
        if (support.iterable) {
          Headers3.prototype[Symbol.iterator] = Headers3.prototype.entries;
        }
        function consumed(body) {
          if (body._noBody) return;
          if (body.bodyUsed) {
            return Promise.reject(new TypeError("Already read"));
          }
          body.bodyUsed = true;
        }
        function fileReaderReady(reader) {
          return new Promise(function(resolve, reject) {
            reader.onload = function() {
              resolve(reader.result);
            };
            reader.onerror = function() {
              reject(reader.error);
            };
          });
        }
        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsArrayBuffer(blob);
          return promise;
        }
        function readBlobAsText(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
          var encoding = match ? match[1] : "utf-8";
          reader.readAsText(blob, encoding);
          return promise;
        }
        function readArrayBufferAsText(buf) {
          var view = new Uint8Array(buf);
          var chars = new Array(view.length);
          for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
          }
          return chars.join("");
        }
        function bufferClone(buf) {
          if (buf.slice) {
            return buf.slice(0);
          } else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
          }
        }
        function Body() {
          this.bodyUsed = false;
          this._initBody = function(body) {
            this.bodyUsed = this.bodyUsed;
            this._bodyInit = body;
            if (!body) {
              this._noBody = true;
              this._bodyText = "";
            } else if (typeof body === "string") {
              this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString();
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
              this._bodyArrayBuffer = bufferClone(body.buffer);
              this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
              this._bodyArrayBuffer = bufferClone(body);
            } else {
              this._bodyText = body = Object.prototype.toString.call(body);
            }
            if (!this.headers.get("content-type")) {
              if (typeof body === "string") {
                this.headers.set("content-type", "text/plain;charset=UTF-8");
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set("content-type", this._bodyBlob.type);
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
              }
            }
          };
          if (support.blob) {
            this.blob = function() {
              var rejected = consumed(this);
              if (rejected) {
                return rejected;
              }
              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
              } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
              } else if (this._bodyFormData) {
                throw new Error("could not read FormData body as blob");
              } else {
                return Promise.resolve(new Blob([this._bodyText]));
              }
            };
          }
          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              var isConsumed = consumed(this);
              if (isConsumed) {
                return isConsumed;
              } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
                return Promise.resolve(
                  this._bodyArrayBuffer.buffer.slice(
                    this._bodyArrayBuffer.byteOffset,
                    this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
                  )
                );
              } else {
                return Promise.resolve(this._bodyArrayBuffer);
              }
            } else if (support.blob) {
              return this.blob().then(readBlobAsArrayBuffer);
            } else {
              throw new Error("could not read as ArrayBuffer");
            }
          };
          this.text = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }
            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as text");
            } else {
              return Promise.resolve(this._bodyText);
            }
          };
          if (support.formData) {
            this.formData = function() {
              return this.text().then(decode);
            };
          }
          this.json = function() {
            return this.text().then(JSON.parse);
          };
          return this;
        }
        var methods = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
        function normalizeMethod(method) {
          var upcased = method.toUpperCase();
          return methods.indexOf(upcased) > -1 ? upcased : method;
        }
        function Request(input, options) {
          if (!(this instanceof Request)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          options = options || {};
          var body = options.body;
          if (input instanceof Request) {
            if (input.bodyUsed) {
              throw new TypeError("Already read");
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
              this.headers = new Headers3(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;
            if (!body && input._bodyInit != null) {
              body = input._bodyInit;
              input.bodyUsed = true;
            }
          } else {
            this.url = String(input);
          }
          this.credentials = options.credentials || this.credentials || "same-origin";
          if (options.headers || !this.headers) {
            this.headers = new Headers3(options.headers);
          }
          this.method = normalizeMethod(options.method || this.method || "GET");
          this.mode = options.mode || this.mode || null;
          this.signal = options.signal || this.signal || function() {
            if ("AbortController" in g2) {
              var ctrl = new AbortController();
              return ctrl.signal;
            }
          }();
          this.referrer = null;
          if ((this.method === "GET" || this.method === "HEAD") && body) {
            throw new TypeError("Body not allowed for GET or HEAD requests");
          }
          this._initBody(body);
          if (this.method === "GET" || this.method === "HEAD") {
            if (options.cache === "no-store" || options.cache === "no-cache") {
              var reParamSearch = /([?&])_=[^&]*/;
              if (reParamSearch.test(this.url)) {
                this.url = this.url.replace(reParamSearch, "$1_=" + (/* @__PURE__ */ new Date()).getTime());
              } else {
                var reQueryString = /\?/;
                this.url += (reQueryString.test(this.url) ? "&" : "?") + "_=" + (/* @__PURE__ */ new Date()).getTime();
              }
            }
          }
        }
        Request.prototype.clone = function() {
          return new Request(this, { body: this._bodyInit });
        };
        function decode(body) {
          var form = new FormData();
          body.trim().split("&").forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split("=");
              var name = split.shift().replace(/\+/g, " ");
              var value = split.join("=").replace(/\+/g, " ");
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
          return form;
        }
        function parseHeaders(rawHeaders) {
          var headers = new Headers3();
          var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
          preProcessedHeaders.split("\r").map(function(header) {
            return header.indexOf("\n") === 0 ? header.substr(1, header.length) : header;
          }).forEach(function(line) {
            var parts = line.split(":");
            var key = parts.shift().trim();
            if (key) {
              var value = parts.join(":").trim();
              try {
                headers.append(key, value);
              } catch (error) {
                console.warn("Response " + error.message);
              }
            }
          });
          return headers;
        }
        Body.call(Request.prototype);
        function Response(bodyInit, options) {
          if (!(this instanceof Response)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          if (!options) {
            options = {};
          }
          this.type = "default";
          this.status = options.status === void 0 ? 200 : options.status;
          if (this.status < 200 || this.status > 599) {
            throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].");
          }
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = options.statusText === void 0 ? "" : "" + options.statusText;
          this.headers = new Headers3(options.headers);
          this.url = options.url || "";
          this._initBody(bodyInit);
        }
        Body.call(Response.prototype);
        Response.prototype.clone = function() {
          return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers3(this.headers),
            url: this.url
          });
        };
        Response.error = function() {
          var response = new Response(null, { status: 200, statusText: "" });
          response.ok = false;
          response.status = 0;
          response.type = "error";
          return response;
        };
        var redirectStatuses = [301, 302, 303, 307, 308];
        Response.redirect = function(url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError("Invalid status code");
          }
          return new Response(null, { status, headers: { location: url } });
        };
        exports2.DOMException = g2.DOMException;
        try {
          new exports2.DOMException();
        } catch (err) {
          exports2.DOMException = function(message, name) {
            this.message = message;
            this.name = name;
            var error = Error(message);
            this.stack = error.stack;
          };
          exports2.DOMException.prototype = Object.create(Error.prototype);
          exports2.DOMException.prototype.constructor = exports2.DOMException;
        }
        function fetch2(input, init) {
          return new Promise(function(resolve, reject) {
            var request = new Request(input, init);
            if (request.signal && request.signal.aborted) {
              return reject(new exports2.DOMException("Aborted", "AbortError"));
            }
            var xhr = new XMLHttpRequest();
            function abortXhr() {
              xhr.abort();
            }
            xhr.onload = function() {
              var options = {
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || "")
              };
              if (request.url.indexOf("file://") === 0 && (xhr.status < 200 || xhr.status > 599)) {
                options.status = 200;
              } else {
                options.status = xhr.status;
              }
              options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
              var body = "response" in xhr ? xhr.response : xhr.responseText;
              setTimeout(function() {
                resolve(new Response(body, options));
              }, 0);
            };
            xhr.onerror = function() {
              setTimeout(function() {
                reject(new TypeError("Network request failed"));
              }, 0);
            };
            xhr.ontimeout = function() {
              setTimeout(function() {
                reject(new TypeError("Network request timed out"));
              }, 0);
            };
            xhr.onabort = function() {
              setTimeout(function() {
                reject(new exports2.DOMException("Aborted", "AbortError"));
              }, 0);
            };
            function fixUrl(url) {
              try {
                return url === "" && g2.location.href ? g2.location.href : url;
              } catch (e24) {
                return url;
              }
            }
            xhr.open(request.method, fixUrl(request.url), true);
            if (request.credentials === "include") {
              xhr.withCredentials = true;
            } else if (request.credentials === "omit") {
              xhr.withCredentials = false;
            }
            if ("responseType" in xhr) {
              if (support.blob) {
                xhr.responseType = "blob";
              } else if (support.arrayBuffer) {
                xhr.responseType = "arraybuffer";
              }
            }
            if (init && typeof init.headers === "object" && !(init.headers instanceof Headers3 || g2.Headers && init.headers instanceof g2.Headers)) {
              var names = [];
              Object.getOwnPropertyNames(init.headers).forEach(function(name) {
                names.push(normalizeName(name));
                xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
              });
              request.headers.forEach(function(value, name) {
                if (names.indexOf(name) === -1) {
                  xhr.setRequestHeader(name, value);
                }
              });
            } else {
              request.headers.forEach(function(value, name) {
                xhr.setRequestHeader(name, value);
              });
            }
            if (request.signal) {
              request.signal.addEventListener("abort", abortXhr);
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                  request.signal.removeEventListener("abort", abortXhr);
                }
              };
            }
            xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit);
          });
        }
        fetch2.polyfill = true;
        if (!g2.fetch) {
          g2.fetch = fetch2;
          g2.Headers = Headers3;
          g2.Request = Request;
          g2.Response = Response;
        }
        exports2.Headers = Headers3;
        exports2.Request = Request;
        exports2.Response = Response;
        exports2.fetch = fetch2;
        Object.defineProperty(exports2, "__esModule", { value: true });
        return exports2;
      }({});
    })(__globalThis__);
    __globalThis__.fetch.ponyfill = true;
    delete __globalThis__.fetch.polyfill;
    var ctx = __global__.fetch ? __global__ : __globalThis__;
    exports = ctx.fetch;
    exports.default = ctx.fetch;
    exports.fetch = ctx.fetch;
    exports.Headers = ctx.Headers;
    exports.Request = ctx.Request;
    exports.Response = ctx.Response;
    module2.exports = exports;
  }
});

// node_modules/nice-grpc-common/lib/Metadata.js
var require_Metadata = __commonJS({
  "node_modules/nice-grpc-common/lib/Metadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Metadata = void 0;
    exports.Metadata = function Metadata2(init) {
      const data = /* @__PURE__ */ new Map();
      const metadata = {
        set(key, value) {
          key = normalizeKey(key);
          if (Array.isArray(value)) {
            if (value.length === 0) {
              data.delete(key);
            } else {
              for (const item of value) {
                validate2(key, item);
              }
              data.set(key, key.endsWith("-bin") ? value : [value.join(", ")]);
            }
          } else {
            validate2(key, value);
            data.set(key, [value]);
          }
          return metadata;
        },
        append(key, value) {
          key = normalizeKey(key);
          validate2(key, value);
          let values = data.get(key);
          if (values == null) {
            values = [];
            data.set(key, values);
          }
          values.push(value);
          if (!key.endsWith("-bin")) {
            data.set(key, [values.join(", ")]);
          }
          return metadata;
        },
        delete(key) {
          key = normalizeKey(key);
          data.delete(key);
        },
        get(key) {
          var _a2;
          key = normalizeKey(key);
          return (_a2 = data.get(key)) === null || _a2 === void 0 ? void 0 : _a2[0];
        },
        getAll(key) {
          var _a2;
          key = normalizeKey(key);
          return (_a2 = data.get(key)) !== null && _a2 !== void 0 ? _a2 : [];
        },
        has(key) {
          key = normalizeKey(key);
          return data.has(key);
        },
        [Symbol.iterator]() {
          return data[Symbol.iterator]();
        }
      };
      if (init != null) {
        const entries = isIterable(init) ? init : Object.entries(init);
        for (const [key, value] of entries) {
          metadata.set(key, value);
        }
      }
      return metadata;
    };
    function normalizeKey(key) {
      return key.toLowerCase();
    }
    function validate2(key, value) {
      if (!/^[0-9a-z_.-]+$/.test(key)) {
        throw new Error(`Metadata key '${key}' contains illegal characters`);
      }
      if (key.endsWith("-bin")) {
        if (!(value instanceof Uint8Array)) {
          throw new Error(`Metadata key '${key}' ends with '-bin', thus it must have binary value`);
        }
      } else {
        if (typeof value !== "string") {
          throw new Error(`Metadata key '${key}' doesn't end with '-bin', thus it must have string value`);
        }
        if (!/^[ -~]*$/.test(value)) {
          throw new Error(`Metadata value '${value}' of key '${key}' contains illegal characters`);
        }
      }
    }
    function isIterable(value) {
      return Symbol.iterator in value;
    }
  }
});

// node_modules/nice-grpc-common/lib/Status.js
var require_Status = __commonJS({
  "node_modules/nice-grpc-common/lib/Status.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Status = void 0;
    var Status2;
    (function(Status3) {
      Status3[Status3["OK"] = 0] = "OK";
      Status3[Status3["CANCELLED"] = 1] = "CANCELLED";
      Status3[Status3["UNKNOWN"] = 2] = "UNKNOWN";
      Status3[Status3["INVALID_ARGUMENT"] = 3] = "INVALID_ARGUMENT";
      Status3[Status3["DEADLINE_EXCEEDED"] = 4] = "DEADLINE_EXCEEDED";
      Status3[Status3["NOT_FOUND"] = 5] = "NOT_FOUND";
      Status3[Status3["ALREADY_EXISTS"] = 6] = "ALREADY_EXISTS";
      Status3[Status3["PERMISSION_DENIED"] = 7] = "PERMISSION_DENIED";
      Status3[Status3["RESOURCE_EXHAUSTED"] = 8] = "RESOURCE_EXHAUSTED";
      Status3[Status3["FAILED_PRECONDITION"] = 9] = "FAILED_PRECONDITION";
      Status3[Status3["ABORTED"] = 10] = "ABORTED";
      Status3[Status3["OUT_OF_RANGE"] = 11] = "OUT_OF_RANGE";
      Status3[Status3["UNIMPLEMENTED"] = 12] = "UNIMPLEMENTED";
      Status3[Status3["INTERNAL"] = 13] = "INTERNAL";
      Status3[Status3["UNAVAILABLE"] = 14] = "UNAVAILABLE";
      Status3[Status3["DATA_LOSS"] = 15] = "DATA_LOSS";
      Status3[Status3["UNAUTHENTICATED"] = 16] = "UNAUTHENTICATED";
    })(Status2 || (exports.Status = Status2 = {}));
  }
});

// node_modules/nice-grpc-common/lib/MethodDescriptor.js
var require_MethodDescriptor = __commonJS({
  "node_modules/nice-grpc-common/lib/MethodDescriptor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/nice-grpc-common/lib/client/CallOptions.js
var require_CallOptions = __commonJS({
  "node_modules/nice-grpc-common/lib/client/CallOptions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/nice-grpc-common/lib/client/ClientMiddleware.js
var require_ClientMiddleware = __commonJS({
  "node_modules/nice-grpc-common/lib/client/ClientMiddleware.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/nice-grpc-common/lib/client/composeClientMiddleware.js
var require_composeClientMiddleware = __commonJS({
  "node_modules/nice-grpc-common/lib/client/composeClientMiddleware.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.composeClientMiddleware = composeClientMiddleware;
    function composeClientMiddleware(middleware1, middleware2) {
      return (call, options) => {
        return middleware2(Object.assign(Object.assign({}, call), { next: (request, options2) => {
          return middleware1(Object.assign(Object.assign({}, call), { request }), options2);
        } }), options);
      };
    }
  }
});

// node_modules/ts-error/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/ts-error/lib/helpers.js"(exports) {
    "use strict";
    exports.__esModule = void 0;
    exports.__esModule = true;
    var objectSetPrototypeOfIsDefined = typeof Object.setPrototypeOf === "function";
    var objectGetPrototypeOfIsDefined = typeof Object.getPrototypeOf === "function";
    var objectDefinePropertyIsDefined = typeof Object.defineProperty === "function";
    var objectCreateIsDefined = typeof Object.create === "function";
    var objectHasOwnPropertyIsDefined = typeof Object.prototype.hasOwnProperty === "function";
    var setPrototypeOf = function setPrototypeOf2(target, prototype) {
      if (objectSetPrototypeOfIsDefined) {
        Object.setPrototypeOf(target, prototype);
      } else {
        target.__proto__ = prototype;
      }
    };
    exports.setPrototypeOf = setPrototypeOf;
    var getPrototypeOf = function getPrototypeOf2(target) {
      if (objectGetPrototypeOfIsDefined) {
        return Object.getPrototypeOf(target);
      } else {
        return target.__proto__ || target.prototype;
      }
    };
    exports.getPrototypeOf = getPrototypeOf;
    var ie8ObjectDefinePropertyBug = false;
    var defineProperty = function defineProperty2(target, name, propertyDescriptor) {
      if (objectDefinePropertyIsDefined && !ie8ObjectDefinePropertyBug) {
        try {
          Object.defineProperty(target, name, propertyDescriptor);
        } catch (e24) {
          ie8ObjectDefinePropertyBug = true;
          defineProperty2(target, name, propertyDescriptor);
        }
      } else {
        target[name] = propertyDescriptor.value;
      }
    };
    exports.defineProperty = defineProperty;
    var hasOwnProperty = function hasOwnProperty2(target, name) {
      if (objectHasOwnPropertyIsDefined) {
        return target.hasOwnProperty(target, name);
      } else {
        return target[name] === void 0;
      }
    };
    exports.hasOwnProperty = hasOwnProperty;
    var objectCreate = function objectCreate2(prototype, propertyDescriptors) {
      if (objectCreateIsDefined) {
        return Object.create(prototype, propertyDescriptors);
      } else {
        var F2 = function F3() {
        };
        F2.prototype = prototype;
        var result = new F2();
        if (typeof propertyDescriptors === "undefined") {
          return result;
        }
        if (typeof propertyDescriptors === "null") {
          throw new Error("PropertyDescriptors must not be null.");
        }
        if (typeof propertyDescriptors === "object") {
          for (var key in propertyDescriptors) {
            if (hasOwnProperty(propertyDescriptors, key)) {
              result[key] = propertyDescriptors[key].value;
            }
          }
        }
        return result;
      }
    };
    exports.objectCreate = objectCreate;
  }
});

// node_modules/ts-error/lib/cjs.js
var require_cjs = __commonJS({
  "node_modules/ts-error/lib/cjs.js"(exports) {
    "use strict";
    exports.__esModule = void 0;
    exports.__esModule = true;
    var helpers = require_helpers();
    var setPrototypeOf = helpers.setPrototypeOf;
    var getPrototypeOf = helpers.getPrototypeOf;
    var defineProperty = helpers.defineProperty;
    var objectCreate = helpers.objectCreate;
    var uglyErrorPrinting = new Error().toString() === "[object Error]";
    var extendableErrorName = "";
    function ExtendableError(message) {
      var originalConstructor = this.constructor;
      var constructorName = originalConstructor.name || function() {
        var constructorNameMatch = originalConstructor.toString().match(/^function\s*([^\s(]+)/);
        return constructorNameMatch === null ? extendableErrorName ? extendableErrorName : "Error" : constructorNameMatch[1];
      }();
      var constructorNameIsError = constructorName === "Error";
      var name = constructorNameIsError ? extendableErrorName : constructorName;
      var instance = Error.apply(this, arguments);
      setPrototypeOf(instance, getPrototypeOf(this));
      if (!(instance instanceof originalConstructor) || !(instance instanceof ExtendableError)) {
        var instance = this;
        Error.apply(this, arguments);
        defineProperty(instance, "message", {
          configurable: true,
          enumerable: false,
          value: message,
          writable: true
        });
      }
      defineProperty(instance, "name", {
        configurable: true,
        enumerable: false,
        value: name,
        writable: true
      });
      if (Error.captureStackTrace) {
        Error.captureStackTrace(
          instance,
          constructorNameIsError ? ExtendableError : originalConstructor
        );
      }
      if (instance.stack === void 0) {
        var err = new Error(message);
        err.name = instance.name;
        instance.stack = err.stack;
      }
      if (uglyErrorPrinting) {
        defineProperty(instance, "toString", {
          configurable: true,
          enumerable: false,
          value: function toString2() {
            return (this.name || "Error") + (typeof this.message === "undefined" ? "" : ": " + this.message);
          },
          writable: true
        });
      }
      return instance;
    }
    extendableErrorName = ExtendableError.name || "ExtendableError";
    ExtendableError.prototype = objectCreate(Error.prototype, {
      constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    exports.ExtendableError = ExtendableError;
    exports["default"] = exports.ExtendableError;
  }
});

// node_modules/nice-grpc-common/lib/client/ClientError.js
var require_ClientError = __commonJS({
  "node_modules/nice-grpc-common/lib/client/ClientError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClientError = void 0;
    var ts_error_1 = require_cjs();
    var Status_1 = require_Status();
    var ClientError3 = class _ClientError extends ts_error_1.ExtendableError {
      constructor(path, code, details) {
        super(`${path} ${Status_1.Status[code]}: ${details}`);
        this.path = path;
        this.code = code;
        this.details = details;
        this.name = "ClientError";
        Object.defineProperty(this, "@@nice-grpc", {
          value: true
        });
        Object.defineProperty(this, "@@nice-grpc:ClientError", {
          value: true
        });
      }
      static [Symbol.hasInstance](instance) {
        if (this !== _ClientError) {
          return this.prototype.isPrototypeOf(instance);
        }
        return typeof instance === "object" && instance !== null && (instance.constructor === _ClientError || instance["@@nice-grpc:ClientError"] === true || instance.name === "ClientError" && instance["@@nice-grpc"] === true);
      }
    };
    exports.ClientError = ClientError3;
  }
});

// node_modules/nice-grpc-common/lib/server/CallContext.js
var require_CallContext = __commonJS({
  "node_modules/nice-grpc-common/lib/server/CallContext.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/nice-grpc-common/lib/server/ServerMiddleware.js
var require_ServerMiddleware = __commonJS({
  "node_modules/nice-grpc-common/lib/server/ServerMiddleware.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/nice-grpc-common/lib/server/composeServerMiddleware.js
var require_composeServerMiddleware = __commonJS({
  "node_modules/nice-grpc-common/lib/server/composeServerMiddleware.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.composeServerMiddleware = composeServerMiddleware;
    function composeServerMiddleware(middleware1, middleware2) {
      return (call, context) => {
        return middleware1(Object.assign(Object.assign({}, call), { next: (request, context1) => {
          return middleware2(Object.assign(Object.assign({}, call), { request }), context1);
        } }), context);
      };
    }
  }
});

// node_modules/nice-grpc-common/lib/server/ServerError.js
var require_ServerError = __commonJS({
  "node_modules/nice-grpc-common/lib/server/ServerError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServerError = void 0;
    var ts_error_1 = require_cjs();
    var Status_1 = require_Status();
    var ServerError2 = class _ServerError extends ts_error_1.ExtendableError {
      constructor(code, details) {
        super(`${Status_1.Status[code]}: ${details}`);
        this.code = code;
        this.details = details;
        this.name = "ServerError";
        Object.defineProperty(this, "@@nice-grpc", {
          value: true
        });
        Object.defineProperty(this, "@@nice-grpc:ServerError", {
          value: true
        });
      }
      static [Symbol.hasInstance](instance) {
        if (this !== _ServerError) {
          return this.prototype.isPrototypeOf(instance);
        }
        return typeof instance === "object" && instance !== null && (instance.constructor === _ServerError || instance["@@nice-grpc:ServerError"] === true || instance.name === "ServerError" && instance["@@nice-grpc"] === true);
      }
    };
    exports.ServerError = ServerError2;
  }
});

// node_modules/nice-grpc-common/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/nice-grpc-common/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o, k22, desc);
    } : function(o, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o[k22] = m2[k2];
    });
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding(exports2, m2, p2);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_Metadata(), exports);
    __exportStar(require_Status(), exports);
    __exportStar(require_MethodDescriptor(), exports);
    __exportStar(require_CallOptions(), exports);
    __exportStar(require_ClientMiddleware(), exports);
    __exportStar(require_composeClientMiddleware(), exports);
    __exportStar(require_ClientError(), exports);
    __exportStar(require_CallContext(), exports);
    __exportStar(require_ServerMiddleware(), exports);
    __exportStar(require_composeServerMiddleware(), exports);
    __exportStar(require_ServerError(), exports);
  }
});

// node_modules/nice-grpc-client-middleware-retry/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/nice-grpc-client-middleware-retry/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.retryMiddleware = void 0;
    var abort_controller_x_1 = require_lib();
    var nice_grpc_common_1 = require_lib2();
    var defaultRetryableStatuses = [
      nice_grpc_common_1.Status.UNKNOWN,
      nice_grpc_common_1.Status.INTERNAL,
      nice_grpc_common_1.Status.UNAVAILABLE,
      // Server may return `CANCELLED` if it is shutting down. We can distinguish
      // this from client-initiated cancellations because these are returned as
      // `AbortError`s.
      nice_grpc_common_1.Status.CANCELLED
    ];
    var retryMiddleware2 = async function* retryMiddleware3(call, options) {
      var _a2;
      const { idempotencyLevel } = call.method.options;
      const isIdempotent = idempotencyLevel === "IDEMPOTENT" || idempotencyLevel === "NO_SIDE_EFFECTS";
      const { retry = isIdempotent, retryBaseDelayMs = 1e3, retryMaxDelayMs = 3e4, retryMaxAttempts = 1, onRetryableError, retryableStatuses = defaultRetryableStatuses, ...restOptions } = options;
      if (call.requestStream || call.responseStream || !retry) {
        return yield* call.next(call.request, restOptions);
      }
      const signal = (_a2 = options.signal) !== null && _a2 !== void 0 ? _a2 : new AbortController().signal;
      for (let attempt = 0; ; attempt++) {
        try {
          return yield* call.next(call.request, restOptions);
        } catch (error) {
          (0, abort_controller_x_1.rethrowAbortError)(error);
          if (attempt >= retryMaxAttempts || !(error instanceof nice_grpc_common_1.ClientError) || !retryableStatuses.includes(error.code)) {
            throw error;
          }
          const backoff = Math.min(retryMaxDelayMs, Math.pow(2, attempt) * retryBaseDelayMs);
          const delayMs = Math.round(backoff * (1 + Math.random()) / 2);
          onRetryableError === null || onRetryableError === void 0 ? void 0 : onRetryableError(error, attempt, delayMs);
          await (0, abort_controller_x_1.delay)(signal, delayMs);
        }
      }
    };
    exports.retryMiddleware = retryMiddleware2;
  }
});

// node_modules/nice-grpc-web/lib/service-definitions/grpc-web.js
var require_grpc_web = __commonJS({
  "node_modules/nice-grpc-web/lib/service-definitions/grpc-web.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fromGrpcWebServiceDefinition = fromGrpcWebServiceDefinition;
    exports.isGrpcWebServiceDefinition = isGrpcWebServiceDefinition;
    function fromGrpcWebServiceDefinition(definition) {
      const result = {};
      for (const [key, value] of Object.entries(definition)) {
        if (key === "serviceName") {
          continue;
        }
        const method = value;
        result[uncapitalize(key)] = {
          path: `/${definition.serviceName}/${key}`,
          requestStream: method.requestStream,
          responseStream: method.responseStream,
          requestDeserialize: method.requestType.deserializeBinary,
          requestSerialize: (value2) => value2.serializeBinary(),
          responseDeserialize: method.responseType.deserializeBinary,
          responseSerialize: (value2) => value2.serializeBinary(),
          options: {}
        };
      }
      return result;
    }
    function isGrpcWebServiceDefinition(definition) {
      return "prototype" in definition;
    }
    function uncapitalize(value) {
      if (value.length === 0) {
        return value;
      }
      return value[0].toLowerCase() + value.slice(1);
    }
  }
});

// node_modules/nice-grpc-web/lib/service-definitions/ts-proto.js
var require_ts_proto = __commonJS({
  "node_modules/nice-grpc-web/lib/service-definitions/ts-proto.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fromTsProtoServiceDefinition = fromTsProtoServiceDefinition;
    exports.isTsProtoServiceDefinition = isTsProtoServiceDefinition;
    function fromTsProtoServiceDefinition(definition) {
      const result = {};
      for (const [key, method] of Object.entries(definition.methods)) {
        const requestEncode = method.requestType.encode;
        const requestFromPartial = method.requestType.fromPartial;
        const responseEncode = method.responseType.encode;
        const responseFromPartial = method.responseType.fromPartial;
        result[key] = {
          path: `/${definition.fullName}/${method.name}`,
          requestStream: method.requestStream,
          responseStream: method.responseStream,
          requestDeserialize: method.requestType.decode,
          requestSerialize: requestFromPartial != null ? (value) => requestEncode(requestFromPartial(value)).finish() : (value) => requestEncode(value).finish(),
          responseDeserialize: method.responseType.decode,
          responseSerialize: responseFromPartial != null ? (value) => responseEncode(responseFromPartial(value)).finish() : (value) => responseEncode(value).finish(),
          options: method.options
        };
      }
      return result;
    }
    function isTsProtoServiceDefinition(definition) {
      return "name" in definition && "fullName" in definition && "methods" in definition;
    }
  }
});

// node_modules/nice-grpc-web/lib/service-definitions/index.js
var require_service_definitions = __commonJS({
  "node_modules/nice-grpc-web/lib/service-definitions/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeServiceDefinition = normalizeServiceDefinition;
    var grpc_web_1 = require_grpc_web();
    var ts_proto_1 = require_ts_proto();
    function normalizeServiceDefinition(definition) {
      if ((0, grpc_web_1.isGrpcWebServiceDefinition)(definition)) {
        return (0, grpc_web_1.fromGrpcWebServiceDefinition)(definition);
      } else if ((0, ts_proto_1.isTsProtoServiceDefinition)(definition)) {
        return (0, ts_proto_1.fromTsProtoServiceDefinition)(definition);
      } else {
        return definition;
      }
    }
  }
});

// node_modules/js-base64/base64.js
var require_base64 = __commonJS({
  "node_modules/js-base64/base64.js"(exports, module2) {
    (function(global2, factory) {
      typeof exports === "object" && typeof module2 !== "undefined" ? module2.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (
        // cf. https://github.com/dankogai/js-base64/issues/119
        function() {
          var _Base64 = global2.Base64;
          var gBase64 = factory();
          gBase64.noConflict = function() {
            global2.Base64 = _Base64;
            return gBase64;
          };
          if (global2.Meteor) {
            Base64 = gBase64;
          }
          global2.Base64 = gBase64;
        }()
      );
    })(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : exports, function() {
      "use strict";
      var version = "3.7.8";
      var VERSION = version;
      var _hasBuffer = typeof Buffer === "function";
      var _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
      var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
      var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var b64chs = Array.prototype.slice.call(b64ch);
      var b64tab = function(a) {
        var tab = {};
        a.forEach(function(c, i) {
          return tab[c] = i;
        });
        return tab;
      }(b64chs);
      var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
      var _fromCC = String.fromCharCode.bind(String);
      var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : function(it2) {
        return new Uint8Array(Array.prototype.slice.call(it2, 0));
      };
      var _mkUriSafe = function(src) {
        return src.replace(/=/g, "").replace(/[+\/]/g, function(m0) {
          return m0 == "+" ? "-" : "_";
        });
      };
      var _tidyB64 = function(s) {
        return s.replace(/[^A-Za-z0-9\+\/]/g, "");
      };
      var btoaPolyfill = function(bin) {
        var u32, c0, c1, c2, asc = "";
        var pad = bin.length % 3;
        for (var i = 0; i < bin.length; ) {
          if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
            throw new TypeError("invalid character found");
          u32 = c0 << 16 | c1 << 8 | c2;
          asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
        }
        return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
      };
      var _btoa = typeof btoa === "function" ? function(bin) {
        return btoa(bin);
      } : _hasBuffer ? function(bin) {
        return Buffer.from(bin, "binary").toString("base64");
      } : btoaPolyfill;
      var _fromUint8Array = _hasBuffer ? function(u8a) {
        return Buffer.from(u8a).toString("base64");
      } : function(u8a) {
        var maxargs = 4096;
        var strs = [];
        for (var i = 0, l2 = u8a.length; i < l2; i += maxargs) {
          strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
        }
        return _btoa(strs.join(""));
      };
      var fromUint8Array = function(u8a, urlsafe) {
        if (urlsafe === void 0) {
          urlsafe = false;
        }
        return urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
      };
      var cb_utob = function(c) {
        if (c.length < 2) {
          var cc2 = c.charCodeAt(0);
          return cc2 < 128 ? c : cc2 < 2048 ? _fromCC(192 | cc2 >>> 6) + _fromCC(128 | cc2 & 63) : _fromCC(224 | cc2 >>> 12 & 15) + _fromCC(128 | cc2 >>> 6 & 63) + _fromCC(128 | cc2 & 63);
        } else {
          var cc2 = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
          return _fromCC(240 | cc2 >>> 18 & 7) + _fromCC(128 | cc2 >>> 12 & 63) + _fromCC(128 | cc2 >>> 6 & 63) + _fromCC(128 | cc2 & 63);
        }
      };
      var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
      var utob = function(u) {
        return u.replace(re_utob, cb_utob);
      };
      var _encode = _hasBuffer ? function(s) {
        return Buffer.from(s, "utf8").toString("base64");
      } : _TE ? function(s) {
        return _fromUint8Array(_TE.encode(s));
      } : function(s) {
        return _btoa(utob(s));
      };
      var encode = function(src, urlsafe) {
        if (urlsafe === void 0) {
          urlsafe = false;
        }
        return urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
      };
      var encodeURI = function(src) {
        return encode(src, true);
      };
      var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
      var cb_btou = function(cccc) {
        switch (cccc.length) {
          case 4:
            var cp2 = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp2 - 65536;
            return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
          case 3:
            return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
          default:
            return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
        }
      };
      var btou = function(b2) {
        return b2.replace(re_btou, cb_btou);
      };
      var atobPolyfill = function(asc) {
        asc = asc.replace(/\s+/g, "");
        if (!b64re.test(asc))
          throw new TypeError("malformed base64.");
        asc += "==".slice(2 - (asc.length & 3));
        var u24, r1, r2;
        var binArray = [];
        for (var i = 0; i < asc.length; ) {
          u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
          if (r1 === 64) {
            binArray.push(_fromCC(u24 >> 16 & 255));
          } else if (r2 === 64) {
            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
          } else {
            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
          }
        }
        return binArray.join("");
      };
      var _atob = typeof atob === "function" ? function(asc) {
        return atob(_tidyB64(asc));
      } : _hasBuffer ? function(asc) {
        return Buffer.from(asc, "base64").toString("binary");
      } : atobPolyfill;
      var _toUint8Array = _hasBuffer ? function(a) {
        return _U8Afrom(Buffer.from(a, "base64"));
      } : function(a) {
        return _U8Afrom(_atob(a).split("").map(function(c) {
          return c.charCodeAt(0);
        }));
      };
      var toUint8Array = function(a) {
        return _toUint8Array(_unURI(a));
      };
      var _decode = _hasBuffer ? function(a) {
        return Buffer.from(a, "base64").toString("utf8");
      } : _TD ? function(a) {
        return _TD.decode(_toUint8Array(a));
      } : function(a) {
        return btou(_atob(a));
      };
      var _unURI = function(a) {
        return _tidyB64(a.replace(/[-_]/g, function(m0) {
          return m0 == "-" ? "+" : "/";
        }));
      };
      var decode = function(src) {
        return _decode(_unURI(src));
      };
      var isValid = function(src) {
        if (typeof src !== "string")
          return false;
        var s = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
        return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
      };
      var _noEnum = function(v2) {
        return {
          value: v2,
          enumerable: false,
          writable: true,
          configurable: true
        };
      };
      var extendString = function() {
        var _add = function(name, body) {
          return Object.defineProperty(String.prototype, name, _noEnum(body));
        };
        _add("fromBase64", function() {
          return decode(this);
        });
        _add("toBase64", function(urlsafe) {
          return encode(this, urlsafe);
        });
        _add("toBase64URI", function() {
          return encode(this, true);
        });
        _add("toBase64URL", function() {
          return encode(this, true);
        });
        _add("toUint8Array", function() {
          return toUint8Array(this);
        });
      };
      var extendUint8Array = function() {
        var _add = function(name, body) {
          return Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
        };
        _add("toBase64", function(urlsafe) {
          return fromUint8Array(this, urlsafe);
        });
        _add("toBase64URI", function() {
          return fromUint8Array(this, true);
        });
        _add("toBase64URL", function() {
          return fromUint8Array(this, true);
        });
      };
      var extendBuiltins = function() {
        extendString();
        extendUint8Array();
      };
      var gBase64 = {
        version,
        VERSION,
        atob: _atob,
        atobPolyfill,
        btoa: _btoa,
        btoaPolyfill,
        fromBase64: decode,
        toBase64: encode,
        encode,
        encodeURI,
        encodeURL: encodeURI,
        utob,
        btou,
        decode,
        isValid,
        fromUint8Array,
        toUint8Array,
        extendString,
        extendUint8Array,
        extendBuiltins
      };
      gBase64.Base64 = {};
      Object.keys(gBase64).forEach(function(k2) {
        return gBase64.Base64[k2] = gBase64[k2];
      });
      return gBase64;
    });
  }
});

// node_modules/nice-grpc-web/lib/client/transports/fetch.js
var require_fetch = __commonJS({
  "node_modules/nice-grpc-web/lib/client/transports/fetch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FetchTransport = FetchTransport2;
    var abort_controller_x_1 = require_lib();
    var js_base64_1 = require_base64();
    var nice_grpc_common_1 = require_lib2();
    function FetchTransport2(config) {
      return async function* fetchTransport({ url, body, metadata, signal, method }) {
        let requestBody;
        if (!method.requestStream) {
          let bodyBuffer;
          for await (const chunk of body) {
            bodyBuffer = chunk;
            break;
          }
          requestBody = bodyBuffer;
        } else {
          let iterator;
          requestBody = new ReadableStream({
            type: "bytes",
            start() {
              iterator = body[Symbol.asyncIterator]();
            },
            async pull(controller) {
              const { done, value } = await iterator.next();
              if (done) {
                controller.close();
              } else {
                controller.enqueue(value);
              }
            },
            async cancel() {
              var _a2, _b;
              await ((_b = (_a2 = iterator).return) === null || _b === void 0 ? void 0 : _b.call(_a2));
            }
          });
        }
        const response = await fetch(url, {
          method: "POST",
          body: requestBody,
          headers: metadataToHeaders(metadata),
          signal,
          cache: config === null || config === void 0 ? void 0 : config.cache,
          ["duplex"]: "half",
          credentials: config === null || config === void 0 ? void 0 : config.credentials
        });
        yield {
          type: "header",
          header: headersToMetadata(response.headers)
        };
        if (!response.ok) {
          const responseText = await response.text();
          throw new nice_grpc_common_1.ClientError(method.path, getStatusFromHttpCode(response.status), getErrorDetailsFromHttpResponse(response.status, responseText));
        }
        (0, abort_controller_x_1.throwIfAborted)(signal);
        const reader = response.body.getReader();
        const abortListener = () => {
          reader.cancel().catch(() => {
          });
        };
        signal.addEventListener("abort", abortListener);
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (value != null) {
              yield {
                type: "data",
                data: value
              };
            }
            if (done) {
              break;
            }
          }
        } finally {
          signal.removeEventListener("abort", abortListener);
          (0, abort_controller_x_1.throwIfAborted)(signal);
        }
      };
    }
    function metadataToHeaders(metadata) {
      const headers = new Headers();
      for (const [key, values] of metadata) {
        for (const value of values) {
          headers.append(key, typeof value === "string" ? value : js_base64_1.Base64.fromUint8Array(value));
        }
      }
      return headers;
    }
    function headersToMetadata(headers) {
      const metadata = new nice_grpc_common_1.Metadata();
      for (const [key, value] of headers) {
        if (key.endsWith("-bin")) {
          for (const item of value.split(/,\s?/)) {
            metadata.append(key, js_base64_1.Base64.toUint8Array(item));
          }
        } else {
          metadata.set(key, value);
        }
      }
      return metadata;
    }
    function getStatusFromHttpCode(statusCode) {
      switch (statusCode) {
        case 400:
          return nice_grpc_common_1.Status.INTERNAL;
        case 401:
          return nice_grpc_common_1.Status.UNAUTHENTICATED;
        case 403:
          return nice_grpc_common_1.Status.PERMISSION_DENIED;
        case 404:
          return nice_grpc_common_1.Status.UNIMPLEMENTED;
        case 429:
        case 502:
        case 503:
        case 504:
          return nice_grpc_common_1.Status.UNAVAILABLE;
        default:
          return nice_grpc_common_1.Status.UNKNOWN;
      }
    }
    function getErrorDetailsFromHttpResponse(statusCode, responseText) {
      return `Received HTTP ${statusCode} response: ` + (responseText.length > 1e3 ? responseText.slice(0, 1e3) + "... (truncated)" : responseText);
    }
  }
});

// node_modules/nice-grpc-web/lib/client/channel.js
var require_channel = __commonJS({
  "node_modules/nice-grpc-web/lib/client/channel.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createChannel = createChannel2;
    var fetch_1 = require_fetch();
    function createChannel2(address, transport = (0, fetch_1.FetchTransport)()) {
      return { address, transport };
    }
  }
});

// node_modules/nice-grpc-web/lib/utils/isAsyncIterable.js
var require_isAsyncIterable = __commonJS({
  "node_modules/nice-grpc-web/lib/utils/isAsyncIterable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAsyncIterable = isAsyncIterable;
    function isAsyncIterable(value) {
      return value != null && Symbol.asyncIterator in value;
    }
  }
});

// node_modules/nice-grpc-web/lib/utils/concatBuffers.js
var require_concatBuffers = __commonJS({
  "node_modules/nice-grpc-web/lib/utils/concatBuffers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.concatBuffers = concatBuffers;
    function concatBuffers(buffers, totalLength) {
      if (buffers.length === 1) {
        return buffers[0];
      }
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buffer of buffers) {
        result.set(buffer, offset);
        offset += buffer.length;
      }
      return result;
    }
  }
});

// node_modules/nice-grpc-web/lib/client/decodeMetadata.js
var require_decodeMetadata = __commonJS({
  "node_modules/nice-grpc-web/lib/client/decodeMetadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeMetadata = decodeMetadata;
    var nice_grpc_common_1 = require_lib2();
    var js_base64_1 = require_base64();
    function decodeMetadata(data) {
      const metadata = (0, nice_grpc_common_1.Metadata)();
      const text = new TextDecoder().decode(data);
      for (const line of text.split("\r\n")) {
        if (!line) {
          continue;
        }
        const splitIndex = line.indexOf(":");
        if (splitIndex === -1) {
          throw new Error(`Invalid metadata line: ${line}`);
        }
        const key = line.slice(0, splitIndex).trim().toLowerCase();
        const value = line.slice(splitIndex + 1).trim();
        if (key.endsWith("-bin")) {
          for (const item of value.split(/,\s?/)) {
            metadata.append(key, js_base64_1.Base64.toUint8Array(item));
          }
        } else {
          metadata.append(key, value);
        }
      }
      return metadata;
    }
  }
});

// node_modules/nice-grpc-web/lib/client/framing.js
var require_framing = __commonJS({
  "node_modules/nice-grpc-web/lib/client/framing.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LPM_HEADER_LENGTH = void 0;
    exports.parseLpmHeader = parseLpmHeader;
    exports.encodeFrame = encodeFrame;
    exports.LPM_HEADER_LENGTH = 5;
    function parseLpmHeader(data) {
      if (data.length !== exports.LPM_HEADER_LENGTH) {
        throw new Error(`Invalid LPM header length: ${data.length}`);
      }
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      const compressed = (view.getUint8(0) & 1) !== 0;
      const isMetadata = (view.getUint8(0) & 128) !== 0;
      const length = view.getUint32(1);
      return {
        compressed,
        isMetadata,
        length
      };
    }
    function encodeFrame(data) {
      const messageBytes = new Uint8Array(exports.LPM_HEADER_LENGTH + data.length);
      new DataView(messageBytes.buffer, 1, 4).setUint32(0, data.length, false);
      messageBytes.set(data, exports.LPM_HEADER_LENGTH);
      return messageBytes;
    }
  }
});

// node_modules/nice-grpc-web/lib/client/decodeResponse.js
var require_decodeResponse = __commonJS({
  "node_modules/nice-grpc-web/lib/client/decodeResponse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeResponse = decodeResponse;
    var concatBuffers_1 = require_concatBuffers();
    var decodeMetadata_1 = require_decodeMetadata();
    var framing_1 = require_framing();
    async function* decodeResponse({ response, decode, onHeader, onTrailer }) {
      let receivedHeader = false;
      let receivedTrailer = false;
      let receivedData = false;
      let buffer = createChunkBuffer(framing_1.LPM_HEADER_LENGTH);
      let lpmHeader;
      for await (const frame of response) {
        if (frame.type === "header") {
          handleHeader(frame.header);
        } else if (frame.type === "trailer") {
          handleTrailer(frame.trailer);
        } else if (frame.type === "data") {
          if (receivedTrailer) {
            throw new Error("Received data after trailer");
          }
          let { data } = frame;
          while (data.length > 0 || (lpmHeader === null || lpmHeader === void 0 ? void 0 : lpmHeader.length) === 0) {
            const position = Math.min(data.length, buffer.targetLength - buffer.totalLength);
            const chunk = data.subarray(0, position);
            data = data.subarray(position);
            buffer.chunks.push(chunk);
            buffer.totalLength += chunk.length;
            if (buffer.totalLength === buffer.targetLength) {
              const messageBytes = (0, concatBuffers_1.concatBuffers)(buffer.chunks, buffer.totalLength);
              if (lpmHeader == null) {
                lpmHeader = (0, framing_1.parseLpmHeader)(messageBytes);
                buffer = createChunkBuffer(lpmHeader.length);
              } else {
                if (lpmHeader.compressed) {
                  throw new Error("Compressed messages not supported");
                }
                if (lpmHeader.isMetadata) {
                  if (!receivedHeader) {
                    handleHeader((0, decodeMetadata_1.decodeMetadata)(messageBytes));
                  } else {
                    handleTrailer((0, decodeMetadata_1.decodeMetadata)(messageBytes));
                  }
                } else {
                  if (!receivedHeader) {
                    throw new Error("Received data before header");
                  }
                  yield decode(messageBytes);
                  receivedData = true;
                }
                lpmHeader = void 0;
                buffer = createChunkBuffer(framing_1.LPM_HEADER_LENGTH);
              }
            }
          }
        }
      }
      function handleHeader(header) {
        if (receivedHeader) {
          throw new Error("Received multiple headers");
        }
        if (receivedData) {
          throw new Error("Received header after data");
        }
        if (receivedTrailer) {
          throw new Error("Received header after trailer");
        }
        receivedHeader = true;
        onHeader(header);
      }
      function handleTrailer(trailer) {
        if (receivedTrailer) {
          throw new Error("Received multiple trailers");
        }
        receivedTrailer = true;
        onTrailer(trailer);
      }
      function createChunkBuffer(targetLength) {
        return {
          chunks: [],
          totalLength: 0,
          targetLength
        };
      }
    }
  }
});

// node_modules/nice-grpc-web/lib/client/encodeRequest.js
var require_encodeRequest = __commonJS({
  "node_modules/nice-grpc-web/lib/client/encodeRequest.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encodeRequest = encodeRequest;
    var framing_1 = require_framing();
    async function* encodeRequest({ request, encode }) {
      for await (const data of request) {
        const bytes = encode(data);
        yield (0, framing_1.encodeFrame)(bytes);
      }
    }
  }
});

// node_modules/nice-grpc-web/lib/client/makeInternalErrorMessage.js
var require_makeInternalErrorMessage = __commonJS({
  "node_modules/nice-grpc-web/lib/client/makeInternalErrorMessage.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeInternalErrorMessage = makeInternalErrorMessage;
    function makeInternalErrorMessage(err) {
      if (err == null || typeof err !== "object") {
        return String(err);
      } else if (typeof err.message === "string") {
        return err.message;
      } else {
        return JSON.stringify(err);
      }
    }
  }
});

// node_modules/nice-grpc-web/lib/client/parseTrailer.js
var require_parseTrailer = __commonJS({
  "node_modules/nice-grpc-web/lib/client/parseTrailer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseTrailer = parseTrailer;
    var nice_grpc_common_1 = require_lib2();
    function parseTrailer(trailer) {
      let status;
      const statusValue = trailer.get("grpc-status");
      if (statusValue != null) {
        const statusNum = +statusValue;
        if (statusNum in nice_grpc_common_1.Status) {
          status = statusNum;
        } else {
          throw new Error(`Received invalid status code from server: ${statusValue}`);
        }
      } else {
        throw new Error("Received no status code from server");
      }
      let message = trailer.get("grpc-message");
      if (message != null) {
        try {
          message = decodeURIComponent(message);
        } catch (_a2) {
        }
      }
      const trailerCopy = (0, nice_grpc_common_1.Metadata)(trailer);
      trailerCopy.delete("grpc-status");
      trailerCopy.delete("grpc-message");
      return {
        status,
        message,
        trailer: trailerCopy
      };
    }
  }
});

// node_modules/nice-grpc-web/lib/client/makeCall.js
var require_makeCall = __commonJS({
  "node_modules/nice-grpc-web/lib/client/makeCall.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeCall = makeCall;
    var abort_controller_x_1 = require_lib();
    var nice_grpc_common_1 = require_lib2();
    var decodeResponse_1 = require_decodeResponse();
    var encodeRequest_1 = require_encodeRequest();
    var makeInternalErrorMessage_1 = require_makeInternalErrorMessage();
    var parseTrailer_1 = require_parseTrailer();
    async function* makeCall(definition, channel, request, options) {
      const { metadata, signal = new AbortController().signal, onHeader, onTrailer } = options;
      (0, abort_controller_x_1.throwIfAborted)(signal);
      let receivedTrailersOnly = false;
      let status;
      let message;
      function handleTrailer(trailer) {
        if (receivedTrailersOnly) {
          if (new Map(trailer).size > 0) {
            throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.INTERNAL, "Received non-empty trailer after trailers-only response");
          } else {
            return;
          }
        }
        const parsedTrailer = (0, parseTrailer_1.parseTrailer)(trailer);
        ({ status, message } = parsedTrailer);
        onTrailer === null || onTrailer === void 0 ? void 0 : onTrailer(parsedTrailer.trailer);
      }
      const finalMetadata = (0, nice_grpc_common_1.Metadata)(metadata);
      finalMetadata.set("content-type", "application/grpc-web+proto");
      finalMetadata.set("x-grpc-web", "1");
      const innerAbortController = new AbortController();
      const abortListener = () => {
        innerAbortController.abort();
      };
      signal.addEventListener("abort", abortListener);
      let finished = false;
      let requestError;
      async function* interceptRequestError() {
        try {
          for await (const item of request) {
            if (finished) {
              throw new Error("Request finished");
            }
            yield item;
          }
        } catch (err) {
          requestError = { err };
          innerAbortController.abort();
          throw err;
        }
      }
      async function* handleTransportErrors() {
        try {
          return yield* channel.transport({
            url: channel.address + definition.path,
            metadata: finalMetadata,
            body: (0, encodeRequest_1.encodeRequest)({
              request: interceptRequestError(),
              encode: definition.requestSerialize
            }),
            signal: innerAbortController.signal,
            method: definition
          });
        } catch (err) {
          (0, abort_controller_x_1.rethrowAbortError)(err);
          throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.UNKNOWN, `Transport error: ${(0, makeInternalErrorMessage_1.makeInternalErrorMessage)(err)}`);
        }
      }
      const response = (0, decodeResponse_1.decodeResponse)({
        response: handleTransportErrors(),
        decode: definition.responseDeserialize,
        onHeader(header) {
          const isTrailersOnly = header.has("grpc-status");
          if (isTrailersOnly) {
            handleTrailer(header);
            receivedTrailersOnly = true;
          } else {
            onHeader === null || onHeader === void 0 ? void 0 : onHeader(header);
          }
        },
        onTrailer(trailer) {
          handleTrailer(trailer);
        }
      });
      try {
        yield* response;
      } catch (err) {
        if (requestError !== void 0) {
          throw requestError.err;
        } else if (err instanceof nice_grpc_common_1.ClientError || (0, abort_controller_x_1.isAbortError)(err)) {
          throw err;
        } else {
          throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.INTERNAL, (0, makeInternalErrorMessage_1.makeInternalErrorMessage)(err));
        }
      } finally {
        finished = true;
        signal.removeEventListener("abort", abortListener);
        if (status != null && status !== nice_grpc_common_1.Status.OK) {
          throw new nice_grpc_common_1.ClientError(definition.path, status, message !== null && message !== void 0 ? message : "");
        }
      }
      if (status == null) {
        throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.UNKNOWN, 'Response stream closed without gRPC status. This may indicate a misconfigured CORS policy on the server: Access-Control-Expose-Headers must include "grpc-status" and "grpc-message".');
      }
    }
  }
});

// node_modules/nice-grpc-web/lib/client/createBidiStreamingMethod.js
var require_createBidiStreamingMethod = __commonJS({
  "node_modules/nice-grpc-web/lib/client/createBidiStreamingMethod.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createBidiStreamingMethod = createBidiStreamingMethod;
    var isAsyncIterable_1 = require_isAsyncIterable();
    var makeCall_1 = require_makeCall();
    function createBidiStreamingMethod(definition, channel, middleware, defaultOptions) {
      const methodDescriptor = {
        path: definition.path,
        requestStream: definition.requestStream,
        responseStream: definition.responseStream,
        options: definition.options
      };
      async function* bidiStreamingMethod(request, options) {
        if (!(0, isAsyncIterable_1.isAsyncIterable)(request)) {
          throw new Error("A middleware passed invalid request to next(): expected a single message for bidirectional streaming method");
        }
        const response = (0, makeCall_1.makeCall)(definition, channel, request, options);
        yield* response;
      }
      const method = middleware == null ? bidiStreamingMethod : (request, options) => middleware({
        method: methodDescriptor,
        requestStream: true,
        request,
        responseStream: true,
        next: bidiStreamingMethod
      }, options);
      return (request, options) => {
        const iterable = method(request, {
          ...defaultOptions,
          ...options
        });
        const iterator = iterable[Symbol.asyncIterator]();
        return {
          [Symbol.asyncIterator]() {
            return {
              async next() {
                const result = await iterator.next();
                if (result.done && result.value != null) {
                  return await iterator.throw(new Error("A middleware returned a message, but expected to return void for bidirectional streaming method"));
                }
                return result;
              },
              return() {
                return iterator.return();
              },
              throw(err) {
                return iterator.throw(err);
              }
            };
          }
        };
      };
    }
  }
});

// node_modules/nice-grpc-web/lib/client/createClientStreamingMethod.js
var require_createClientStreamingMethod = __commonJS({
  "node_modules/nice-grpc-web/lib/client/createClientStreamingMethod.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createClientStreamingMethod = createClientStreamingMethod;
    var nice_grpc_common_1 = require_lib2();
    var isAsyncIterable_1 = require_isAsyncIterable();
    var makeCall_1 = require_makeCall();
    function createClientStreamingMethod(definition, channel, middleware, defaultOptions) {
      const methodDescriptor = {
        path: definition.path,
        requestStream: definition.requestStream,
        responseStream: definition.responseStream,
        options: definition.options
      };
      async function* clientStreamingMethod(request, options) {
        if (!(0, isAsyncIterable_1.isAsyncIterable)(request)) {
          throw Error("A middleware passed invalid request to next(): expected a single message for client streaming method");
        }
        const response = (0, makeCall_1.makeCall)(definition, channel, request, options);
        let unaryResponse;
        for await (const message of response) {
          if (unaryResponse != null) {
            throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.INTERNAL, "Received more than one message from server for client streaming method");
          }
          unaryResponse = message;
        }
        if (unaryResponse == null) {
          throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.INTERNAL, "Server did not return a response");
        }
        return unaryResponse;
      }
      const method = middleware == null ? clientStreamingMethod : (request, options) => middleware({
        method: methodDescriptor,
        requestStream: true,
        request,
        responseStream: false,
        next: clientStreamingMethod
      }, options);
      return async (request, options) => {
        const iterable = method(request, {
          ...defaultOptions,
          ...options
        });
        const iterator = iterable[Symbol.asyncIterator]();
        let result = await iterator.next();
        while (true) {
          if (!result.done) {
            result = await iterator.throw(new Error("A middleware yielded a message, but expected to only return a message for client streaming method"));
            continue;
          }
          if (result.value == null) {
            result = await iterator.throw(new Error("A middleware returned void, but expected to return a message for client streaming method"));
            continue;
          }
          return result.value;
        }
      };
    }
  }
});

// node_modules/nice-grpc-web/lib/utils/asyncIterableOf.js
var require_asyncIterableOf = __commonJS({
  "node_modules/nice-grpc-web/lib/utils/asyncIterableOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.asyncIterableOf = asyncIterableOf;
    async function* asyncIterableOf(item) {
      yield item;
    }
  }
});

// node_modules/nice-grpc-web/lib/client/createServerStreamingMethod.js
var require_createServerStreamingMethod = __commonJS({
  "node_modules/nice-grpc-web/lib/client/createServerStreamingMethod.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createServerStreamingMethod = createServerStreamingMethod;
    var asyncIterableOf_1 = require_asyncIterableOf();
    var isAsyncIterable_1 = require_isAsyncIterable();
    var makeCall_1 = require_makeCall();
    function createServerStreamingMethod(definition, channel, middleware, defaultOptions) {
      const methodDescriptor = {
        path: definition.path,
        requestStream: definition.requestStream,
        responseStream: definition.responseStream,
        options: definition.options
      };
      async function* serverStreamingMethod(request, options) {
        if ((0, isAsyncIterable_1.isAsyncIterable)(request)) {
          throw new Error("A middleware passed invalid request to next(): expected a single message for server streaming method");
        }
        const response = (0, makeCall_1.makeCall)(definition, channel, (0, asyncIterableOf_1.asyncIterableOf)(request), options);
        yield* response;
      }
      const method = middleware == null ? serverStreamingMethod : (request, options) => middleware({
        method: methodDescriptor,
        requestStream: false,
        request,
        responseStream: true,
        next: serverStreamingMethod
      }, options);
      return (request, options) => {
        const iterable = method(request, {
          ...defaultOptions,
          ...options
        });
        const iterator = iterable[Symbol.asyncIterator]();
        return {
          [Symbol.asyncIterator]() {
            return {
              async next() {
                const result = await iterator.next();
                if (result.done && result.value != null) {
                  return await iterator.throw(new Error("A middleware returned a message, but expected to return void for server streaming method"));
                }
                return result;
              },
              return() {
                return iterator.return();
              },
              throw(err) {
                return iterator.throw(err);
              }
            };
          }
        };
      };
    }
  }
});

// node_modules/nice-grpc-web/lib/client/createUnaryMethod.js
var require_createUnaryMethod = __commonJS({
  "node_modules/nice-grpc-web/lib/client/createUnaryMethod.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createUnaryMethod = createUnaryMethod;
    var nice_grpc_common_1 = require_lib2();
    var asyncIterableOf_1 = require_asyncIterableOf();
    var isAsyncIterable_1 = require_isAsyncIterable();
    var makeCall_1 = require_makeCall();
    function createUnaryMethod(definition, channel, middleware, defaultOptions) {
      const methodDescriptor = {
        path: definition.path,
        requestStream: definition.requestStream,
        responseStream: definition.responseStream,
        options: definition.options
      };
      async function* unaryMethod(request, options) {
        if ((0, isAsyncIterable_1.isAsyncIterable)(request)) {
          throw new Error("A middleware passed invalid request to next(): expected a single message for unary method");
        }
        const response = (0, makeCall_1.makeCall)(definition, channel, (0, asyncIterableOf_1.asyncIterableOf)(request), options);
        let unaryResponse;
        for await (const message of response) {
          if (unaryResponse != null) {
            throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.INTERNAL, "Received more than one message from server for unary method");
          }
          unaryResponse = message;
        }
        if (unaryResponse == null) {
          throw new nice_grpc_common_1.ClientError(definition.path, nice_grpc_common_1.Status.INTERNAL, "Server did not return a response");
        }
        return unaryResponse;
      }
      const method = middleware == null ? unaryMethod : (request, options) => middleware({
        method: methodDescriptor,
        requestStream: false,
        request,
        responseStream: false,
        next: unaryMethod
      }, options);
      return async (request, options) => {
        const iterable = method(request, {
          ...defaultOptions,
          ...options
        });
        const iterator = iterable[Symbol.asyncIterator]();
        let result = await iterator.next();
        while (true) {
          if (!result.done) {
            result = await iterator.throw(new Error("A middleware yielded a message, but expected to only return a message for unary method"));
            continue;
          }
          if (result.value == null) {
            result = await iterator.throw(new Error("A middleware returned void, but expected to return a message for unary method"));
            continue;
          }
          return result.value;
        }
      };
    }
  }
});

// node_modules/nice-grpc-web/lib/client/ClientFactory.js
var require_ClientFactory = __commonJS({
  "node_modules/nice-grpc-web/lib/client/ClientFactory.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createClientFactory = createClientFactory2;
    exports.createClient = createClient;
    var nice_grpc_common_1 = require_lib2();
    var service_definitions_1 = require_service_definitions();
    var createBidiStreamingMethod_1 = require_createBidiStreamingMethod();
    var createClientStreamingMethod_1 = require_createClientStreamingMethod();
    var createServerStreamingMethod_1 = require_createServerStreamingMethod();
    var createUnaryMethod_1 = require_createUnaryMethod();
    function createClientFactory2() {
      return createClientFactoryWithMiddleware();
    }
    function createClient(definition, channel, defaultCallOptions) {
      return createClientFactory2().create(definition, channel, defaultCallOptions);
    }
    function createClientFactoryWithMiddleware(middleware) {
      return {
        use(newMiddleware) {
          return createClientFactoryWithMiddleware(middleware == null ? newMiddleware : (0, nice_grpc_common_1.composeClientMiddleware)(middleware, newMiddleware));
        },
        create(definition, channel, defaultCallOptions = {}) {
          const client = {};
          const methodEntries = Object.entries((0, service_definitions_1.normalizeServiceDefinition)(definition));
          for (const [methodName, methodDefinition] of methodEntries) {
            const defaultOptions = {
              ...defaultCallOptions["*"],
              ...defaultCallOptions[methodName]
            };
            if (!methodDefinition.requestStream) {
              if (!methodDefinition.responseStream) {
                client[methodName] = (0, createUnaryMethod_1.createUnaryMethod)(methodDefinition, channel, middleware, defaultOptions);
              } else {
                client[methodName] = (0, createServerStreamingMethod_1.createServerStreamingMethod)(methodDefinition, channel, middleware, defaultOptions);
              }
            } else {
              if (!methodDefinition.responseStream) {
                client[methodName] = (0, createClientStreamingMethod_1.createClientStreamingMethod)(methodDefinition, channel, middleware, defaultOptions);
              } else {
                client[methodName] = (0, createBidiStreamingMethod_1.createBidiStreamingMethod)(methodDefinition, channel, middleware, defaultOptions);
              }
            }
          }
          return client;
        }
      };
    }
  }
});

// node_modules/nice-grpc-web/lib/client/Client.js
var require_Client = __commonJS({
  "node_modules/nice-grpc-web/lib/client/Client.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/isomorphic-ws/browser.js
var browser_exports = {};
__export(browser_exports, {
  default: () => browser_default
});
var ws, browser_default;
var init_browser = __esm({
  "node_modules/isomorphic-ws/browser.js"() {
    ws = null;
    if (typeof WebSocket !== "undefined") {
      ws = WebSocket;
    } else if (typeof MozWebSocket !== "undefined") {
      ws = MozWebSocket;
    } else if (typeof global !== "undefined") {
      ws = global.WebSocket || global.MozWebSocket;
    } else if (typeof window !== "undefined") {
      ws = window.WebSocket || window.MozWebSocket;
    } else if (typeof self !== "undefined") {
      ws = self.WebSocket || self.MozWebSocket;
    }
    browser_default = ws;
  }
});

// node_modules/nice-grpc-web/lib/utils/AsyncSink.js
var require_AsyncSink = __commonJS({
  "node_modules/nice-grpc-web/lib/utils/AsyncSink.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncSink = void 0;
    var ARRAY_VALUE = "value";
    var ARRAY_ERROR = "error";
    var AsyncSink = class {
      constructor() {
        this._ended = false;
        this._values = [];
        this._resolvers = [];
      }
      [Symbol.asyncIterator]() {
        return this;
      }
      write(value) {
        this._push({ type: ARRAY_VALUE, value });
      }
      error(error) {
        this._push({ type: ARRAY_ERROR, error });
      }
      _push(item) {
        if (this._ended) {
          return;
        }
        if (this._resolvers.length > 0) {
          const { resolve, reject } = this._resolvers.shift();
          if (item.type === ARRAY_ERROR) {
            reject(item.error);
          } else {
            resolve({ done: false, value: item.value });
          }
        } else {
          this._values.push(item);
        }
      }
      next() {
        if (this._values.length > 0) {
          const { type, value, error } = this._values.shift();
          if (type === ARRAY_ERROR) {
            return Promise.reject(error);
          } else {
            return Promise.resolve({ done: false, value });
          }
        }
        if (this._ended) {
          return Promise.resolve({ done: true });
        }
        return new Promise((resolve, reject) => {
          this._resolvers.push({ resolve, reject });
        });
      }
      end() {
        while (this._resolvers.length > 0) {
          this._resolvers.shift().resolve({ done: true });
        }
        this._ended = true;
      }
    };
    exports.AsyncSink = AsyncSink;
  }
});

// node_modules/nice-grpc-web/lib/client/transports/websocket.js
var require_websocket = __commonJS({
  "node_modules/nice-grpc-web/lib/client/transports/websocket.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebsocketTransport = WebsocketTransport;
    var abort_controller_x_1 = require_lib();
    var isomorphic_ws_1 = __importDefault((init_browser(), __toCommonJS(browser_exports)));
    var js_base64_1 = require_base64();
    var AsyncSink_1 = require_AsyncSink();
    function WebsocketTransport() {
      return async function* ({ url, body, metadata, signal }) {
        if (signal.aborted) {
          throw new abort_controller_x_1.AbortError();
        }
        const frames = new AsyncSink_1.AsyncSink();
        signal.addEventListener("abort", () => {
          frames.error(new abort_controller_x_1.AbortError());
        });
        const websocketUrl = new URL(url);
        websocketUrl.protocol = websocketUrl.protocol.replace("http", "ws");
        const webSocket = new isomorphic_ws_1.default(websocketUrl, ["grpc-websockets"]);
        webSocket.binaryType = "arraybuffer";
        webSocket.addEventListener("message", (event) => {
          if (event.data instanceof ArrayBuffer) {
            frames.write({
              type: "data",
              data: new Uint8Array(event.data)
            });
          } else {
            frames.error(new Error(`Unexpected message type: ${typeof event.data}`));
          }
        });
        webSocket.addEventListener("close", (event) => {
          if (event.wasClean) {
            frames.end();
          } else {
            frames.error(new Error(`WebSocket closed with code ${event.code}` + (event.reason && `: ${event.reason}`)));
          }
        });
        const pipeAbortController = new AbortController();
        pipeBody(pipeAbortController.signal, metadata, body, webSocket).catch((err) => {
          if (!(0, abort_controller_x_1.isAbortError)(err)) {
            frames.error(err);
          }
        });
        try {
          return yield* frames;
        } finally {
          pipeAbortController.abort();
          if (webSocket.readyState === isomorphic_ws_1.default.OPEN || webSocket.readyState === isomorphic_ws_1.default.CONNECTING) {
            webSocket.close();
          }
        }
      };
    }
    function sendIfOpen(webSocket, data) {
      if (webSocket.readyState === isomorphic_ws_1.default.OPEN) {
        webSocket.send(data);
      }
    }
    async function pipeBody(signal, metadata, body, webSocket) {
      if (webSocket.readyState == isomorphic_ws_1.default.CONNECTING) {
        await (0, abort_controller_x_1.waitForEvent)(signal, webSocket, "open");
      }
      sendIfOpen(webSocket, encodeMetadata(metadata));
      for await (const chunk of body) {
        (0, abort_controller_x_1.throwIfAborted)(signal);
        const data = new Uint8Array(chunk.length + 1);
        data.set([0], 0);
        data.set(chunk, 1);
        sendIfOpen(webSocket, data);
      }
      sendIfOpen(webSocket, new Uint8Array([1]));
    }
    function encodeMetadata(metadata) {
      let result = "";
      for (const [key, values] of metadata) {
        for (const value of values) {
          const valueString = typeof value === "string" ? value : js_base64_1.Base64.fromUint8Array(value);
          const pairString = `${key}: ${valueString}\r
`;
          for (let i = 0; i < pairString.length; i++) {
            const charCode = pairString.charCodeAt(i);
            if (!isValidCharCode(charCode)) {
              throw new Error(`Metadata contains invalid characters: '${pairString}'`);
            }
          }
          result += pairString;
        }
      }
      return new TextEncoder().encode(result);
    }
    function isValidCharCode(val) {
      return val === 9 || val === 10 || val === 13 || val >= 32 && val <= 126;
    }
  }
});

// node_modules/nice-grpc-web/lib/client/transports/nodeHttp/browser.js
var require_browser = __commonJS({
  "node_modules/nice-grpc-web/lib/client/transports/nodeHttp/browser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeHttpTransport = NodeHttpTransport;
    function NodeHttpTransport() {
      throw new Error("NodeHttpTransport is not supported in the browser");
    }
  }
});

// node_modules/nice-grpc-web/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/nice-grpc-web/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o, k22, desc);
    } : function(o, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o[k22] = m2[k2];
    });
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding(exports2, m2, p2);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeHttpTransport = exports.WebsocketTransport = exports.FetchTransport = exports.Status = exports.Metadata = exports.composeClientMiddleware = exports.ClientError = void 0;
    var nice_grpc_common_1 = require_lib2();
    Object.defineProperty(exports, "ClientError", { enumerable: true, get: function() {
      return nice_grpc_common_1.ClientError;
    } });
    Object.defineProperty(exports, "composeClientMiddleware", { enumerable: true, get: function() {
      return nice_grpc_common_1.composeClientMiddleware;
    } });
    Object.defineProperty(exports, "Metadata", { enumerable: true, get: function() {
      return nice_grpc_common_1.Metadata;
    } });
    Object.defineProperty(exports, "Status", { enumerable: true, get: function() {
      return nice_grpc_common_1.Status;
    } });
    __exportStar(require_service_definitions(), exports);
    __exportStar(require_channel(), exports);
    __exportStar(require_ClientFactory(), exports);
    __exportStar(require_Client(), exports);
    var fetch_1 = require_fetch();
    Object.defineProperty(exports, "FetchTransport", { enumerable: true, get: function() {
      return fetch_1.FetchTransport;
    } });
    var websocket_1 = require_websocket();
    Object.defineProperty(exports, "WebsocketTransport", { enumerable: true, get: function() {
      return websocket_1.WebsocketTransport;
    } });
    var nodeHttp_1 = require_browser();
    Object.defineProperty(exports, "NodeHttpTransport", { enumerable: true, get: function() {
      return nodeHttp_1.NodeHttpTransport;
    } });
  }
});

// node_modules/long/index.js
var wasm = null;
try {
  wasm = new WebAssembly.Instance(
    new WebAssembly.Module(
      new Uint8Array([
        // \0asm
        0,
        97,
        115,
        109,
        // version 1
        1,
        0,
        0,
        0,
        // section "type"
        1,
        13,
        2,
        // 0, () => i32
        96,
        0,
        1,
        127,
        // 1, (i32, i32, i32, i32) => i32
        96,
        4,
        127,
        127,
        127,
        127,
        1,
        127,
        // section "function"
        3,
        7,
        6,
        // 0, type 0
        0,
        // 1, type 1
        1,
        // 2, type 1
        1,
        // 3, type 1
        1,
        // 4, type 1
        1,
        // 5, type 1
        1,
        // section "global"
        6,
        6,
        1,
        // 0, "high", mutable i32
        127,
        1,
        65,
        0,
        11,
        // section "export"
        7,
        50,
        6,
        // 0, "mul"
        3,
        109,
        117,
        108,
        0,
        1,
        // 1, "div_s"
        5,
        100,
        105,
        118,
        95,
        115,
        0,
        2,
        // 2, "div_u"
        5,
        100,
        105,
        118,
        95,
        117,
        0,
        3,
        // 3, "rem_s"
        5,
        114,
        101,
        109,
        95,
        115,
        0,
        4,
        // 4, "rem_u"
        5,
        114,
        101,
        109,
        95,
        117,
        0,
        5,
        // 5, "get_high"
        8,
        103,
        101,
        116,
        95,
        104,
        105,
        103,
        104,
        0,
        0,
        // section "code"
        10,
        191,
        1,
        6,
        // 0, "get_high"
        4,
        0,
        35,
        0,
        11,
        // 1, "mul"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        126,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 2, "div_s"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        127,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 3, "div_u"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        128,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 4, "rem_s"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        129,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11,
        // 5, "rem_u"
        36,
        1,
        1,
        126,
        32,
        0,
        173,
        32,
        1,
        173,
        66,
        32,
        134,
        132,
        32,
        2,
        173,
        32,
        3,
        173,
        66,
        32,
        134,
        132,
        130,
        34,
        4,
        66,
        32,
        135,
        167,
        36,
        0,
        32,
        4,
        167,
        11
      ])
    ),
    {}
  ).exports;
} catch {
}
function Long(low, high, unsigned) {
  this.low = low | 0;
  this.high = high | 0;
  this.unsigned = !!unsigned;
}
Long.prototype.__isLong__;
Object.defineProperty(Long.prototype, "__isLong__", { value: true });
function isLong(obj) {
  return (obj && obj["__isLong__"]) === true;
}
function ctz32(value) {
  var c = Math.clz32(value & -value);
  return value ? 31 - c : c;
}
Long.isLong = isLong;
var INT_CACHE = {};
var UINT_CACHE = {};
function fromInt(value, unsigned) {
  var obj, cachedObj, cache;
  if (unsigned) {
    value >>>= 0;
    if (cache = 0 <= value && value < 256) {
      cachedObj = UINT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = fromBits(value, 0, true);
    if (cache) UINT_CACHE[value] = obj;
    return obj;
  } else {
    value |= 0;
    if (cache = -128 <= value && value < 128) {
      cachedObj = INT_CACHE[value];
      if (cachedObj) return cachedObj;
    }
    obj = fromBits(value, value < 0 ? -1 : 0, false);
    if (cache) INT_CACHE[value] = obj;
    return obj;
  }
}
Long.fromInt = fromInt;
function fromNumber(value, unsigned) {
  if (isNaN(value)) return unsigned ? UZERO : ZERO;
  if (unsigned) {
    if (value < 0) return UZERO;
    if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
  } else {
    if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
    if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
  }
  if (value < 0) return fromNumber(-value, unsigned).neg();
  return fromBits(
    value % TWO_PWR_32_DBL | 0,
    value / TWO_PWR_32_DBL | 0,
    unsigned
  );
}
Long.fromNumber = fromNumber;
function fromBits(lowBits, highBits, unsigned) {
  return new Long(lowBits, highBits, unsigned);
}
Long.fromBits = fromBits;
var pow_dbl = Math.pow;
function fromString(str, unsigned, radix) {
  if (str.length === 0) throw Error("empty string");
  if (typeof unsigned === "number") {
    radix = unsigned;
    unsigned = false;
  } else {
    unsigned = !!unsigned;
  }
  if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
    return unsigned ? UZERO : ZERO;
  radix = radix || 10;
  if (radix < 2 || 36 < radix) throw RangeError("radix");
  var p2;
  if ((p2 = str.indexOf("-")) > 0) throw Error("interior hyphen");
  else if (p2 === 0) {
    return fromString(str.substring(1), unsigned, radix).neg();
  }
  var radixToPower = fromNumber(pow_dbl(radix, 8));
  var result = ZERO;
  for (var i = 0; i < str.length; i += 8) {
    var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
    if (size < 8) {
      var power = fromNumber(pow_dbl(radix, size));
      result = result.mul(power).add(fromNumber(value));
    } else {
      result = result.mul(radixToPower);
      result = result.add(fromNumber(value));
    }
  }
  result.unsigned = unsigned;
  return result;
}
Long.fromString = fromString;
function fromValue(val, unsigned) {
  if (typeof val === "number") return fromNumber(val, unsigned);
  if (typeof val === "string") return fromString(val, unsigned);
  return fromBits(
    val.low,
    val.high,
    typeof unsigned === "boolean" ? unsigned : val.unsigned
  );
}
Long.fromValue = fromValue;
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
var ZERO = fromInt(0);
Long.ZERO = ZERO;
var UZERO = fromInt(0, true);
Long.UZERO = UZERO;
var ONE = fromInt(1);
Long.ONE = ONE;
var UONE = fromInt(1, true);
Long.UONE = UONE;
var NEG_ONE = fromInt(-1);
Long.NEG_ONE = NEG_ONE;
var MAX_VALUE = fromBits(4294967295 | 0, 2147483647 | 0, false);
Long.MAX_VALUE = MAX_VALUE;
var MAX_UNSIGNED_VALUE = fromBits(4294967295 | 0, 4294967295 | 0, true);
Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
var MIN_VALUE = fromBits(0, 2147483648 | 0, false);
Long.MIN_VALUE = MIN_VALUE;
var LongPrototype = Long.prototype;
LongPrototype.toInt = function toInt() {
  return this.unsigned ? this.low >>> 0 : this.low;
};
LongPrototype.toNumber = function toNumber() {
  if (this.unsigned)
    return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
  return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};
LongPrototype.toString = function toString(radix) {
  radix = radix || 10;
  if (radix < 2 || 36 < radix) throw RangeError("radix");
  if (this.isZero()) return "0";
  if (this.isNegative()) {
    if (this.eq(MIN_VALUE)) {
      var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
      return div.toString(radix) + rem1.toInt().toString(radix);
    } else return "-" + this.neg().toString(radix);
  }
  var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
  var result = "";
  while (true) {
    var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
    rem = remDiv;
    if (rem.isZero()) return digits + result;
    else {
      while (digits.length < 6) digits = "0" + digits;
      result = "" + digits + result;
    }
  }
};
LongPrototype.getHighBits = function getHighBits() {
  return this.high;
};
LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
  return this.high >>> 0;
};
LongPrototype.getLowBits = function getLowBits() {
  return this.low;
};
LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
  return this.low >>> 0;
};
LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
  if (this.isNegative())
    return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
  var val = this.high != 0 ? this.high : this.low;
  for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
  return this.high != 0 ? bit + 33 : bit + 1;
};
LongPrototype.isSafeInteger = function isSafeInteger() {
  var top11Bits = this.high >> 21;
  if (!top11Bits) return true;
  if (this.unsigned) return false;
  return top11Bits === -1 && !(this.low === 0 && this.high === -2097152);
};
LongPrototype.isZero = function isZero() {
  return this.high === 0 && this.low === 0;
};
LongPrototype.eqz = LongPrototype.isZero;
LongPrototype.isNegative = function isNegative() {
  return !this.unsigned && this.high < 0;
};
LongPrototype.isPositive = function isPositive() {
  return this.unsigned || this.high >= 0;
};
LongPrototype.isOdd = function isOdd() {
  return (this.low & 1) === 1;
};
LongPrototype.isEven = function isEven() {
  return (this.low & 1) === 0;
};
LongPrototype.equals = function equals(other) {
  if (!isLong(other)) other = fromValue(other);
  if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
    return false;
  return this.high === other.high && this.low === other.low;
};
LongPrototype.eq = LongPrototype.equals;
LongPrototype.notEquals = function notEquals(other) {
  return !this.eq(
    /* validates */
    other
  );
};
LongPrototype.neq = LongPrototype.notEquals;
LongPrototype.ne = LongPrototype.notEquals;
LongPrototype.lessThan = function lessThan(other) {
  return this.comp(
    /* validates */
    other
  ) < 0;
};
LongPrototype.lt = LongPrototype.lessThan;
LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
  return this.comp(
    /* validates */
    other
  ) <= 0;
};
LongPrototype.lte = LongPrototype.lessThanOrEqual;
LongPrototype.le = LongPrototype.lessThanOrEqual;
LongPrototype.greaterThan = function greaterThan(other) {
  return this.comp(
    /* validates */
    other
  ) > 0;
};
LongPrototype.gt = LongPrototype.greaterThan;
LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
  return this.comp(
    /* validates */
    other
  ) >= 0;
};
LongPrototype.gte = LongPrototype.greaterThanOrEqual;
LongPrototype.ge = LongPrototype.greaterThanOrEqual;
LongPrototype.compare = function compare(other) {
  if (!isLong(other)) other = fromValue(other);
  if (this.eq(other)) return 0;
  var thisNeg = this.isNegative(), otherNeg = other.isNegative();
  if (thisNeg && !otherNeg) return -1;
  if (!thisNeg && otherNeg) return 1;
  if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
  return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
};
LongPrototype.comp = LongPrototype.compare;
LongPrototype.negate = function negate() {
  if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
  return this.not().add(ONE);
};
LongPrototype.neg = LongPrototype.negate;
LongPrototype.add = function add(addend) {
  if (!isLong(addend)) addend = fromValue(addend);
  var a48 = this.high >>> 16;
  var a32 = this.high & 65535;
  var a16 = this.low >>> 16;
  var a00 = this.low & 65535;
  var b48 = addend.high >>> 16;
  var b32 = addend.high & 65535;
  var b16 = addend.low >>> 16;
  var b00 = addend.low & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 + b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 + b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 + b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 + b48;
  c48 &= 65535;
  return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
};
LongPrototype.subtract = function subtract(subtrahend) {
  if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
  return this.add(subtrahend.neg());
};
LongPrototype.sub = LongPrototype.subtract;
LongPrototype.multiply = function multiply(multiplier) {
  if (this.isZero()) return this;
  if (!isLong(multiplier)) multiplier = fromValue(multiplier);
  if (wasm) {
    var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
  if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
  if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  if (this.isNegative()) {
    if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
    else return this.neg().mul(multiplier).neg();
  } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg();
  if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
    return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
  var a48 = this.high >>> 16;
  var a32 = this.high & 65535;
  var a16 = this.low >>> 16;
  var a00 = this.low & 65535;
  var b48 = multiplier.high >>> 16;
  var b32 = multiplier.high & 65535;
  var b16 = multiplier.low >>> 16;
  var b00 = multiplier.low & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 65535;
  return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
};
LongPrototype.mul = LongPrototype.multiply;
LongPrototype.divide = function divide(divisor) {
  if (!isLong(divisor)) divisor = fromValue(divisor);
  if (divisor.isZero()) throw Error("division by zero");
  if (wasm) {
    if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
      return this;
    }
    var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  if (this.isZero()) return this.unsigned ? UZERO : ZERO;
  var approx, rem, res;
  if (!this.unsigned) {
    if (this.eq(MIN_VALUE)) {
      if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
        return MIN_VALUE;
      else if (divisor.eq(MIN_VALUE)) return ONE;
      else {
        var halfThis = this.shr(1);
        approx = halfThis.div(divisor).shl(1);
        if (approx.eq(ZERO)) {
          return divisor.isNegative() ? ONE : NEG_ONE;
        } else {
          rem = this.sub(divisor.mul(approx));
          res = approx.add(rem.div(divisor));
          return res;
        }
      }
    } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
    if (this.isNegative()) {
      if (divisor.isNegative()) return this.neg().div(divisor.neg());
      return this.neg().div(divisor).neg();
    } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
    res = ZERO;
  } else {
    if (!divisor.unsigned) divisor = divisor.toUnsigned();
    if (divisor.gt(this)) return UZERO;
    if (divisor.gt(this.shru(1)))
      return UONE;
    res = UZERO;
  }
  rem = this;
  while (rem.gte(divisor)) {
    approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
    var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
    while (approxRem.isNegative() || approxRem.gt(rem)) {
      approx -= delta;
      approxRes = fromNumber(approx, this.unsigned);
      approxRem = approxRes.mul(divisor);
    }
    if (approxRes.isZero()) approxRes = ONE;
    res = res.add(approxRes);
    rem = rem.sub(approxRem);
  }
  return res;
};
LongPrototype.div = LongPrototype.divide;
LongPrototype.modulo = function modulo(divisor) {
  if (!isLong(divisor)) divisor = fromValue(divisor);
  if (wasm) {
    var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(
      this.low,
      this.high,
      divisor.low,
      divisor.high
    );
    return fromBits(low, wasm["get_high"](), this.unsigned);
  }
  return this.sub(this.div(divisor).mul(divisor));
};
LongPrototype.mod = LongPrototype.modulo;
LongPrototype.rem = LongPrototype.modulo;
LongPrototype.not = function not() {
  return fromBits(~this.low, ~this.high, this.unsigned);
};
LongPrototype.countLeadingZeros = function countLeadingZeros() {
  return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
};
LongPrototype.clz = LongPrototype.countLeadingZeros;
LongPrototype.countTrailingZeros = function countTrailingZeros() {
  return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
};
LongPrototype.ctz = LongPrototype.countTrailingZeros;
LongPrototype.and = function and(other) {
  if (!isLong(other)) other = fromValue(other);
  return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
};
LongPrototype.or = function or(other) {
  if (!isLong(other)) other = fromValue(other);
  return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
};
LongPrototype.xor = function xor(other) {
  if (!isLong(other)) other = fromValue(other);
  return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
};
LongPrototype.shiftLeft = function shiftLeft(numBits) {
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  else if (numBits < 32)
    return fromBits(
      this.low << numBits,
      this.high << numBits | this.low >>> 32 - numBits,
      this.unsigned
    );
  else return fromBits(0, this.low << numBits - 32, this.unsigned);
};
LongPrototype.shl = LongPrototype.shiftLeft;
LongPrototype.shiftRight = function shiftRight(numBits) {
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  else if (numBits < 32)
    return fromBits(
      this.low >>> numBits | this.high << 32 - numBits,
      this.high >> numBits,
      this.unsigned
    );
  else
    return fromBits(
      this.high >> numBits - 32,
      this.high >= 0 ? 0 : -1,
      this.unsigned
    );
};
LongPrototype.shr = LongPrototype.shiftRight;
LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  if (numBits < 32)
    return fromBits(
      this.low >>> numBits | this.high << 32 - numBits,
      this.high >>> numBits,
      this.unsigned
    );
  if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
  return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
};
LongPrototype.shru = LongPrototype.shiftRightUnsigned;
LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
LongPrototype.rotateLeft = function rotateLeft(numBits) {
  var b2;
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  if (numBits < 32) {
    b2 = 32 - numBits;
    return fromBits(
      this.low << numBits | this.high >>> b2,
      this.high << numBits | this.low >>> b2,
      this.unsigned
    );
  }
  numBits -= 32;
  b2 = 32 - numBits;
  return fromBits(
    this.high << numBits | this.low >>> b2,
    this.low << numBits | this.high >>> b2,
    this.unsigned
  );
};
LongPrototype.rotl = LongPrototype.rotateLeft;
LongPrototype.rotateRight = function rotateRight(numBits) {
  var b2;
  if (isLong(numBits)) numBits = numBits.toInt();
  if ((numBits &= 63) === 0) return this;
  if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  if (numBits < 32) {
    b2 = 32 - numBits;
    return fromBits(
      this.high << b2 | this.low >>> numBits,
      this.low << b2 | this.high >>> numBits,
      this.unsigned
    );
  }
  numBits -= 32;
  b2 = 32 - numBits;
  return fromBits(
    this.low << b2 | this.high >>> numBits,
    this.high << b2 | this.low >>> numBits,
    this.unsigned
  );
};
LongPrototype.rotr = LongPrototype.rotateRight;
LongPrototype.toSigned = function toSigned() {
  if (!this.unsigned) return this;
  return fromBits(this.low, this.high, false);
};
LongPrototype.toUnsigned = function toUnsigned() {
  if (this.unsigned) return this;
  return fromBits(this.low, this.high, true);
};
LongPrototype.toBytes = function toBytes(le) {
  return le ? this.toBytesLE() : this.toBytesBE();
};
LongPrototype.toBytesLE = function toBytesLE() {
  var hi2 = this.high, lo2 = this.low;
  return [
    lo2 & 255,
    lo2 >>> 8 & 255,
    lo2 >>> 16 & 255,
    lo2 >>> 24,
    hi2 & 255,
    hi2 >>> 8 & 255,
    hi2 >>> 16 & 255,
    hi2 >>> 24
  ];
};
LongPrototype.toBytesBE = function toBytesBE() {
  var hi2 = this.high, lo2 = this.low;
  return [
    hi2 >>> 24,
    hi2 >>> 16 & 255,
    hi2 >>> 8 & 255,
    hi2 & 255,
    lo2 >>> 24,
    lo2 >>> 16 & 255,
    lo2 >>> 8 & 255,
    lo2 & 255
  ];
};
Long.fromBytes = function fromBytes(bytes, unsigned, le) {
  return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
};
Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
  return new Long(
    bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
    bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24,
    unsigned
  );
};
Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
  return new Long(
    bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7],
    bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3],
    unsigned
  );
};
if (typeof BigInt === "function") {
  Long.fromBigInt = function fromBigInt(value, unsigned) {
    var lowBits = Number(BigInt.asIntN(32, value));
    var highBits = Number(BigInt.asIntN(32, value >> BigInt(32)));
    return fromBits(lowBits, highBits, unsigned);
  };
  Long.fromValue = function fromValueWithBigInt(value, unsigned) {
    if (typeof value === "bigint") return Long.fromBigInt(value, unsigned);
    return fromValue(value, unsigned);
  };
  LongPrototype.toBigInt = function toBigInt() {
    var lowBigInt = BigInt(this.low >>> 0);
    var highBigInt = BigInt(this.unsigned ? this.high >>> 0 : this.high);
    return highBigInt << BigInt(32) | lowBigInt;
  };
}
var long_default = Long;

// static/playground/weaviate-client.web.js
var import_abort_controller_x = __toESM(require_lib());

// node_modules/uuid/dist/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

// node_modules/uuid/dist/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// node_modules/uuid/dist/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v2;
  return Uint8Array.of((v2 = parseInt(uuid.slice(0, 8), 16)) >>> 24, v2 >>> 16 & 255, v2 >>> 8 & 255, v2 & 255, (v2 = parseInt(uuid.slice(9, 13), 16)) >>> 8, v2 & 255, (v2 = parseInt(uuid.slice(14, 18), 16)) >>> 8, v2 & 255, (v2 = parseInt(uuid.slice(19, 23), 16)) >>> 8, v2 & 255, (v2 = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255, v2 / 4294967296 & 255, v2 >>> 24 & 255, v2 >>> 16 & 255, v2 >>> 8 & 255, v2 & 255);
}
var parse_default = parse;

// node_modules/uuid/dist/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var stringify_default = stringify;

// node_modules/uuid/dist/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}
var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
var URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(version, hash, value, namespace, buf, offset) {
  const valueBytes = typeof value === "string" ? stringToBytes(value) : value;
  const namespaceBytes = typeof namespace === "string" ? parse_default(namespace) : namespace;
  if (typeof namespace === "string") {
    namespace = parse_default(namespace);
  }
  if (namespace?.length !== 16) {
    throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
  }
  let bytes = new Uint8Array(16 + valueBytes.length);
  bytes.set(namespaceBytes);
  bytes.set(valueBytes, namespaceBytes.length);
  bytes = hash(bytes);
  bytes[6] = bytes[6] & 15 | version;
  bytes[8] = bytes[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}

// node_modules/uuid/dist/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = { randomUUID };

// node_modules/uuid/dist/v4.js
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  return _v4(options, buf, offset);
}
var v4_default = v4;

// node_modules/uuid/dist/sha1.js
function f(s, x2, y, z) {
  switch (s) {
    case 0:
      return x2 & y ^ ~x2 & z;
    case 1:
      return x2 ^ y ^ z;
    case 2:
      return x2 & y ^ x2 & z ^ y & z;
    case 3:
      return x2 ^ y ^ z;
  }
}
function ROTL(x2, n) {
  return x2 << n | x2 >>> 32 - n;
}
function sha1(bytes) {
  const K2 = [1518500249, 1859775393, 2400959708, 3395469782];
  const H2 = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  const newBytes = new Uint8Array(bytes.length + 1);
  newBytes.set(bytes);
  newBytes[bytes.length] = 128;
  bytes = newBytes;
  const l2 = bytes.length / 4 + 2;
  const N2 = Math.ceil(l2 / 16);
  const M2 = new Array(N2);
  for (let i = 0; i < N2; ++i) {
    const arr = new Uint32Array(16);
    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
    M2[i] = arr;
  }
  M2[N2 - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M2[N2 - 1][14] = Math.floor(M2[N2 - 1][14]);
  M2[N2 - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (let i = 0; i < N2; ++i) {
    const W2 = new Uint32Array(80);
    for (let t = 0; t < 16; ++t) {
      W2[t] = M2[i][t];
    }
    for (let t = 16; t < 80; ++t) {
      W2[t] = ROTL(W2[t - 3] ^ W2[t - 8] ^ W2[t - 14] ^ W2[t - 16], 1);
    }
    let a = H2[0];
    let b2 = H2[1];
    let c = H2[2];
    let d2 = H2[3];
    let e24 = H2[4];
    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T2 = ROTL(a, 5) + f(s, b2, c, d2) + e24 + K2[s] + W2[t] >>> 0;
      e24 = d2;
      d2 = c;
      c = ROTL(b2, 30) >>> 0;
      b2 = a;
      a = T2;
    }
    H2[0] = H2[0] + a >>> 0;
    H2[1] = H2[1] + b2 >>> 0;
    H2[2] = H2[2] + c >>> 0;
    H2[3] = H2[3] + d2 >>> 0;
    H2[4] = H2[4] + e24 >>> 0;
  }
  return Uint8Array.of(H2[0] >> 24, H2[0] >> 16, H2[0] >> 8, H2[0], H2[1] >> 24, H2[1] >> 16, H2[1] >> 8, H2[1], H2[2] >> 24, H2[2] >> 16, H2[2] >> 8, H2[2], H2[3] >> 24, H2[3] >> 16, H2[3] >> 8, H2[3], H2[4] >> 24, H2[4] >> 16, H2[4] >> 8, H2[4]);
}
var sha1_default = sha1;

// node_modules/uuid/dist/v5.js
function v5(value, namespace, buf, offset) {
  return v35(80, sha1_default, value, namespace, buf, offset);
}
v5.DNS = DNS;
v5.URL = URL2;
var v5_default = v5;

// static/playground/weaviate-client.web.js
var import_deque = __toESM(require_deque2());

// node_modules/graphql-request/build/esm/defaultJsonSerializer.js
var defaultJsonSerializer = JSON;

// node_modules/graphql-request/build/esm/helpers.js
var uppercase = (str) => str.toUpperCase();
var HeadersInstanceToPlainObject = (headers) => {
  const o = {};
  headers.forEach((v2, k2) => {
    o[k2] = v2;
  });
  return o;
};

// node_modules/graphql-request/build/esm/parseArgs.js
var parseRequestArgs = (documentOrOptions, variables, requestHeaders) => {
  return documentOrOptions.document ? documentOrOptions : {
    document: documentOrOptions,
    variables,
    requestHeaders,
    signal: void 0
  };
};
var parseRawRequestArgs = (queryOrOptions, variables, requestHeaders) => {
  return queryOrOptions.query ? queryOrOptions : {
    query: queryOrOptions,
    variables,
    requestHeaders,
    signal: void 0
  };
};
var parseBatchRequestArgs = (documentsOrOptions, requestHeaders) => {
  return documentsOrOptions.documents ? documentsOrOptions : {
    documents: documentsOrOptions,
    requestHeaders,
    signal: void 0
  };
};

// node_modules/graphql/jsutils/devAssert.mjs
function devAssert(condition, message) {
  const booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message);
  }
}

// node_modules/graphql/jsutils/isObjectLike.mjs
function isObjectLike(value) {
  return typeof value == "object" && value !== null;
}

// node_modules/graphql/jsutils/invariant.mjs
function invariant(condition, message) {
  const booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(
      message != null ? message : "Unexpected invariant triggered."
    );
  }
}

// node_modules/graphql/language/location.mjs
var LineRegExp = /\r\n|[\n\r]/g;
function getLocation(source, position) {
  let lastLineStart = 0;
  let line = 1;
  for (const match of source.body.matchAll(LineRegExp)) {
    typeof match.index === "number" || invariant(false);
    if (match.index >= position) {
      break;
    }
    lastLineStart = match.index + match[0].length;
    line += 1;
  }
  return {
    line,
    column: position + 1 - lastLineStart
  };
}

// node_modules/graphql/language/printLocation.mjs
function printLocation(location) {
  return printSourceLocation(
    location.source,
    getLocation(location.source, location.start)
  );
}
function printSourceLocation(source, sourceLocation) {
  const firstLineColumnOffset = source.locationOffset.column - 1;
  const body = "".padStart(firstLineColumnOffset) + source.body;
  const lineIndex = sourceLocation.line - 1;
  const lineOffset = source.locationOffset.line - 1;
  const lineNum = sourceLocation.line + lineOffset;
  const columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
  const columnNum = sourceLocation.column + columnOffset;
  const locationStr = `${source.name}:${lineNum}:${columnNum}
`;
  const lines = body.split(/\r\n|[\n\r]/g);
  const locationLine = lines[lineIndex];
  if (locationLine.length > 120) {
    const subLineIndex = Math.floor(columnNum / 80);
    const subLineColumnNum = columnNum % 80;
    const subLines = [];
    for (let i = 0; i < locationLine.length; i += 80) {
      subLines.push(locationLine.slice(i, i + 80));
    }
    return locationStr + printPrefixedLines([
      [`${lineNum} |`, subLines[0]],
      ...subLines.slice(1, subLineIndex + 1).map((subLine) => ["|", subLine]),
      ["|", "^".padStart(subLineColumnNum)],
      ["|", subLines[subLineIndex + 1]]
    ]);
  }
  return locationStr + printPrefixedLines([
    // Lines specified like this: ["prefix", "string"],
    [`${lineNum - 1} |`, lines[lineIndex - 1]],
    [`${lineNum} |`, locationLine],
    ["|", "^".padStart(columnNum)],
    [`${lineNum + 1} |`, lines[lineIndex + 1]]
  ]);
}
function printPrefixedLines(lines) {
  const existingLines = lines.filter(([_, line]) => line !== void 0);
  const padLen = Math.max(...existingLines.map(([prefix]) => prefix.length));
  return existingLines.map(([prefix, line]) => prefix.padStart(padLen) + (line ? " " + line : "")).join("\n");
}

// node_modules/graphql/error/GraphQLError.mjs
function toNormalizedOptions(args) {
  const firstArg = args[0];
  if (firstArg == null || "kind" in firstArg || "length" in firstArg) {
    return {
      nodes: firstArg,
      source: args[1],
      positions: args[2],
      path: args[3],
      originalError: args[4],
      extensions: args[5]
    };
  }
  return firstArg;
}
var GraphQLError = class _GraphQLError extends Error {
  /**
   * An array of `{ line, column }` locations within the source GraphQL document
   * which correspond to this error.
   *
   * Errors during validation often contain multiple locations, for example to
   * point out two things with the same name. Errors during execution include a
   * single location, the field which produced the error.
   *
   * Enumerable, and appears in the result of JSON.stringify().
   */
  /**
   * An array describing the JSON-path into the execution response which
   * corresponds to this error. Only included for errors during execution.
   *
   * Enumerable, and appears in the result of JSON.stringify().
   */
  /**
   * An array of GraphQL AST Nodes corresponding to this error.
   */
  /**
   * The source GraphQL document for the first location of this error.
   *
   * Note that if this Error represents more than one node, the source may not
   * represent nodes after the first node.
   */
  /**
   * An array of character offsets within the source GraphQL document
   * which correspond to this error.
   */
  /**
   * The original error thrown from a field resolver during execution.
   */
  /**
   * Extension fields to add to the formatted error.
   */
  /**
   * @deprecated Please use the `GraphQLErrorOptions` constructor overload instead.
   */
  constructor(message, ...rawArgs) {
    var _this$nodes, _nodeLocations$, _ref;
    const { nodes, source, positions, path, originalError, extensions } = toNormalizedOptions(rawArgs);
    super(message);
    this.name = "GraphQLError";
    this.path = path !== null && path !== void 0 ? path : void 0;
    this.originalError = originalError !== null && originalError !== void 0 ? originalError : void 0;
    this.nodes = undefinedIfEmpty(
      Array.isArray(nodes) ? nodes : nodes ? [nodes] : void 0
    );
    const nodeLocations = undefinedIfEmpty(
      (_this$nodes = this.nodes) === null || _this$nodes === void 0 ? void 0 : _this$nodes.map((node) => node.loc).filter((loc) => loc != null)
    );
    this.source = source !== null && source !== void 0 ? source : nodeLocations === null || nodeLocations === void 0 ? void 0 : (_nodeLocations$ = nodeLocations[0]) === null || _nodeLocations$ === void 0 ? void 0 : _nodeLocations$.source;
    this.positions = positions !== null && positions !== void 0 ? positions : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => loc.start);
    this.locations = positions && source ? positions.map((pos) => getLocation(source, pos)) : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => getLocation(loc.source, loc.start));
    const originalExtensions = isObjectLike(
      originalError === null || originalError === void 0 ? void 0 : originalError.extensions
    ) ? originalError === null || originalError === void 0 ? void 0 : originalError.extensions : void 0;
    this.extensions = (_ref = extensions !== null && extensions !== void 0 ? extensions : originalExtensions) !== null && _ref !== void 0 ? _ref : /* @__PURE__ */ Object.create(null);
    Object.defineProperties(this, {
      message: {
        writable: true,
        enumerable: true
      },
      name: {
        enumerable: false
      },
      nodes: {
        enumerable: false
      },
      source: {
        enumerable: false
      },
      positions: {
        enumerable: false
      },
      originalError: {
        enumerable: false
      }
    });
    if (originalError !== null && originalError !== void 0 && originalError.stack) {
      Object.defineProperty(this, "stack", {
        value: originalError.stack,
        writable: true,
        configurable: true
      });
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _GraphQLError);
    } else {
      Object.defineProperty(this, "stack", {
        value: Error().stack,
        writable: true,
        configurable: true
      });
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLError";
  }
  toString() {
    let output = this.message;
    if (this.nodes) {
      for (const node of this.nodes) {
        if (node.loc) {
          output += "\n\n" + printLocation(node.loc);
        }
      }
    } else if (this.source && this.locations) {
      for (const location of this.locations) {
        output += "\n\n" + printSourceLocation(this.source, location);
      }
    }
    return output;
  }
  toJSON() {
    const formattedError = {
      message: this.message
    };
    if (this.locations != null) {
      formattedError.locations = this.locations;
    }
    if (this.path != null) {
      formattedError.path = this.path;
    }
    if (this.extensions != null && Object.keys(this.extensions).length > 0) {
      formattedError.extensions = this.extensions;
    }
    return formattedError;
  }
};
function undefinedIfEmpty(array) {
  return array === void 0 || array.length === 0 ? void 0 : array;
}

// node_modules/graphql/error/syntaxError.mjs
function syntaxError(source, position, description) {
  return new GraphQLError(`Syntax Error: ${description}`, {
    source,
    positions: [position]
  });
}

// node_modules/graphql/language/ast.mjs
var Location = class {
  /**
   * The character offset at which this Node begins.
   */
  /**
   * The character offset at which this Node ends.
   */
  /**
   * The Token at which this Node begins.
   */
  /**
   * The Token at which this Node ends.
   */
  /**
   * The Source document the AST represents.
   */
  constructor(startToken, endToken, source) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  }
  get [Symbol.toStringTag]() {
    return "Location";
  }
  toJSON() {
    return {
      start: this.start,
      end: this.end
    };
  }
};
var Token = class {
  /**
   * The kind of Token.
   */
  /**
   * The character offset at which this Node begins.
   */
  /**
   * The character offset at which this Node ends.
   */
  /**
   * The 1-indexed line number on which this Token appears.
   */
  /**
   * The 1-indexed column number at which this Token begins.
   */
  /**
   * For non-punctuation tokens, represents the interpreted value of the token.
   *
   * Note: is undefined for punctuation tokens, but typed as string for
   * convenience in the parser.
   */
  /**
   * Tokens exist as nodes in a double-linked-list amongst all tokens
   * including ignored tokens. <SOF> is always the first node and <EOF>
   * the last.
   */
  constructor(kind, start, end, line, column, value) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
  get [Symbol.toStringTag]() {
    return "Token";
  }
  toJSON() {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column
    };
  }
};
var QueryDocumentKeys = {
  Name: [],
  Document: ["definitions"],
  OperationDefinition: [
    "description",
    "name",
    "variableDefinitions",
    "directives",
    "selectionSet"
  ],
  VariableDefinition: [
    "description",
    "variable",
    "type",
    "defaultValue",
    "directives"
  ],
  Variable: ["name"],
  SelectionSet: ["selections"],
  Field: ["alias", "name", "arguments", "directives", "selectionSet"],
  Argument: ["name", "value"],
  FragmentSpread: ["name", "directives"],
  InlineFragment: ["typeCondition", "directives", "selectionSet"],
  FragmentDefinition: [
    "description",
    "name",
    // Note: fragment variable definitions are deprecated and will removed in v17.0.0
    "variableDefinitions",
    "typeCondition",
    "directives",
    "selectionSet"
  ],
  IntValue: [],
  FloatValue: [],
  StringValue: [],
  BooleanValue: [],
  NullValue: [],
  EnumValue: [],
  ListValue: ["values"],
  ObjectValue: ["fields"],
  ObjectField: ["name", "value"],
  Directive: ["name", "arguments"],
  NamedType: ["name"],
  ListType: ["type"],
  NonNullType: ["type"],
  SchemaDefinition: ["description", "directives", "operationTypes"],
  OperationTypeDefinition: ["type"],
  ScalarTypeDefinition: ["description", "name", "directives"],
  ObjectTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  FieldDefinition: ["description", "name", "arguments", "type", "directives"],
  InputValueDefinition: [
    "description",
    "name",
    "type",
    "defaultValue",
    "directives"
  ],
  InterfaceTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  UnionTypeDefinition: ["description", "name", "directives", "types"],
  EnumTypeDefinition: ["description", "name", "directives", "values"],
  EnumValueDefinition: ["description", "name", "directives"],
  InputObjectTypeDefinition: ["description", "name", "directives", "fields"],
  DirectiveDefinition: [
    "description",
    "name",
    "arguments",
    "directives",
    "locations"
  ],
  SchemaExtension: ["directives", "operationTypes"],
  DirectiveExtension: ["name", "directives"],
  ScalarTypeExtension: ["name", "directives"],
  ObjectTypeExtension: ["name", "interfaces", "directives", "fields"],
  InterfaceTypeExtension: ["name", "interfaces", "directives", "fields"],
  UnionTypeExtension: ["name", "directives", "types"],
  EnumTypeExtension: ["name", "directives", "values"],
  InputObjectTypeExtension: ["name", "directives", "fields"],
  TypeCoordinate: ["name"],
  MemberCoordinate: ["name", "memberName"],
  ArgumentCoordinate: ["name", "fieldName", "argumentName"],
  DirectiveCoordinate: ["name"],
  DirectiveArgumentCoordinate: ["name", "argumentName"]
};
var kindValues = new Set(Object.keys(QueryDocumentKeys));
function isNode(maybeNode) {
  const maybeKind = maybeNode === null || maybeNode === void 0 ? void 0 : maybeNode.kind;
  return typeof maybeKind === "string" && kindValues.has(maybeKind);
}
var OperationTypeNode;
(function(OperationTypeNode2) {
  OperationTypeNode2["QUERY"] = "query";
  OperationTypeNode2["MUTATION"] = "mutation";
  OperationTypeNode2["SUBSCRIPTION"] = "subscription";
})(OperationTypeNode || (OperationTypeNode = {}));

// node_modules/graphql/language/directiveLocation.mjs
var DirectiveLocation;
(function(DirectiveLocation2) {
  DirectiveLocation2["QUERY"] = "QUERY";
  DirectiveLocation2["MUTATION"] = "MUTATION";
  DirectiveLocation2["SUBSCRIPTION"] = "SUBSCRIPTION";
  DirectiveLocation2["FIELD"] = "FIELD";
  DirectiveLocation2["FRAGMENT_DEFINITION"] = "FRAGMENT_DEFINITION";
  DirectiveLocation2["FRAGMENT_SPREAD"] = "FRAGMENT_SPREAD";
  DirectiveLocation2["INLINE_FRAGMENT"] = "INLINE_FRAGMENT";
  DirectiveLocation2["VARIABLE_DEFINITION"] = "VARIABLE_DEFINITION";
  DirectiveLocation2["SCHEMA"] = "SCHEMA";
  DirectiveLocation2["SCALAR"] = "SCALAR";
  DirectiveLocation2["OBJECT"] = "OBJECT";
  DirectiveLocation2["FIELD_DEFINITION"] = "FIELD_DEFINITION";
  DirectiveLocation2["ARGUMENT_DEFINITION"] = "ARGUMENT_DEFINITION";
  DirectiveLocation2["INTERFACE"] = "INTERFACE";
  DirectiveLocation2["UNION"] = "UNION";
  DirectiveLocation2["ENUM"] = "ENUM";
  DirectiveLocation2["ENUM_VALUE"] = "ENUM_VALUE";
  DirectiveLocation2["INPUT_OBJECT"] = "INPUT_OBJECT";
  DirectiveLocation2["INPUT_FIELD_DEFINITION"] = "INPUT_FIELD_DEFINITION";
  DirectiveLocation2["DIRECTIVE_DEFINITION"] = "DIRECTIVE_DEFINITION";
})(DirectiveLocation || (DirectiveLocation = {}));

// node_modules/graphql/language/kinds.mjs
var Kind;
(function(Kind2) {
  Kind2["NAME"] = "Name";
  Kind2["DOCUMENT"] = "Document";
  Kind2["OPERATION_DEFINITION"] = "OperationDefinition";
  Kind2["VARIABLE_DEFINITION"] = "VariableDefinition";
  Kind2["SELECTION_SET"] = "SelectionSet";
  Kind2["FIELD"] = "Field";
  Kind2["ARGUMENT"] = "Argument";
  Kind2["FRAGMENT_SPREAD"] = "FragmentSpread";
  Kind2["INLINE_FRAGMENT"] = "InlineFragment";
  Kind2["FRAGMENT_DEFINITION"] = "FragmentDefinition";
  Kind2["VARIABLE"] = "Variable";
  Kind2["INT"] = "IntValue";
  Kind2["FLOAT"] = "FloatValue";
  Kind2["STRING"] = "StringValue";
  Kind2["BOOLEAN"] = "BooleanValue";
  Kind2["NULL"] = "NullValue";
  Kind2["ENUM"] = "EnumValue";
  Kind2["LIST"] = "ListValue";
  Kind2["OBJECT"] = "ObjectValue";
  Kind2["OBJECT_FIELD"] = "ObjectField";
  Kind2["DIRECTIVE"] = "Directive";
  Kind2["NAMED_TYPE"] = "NamedType";
  Kind2["LIST_TYPE"] = "ListType";
  Kind2["NON_NULL_TYPE"] = "NonNullType";
  Kind2["SCHEMA_DEFINITION"] = "SchemaDefinition";
  Kind2["OPERATION_TYPE_DEFINITION"] = "OperationTypeDefinition";
  Kind2["SCALAR_TYPE_DEFINITION"] = "ScalarTypeDefinition";
  Kind2["OBJECT_TYPE_DEFINITION"] = "ObjectTypeDefinition";
  Kind2["FIELD_DEFINITION"] = "FieldDefinition";
  Kind2["INPUT_VALUE_DEFINITION"] = "InputValueDefinition";
  Kind2["INTERFACE_TYPE_DEFINITION"] = "InterfaceTypeDefinition";
  Kind2["UNION_TYPE_DEFINITION"] = "UnionTypeDefinition";
  Kind2["ENUM_TYPE_DEFINITION"] = "EnumTypeDefinition";
  Kind2["ENUM_VALUE_DEFINITION"] = "EnumValueDefinition";
  Kind2["INPUT_OBJECT_TYPE_DEFINITION"] = "InputObjectTypeDefinition";
  Kind2["DIRECTIVE_DEFINITION"] = "DirectiveDefinition";
  Kind2["SCHEMA_EXTENSION"] = "SchemaExtension";
  Kind2["DIRECTIVE_EXTENSION"] = "DirectiveExtension";
  Kind2["SCALAR_TYPE_EXTENSION"] = "ScalarTypeExtension";
  Kind2["OBJECT_TYPE_EXTENSION"] = "ObjectTypeExtension";
  Kind2["INTERFACE_TYPE_EXTENSION"] = "InterfaceTypeExtension";
  Kind2["UNION_TYPE_EXTENSION"] = "UnionTypeExtension";
  Kind2["ENUM_TYPE_EXTENSION"] = "EnumTypeExtension";
  Kind2["INPUT_OBJECT_TYPE_EXTENSION"] = "InputObjectTypeExtension";
  Kind2["TYPE_COORDINATE"] = "TypeCoordinate";
  Kind2["MEMBER_COORDINATE"] = "MemberCoordinate";
  Kind2["ARGUMENT_COORDINATE"] = "ArgumentCoordinate";
  Kind2["DIRECTIVE_COORDINATE"] = "DirectiveCoordinate";
  Kind2["DIRECTIVE_ARGUMENT_COORDINATE"] = "DirectiveArgumentCoordinate";
})(Kind || (Kind = {}));

// node_modules/graphql/language/characterClasses.mjs
function isWhiteSpace(code) {
  return code === 9 || code === 32;
}
function isDigit(code) {
  return code >= 48 && code <= 57;
}
function isLetter(code) {
  return code >= 97 && code <= 122 || // A-Z
  code >= 65 && code <= 90;
}
function isNameStart(code) {
  return isLetter(code) || code === 95;
}
function isNameContinue(code) {
  return isLetter(code) || isDigit(code) || code === 95;
}

// node_modules/graphql/language/blockString.mjs
function dedentBlockStringLines(lines) {
  var _firstNonEmptyLine2;
  let commonIndent = Number.MAX_SAFE_INTEGER;
  let firstNonEmptyLine = null;
  let lastNonEmptyLine = -1;
  for (let i = 0; i < lines.length; ++i) {
    var _firstNonEmptyLine;
    const line = lines[i];
    const indent2 = leadingWhitespace(line);
    if (indent2 === line.length) {
      continue;
    }
    firstNonEmptyLine = (_firstNonEmptyLine = firstNonEmptyLine) !== null && _firstNonEmptyLine !== void 0 ? _firstNonEmptyLine : i;
    lastNonEmptyLine = i;
    if (i !== 0 && indent2 < commonIndent) {
      commonIndent = indent2;
    }
  }
  return lines.map((line, i) => i === 0 ? line : line.slice(commonIndent)).slice(
    (_firstNonEmptyLine2 = firstNonEmptyLine) !== null && _firstNonEmptyLine2 !== void 0 ? _firstNonEmptyLine2 : 0,
    lastNonEmptyLine + 1
  );
}
function leadingWhitespace(str) {
  let i = 0;
  while (i < str.length && isWhiteSpace(str.charCodeAt(i))) {
    ++i;
  }
  return i;
}
function printBlockString(value, options) {
  const escapedValue = value.replace(/"""/g, '\\"""');
  const lines = escapedValue.split(/\r\n|[\n\r]/g);
  const isSingleLine = lines.length === 1;
  const forceLeadingNewLine = lines.length > 1 && lines.slice(1).every((line) => line.length === 0 || isWhiteSpace(line.charCodeAt(0)));
  const hasTrailingTripleQuotes = escapedValue.endsWith('\\"""');
  const hasTrailingQuote = value.endsWith('"') && !hasTrailingTripleQuotes;
  const hasTrailingSlash = value.endsWith("\\");
  const forceTrailingNewline = hasTrailingQuote || hasTrailingSlash;
  const printAsMultipleLines = !(options !== null && options !== void 0 && options.minimize) && // add leading and trailing new lines only if it improves readability
  (!isSingleLine || value.length > 70 || forceTrailingNewline || forceLeadingNewLine || hasTrailingTripleQuotes);
  let result = "";
  const skipLeadingNewLine = isSingleLine && isWhiteSpace(value.charCodeAt(0));
  if (printAsMultipleLines && !skipLeadingNewLine || forceLeadingNewLine) {
    result += "\n";
  }
  result += escapedValue;
  if (printAsMultipleLines || forceTrailingNewline) {
    result += "\n";
  }
  return '"""' + result + '"""';
}

// node_modules/graphql/language/tokenKind.mjs
var TokenKind;
(function(TokenKind2) {
  TokenKind2["SOF"] = "<SOF>";
  TokenKind2["EOF"] = "<EOF>";
  TokenKind2["BANG"] = "!";
  TokenKind2["DOLLAR"] = "$";
  TokenKind2["AMP"] = "&";
  TokenKind2["PAREN_L"] = "(";
  TokenKind2["PAREN_R"] = ")";
  TokenKind2["DOT"] = ".";
  TokenKind2["SPREAD"] = "...";
  TokenKind2["COLON"] = ":";
  TokenKind2["EQUALS"] = "=";
  TokenKind2["AT"] = "@";
  TokenKind2["BRACKET_L"] = "[";
  TokenKind2["BRACKET_R"] = "]";
  TokenKind2["BRACE_L"] = "{";
  TokenKind2["PIPE"] = "|";
  TokenKind2["BRACE_R"] = "}";
  TokenKind2["NAME"] = "Name";
  TokenKind2["INT"] = "Int";
  TokenKind2["FLOAT"] = "Float";
  TokenKind2["STRING"] = "String";
  TokenKind2["BLOCK_STRING"] = "BlockString";
  TokenKind2["COMMENT"] = "Comment";
})(TokenKind || (TokenKind = {}));

// node_modules/graphql/language/lexer.mjs
var Lexer = class {
  /**
   * The previously focused non-ignored token.
   */
  /**
   * The currently focused non-ignored token.
   */
  /**
   * The (1-indexed) line containing the current token.
   */
  /**
   * The character offset at which the current line begins.
   */
  constructor(source) {
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);
    this.source = source;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
  }
  get [Symbol.toStringTag]() {
    return "Lexer";
  }
  /**
   * Advances the token stream to the next non-ignored token.
   */
  advance() {
    this.lastToken = this.token;
    const token = this.token = this.lookahead();
    return token;
  }
  /**
   * Looks ahead and returns the next non-ignored token, but does not change
   * the state of Lexer.
   */
  lookahead() {
    let token = this.token;
    if (token.kind !== TokenKind.EOF) {
      do {
        if (token.next) {
          token = token.next;
        } else {
          const nextToken = readNextToken(this, token.end);
          token.next = nextToken;
          nextToken.prev = token;
          token = nextToken;
        }
      } while (token.kind === TokenKind.COMMENT);
    }
    return token;
  }
};
function isPunctuatorTokenKind(kind) {
  return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.DOT || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
}
function isUnicodeScalarValue(code) {
  return code >= 0 && code <= 55295 || code >= 57344 && code <= 1114111;
}
function isSupplementaryCodePoint(body, location) {
  return isLeadingSurrogate(body.charCodeAt(location)) && isTrailingSurrogate(body.charCodeAt(location + 1));
}
function isLeadingSurrogate(code) {
  return code >= 55296 && code <= 56319;
}
function isTrailingSurrogate(code) {
  return code >= 56320 && code <= 57343;
}
function printCodePointAt(lexer, location) {
  const code = lexer.source.body.codePointAt(location);
  if (code === void 0) {
    return TokenKind.EOF;
  } else if (code >= 32 && code <= 126) {
    const char = String.fromCodePoint(code);
    return char === '"' ? `'"'` : `"${char}"`;
  }
  return "U+" + code.toString(16).toUpperCase().padStart(4, "0");
}
function createToken(lexer, kind, start, end, value) {
  const line = lexer.line;
  const col = 1 + start - lexer.lineStart;
  return new Token(kind, start, end, line, col, value);
}
function readNextToken(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    switch (code) {
      case 65279:
      case 9:
      case 32:
      case 44:
        ++position;
        continue;
      case 10:
        ++position;
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 13:
        if (body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 35:
        return readComment(lexer, position);
      case 33:
        return createToken(lexer, TokenKind.BANG, position, position + 1);
      case 36:
        return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
      case 38:
        return createToken(lexer, TokenKind.AMP, position, position + 1);
      case 40:
        return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
      case 41:
        return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
      case 46:
        if (body.charCodeAt(position + 1) === 46 && body.charCodeAt(position + 2) === 46) {
          return createToken(lexer, TokenKind.SPREAD, position, position + 3);
        }
        break;
      case 58:
        return createToken(lexer, TokenKind.COLON, position, position + 1);
      case 61:
        return createToken(lexer, TokenKind.EQUALS, position, position + 1);
      case 64:
        return createToken(lexer, TokenKind.AT, position, position + 1);
      case 91:
        return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);
      case 93:
        return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);
      case 123:
        return createToken(lexer, TokenKind.BRACE_L, position, position + 1);
      case 124:
        return createToken(lexer, TokenKind.PIPE, position, position + 1);
      case 125:
        return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
      case 34:
        if (body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
          return readBlockString(lexer, position);
        }
        return readString(lexer, position);
    }
    if (isDigit(code) || code === 45) {
      return readNumber(lexer, position, code);
    }
    if (isNameStart(code)) {
      return readName(lexer, position);
    }
    throw syntaxError(
      lexer.source,
      position,
      code === 39 ? `Unexpected single quote character ('), did you mean to use a double quote (")?` : isUnicodeScalarValue(code) || isSupplementaryCodePoint(body, position) ? `Unexpected character: ${printCodePointAt(lexer, position)}.` : `Invalid character: ${printCodePointAt(lexer, position)}.`
    );
  }
  return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
}
function readComment(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      break;
    }
  }
  return createToken(
    lexer,
    TokenKind.COMMENT,
    start,
    position,
    body.slice(start + 1, position)
  );
}
function readNumber(lexer, start, firstCode) {
  const body = lexer.source.body;
  let position = start;
  let code = firstCode;
  let isFloat = false;
  if (code === 45) {
    code = body.charCodeAt(++position);
  }
  if (code === 48) {
    code = body.charCodeAt(++position);
    if (isDigit(code)) {
      throw syntaxError(
        lexer.source,
        position,
        `Invalid number, unexpected digit after 0: ${printCodePointAt(
          lexer,
          position
        )}.`
      );
    }
  } else {
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46) {
    isFloat = true;
    code = body.charCodeAt(++position);
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 69 || code === 101) {
    isFloat = true;
    code = body.charCodeAt(++position);
    if (code === 43 || code === 45) {
      code = body.charCodeAt(++position);
    }
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46 || isNameStart(code)) {
    throw syntaxError(
      lexer.source,
      position,
      `Invalid number, expected digit but got: ${printCodePointAt(
        lexer,
        position
      )}.`
    );
  }
  return createToken(
    lexer,
    isFloat ? TokenKind.FLOAT : TokenKind.INT,
    start,
    position,
    body.slice(start, position)
  );
}
function readDigits(lexer, start, firstCode) {
  if (!isDigit(firstCode)) {
    throw syntaxError(
      lexer.source,
      start,
      `Invalid number, expected digit but got: ${printCodePointAt(
        lexer,
        start
      )}.`
    );
  }
  const body = lexer.source.body;
  let position = start + 1;
  while (isDigit(body.charCodeAt(position))) {
    ++position;
  }
  return position;
}
function readString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  let chunkStart = position;
  let value = "";
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34) {
      value += body.slice(chunkStart, position);
      return createToken(lexer, TokenKind.STRING, start, position + 1, value);
    }
    if (code === 92) {
      value += body.slice(chunkStart, position);
      const escape = body.charCodeAt(position + 1) === 117 ? body.charCodeAt(position + 2) === 123 ? readEscapedUnicodeVariableWidth(lexer, position) : readEscapedUnicodeFixedWidth(lexer, position) : readEscapedCharacter(lexer, position);
      value += escape.value;
      position += escape.size;
      chunkStart = position;
      continue;
    }
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(
        lexer.source,
        position,
        `Invalid character within String: ${printCodePointAt(
          lexer,
          position
        )}.`
      );
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readEscapedUnicodeVariableWidth(lexer, position) {
  const body = lexer.source.body;
  let point = 0;
  let size = 3;
  while (size < 12) {
    const code = body.charCodeAt(position + size++);
    if (code === 125) {
      if (size < 5 || !isUnicodeScalarValue(point)) {
        break;
      }
      return {
        value: String.fromCodePoint(point),
        size
      };
    }
    point = point << 4 | readHexDigit(code);
    if (point < 0) {
      break;
    }
  }
  throw syntaxError(
    lexer.source,
    position,
    `Invalid Unicode escape sequence: "${body.slice(
      position,
      position + size
    )}".`
  );
}
function readEscapedUnicodeFixedWidth(lexer, position) {
  const body = lexer.source.body;
  const code = read16BitHexCode(body, position + 2);
  if (isUnicodeScalarValue(code)) {
    return {
      value: String.fromCodePoint(code),
      size: 6
    };
  }
  if (isLeadingSurrogate(code)) {
    if (body.charCodeAt(position + 6) === 92 && body.charCodeAt(position + 7) === 117) {
      const trailingCode = read16BitHexCode(body, position + 8);
      if (isTrailingSurrogate(trailingCode)) {
        return {
          value: String.fromCodePoint(code, trailingCode),
          size: 12
        };
      }
    }
  }
  throw syntaxError(
    lexer.source,
    position,
    `Invalid Unicode escape sequence: "${body.slice(position, position + 6)}".`
  );
}
function read16BitHexCode(body, position) {
  return readHexDigit(body.charCodeAt(position)) << 12 | readHexDigit(body.charCodeAt(position + 1)) << 8 | readHexDigit(body.charCodeAt(position + 2)) << 4 | readHexDigit(body.charCodeAt(position + 3));
}
function readHexDigit(code) {
  return code >= 48 && code <= 57 ? code - 48 : code >= 65 && code <= 70 ? code - 55 : code >= 97 && code <= 102 ? code - 87 : -1;
}
function readEscapedCharacter(lexer, position) {
  const body = lexer.source.body;
  const code = body.charCodeAt(position + 1);
  switch (code) {
    case 34:
      return {
        value: '"',
        size: 2
      };
    case 92:
      return {
        value: "\\",
        size: 2
      };
    case 47:
      return {
        value: "/",
        size: 2
      };
    case 98:
      return {
        value: "\b",
        size: 2
      };
    case 102:
      return {
        value: "\f",
        size: 2
      };
    case 110:
      return {
        value: "\n",
        size: 2
      };
    case 114:
      return {
        value: "\r",
        size: 2
      };
    case 116:
      return {
        value: "	",
        size: 2
      };
  }
  throw syntaxError(
    lexer.source,
    position,
    `Invalid character escape sequence: "${body.slice(
      position,
      position + 2
    )}".`
  );
}
function readBlockString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let lineStart = lexer.lineStart;
  let position = start + 3;
  let chunkStart = position;
  let currentLine = "";
  const blockLines = [];
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      const token = createToken(
        lexer,
        TokenKind.BLOCK_STRING,
        start,
        position + 3,
        // Return a string of the lines joined with U+000A.
        dedentBlockStringLines(blockLines).join("\n")
      );
      lexer.line += blockLines.length - 1;
      lexer.lineStart = lineStart;
      return token;
    }
    if (code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
      currentLine += body.slice(chunkStart, position);
      chunkStart = position + 1;
      position += 4;
      continue;
    }
    if (code === 10 || code === 13) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      if (code === 13 && body.charCodeAt(position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }
      currentLine = "";
      chunkStart = position;
      lineStart = position;
      continue;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(
        lexer.source,
        position,
        `Invalid character within String: ${printCodePointAt(
          lexer,
          position
        )}.`
      );
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readName(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (isNameContinue(code)) {
      ++position;
    } else {
      break;
    }
  }
  return createToken(
    lexer,
    TokenKind.NAME,
    start,
    position,
    body.slice(start, position)
  );
}

// node_modules/graphql/jsutils/inspect.mjs
var MAX_ARRAY_LENGTH = 10;
var MAX_RECURSIVE_DEPTH = 2;
function inspect(value) {
  return formatValue(value, []);
}
function formatValue(value, seenValues) {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "function":
      return value.name ? `[function ${value.name}]` : "[function]";
    case "object":
      return formatObjectValue(value, seenValues);
    default:
      return String(value);
  }
}
function formatObjectValue(value, previouslySeenValues) {
  if (value === null) {
    return "null";
  }
  if (previouslySeenValues.includes(value)) {
    return "[Circular]";
  }
  const seenValues = [...previouslySeenValues, value];
  if (isJSONable(value)) {
    const jsonValue = value.toJSON();
    if (jsonValue !== value) {
      return typeof jsonValue === "string" ? jsonValue : formatValue(jsonValue, seenValues);
    }
  } else if (Array.isArray(value)) {
    return formatArray(value, seenValues);
  }
  return formatObject(value, seenValues);
}
function isJSONable(value) {
  return typeof value.toJSON === "function";
}
function formatObject(object, seenValues) {
  const entries = Object.entries(object);
  if (entries.length === 0) {
    return "{}";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[" + getObjectTag(object) + "]";
  }
  const properties = entries.map(
    ([key, value]) => key + ": " + formatValue(value, seenValues)
  );
  return "{ " + properties.join(", ") + " }";
}
function formatArray(array, seenValues) {
  if (array.length === 0) {
    return "[]";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[Array]";
  }
  const len = Math.min(MAX_ARRAY_LENGTH, array.length);
  const remaining = array.length - len;
  const items = [];
  for (let i = 0; i < len; ++i) {
    items.push(formatValue(array[i], seenValues));
  }
  if (remaining === 1) {
    items.push("... 1 more item");
  } else if (remaining > 1) {
    items.push(`... ${remaining} more items`);
  }
  return "[" + items.join(", ") + "]";
}
function getObjectTag(object) {
  const tag = Object.prototype.toString.call(object).replace(/^\[object /, "").replace(/]$/, "");
  if (tag === "Object" && typeof object.constructor === "function") {
    const name = object.constructor.name;
    if (typeof name === "string" && name !== "") {
      return name;
    }
  }
  return tag;
}

// node_modules/graphql/jsutils/instanceOf.mjs
var isProduction = globalThis.process && // eslint-disable-next-line no-undef
true;
var instanceOf = (
  /* c8 ignore next 6 */
  // FIXME: https://github.com/graphql/graphql-js/issues/2317
  isProduction ? function instanceOf2(value, constructor) {
    return value instanceof constructor;
  } : function instanceOf3(value, constructor) {
    if (value instanceof constructor) {
      return true;
    }
    if (typeof value === "object" && value !== null) {
      var _value$constructor;
      const className = constructor.prototype[Symbol.toStringTag];
      const valueClassName = (
        // We still need to support constructor's name to detect conflicts with older versions of this library.
        Symbol.toStringTag in value ? value[Symbol.toStringTag] : (_value$constructor = value.constructor) === null || _value$constructor === void 0 ? void 0 : _value$constructor.name
      );
      if (className === valueClassName) {
        const stringifiedValue = inspect(value);
        throw new Error(`Cannot use ${className} "${stringifiedValue}" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.`);
      }
    }
    return false;
  }
);

// node_modules/graphql/language/source.mjs
var Source = class {
  constructor(body, name = "GraphQL request", locationOffset = {
    line: 1,
    column: 1
  }) {
    typeof body === "string" || devAssert(false, `Body must be a string. Received: ${inspect(body)}.`);
    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
    this.locationOffset.line > 0 || devAssert(
      false,
      "line in locationOffset is 1-indexed and must be positive."
    );
    this.locationOffset.column > 0 || devAssert(
      false,
      "column in locationOffset is 1-indexed and must be positive."
    );
  }
  get [Symbol.toStringTag]() {
    return "Source";
  }
};
function isSource(source) {
  return instanceOf(source, Source);
}

// node_modules/graphql/language/parser.mjs
function parse2(source, options) {
  const parser = new Parser(source, options);
  const document = parser.parseDocument();
  Object.defineProperty(document, "tokenCount", {
    enumerable: false,
    value: parser.tokenCount
  });
  return document;
}
var Parser = class {
  constructor(source, options = {}) {
    const { lexer, ..._options } = options;
    if (lexer) {
      this._lexer = lexer;
    } else {
      const sourceObj = isSource(source) ? source : new Source(source);
      this._lexer = new Lexer(sourceObj);
    }
    this._options = _options;
    this._tokenCounter = 0;
  }
  get tokenCount() {
    return this._tokenCounter;
  }
  /**
   * Converts a name lex token into a name parse node.
   */
  parseName() {
    const token = this.expectToken(TokenKind.NAME);
    return this.node(token, {
      kind: Kind.NAME,
      value: token.value
    });
  }
  // Implements the parsing rules in the Document section.
  /**
   * Document : Definition+
   */
  parseDocument() {
    return this.node(this._lexer.token, {
      kind: Kind.DOCUMENT,
      definitions: this.many(
        TokenKind.SOF,
        this.parseDefinition,
        TokenKind.EOF
      )
    });
  }
  /**
   * Definition :
   *   - ExecutableDefinition
   *   - TypeSystemDefinition
   *   - TypeSystemExtension
   *
   * ExecutableDefinition :
   *   - OperationDefinition
   *   - FragmentDefinition
   *
   * TypeSystemDefinition :
   *   - SchemaDefinition
   *   - TypeDefinition
   *   - DirectiveDefinition
   *
   * TypeDefinition :
   *   - ScalarTypeDefinition
   *   - ObjectTypeDefinition
   *   - InterfaceTypeDefinition
   *   - UnionTypeDefinition
   *   - EnumTypeDefinition
   *   - InputObjectTypeDefinition
   */
  parseDefinition() {
    if (this.peek(TokenKind.BRACE_L)) {
      return this.parseOperationDefinition();
    }
    const hasDescription = this.peekDescription();
    const keywordToken = hasDescription ? this._lexer.lookahead() : this._lexer.token;
    if (hasDescription && keywordToken.kind === TokenKind.BRACE_L) {
      throw syntaxError(
        this._lexer.source,
        this._lexer.token.start,
        "Unexpected description, descriptions are not supported on shorthand queries."
      );
    }
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaDefinition();
        case "scalar":
          return this.parseScalarTypeDefinition();
        case "type":
          return this.parseObjectTypeDefinition();
        case "interface":
          return this.parseInterfaceTypeDefinition();
        case "union":
          return this.parseUnionTypeDefinition();
        case "enum":
          return this.parseEnumTypeDefinition();
        case "input":
          return this.parseInputObjectTypeDefinition();
        case "directive":
          return this.parseDirectiveDefinition();
      }
      switch (keywordToken.value) {
        case "query":
        case "mutation":
        case "subscription":
          return this.parseOperationDefinition();
        case "fragment":
          return this.parseFragmentDefinition();
      }
      if (hasDescription) {
        throw syntaxError(
          this._lexer.source,
          this._lexer.token.start,
          "Unexpected description, only GraphQL definitions support descriptions."
        );
      }
      switch (keywordToken.value) {
        case "extend":
          return this.parseTypeSystemExtension();
      }
    }
    throw this.unexpected(keywordToken);
  }
  // Implements the parsing rules in the Operations section.
  /**
   * OperationDefinition :
   *  - SelectionSet
   *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
   */
  parseOperationDefinition() {
    const start = this._lexer.token;
    if (this.peek(TokenKind.BRACE_L)) {
      return this.node(start, {
        kind: Kind.OPERATION_DEFINITION,
        operation: OperationTypeNode.QUERY,
        description: void 0,
        name: void 0,
        variableDefinitions: [],
        directives: [],
        selectionSet: this.parseSelectionSet()
      });
    }
    const description = this.parseDescription();
    const operation = this.parseOperationType();
    let name;
    if (this.peek(TokenKind.NAME)) {
      name = this.parseName();
    }
    return this.node(start, {
      kind: Kind.OPERATION_DEFINITION,
      operation,
      description,
      name,
      variableDefinitions: this.parseVariableDefinitions(),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  /**
   * OperationType : one of query mutation subscription
   */
  parseOperationType() {
    const operationToken = this.expectToken(TokenKind.NAME);
    switch (operationToken.value) {
      case "query":
        return OperationTypeNode.QUERY;
      case "mutation":
        return OperationTypeNode.MUTATION;
      case "subscription":
        return OperationTypeNode.SUBSCRIPTION;
    }
    throw this.unexpected(operationToken);
  }
  /**
   * VariableDefinitions : ( VariableDefinition+ )
   */
  parseVariableDefinitions() {
    return this.optionalMany(
      TokenKind.PAREN_L,
      this.parseVariableDefinition,
      TokenKind.PAREN_R
    );
  }
  /**
   * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
   */
  parseVariableDefinition() {
    return this.node(this._lexer.token, {
      kind: Kind.VARIABLE_DEFINITION,
      description: this.parseDescription(),
      variable: this.parseVariable(),
      type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
      defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseConstValueLiteral() : void 0,
      directives: this.parseConstDirectives()
    });
  }
  /**
   * Variable : $ Name
   */
  parseVariable() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.DOLLAR);
    return this.node(start, {
      kind: Kind.VARIABLE,
      name: this.parseName()
    });
  }
  /**
   * ```
   * SelectionSet : { Selection+ }
   * ```
   */
  parseSelectionSet() {
    return this.node(this._lexer.token, {
      kind: Kind.SELECTION_SET,
      selections: this.many(
        TokenKind.BRACE_L,
        this.parseSelection,
        TokenKind.BRACE_R
      )
    });
  }
  /**
   * Selection :
   *   - Field
   *   - FragmentSpread
   *   - InlineFragment
   */
  parseSelection() {
    return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
  }
  /**
   * Field : Alias? Name Arguments? Directives? SelectionSet?
   *
   * Alias : Name :
   */
  parseField() {
    const start = this._lexer.token;
    const nameOrAlias = this.parseName();
    let alias;
    let name;
    if (this.expectOptionalToken(TokenKind.COLON)) {
      alias = nameOrAlias;
      name = this.parseName();
    } else {
      name = nameOrAlias;
    }
    return this.node(start, {
      kind: Kind.FIELD,
      alias,
      name,
      arguments: this.parseArguments(false),
      directives: this.parseDirectives(false),
      selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : void 0
    });
  }
  /**
   * Arguments[Const] : ( Argument[?Const]+ )
   */
  parseArguments(isConst) {
    const item = isConst ? this.parseConstArgument : this.parseArgument;
    return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
  }
  /**
   * Argument[Const] : Name : Value[?Const]
   */
  parseArgument(isConst = false) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: Kind.ARGUMENT,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  parseConstArgument() {
    return this.parseArgument(true);
  }
  // Implements the parsing rules in the Fragments section.
  /**
   * Corresponds to both FragmentSpread and InlineFragment in the spec.
   *
   * FragmentSpread : ... FragmentName Directives?
   *
   * InlineFragment : ... TypeCondition? Directives? SelectionSet
   */
  parseFragment() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.SPREAD);
    const hasTypeCondition = this.expectOptionalKeyword("on");
    if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
      return this.node(start, {
        kind: Kind.FRAGMENT_SPREAD,
        name: this.parseFragmentName(),
        directives: this.parseDirectives(false)
      });
    }
    return this.node(start, {
      kind: Kind.INLINE_FRAGMENT,
      typeCondition: hasTypeCondition ? this.parseNamedType() : void 0,
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  /**
   * FragmentDefinition :
   *   - fragment FragmentName on TypeCondition Directives? SelectionSet
   *
   * TypeCondition : NamedType
   */
  parseFragmentDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("fragment");
    if (this._options.allowLegacyFragmentVariables === true) {
      return this.node(start, {
        kind: Kind.FRAGMENT_DEFINITION,
        description,
        name: this.parseFragmentName(),
        variableDefinitions: this.parseVariableDefinitions(),
        typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet()
      });
    }
    return this.node(start, {
      kind: Kind.FRAGMENT_DEFINITION,
      description,
      name: this.parseFragmentName(),
      typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  /**
   * FragmentName : Name but not `on`
   */
  parseFragmentName() {
    if (this._lexer.token.value === "on") {
      throw this.unexpected();
    }
    return this.parseName();
  }
  // Implements the parsing rules in the Values section.
  /**
   * Value[Const] :
   *   - [~Const] Variable
   *   - IntValue
   *   - FloatValue
   *   - StringValue
   *   - BooleanValue
   *   - NullValue
   *   - EnumValue
   *   - ListValue[?Const]
   *   - ObjectValue[?Const]
   *
   * BooleanValue : one of `true` `false`
   *
   * NullValue : `null`
   *
   * EnumValue : Name but not `true`, `false` or `null`
   */
  parseValueLiteral(isConst) {
    const token = this._lexer.token;
    switch (token.kind) {
      case TokenKind.BRACKET_L:
        return this.parseList(isConst);
      case TokenKind.BRACE_L:
        return this.parseObject(isConst);
      case TokenKind.INT:
        this.advanceLexer();
        return this.node(token, {
          kind: Kind.INT,
          value: token.value
        });
      case TokenKind.FLOAT:
        this.advanceLexer();
        return this.node(token, {
          kind: Kind.FLOAT,
          value: token.value
        });
      case TokenKind.STRING:
      case TokenKind.BLOCK_STRING:
        return this.parseStringLiteral();
      case TokenKind.NAME:
        this.advanceLexer();
        switch (token.value) {
          case "true":
            return this.node(token, {
              kind: Kind.BOOLEAN,
              value: true
            });
          case "false":
            return this.node(token, {
              kind: Kind.BOOLEAN,
              value: false
            });
          case "null":
            return this.node(token, {
              kind: Kind.NULL
            });
          default:
            return this.node(token, {
              kind: Kind.ENUM,
              value: token.value
            });
        }
      case TokenKind.DOLLAR:
        if (isConst) {
          this.expectToken(TokenKind.DOLLAR);
          if (this._lexer.token.kind === TokenKind.NAME) {
            const varName = this._lexer.token.value;
            throw syntaxError(
              this._lexer.source,
              token.start,
              `Unexpected variable "$${varName}" in constant value.`
            );
          } else {
            throw this.unexpected(token);
          }
        }
        return this.parseVariable();
      default:
        throw this.unexpected();
    }
  }
  parseConstValueLiteral() {
    return this.parseValueLiteral(true);
  }
  parseStringLiteral() {
    const token = this._lexer.token;
    this.advanceLexer();
    return this.node(token, {
      kind: Kind.STRING,
      value: token.value,
      block: token.kind === TokenKind.BLOCK_STRING
    });
  }
  /**
   * ListValue[Const] :
   *   - [ ]
   *   - [ Value[?Const]+ ]
   */
  parseList(isConst) {
    const item = () => this.parseValueLiteral(isConst);
    return this.node(this._lexer.token, {
      kind: Kind.LIST,
      values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R)
    });
  }
  /**
   * ```
   * ObjectValue[Const] :
   *   - { }
   *   - { ObjectField[?Const]+ }
   * ```
   */
  parseObject(isConst) {
    const item = () => this.parseObjectField(isConst);
    return this.node(this._lexer.token, {
      kind: Kind.OBJECT,
      fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R)
    });
  }
  /**
   * ObjectField[Const] : Name : Value[?Const]
   */
  parseObjectField(isConst) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: Kind.OBJECT_FIELD,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  // Implements the parsing rules in the Directives section.
  /**
   * Directives[Const] : Directive[?Const]+
   */
  parseDirectives(isConst) {
    const directives = [];
    while (this.peek(TokenKind.AT)) {
      directives.push(this.parseDirective(isConst));
    }
    return directives;
  }
  parseConstDirectives() {
    return this.parseDirectives(true);
  }
  /**
   * ```
   * Directive[Const] : @ Name Arguments[?Const]?
   * ```
   */
  parseDirective(isConst) {
    const start = this._lexer.token;
    this.expectToken(TokenKind.AT);
    return this.node(start, {
      kind: Kind.DIRECTIVE,
      name: this.parseName(),
      arguments: this.parseArguments(isConst)
    });
  }
  // Implements the parsing rules in the Types section.
  /**
   * Type :
   *   - NamedType
   *   - ListType
   *   - NonNullType
   */
  parseTypeReference() {
    const start = this._lexer.token;
    let type;
    if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
      const innerType = this.parseTypeReference();
      this.expectToken(TokenKind.BRACKET_R);
      type = this.node(start, {
        kind: Kind.LIST_TYPE,
        type: innerType
      });
    } else {
      type = this.parseNamedType();
    }
    if (this.expectOptionalToken(TokenKind.BANG)) {
      return this.node(start, {
        kind: Kind.NON_NULL_TYPE,
        type
      });
    }
    return type;
  }
  /**
   * NamedType : Name
   */
  parseNamedType() {
    return this.node(this._lexer.token, {
      kind: Kind.NAMED_TYPE,
      name: this.parseName()
    });
  }
  // Implements the parsing rules in the Type Definition section.
  peekDescription() {
    return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
  }
  /**
   * Description : StringValue
   */
  parseDescription() {
    if (this.peekDescription()) {
      return this.parseStringLiteral();
    }
  }
  /**
   * ```
   * SchemaDefinition : Description? schema Directives[Const]? { OperationTypeDefinition+ }
   * ```
   */
  parseSchemaDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.many(
      TokenKind.BRACE_L,
      this.parseOperationTypeDefinition,
      TokenKind.BRACE_R
    );
    return this.node(start, {
      kind: Kind.SCHEMA_DEFINITION,
      description,
      directives,
      operationTypes
    });
  }
  /**
   * OperationTypeDefinition : OperationType : NamedType
   */
  parseOperationTypeDefinition() {
    const start = this._lexer.token;
    const operation = this.parseOperationType();
    this.expectToken(TokenKind.COLON);
    const type = this.parseNamedType();
    return this.node(start, {
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation,
      type
    });
  }
  /**
   * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
   */
  parseScalarTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.SCALAR_TYPE_DEFINITION,
      description,
      name,
      directives
    });
  }
  /**
   * ObjectTypeDefinition :
   *   Description?
   *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
   */
  parseObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  /**
   * ImplementsInterfaces :
   *   - implements `&`? NamedType
   *   - ImplementsInterfaces & NamedType
   */
  parseImplementsInterfaces() {
    return this.expectOptionalKeyword("implements") ? this.delimitedMany(TokenKind.AMP, this.parseNamedType) : [];
  }
  /**
   * ```
   * FieldsDefinition : { FieldDefinition+ }
   * ```
   */
  parseFieldsDefinition() {
    return this.optionalMany(
      TokenKind.BRACE_L,
      this.parseFieldDefinition,
      TokenKind.BRACE_R
    );
  }
  /**
   * FieldDefinition :
   *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
   */
  parseFieldDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.FIELD_DEFINITION,
      description,
      name,
      arguments: args,
      type,
      directives
    });
  }
  /**
   * ArgumentsDefinition : ( InputValueDefinition+ )
   */
  parseArgumentDefs() {
    return this.optionalMany(
      TokenKind.PAREN_L,
      this.parseInputValueDef,
      TokenKind.PAREN_R
    );
  }
  /**
   * InputValueDefinition :
   *   - Description? Name : Type DefaultValue? Directives[Const]?
   */
  parseInputValueDef() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    let defaultValue;
    if (this.expectOptionalToken(TokenKind.EQUALS)) {
      defaultValue = this.parseConstValueLiteral();
    }
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.INPUT_VALUE_DEFINITION,
      description,
      name,
      type,
      defaultValue,
      directives
    });
  }
  /**
   * InterfaceTypeDefinition :
   *   - Description? interface Name Directives[Const]? FieldsDefinition?
   */
  parseInterfaceTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: Kind.INTERFACE_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  /**
   * UnionTypeDefinition :
   *   - Description? union Name Directives[Const]? UnionMemberTypes?
   */
  parseUnionTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    return this.node(start, {
      kind: Kind.UNION_TYPE_DEFINITION,
      description,
      name,
      directives,
      types
    });
  }
  /**
   * UnionMemberTypes :
   *   - = `|`? NamedType
   *   - UnionMemberTypes | NamedType
   */
  parseUnionMemberTypes() {
    return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : [];
  }
  /**
   * EnumTypeDefinition :
   *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
   */
  parseEnumTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    return this.node(start, {
      kind: Kind.ENUM_TYPE_DEFINITION,
      description,
      name,
      directives,
      values
    });
  }
  /**
   * ```
   * EnumValuesDefinition : { EnumValueDefinition+ }
   * ```
   */
  parseEnumValuesDefinition() {
    return this.optionalMany(
      TokenKind.BRACE_L,
      this.parseEnumValueDefinition,
      TokenKind.BRACE_R
    );
  }
  /**
   * EnumValueDefinition : Description? EnumValue Directives[Const]?
   */
  parseEnumValueDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseEnumValueName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.ENUM_VALUE_DEFINITION,
      description,
      name,
      directives
    });
  }
  /**
   * EnumValue : Name but not `true`, `false` or `null`
   */
  parseEnumValueName() {
    if (this._lexer.token.value === "true" || this._lexer.token.value === "false" || this._lexer.token.value === "null") {
      throw syntaxError(
        this._lexer.source,
        this._lexer.token.start,
        `${getTokenDesc(
          this._lexer.token
        )} is reserved and cannot be used for an enum value.`
      );
    }
    return this.parseName();
  }
  /**
   * InputObjectTypeDefinition :
   *   - Description? input Name Directives[Const]? InputFieldsDefinition?
   */
  parseInputObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    return this.node(start, {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      description,
      name,
      directives,
      fields
    });
  }
  /**
   * ```
   * InputFieldsDefinition : { InputValueDefinition+ }
   * ```
   */
  parseInputFieldsDefinition() {
    return this.optionalMany(
      TokenKind.BRACE_L,
      this.parseInputValueDef,
      TokenKind.BRACE_R
    );
  }
  /**
   * TypeSystemExtension :
   *   - SchemaExtension
   *   - TypeExtension
   *
   * TypeExtension :
   *   - ScalarTypeExtension
   *   - ObjectTypeExtension
   *   - InterfaceTypeExtension
   *   - UnionTypeExtension
   *   - EnumTypeExtension
   *   - InputObjectTypeDefinition
   *   - DirectiveDefinitionExtension
   */
  parseTypeSystemExtension() {
    const keywordToken = this._lexer.lookahead();
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaExtension();
        case "scalar":
          return this.parseScalarTypeExtension();
        case "type":
          return this.parseObjectTypeExtension();
        case "interface":
          return this.parseInterfaceTypeExtension();
        case "union":
          return this.parseUnionTypeExtension();
        case "enum":
          return this.parseEnumTypeExtension();
        case "input":
          return this.parseInputObjectTypeExtension();
        case "directive":
          if (this._options.experimentalDirectivesOnDirectiveDefinitions) {
            return this.parseDirectiveDefinitionExtension();
          }
          break;
      }
    }
    throw this.unexpected(keywordToken);
  }
  /**
   * ```
   * SchemaExtension :
   *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
   *  - extend schema Directives[Const]
   * ```
   */
  parseSchemaExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.optionalMany(
      TokenKind.BRACE_L,
      this.parseOperationTypeDefinition,
      TokenKind.BRACE_R
    );
    if (directives.length === 0 && operationTypes.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.SCHEMA_EXTENSION,
      directives,
      operationTypes
    });
  }
  /**
   * ScalarTypeExtension :
   *   - extend scalar Name Directives[Const]
   */
  parseScalarTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    if (directives.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.SCALAR_TYPE_EXTENSION,
      name,
      directives
    });
  }
  /**
   * ObjectTypeExtension :
   *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
   *  - extend type Name ImplementsInterfaces? Directives[Const]
   *  - extend type Name ImplementsInterfaces
   */
  parseObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  /**
   * InterfaceTypeExtension :
   *  - extend interface Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
   *  - extend interface Name ImplementsInterfaces? Directives[Const]
   *  - extend interface Name ImplementsInterfaces
   */
  parseInterfaceTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.INTERFACE_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  /**
   * UnionTypeExtension :
   *   - extend union Name Directives[Const]? UnionMemberTypes
   *   - extend union Name Directives[Const]
   */
  parseUnionTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    if (directives.length === 0 && types.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.UNION_TYPE_EXTENSION,
      name,
      directives,
      types
    });
  }
  /**
   * EnumTypeExtension :
   *   - extend enum Name Directives[Const]? EnumValuesDefinition
   *   - extend enum Name Directives[Const]
   */
  parseEnumTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    if (directives.length === 0 && values.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.ENUM_TYPE_EXTENSION,
      name,
      directives,
      values
    });
  }
  /**
   * InputObjectTypeExtension :
   *   - extend input Name Directives[Const]? InputFieldsDefinition
   *   - extend input Name Directives[Const]
   */
  parseInputObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    if (directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
      name,
      directives,
      fields
    });
  }
  parseDirectiveDefinitionExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("directive");
    this.expectToken(TokenKind.AT);
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    if (directives.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.DIRECTIVE_EXTENSION,
      name,
      directives
    });
  }
  /**
   * ```
   * DirectiveDefinition :
   *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
   * ```
   */
  parseDirectiveDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("directive");
    this.expectToken(TokenKind.AT);
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    const directives = this._options.experimentalDirectivesOnDirectiveDefinitions ? this.parseConstDirectives() : [];
    const repeatable = this.expectOptionalKeyword("repeatable");
    this.expectKeyword("on");
    const locations = this.parseDirectiveLocations();
    return this.node(start, {
      kind: Kind.DIRECTIVE_DEFINITION,
      description,
      name,
      arguments: args,
      directives,
      repeatable,
      locations
    });
  }
  /**
   * DirectiveLocations :
   *   - `|`? DirectiveLocation
   *   - DirectiveLocations | DirectiveLocation
   */
  parseDirectiveLocations() {
    return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
  }
  /*
   * DirectiveLocation :
   *   - ExecutableDirectiveLocation
   *   - TypeSystemDirectiveLocation
   *
   * ExecutableDirectiveLocation : one of
   *   `QUERY`
   *   `MUTATION`
   *   `SUBSCRIPTION`
   *   `FIELD`
   *   `FRAGMENT_DEFINITION`
   *   `FRAGMENT_SPREAD`
   *   `INLINE_FRAGMENT`
   *
   * TypeSystemDirectiveLocation : one of
   *   `SCHEMA`
   *   `SCALAR`
   *   `OBJECT`
   *   `FIELD_DEFINITION`
   *   `ARGUMENT_DEFINITION`
   *   `INTERFACE`
   *   `UNION`
   *   `ENUM`
   *   `ENUM_VALUE`
   *   `INPUT_OBJECT`
   *   `INPUT_FIELD_DEFINITION`
   *   `DIRECTIVE_DEFINITION`
   */
  parseDirectiveLocation() {
    const start = this._lexer.token;
    const name = this.parseName();
    if (Object.prototype.hasOwnProperty.call(DirectiveLocation, name.value)) {
      return name;
    }
    throw this.unexpected(start);
  }
  // Schema Coordinates
  /**
   * SchemaCoordinate :
   *   - Name
   *   - Name . Name
   *   - Name . Name ( Name : )
   *   - \@ Name
   *   - \@ Name ( Name : )
   */
  parseSchemaCoordinate() {
    const start = this._lexer.token;
    const ofDirective = this.expectOptionalToken(TokenKind.AT);
    const name = this.parseName();
    let memberName;
    if (!ofDirective && this.expectOptionalToken(TokenKind.DOT)) {
      memberName = this.parseName();
    }
    let argumentName;
    if ((ofDirective || memberName) && this.expectOptionalToken(TokenKind.PAREN_L)) {
      argumentName = this.parseName();
      this.expectToken(TokenKind.COLON);
      this.expectToken(TokenKind.PAREN_R);
    }
    if (ofDirective) {
      if (argumentName) {
        return this.node(start, {
          kind: Kind.DIRECTIVE_ARGUMENT_COORDINATE,
          name,
          argumentName
        });
      }
      return this.node(start, {
        kind: Kind.DIRECTIVE_COORDINATE,
        name
      });
    } else if (memberName) {
      if (argumentName) {
        return this.node(start, {
          kind: Kind.ARGUMENT_COORDINATE,
          name,
          fieldName: memberName,
          argumentName
        });
      }
      return this.node(start, {
        kind: Kind.MEMBER_COORDINATE,
        name,
        memberName
      });
    }
    return this.node(start, {
      kind: Kind.TYPE_COORDINATE,
      name
    });
  }
  // Core parsing utility functions
  /**
   * Returns a node that, if configured to do so, sets a "loc" field as a
   * location object, used to identify the place in the source that created a
   * given parsed object.
   */
  node(startToken, node) {
    if (this._options.noLocation !== true) {
      node.loc = new Location(
        startToken,
        this._lexer.lastToken,
        this._lexer.source
      );
    }
    return node;
  }
  /**
   * Determines if the next token is of a given kind
   */
  peek(kind) {
    return this._lexer.token.kind === kind;
  }
  /**
   * If the next token is of the given kind, return that token after advancing the lexer.
   * Otherwise, do not change the parser state and throw an error.
   */
  expectToken(kind) {
    const token = this._lexer.token;
    if (token.kind === kind) {
      this.advanceLexer();
      return token;
    }
    throw syntaxError(
      this._lexer.source,
      token.start,
      `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`
    );
  }
  /**
   * If the next token is of the given kind, return "true" after advancing the lexer.
   * Otherwise, do not change the parser state and return "false".
   */
  expectOptionalToken(kind) {
    const token = this._lexer.token;
    if (token.kind === kind) {
      this.advanceLexer();
      return true;
    }
    return false;
  }
  /**
   * If the next token is a given keyword, advance the lexer.
   * Otherwise, do not change the parser state and throw an error.
   */
  expectKeyword(value) {
    const token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this.advanceLexer();
    } else {
      throw syntaxError(
        this._lexer.source,
        token.start,
        `Expected "${value}", found ${getTokenDesc(token)}.`
      );
    }
  }
  /**
   * If the next token is a given keyword, return "true" after advancing the lexer.
   * Otherwise, do not change the parser state and return "false".
   */
  expectOptionalKeyword(value) {
    const token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this.advanceLexer();
      return true;
    }
    return false;
  }
  /**
   * Helper function for creating an error when an unexpected lexed token is encountered.
   */
  unexpected(atToken) {
    const token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
    return syntaxError(
      this._lexer.source,
      token.start,
      `Unexpected ${getTokenDesc(token)}.`
    );
  }
  /**
   * Returns a possibly empty list of parse nodes, determined by the parseFn.
   * This list begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the next lex token after the closing token.
   */
  any(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    while (!this.expectOptionalToken(closeKind)) {
      nodes.push(parseFn.call(this));
    }
    return nodes;
  }
  /**
   * Returns a list of parse nodes, determined by the parseFn.
   * It can be empty only if open token is missing otherwise it will always return non-empty list
   * that begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the next lex token after the closing token.
   */
  optionalMany(openKind, parseFn, closeKind) {
    if (this.expectOptionalToken(openKind)) {
      const nodes = [];
      do {
        nodes.push(parseFn.call(this));
      } while (!this.expectOptionalToken(closeKind));
      return nodes;
    }
    return [];
  }
  /**
   * Returns a non-empty list of parse nodes, determined by the parseFn.
   * This list begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the next lex token after the closing token.
   */
  many(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (!this.expectOptionalToken(closeKind));
    return nodes;
  }
  /**
   * Returns a non-empty list of parse nodes, determined by the parseFn.
   * This list may begin with a lex token of delimiterKind followed by items separated by lex tokens of tokenKind.
   * Advances the parser to the next lex token after last item in the list.
   */
  delimitedMany(delimiterKind, parseFn) {
    this.expectOptionalToken(delimiterKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (this.expectOptionalToken(delimiterKind));
    return nodes;
  }
  advanceLexer() {
    const { maxTokens } = this._options;
    const token = this._lexer.advance();
    if (token.kind !== TokenKind.EOF) {
      ++this._tokenCounter;
      if (maxTokens !== void 0 && this._tokenCounter > maxTokens) {
        throw syntaxError(
          this._lexer.source,
          token.start,
          `Document contains more that ${maxTokens} tokens. Parsing aborted.`
        );
      }
    }
  }
};
function getTokenDesc(token) {
  const value = token.value;
  return getTokenKindDesc(token.kind) + (value != null ? ` "${value}"` : "");
}
function getTokenKindDesc(kind) {
  return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
}

// node_modules/graphql/language/printString.mjs
function printString(str) {
  return `"${str.replace(escapedRegExp, escapedReplacer)}"`;
}
var escapedRegExp = /[\x00-\x1f\x22\x5c\x7f-\x9f]/g;
function escapedReplacer(str) {
  return escapeSequences[str.charCodeAt(0)];
}
var escapeSequences = [
  "\\u0000",
  "\\u0001",
  "\\u0002",
  "\\u0003",
  "\\u0004",
  "\\u0005",
  "\\u0006",
  "\\u0007",
  "\\b",
  "\\t",
  "\\n",
  "\\u000B",
  "\\f",
  "\\r",
  "\\u000E",
  "\\u000F",
  "\\u0010",
  "\\u0011",
  "\\u0012",
  "\\u0013",
  "\\u0014",
  "\\u0015",
  "\\u0016",
  "\\u0017",
  "\\u0018",
  "\\u0019",
  "\\u001A",
  "\\u001B",
  "\\u001C",
  "\\u001D",
  "\\u001E",
  "\\u001F",
  "",
  "",
  '\\"',
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  // 2F
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  // 3F
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  // 4F
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "\\\\",
  "",
  "",
  "",
  // 5F
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  // 6F
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "\\u007F",
  "\\u0080",
  "\\u0081",
  "\\u0082",
  "\\u0083",
  "\\u0084",
  "\\u0085",
  "\\u0086",
  "\\u0087",
  "\\u0088",
  "\\u0089",
  "\\u008A",
  "\\u008B",
  "\\u008C",
  "\\u008D",
  "\\u008E",
  "\\u008F",
  "\\u0090",
  "\\u0091",
  "\\u0092",
  "\\u0093",
  "\\u0094",
  "\\u0095",
  "\\u0096",
  "\\u0097",
  "\\u0098",
  "\\u0099",
  "\\u009A",
  "\\u009B",
  "\\u009C",
  "\\u009D",
  "\\u009E",
  "\\u009F"
];

// node_modules/graphql/language/visitor.mjs
var BREAK = Object.freeze({});
function visit(root, visitor, visitorKeys = QueryDocumentKeys) {
  const enterLeaveMap = /* @__PURE__ */ new Map();
  for (const kind of Object.values(Kind)) {
    enterLeaveMap.set(kind, getEnterLeaveForKind(visitor, kind));
  }
  let stack = void 0;
  let inArray = Array.isArray(root);
  let keys = [root];
  let index = -1;
  let edits = [];
  let node = root;
  let key = void 0;
  let parent = void 0;
  const path = [];
  const ancestors = [];
  do {
    index++;
    const isLeaving = index === keys.length;
    const isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? void 0 : path[path.length - 1];
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        if (inArray) {
          node = node.slice();
          let editOffset = 0;
          for (const [editKey, editValue] of edits) {
            const arrayKey = editKey - editOffset;
            if (editValue === null) {
              node.splice(arrayKey, 1);
              editOffset++;
            } else {
              node[arrayKey] = editValue;
            }
          }
        } else {
          node = { ...node };
          for (const [editKey, editValue] of edits) {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else if (parent) {
      key = inArray ? index : keys[index];
      node = parent[key];
      if (node === null || node === void 0) {
        continue;
      }
      path.push(key);
    }
    let result;
    if (!Array.isArray(node)) {
      var _enterLeaveMap$get, _enterLeaveMap$get2;
      isNode(node) || devAssert(false, `Invalid AST Node: ${inspect(node)}.`);
      const visitFn = isLeaving ? (_enterLeaveMap$get = enterLeaveMap.get(node.kind)) === null || _enterLeaveMap$get === void 0 ? void 0 : _enterLeaveMap$get.leave : (_enterLeaveMap$get2 = enterLeaveMap.get(node.kind)) === null || _enterLeaveMap$get2 === void 0 ? void 0 : _enterLeaveMap$get2.enter;
      result = visitFn === null || visitFn === void 0 ? void 0 : visitFn.call(visitor, node, key, parent, path, ancestors);
      if (result === BREAK) {
        break;
      }
      if (result === false) {
        if (!isLeaving) {
          path.pop();
          continue;
        }
      } else if (result !== void 0) {
        edits.push([key, result]);
        if (!isLeaving) {
          if (isNode(result)) {
            node = result;
          } else {
            path.pop();
            continue;
          }
        }
      }
    }
    if (result === void 0 && isEdited) {
      edits.push([key, node]);
    }
    if (isLeaving) {
      path.pop();
    } else {
      var _node$kind;
      stack = {
        inArray,
        index,
        keys,
        edits,
        prev: stack
      };
      inArray = Array.isArray(node);
      keys = inArray ? node : (_node$kind = visitorKeys[node.kind]) !== null && _node$kind !== void 0 ? _node$kind : [];
      index = -1;
      edits = [];
      if (parent) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== void 0);
  if (edits.length !== 0) {
    return edits[edits.length - 1][1];
  }
  return root;
}
function getEnterLeaveForKind(visitor, kind) {
  const kindVisitor = visitor[kind];
  if (typeof kindVisitor === "object") {
    return kindVisitor;
  } else if (typeof kindVisitor === "function") {
    return {
      enter: kindVisitor,
      leave: void 0
    };
  }
  return {
    enter: visitor.enter,
    leave: visitor.leave
  };
}

// node_modules/graphql/language/printer.mjs
function print(ast) {
  return visit(ast, printDocASTReducer);
}
var MAX_LINE_LENGTH = 80;
var printDocASTReducer = {
  Name: {
    leave: (node) => node.value
  },
  Variable: {
    leave: (node) => "$" + node.name
  },
  // Document
  Document: {
    leave: (node) => join(node.definitions, "\n\n")
  },
  OperationDefinition: {
    leave(node) {
      const varDefs = hasMultilineItems(node.variableDefinitions) ? wrap("(\n", join(node.variableDefinitions, "\n"), "\n)") : wrap("(", join(node.variableDefinitions, ", "), ")");
      const prefix = wrap("", node.description, "\n") + join(
        [
          node.operation,
          join([node.name, varDefs]),
          join(node.directives, " ")
        ],
        " "
      );
      return (prefix === "query" ? "" : prefix + " ") + node.selectionSet;
    }
  },
  VariableDefinition: {
    leave: ({ variable, type, defaultValue, directives, description }) => wrap("", description, "\n") + variable + ": " + type + wrap(" = ", defaultValue) + wrap(" ", join(directives, " "))
  },
  SelectionSet: {
    leave: ({ selections }) => block(selections)
  },
  Field: {
    leave({ alias, name, arguments: args, directives, selectionSet }) {
      const prefix = wrap("", alias, ": ") + name;
      let argsLine = prefix + wrap("(", join(args, ", "), ")");
      if (argsLine.length > MAX_LINE_LENGTH) {
        argsLine = prefix + wrap("(\n", indent(join(args, "\n")), "\n)");
      }
      return join([argsLine, join(directives, " "), selectionSet], " ");
    }
  },
  Argument: {
    leave: ({ name, value }) => name + ": " + value
  },
  // Fragments
  FragmentSpread: {
    leave: ({ name, directives }) => "..." + name + wrap(" ", join(directives, " "))
  },
  InlineFragment: {
    leave: ({ typeCondition, directives, selectionSet }) => join(
      [
        "...",
        wrap("on ", typeCondition),
        join(directives, " "),
        selectionSet
      ],
      " "
    )
  },
  FragmentDefinition: {
    leave: ({
      name,
      typeCondition,
      variableDefinitions,
      directives,
      selectionSet,
      description
    }) => wrap("", description, "\n") + // Note: fragment variable definitions are experimental and may be changed
    // or removed in the future.
    `fragment ${name}${wrap("(", join(variableDefinitions, ", "), ")")} on ${typeCondition} ${wrap("", join(directives, " "), " ")}` + selectionSet
  },
  // Value
  IntValue: {
    leave: ({ value }) => value
  },
  FloatValue: {
    leave: ({ value }) => value
  },
  StringValue: {
    leave: ({ value, block: isBlockString }) => isBlockString ? printBlockString(value) : printString(value)
  },
  BooleanValue: {
    leave: ({ value }) => value ? "true" : "false"
  },
  NullValue: {
    leave: () => "null"
  },
  EnumValue: {
    leave: ({ value }) => value
  },
  ListValue: {
    leave: ({ values }) => "[" + join(values, ", ") + "]"
  },
  ObjectValue: {
    leave: ({ fields }) => "{" + join(fields, ", ") + "}"
  },
  ObjectField: {
    leave: ({ name, value }) => name + ": " + value
  },
  // Directive
  Directive: {
    leave: ({ name, arguments: args }) => "@" + name + wrap("(", join(args, ", "), ")")
  },
  // Type
  NamedType: {
    leave: ({ name }) => name
  },
  ListType: {
    leave: ({ type }) => "[" + type + "]"
  },
  NonNullType: {
    leave: ({ type }) => type + "!"
  },
  // Type System Definitions
  SchemaDefinition: {
    leave: ({ description, directives, operationTypes }) => wrap("", description, "\n") + join(["schema", join(directives, " "), block(operationTypes)], " ")
  },
  OperationTypeDefinition: {
    leave: ({ operation, type }) => operation + ": " + type
  },
  ScalarTypeDefinition: {
    leave: ({ description, name, directives }) => wrap("", description, "\n") + join(["scalar", name, join(directives, " ")], " ")
  },
  ObjectTypeDefinition: {
    leave: ({ description, name, interfaces, directives, fields }) => wrap("", description, "\n") + join(
      [
        "type",
        name,
        wrap("implements ", join(interfaces, " & ")),
        join(directives, " "),
        block(fields)
      ],
      " "
    )
  },
  FieldDefinition: {
    leave: ({ description, name, arguments: args, type, directives }) => wrap("", description, "\n") + name + (hasMultilineItems(args) ? wrap("(\n", indent(join(args, "\n")), "\n)") : wrap("(", join(args, ", "), ")")) + ": " + type + wrap(" ", join(directives, " "))
  },
  InputValueDefinition: {
    leave: ({ description, name, type, defaultValue, directives }) => wrap("", description, "\n") + join(
      [name + ": " + type, wrap("= ", defaultValue), join(directives, " ")],
      " "
    )
  },
  InterfaceTypeDefinition: {
    leave: ({ description, name, interfaces, directives, fields }) => wrap("", description, "\n") + join(
      [
        "interface",
        name,
        wrap("implements ", join(interfaces, " & ")),
        join(directives, " "),
        block(fields)
      ],
      " "
    )
  },
  UnionTypeDefinition: {
    leave: ({ description, name, directives, types }) => wrap("", description, "\n") + join(
      ["union", name, join(directives, " "), wrap("= ", join(types, " | "))],
      " "
    )
  },
  EnumTypeDefinition: {
    leave: ({ description, name, directives, values }) => wrap("", description, "\n") + join(["enum", name, join(directives, " "), block(values)], " ")
  },
  EnumValueDefinition: {
    leave: ({ description, name, directives }) => wrap("", description, "\n") + join([name, join(directives, " ")], " ")
  },
  InputObjectTypeDefinition: {
    leave: ({ description, name, directives, fields }) => wrap("", description, "\n") + join(["input", name, join(directives, " "), block(fields)], " ")
  },
  DirectiveDefinition: {
    leave: ({
      description,
      name,
      arguments: args,
      directives,
      repeatable,
      locations
    }) => wrap("", description, "\n") + "directive @" + name + (hasMultilineItems(args) ? wrap("(\n", indent(join(args, "\n")), "\n)") : wrap("(", join(args, ", "), ")")) + wrap(" ", join(directives, " ")) + (repeatable ? " repeatable" : "") + " on " + join(locations, " | ")
  },
  SchemaExtension: {
    leave: ({ directives, operationTypes }) => join(
      ["extend schema", join(directives, " "), block(operationTypes)],
      " "
    )
  },
  ScalarTypeExtension: {
    leave: ({ name, directives }) => join(["extend scalar", name, join(directives, " ")], " ")
  },
  ObjectTypeExtension: {
    leave: ({ name, interfaces, directives, fields }) => join(
      [
        "extend type",
        name,
        wrap("implements ", join(interfaces, " & ")),
        join(directives, " "),
        block(fields)
      ],
      " "
    )
  },
  InterfaceTypeExtension: {
    leave: ({ name, interfaces, directives, fields }) => join(
      [
        "extend interface",
        name,
        wrap("implements ", join(interfaces, " & ")),
        join(directives, " "),
        block(fields)
      ],
      " "
    )
  },
  UnionTypeExtension: {
    leave: ({ name, directives, types }) => join(
      [
        "extend union",
        name,
        join(directives, " "),
        wrap("= ", join(types, " | "))
      ],
      " "
    )
  },
  EnumTypeExtension: {
    leave: ({ name, directives, values }) => join(["extend enum", name, join(directives, " "), block(values)], " ")
  },
  InputObjectTypeExtension: {
    leave: ({ name, directives, fields }) => join(["extend input", name, join(directives, " "), block(fields)], " ")
  },
  DirectiveExtension: {
    leave: ({ name, directives }) => join(["extend directive @" + name, join(directives, " ")], " ")
  },
  // Schema Coordinates
  TypeCoordinate: {
    leave: ({ name }) => name
  },
  MemberCoordinate: {
    leave: ({ name, memberName }) => join([name, wrap(".", memberName)])
  },
  ArgumentCoordinate: {
    leave: ({ name, fieldName, argumentName }) => join([name, wrap(".", fieldName), wrap("(", argumentName, ":)")])
  },
  DirectiveCoordinate: {
    leave: ({ name }) => join(["@", name])
  },
  DirectiveArgumentCoordinate: {
    leave: ({ name, argumentName }) => join(["@", name, wrap("(", argumentName, ":)")])
  }
};
function join(maybeArray, separator = "") {
  var _maybeArray$filter$jo;
  return (_maybeArray$filter$jo = maybeArray === null || maybeArray === void 0 ? void 0 : maybeArray.filter((x2) => x2).join(separator)) !== null && _maybeArray$filter$jo !== void 0 ? _maybeArray$filter$jo : "";
}
function block(array) {
  return wrap("{\n", indent(join(array, "\n")), "\n}");
}
function wrap(start, maybeString, end = "") {
  return maybeString != null && maybeString !== "" ? start + maybeString + end : "";
}
function indent(str) {
  return wrap("  ", str.replace(/\n/g, "\n  "));
}
function hasMultilineItems(maybeArray) {
  var _maybeArray$some;
  return (_maybeArray$some = maybeArray === null || maybeArray === void 0 ? void 0 : maybeArray.some((str) => str.includes("\n"))) !== null && _maybeArray$some !== void 0 ? _maybeArray$some : false;
}

// node_modules/graphql-request/build/esm/resolveRequestDocument.js
var extractOperationName = (document) => {
  let operationName = void 0;
  const operationDefinitions = document.definitions.filter((definition) => definition.kind === `OperationDefinition`);
  if (operationDefinitions.length === 1) {
    operationName = operationDefinitions[0]?.name?.value;
  }
  return operationName;
};
var resolveRequestDocument = (document) => {
  if (typeof document === `string`) {
    let operationName2 = void 0;
    try {
      const parsedDocument = parse2(document);
      operationName2 = extractOperationName(parsedDocument);
    } catch (err) {
    }
    return { query: document, operationName: operationName2 };
  }
  const operationName = extractOperationName(document);
  return { query: print(document), operationName };
};

// node_modules/graphql-request/build/esm/types.js
var ClientError = class _ClientError extends Error {
  constructor(response, request) {
    const message = `${_ClientError.extractMessage(response)}: ${JSON.stringify({
      response,
      request
    })}`;
    super(message);
    Object.setPrototypeOf(this, _ClientError.prototype);
    this.response = response;
    this.request = request;
    if (typeof Error.captureStackTrace === `function`) {
      Error.captureStackTrace(this, _ClientError);
    }
  }
  static extractMessage(response) {
    return response.errors?.[0]?.message ?? `GraphQL Error (Code: ${response.status})`;
  }
};

// node_modules/graphql-request/build/esm/index.js
var CrossFetch = __toESM(require_browser_ponyfill(), 1);

// node_modules/graphql-request/build/esm/graphql-ws.js
var CONNECTION_INIT = `connection_init`;
var CONNECTION_ACK = `connection_ack`;
var PING = `ping`;
var PONG = `pong`;
var SUBSCRIBE = `subscribe`;
var NEXT = `next`;
var ERROR = `error`;
var COMPLETE = `complete`;
var GraphQLWebSocketMessage = class _GraphQLWebSocketMessage {
  get type() {
    return this._type;
  }
  get id() {
    return this._id;
  }
  get payload() {
    return this._payload;
  }
  constructor(type, payload, id) {
    this._type = type;
    this._payload = payload;
    this._id = id;
  }
  get text() {
    const result = { type: this.type };
    if (this.id != null && this.id != void 0)
      result.id = this.id;
    if (this.payload != null && this.payload != void 0)
      result.payload = this.payload;
    return JSON.stringify(result);
  }
  static parse(data, f2) {
    const { type, payload, id } = JSON.parse(data);
    return new _GraphQLWebSocketMessage(type, f2(payload), id);
  }
};
var GraphQLWebSocketClient = class {
  constructor(socket, { onInit, onAcknowledged, onPing, onPong }) {
    this.socketState = { acknowledged: false, lastRequestId: 0, subscriptions: {} };
    this.socket = socket;
    socket.addEventListener(`open`, async (e24) => {
      this.socketState.acknowledged = false;
      this.socketState.subscriptions = {};
      socket.send(ConnectionInit(onInit ? await onInit() : null).text);
    });
    socket.addEventListener(`close`, (e24) => {
      this.socketState.acknowledged = false;
      this.socketState.subscriptions = {};
    });
    socket.addEventListener(`error`, (e24) => {
      console.error(e24);
    });
    socket.addEventListener(`message`, (e24) => {
      try {
        const message = parseMessage(e24.data);
        switch (message.type) {
          case CONNECTION_ACK: {
            if (this.socketState.acknowledged) {
              console.warn(`Duplicate CONNECTION_ACK message ignored`);
            } else {
              this.socketState.acknowledged = true;
              if (onAcknowledged)
                onAcknowledged(message.payload);
            }
            return;
          }
          case PING: {
            if (onPing)
              onPing(message.payload).then((r) => socket.send(Pong(r).text));
            else
              socket.send(Pong(null).text);
            return;
          }
          case PONG: {
            if (onPong)
              onPong(message.payload);
            return;
          }
        }
        if (!this.socketState.acknowledged) {
          return;
        }
        if (message.id === void 0 || message.id === null || !this.socketState.subscriptions[message.id]) {
          return;
        }
        const { query, variables, subscriber } = this.socketState.subscriptions[message.id];
        switch (message.type) {
          case NEXT: {
            if (!message.payload.errors && message.payload.data) {
              subscriber.next && subscriber.next(message.payload.data);
            }
            if (message.payload.errors) {
              subscriber.error && subscriber.error(new ClientError({ ...message.payload, status: 200 }, { query, variables }));
            } else {
            }
            return;
          }
          case ERROR: {
            subscriber.error && subscriber.error(new ClientError({ errors: message.payload, status: 200 }, { query, variables }));
            return;
          }
          case COMPLETE: {
            subscriber.complete && subscriber.complete();
            delete this.socketState.subscriptions[message.id];
            return;
          }
        }
      } catch (e25) {
        console.error(e25);
        socket.close(1006);
      }
      socket.close(4400, `Unknown graphql-ws message.`);
    });
  }
  makeSubscribe(query, operationName, subscriber, variables) {
    const subscriptionId = (this.socketState.lastRequestId++).toString();
    this.socketState.subscriptions[subscriptionId] = { query, variables, subscriber };
    this.socket.send(Subscribe(subscriptionId, { query, operationName, variables }).text);
    return () => {
      this.socket.send(Complete(subscriptionId).text);
      delete this.socketState.subscriptions[subscriptionId];
    };
  }
  rawRequest(query, variables) {
    return new Promise((resolve, reject) => {
      let result;
      this.rawSubscribe(query, {
        next: (data, extensions) => result = { data, extensions },
        error: reject,
        complete: () => resolve(result)
      }, variables);
    });
  }
  request(document, variables) {
    return new Promise((resolve, reject) => {
      let result;
      this.subscribe(document, {
        next: (data) => result = data,
        error: reject,
        complete: () => resolve(result)
      }, variables);
    });
  }
  subscribe(document, subscriber, variables) {
    const { query, operationName } = resolveRequestDocument(document);
    return this.makeSubscribe(query, operationName, subscriber, variables);
  }
  rawSubscribe(query, subscriber, variables) {
    return this.makeSubscribe(query, void 0, subscriber, variables);
  }
  ping(payload) {
    this.socket.send(Ping(payload).text);
  }
  close() {
    this.socket.close(1e3);
  }
};
GraphQLWebSocketClient.PROTOCOL = `graphql-transport-ws`;
function parseMessage(data, f2 = (a) => a) {
  const m2 = GraphQLWebSocketMessage.parse(data, f2);
  return m2;
}
function ConnectionInit(payload) {
  return new GraphQLWebSocketMessage(CONNECTION_INIT, payload);
}
function Ping(payload) {
  return new GraphQLWebSocketMessage(PING, payload, void 0);
}
function Pong(payload) {
  return new GraphQLWebSocketMessage(PONG, payload, void 0);
}
function Subscribe(id, payload) {
  return new GraphQLWebSocketMessage(SUBSCRIBE, payload, id);
}
function Complete(id) {
  return new GraphQLWebSocketMessage(COMPLETE, void 0, id);
}

// node_modules/graphql-request/build/esm/index.js
var resolveHeaders = (headers) => {
  let oHeaders = {};
  if (headers) {
    if (typeof Headers !== `undefined` && headers instanceof Headers || CrossFetch && CrossFetch.Headers && headers instanceof CrossFetch.Headers) {
      oHeaders = HeadersInstanceToPlainObject(headers);
    } else if (Array.isArray(headers)) {
      headers.forEach(([name, value]) => {
        if (name && value !== void 0) {
          oHeaders[name] = value;
        }
      });
    } else {
      oHeaders = headers;
    }
  }
  return oHeaders;
};
var cleanQuery = (str) => str.replace(/([\s,]|#[^\n\r]+)+/g, ` `).trim();
var buildRequestConfig = (params) => {
  if (!Array.isArray(params.query)) {
    const params_2 = params;
    const search = [`query=${encodeURIComponent(cleanQuery(params_2.query))}`];
    if (params.variables) {
      search.push(`variables=${encodeURIComponent(params_2.jsonSerializer.stringify(params_2.variables))}`);
    }
    if (params_2.operationName) {
      search.push(`operationName=${encodeURIComponent(params_2.operationName)}`);
    }
    return search.join(`&`);
  }
  if (typeof params.variables !== `undefined` && !Array.isArray(params.variables)) {
    throw new Error(`Cannot create query with given variable type, array expected`);
  }
  const params_ = params;
  const payload = params.query.reduce((acc, currentQuery, index) => {
    acc.push({
      query: cleanQuery(currentQuery),
      variables: params_.variables ? params_.jsonSerializer.stringify(params_.variables[index]) : void 0
    });
    return acc;
  }, []);
  return `query=${encodeURIComponent(params_.jsonSerializer.stringify(payload))}`;
};
var createHttpMethodFetcher = (method) => async (params) => {
  const { url, query, variables, operationName, fetch: fetch2, fetchOptions, middleware } = params;
  const headers = { ...params.headers };
  let queryParams = ``;
  let body = void 0;
  if (method === `POST`) {
    body = createRequestBody(query, variables, operationName, fetchOptions.jsonSerializer);
    if (typeof body === `string`) {
      headers[`Content-Type`] = `application/json`;
    }
  } else {
    queryParams = buildRequestConfig({
      query,
      variables,
      operationName,
      jsonSerializer: fetchOptions.jsonSerializer ?? defaultJsonSerializer
    });
  }
  const init = {
    method,
    headers,
    body,
    ...fetchOptions
  };
  let urlResolved = url;
  let initResolved = init;
  if (middleware) {
    const result = await Promise.resolve(middleware({ ...init, url, operationName, variables }));
    const { url: urlNew, ...initNew } = result;
    urlResolved = urlNew;
    initResolved = initNew;
  }
  if (queryParams) {
    urlResolved = `${urlResolved}?${queryParams}`;
  }
  return await fetch2(urlResolved, initResolved);
};
var GraphQLClient = class {
  constructor(url, requestConfig = {}) {
    this.url = url;
    this.requestConfig = requestConfig;
    this.rawRequest = async (...args) => {
      const [queryOrOptions, variables, requestHeaders] = args;
      const rawRequestOptions = parseRawRequestArgs(queryOrOptions, variables, requestHeaders);
      const { headers, fetch: fetch2 = CrossFetch.default, method = `POST`, requestMiddleware, responseMiddleware, ...fetchOptions } = this.requestConfig;
      const { url: url2 } = this;
      if (rawRequestOptions.signal !== void 0) {
        fetchOptions.signal = rawRequestOptions.signal;
      }
      const { operationName } = resolveRequestDocument(rawRequestOptions.query);
      return makeRequest({
        url: url2,
        query: rawRequestOptions.query,
        variables: rawRequestOptions.variables,
        headers: {
          ...resolveHeaders(callOrIdentity(headers)),
          ...resolveHeaders(rawRequestOptions.requestHeaders)
        },
        operationName,
        fetch: fetch2,
        method,
        fetchOptions,
        middleware: requestMiddleware
      }).then((response) => {
        if (responseMiddleware) {
          responseMiddleware(response);
        }
        return response;
      }).catch((error) => {
        if (responseMiddleware) {
          responseMiddleware(error);
        }
        throw error;
      });
    };
  }
  async request(documentOrOptions, ...variablesAndRequestHeaders) {
    const [variables, requestHeaders] = variablesAndRequestHeaders;
    const requestOptions = parseRequestArgs(documentOrOptions, variables, requestHeaders);
    const { headers, fetch: fetch2 = CrossFetch.default, method = `POST`, requestMiddleware, responseMiddleware, ...fetchOptions } = this.requestConfig;
    const { url } = this;
    if (requestOptions.signal !== void 0) {
      fetchOptions.signal = requestOptions.signal;
    }
    const { query, operationName } = resolveRequestDocument(requestOptions.document);
    return makeRequest({
      url,
      query,
      variables: requestOptions.variables,
      headers: {
        ...resolveHeaders(callOrIdentity(headers)),
        ...resolveHeaders(requestOptions.requestHeaders)
      },
      operationName,
      fetch: fetch2,
      method,
      fetchOptions,
      middleware: requestMiddleware
    }).then((response) => {
      if (responseMiddleware) {
        responseMiddleware(response);
      }
      return response.data;
    }).catch((error) => {
      if (responseMiddleware) {
        responseMiddleware(error);
      }
      throw error;
    });
  }
  // prettier-ignore
  batchRequests(documentsOrOptions, requestHeaders) {
    const batchRequestOptions = parseBatchRequestArgs(documentsOrOptions, requestHeaders);
    const { headers, ...fetchOptions } = this.requestConfig;
    if (batchRequestOptions.signal !== void 0) {
      fetchOptions.signal = batchRequestOptions.signal;
    }
    const queries = batchRequestOptions.documents.map(({ document }) => resolveRequestDocument(document).query);
    const variables = batchRequestOptions.documents.map(({ variables: variables2 }) => variables2);
    return makeRequest({
      url: this.url,
      query: queries,
      // @ts-expect-error TODO reconcile batch variables into system.
      variables,
      headers: {
        ...resolveHeaders(callOrIdentity(headers)),
        ...resolveHeaders(batchRequestOptions.requestHeaders)
      },
      operationName: void 0,
      fetch: this.requestConfig.fetch ?? CrossFetch.default,
      method: this.requestConfig.method || `POST`,
      fetchOptions,
      middleware: this.requestConfig.requestMiddleware
    }).then((response) => {
      if (this.requestConfig.responseMiddleware) {
        this.requestConfig.responseMiddleware(response);
      }
      return response.data;
    }).catch((error) => {
      if (this.requestConfig.responseMiddleware) {
        this.requestConfig.responseMiddleware(error);
      }
      throw error;
    });
  }
  setHeaders(headers) {
    this.requestConfig.headers = headers;
    return this;
  }
  /**
   * Attach a header to the client. All subsequent requests will have this header.
   */
  setHeader(key, value) {
    const { headers } = this.requestConfig;
    if (headers) {
      headers[key] = value;
    } else {
      this.requestConfig.headers = { [key]: value };
    }
    return this;
  }
  /**
   * Change the client endpoint. All subsequent requests will send to this endpoint.
   */
  setEndpoint(value) {
    this.url = value;
    return this;
  }
};
var makeRequest = async (params) => {
  const { query, variables, fetchOptions } = params;
  const fetcher = createHttpMethodFetcher(uppercase(params.method ?? `post`));
  const isBatchingQuery = Array.isArray(params.query);
  const response = await fetcher(params);
  const result = await getResult(response, fetchOptions.jsonSerializer ?? defaultJsonSerializer);
  const successfullyReceivedData = Array.isArray(result) ? !result.some(({ data }) => !data) : Boolean(result.data);
  const successfullyPassedErrorPolicy = Array.isArray(result) || !result.errors || Array.isArray(result.errors) && !result.errors.length || fetchOptions.errorPolicy === `all` || fetchOptions.errorPolicy === `ignore`;
  if (response.ok && successfullyPassedErrorPolicy && successfullyReceivedData) {
    const { errors: _, ...rest } = Array.isArray(result) ? result : result;
    const data = fetchOptions.errorPolicy === `ignore` ? rest : result;
    const dataEnvelope = isBatchingQuery ? { data } : data;
    return {
      ...dataEnvelope,
      headers: response.headers,
      status: response.status
    };
  } else {
    const errorResult = typeof result === `string` ? {
      error: result
    } : result;
    throw new ClientError(
      // @ts-expect-error TODO
      { ...errorResult, status: response.status, headers: response.headers },
      { query, variables }
    );
  }
};
var createRequestBody = (query, variables, operationName, jsonSerializer) => {
  const jsonSerializer_ = jsonSerializer ?? defaultJsonSerializer;
  if (!Array.isArray(query)) {
    return jsonSerializer_.stringify({ query, variables, operationName });
  }
  if (typeof variables !== `undefined` && !Array.isArray(variables)) {
    throw new Error(`Cannot create request body with given variable type, array expected`);
  }
  const payload = query.reduce((acc, currentQuery, index) => {
    acc.push({ query: currentQuery, variables: variables ? variables[index] : void 0 });
    return acc;
  }, []);
  return jsonSerializer_.stringify(payload);
};
var getResult = async (response, jsonSerializer) => {
  let contentType;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === `content-type`) {
      contentType = value;
    }
  });
  if (contentType && (contentType.toLowerCase().startsWith(`application/json`) || contentType.toLowerCase().startsWith(`application/graphql+json`) || contentType.toLowerCase().startsWith(`application/graphql-response+json`))) {
    return jsonSerializer.parse(await response.text());
  } else {
    return response.text();
  }
};
var callOrIdentity = (value) => {
  return typeof value === `function` ? value() : value;
};

// static/playground/weaviate-client.web.js
var import_nice_grpc_common = __toESM(require_lib2());
var import_nice_grpc_client_middleware_retry = __toESM(require_lib3());
var import_nice_grpc_web = __toESM(require_lib4());
var qp = Object.create;
var Js = Object.defineProperty;
var Lp = Object.getOwnPropertyDescriptor;
var Jp = Object.getOwnPropertyNames;
var zp = Object.getPrototypeOf;
var $p = Object.prototype.hasOwnProperty;
var Hp = (e24, t) => () => (e24 && (t = e24(e24 = 0)), t);
var re = (e24, t) => () => (t || e24((t = { exports: {} }).exports, t), t.exports);
var Qp = (e24, t, r, a) => {
  if (t && typeof t == "object" || typeof t == "function") for (let i of Jp(t)) !$p.call(e24, i) && i !== r && Js(e24, i, { get: () => t[i], enumerable: !(a = Lp(t, i)) || a.enumerable });
  return e24;
};
var ze = (e24, t, r) => (r = e24 != null ? qp(zp(e24)) : {}, Qp(Js(r, "default", { value: e24, enumerable: true }), e24));
var Hs = re((Ma) => {
  d();
  Ma.byteLength = Yp;
  Ma.toByteArray = Xp;
  Ma.fromByteArray = tg;
  var bt = [], $e = [], Kp = typeof Uint8Array < "u" ? Uint8Array : Array, vo = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (vr = 0, zs = vo.length; vr < zs; ++vr) bt[vr] = vo[vr], $e[vo.charCodeAt(vr)] = vr;
  var vr, zs;
  $e[45] = 62;
  $e[95] = 63;
  function $s(e24) {
    var t = e24.length;
    if (t % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var r = e24.indexOf("=");
    r === -1 && (r = t);
    var a = r === t ? 0 : 4 - r % 4;
    return [r, a];
  }
  function Yp(e24) {
    var t = $s(e24), r = t[0], a = t[1];
    return (r + a) * 3 / 4 - a;
  }
  function Zp(e24, t, r) {
    return (t + r) * 3 / 4 - r;
  }
  function Xp(e24) {
    var t, r = $s(e24), a = r[0], i = r[1], n = new Kp(Zp(e24, a, i)), o = 0, s = i > 0 ? a - 4 : a, u;
    for (u = 0; u < s; u += 4) t = $e[e24.charCodeAt(u)] << 18 | $e[e24.charCodeAt(u + 1)] << 12 | $e[e24.charCodeAt(u + 2)] << 6 | $e[e24.charCodeAt(u + 3)], n[o++] = t >> 16 & 255, n[o++] = t >> 8 & 255, n[o++] = t & 255;
    return i === 2 && (t = $e[e24.charCodeAt(u)] << 2 | $e[e24.charCodeAt(u + 1)] >> 4, n[o++] = t & 255), i === 1 && (t = $e[e24.charCodeAt(u)] << 10 | $e[e24.charCodeAt(u + 1)] << 4 | $e[e24.charCodeAt(u + 2)] >> 2, n[o++] = t >> 8 & 255, n[o++] = t & 255), n;
  }
  function jp(e24) {
    return bt[e24 >> 18 & 63] + bt[e24 >> 12 & 63] + bt[e24 >> 6 & 63] + bt[e24 & 63];
  }
  function eg(e24, t, r) {
    for (var a, i = [], n = t; n < r; n += 3) a = (e24[n] << 16 & 16711680) + (e24[n + 1] << 8 & 65280) + (e24[n + 2] & 255), i.push(jp(a));
    return i.join("");
  }
  function tg(e24) {
    for (var t, r = e24.length, a = r % 3, i = [], n = 16383, o = 0, s = r - a; o < s; o += n) i.push(eg(e24, o, o + n > s ? s : o + n));
    return a === 1 ? (t = e24[r - 1], i.push(bt[t >> 2] + bt[t << 4 & 63] + "==")) : a === 2 && (t = (e24[r - 2] << 8) + e24[r - 1], i.push(bt[t >> 10] + bt[t >> 4 & 63] + bt[t << 2 & 63] + "=")), i.join("");
  }
});
var Qs = re((bo) => {
  d();
  bo.read = function(e24, t, r, a, i) {
    var n, o, s = i * 8 - a - 1, u = (1 << s) - 1, c = u >> 1, f2 = -7, y = r ? i - 1 : 0, P = r ? -1 : 1, V = e24[t + y];
    for (y += P, n = V & (1 << -f2) - 1, V >>= -f2, f2 += s; f2 > 0; n = n * 256 + e24[t + y], y += P, f2 -= 8) ;
    for (o = n & (1 << -f2) - 1, n >>= -f2, f2 += a; f2 > 0; o = o * 256 + e24[t + y], y += P, f2 -= 8) ;
    if (n === 0) n = 1 - c;
    else {
      if (n === u) return o ? NaN : (V ? -1 : 1) * (1 / 0);
      o = o + Math.pow(2, a), n = n - c;
    }
    return (V ? -1 : 1) * o * Math.pow(2, n - a);
  };
  bo.write = function(e24, t, r, a, i, n) {
    var o, s, u, c = n * 8 - i - 1, f2 = (1 << c) - 1, y = f2 >> 1, P = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, V = a ? 0 : n - 1, j = a ? 1 : -1, D = t < 0 || t === 0 && 1 / t < 0 ? 1 : 0;
    for (t = Math.abs(t), isNaN(t) || t === 1 / 0 ? (s = isNaN(t) ? 1 : 0, o = f2) : (o = Math.floor(Math.log(t) / Math.LN2), t * (u = Math.pow(2, -o)) < 1 && (o--, u *= 2), o + y >= 1 ? t += P / u : t += P * Math.pow(2, 1 - y), t * u >= 2 && (o++, u /= 2), o + y >= f2 ? (s = 0, o = f2) : o + y >= 1 ? (s = (t * u - 1) * Math.pow(2, i), o = o + y) : (s = t * Math.pow(2, y - 1) * Math.pow(2, i), o = 0)); i >= 8; e24[r + V] = s & 255, V += j, s /= 256, i -= 8) ;
    for (o = o << i | s, c += i; c > 0; e24[r + V] = o & 255, V += j, o /= 256, c -= 8) ;
    e24[r + V - j] |= D * 128;
  };
});
var lu = re((Kr) => {
  d();
  var xo = Hs(), Hr = Qs(), Ks = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  Kr.Buffer = h;
  Kr.SlowBuffer = sg;
  Kr.INSPECT_MAX_BYTES = 50;
  var Ea = 2147483647;
  Kr.kMaxLength = Ea;
  h.TYPED_ARRAY_SUPPORT = rg();
  !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function rg() {
    try {
      let e24 = new Uint8Array(1), t = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(e24, t), e24.foo() === 42;
    } catch {
      return false;
    }
  }
  Object.defineProperty(h.prototype, "parent", { enumerable: true, get: function() {
    if (h.isBuffer(this)) return this.buffer;
  } });
  Object.defineProperty(h.prototype, "offset", { enumerable: true, get: function() {
    if (h.isBuffer(this)) return this.byteOffset;
  } });
  function It(e24) {
    if (e24 > Ea) throw new RangeError('The value "' + e24 + '" is invalid for option "size"');
    let t = new Uint8Array(e24);
    return Object.setPrototypeOf(t, h.prototype), t;
  }
  function h(e24, t, r) {
    if (typeof e24 == "number") {
      if (typeof t == "string") throw new TypeError('The "string" argument must be of type string. Received type number');
      return Ao(e24);
    }
    return js(e24, t, r);
  }
  h.poolSize = 8192;
  function js(e24, t, r) {
    if (typeof e24 == "string") return ig(e24, t);
    if (ArrayBuffer.isView(e24)) return ag(e24);
    if (e24 == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e24);
    if (xt(e24, ArrayBuffer) || e24 && xt(e24.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (xt(e24, SharedArrayBuffer) || e24 && xt(e24.buffer, SharedArrayBuffer))) return Po(e24, t, r);
    if (typeof e24 == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    let a = e24.valueOf && e24.valueOf();
    if (a != null && a !== e24) return h.from(a, t, r);
    let i = og(e24);
    if (i) return i;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof e24[Symbol.toPrimitive] == "function") return h.from(e24[Symbol.toPrimitive]("string"), t, r);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e24);
  }
  h.from = function(e24, t, r) {
    return js(e24, t, r);
  };
  Object.setPrototypeOf(h.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(h, Uint8Array);
  function eu(e24) {
    if (typeof e24 != "number") throw new TypeError('"size" argument must be of type number');
    if (e24 < 0) throw new RangeError('The value "' + e24 + '" is invalid for option "size"');
  }
  function ng(e24, t, r) {
    return eu(e24), e24 <= 0 ? It(e24) : t !== void 0 ? typeof r == "string" ? It(e24).fill(t, r) : It(e24).fill(t) : It(e24);
  }
  h.alloc = function(e24, t, r) {
    return ng(e24, t, r);
  };
  function Ao(e24) {
    return eu(e24), It(e24 < 0 ? 0 : No(e24) | 0);
  }
  h.allocUnsafe = function(e24) {
    return Ao(e24);
  };
  h.allocUnsafeSlow = function(e24) {
    return Ao(e24);
  };
  function ig(e24, t) {
    if ((typeof t != "string" || t === "") && (t = "utf8"), !h.isEncoding(t)) throw new TypeError("Unknown encoding: " + t);
    let r = tu(e24, t) | 0, a = It(r), i = a.write(e24, t);
    return i !== r && (a = a.slice(0, i)), a;
  }
  function Co(e24) {
    let t = e24.length < 0 ? 0 : No(e24.length) | 0, r = It(t);
    for (let a = 0; a < t; a += 1) r[a] = e24[a] & 255;
    return r;
  }
  function ag(e24) {
    if (xt(e24, Uint8Array)) {
      let t = new Uint8Array(e24);
      return Po(t.buffer, t.byteOffset, t.byteLength);
    }
    return Co(e24);
  }
  function Po(e24, t, r) {
    if (t < 0 || e24.byteLength < t) throw new RangeError('"offset" is outside of buffer bounds');
    if (e24.byteLength < t + (r || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let a;
    return t === void 0 && r === void 0 ? a = new Uint8Array(e24) : r === void 0 ? a = new Uint8Array(e24, t) : a = new Uint8Array(e24, t, r), Object.setPrototypeOf(a, h.prototype), a;
  }
  function og(e24) {
    if (h.isBuffer(e24)) {
      let t = No(e24.length) | 0, r = It(t);
      return r.length === 0 || e24.copy(r, 0, 0, t), r;
    }
    if (e24.length !== void 0) return typeof e24.length != "number" || Oo(e24.length) ? It(0) : Co(e24);
    if (e24.type === "Buffer" && Array.isArray(e24.data)) return Co(e24.data);
  }
  function No(e24) {
    if (e24 >= Ea) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + Ea.toString(16) + " bytes");
    return e24 | 0;
  }
  function sg(e24) {
    return +e24 != e24 && (e24 = 0), h.alloc(+e24);
  }
  h.isBuffer = function(t) {
    return t != null && t._isBuffer === true && t !== h.prototype;
  };
  h.compare = function(t, r) {
    if (xt(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), xt(r, Uint8Array) && (r = h.from(r, r.offset, r.byteLength)), !h.isBuffer(t) || !h.isBuffer(r)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (t === r) return 0;
    let a = t.length, i = r.length;
    for (let n = 0, o = Math.min(a, i); n < o; ++n) if (t[n] !== r[n]) {
      a = t[n], i = r[n];
      break;
    }
    return a < i ? -1 : i < a ? 1 : 0;
  };
  h.isEncoding = function(t) {
    switch (String(t).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  };
  h.concat = function(t, r) {
    if (!Array.isArray(t)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (t.length === 0) return h.alloc(0);
    let a;
    if (r === void 0) for (r = 0, a = 0; a < t.length; ++a) r += t[a].length;
    let i = h.allocUnsafe(r), n = 0;
    for (a = 0; a < t.length; ++a) {
      let o = t[a];
      if (xt(o, Uint8Array)) n + o.length > i.length ? (h.isBuffer(o) || (o = h.from(o)), o.copy(i, n)) : Uint8Array.prototype.set.call(i, o, n);
      else if (h.isBuffer(o)) o.copy(i, n);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      n += o.length;
    }
    return i;
  };
  function tu(e24, t) {
    if (h.isBuffer(e24)) return e24.length;
    if (ArrayBuffer.isView(e24) || xt(e24, ArrayBuffer)) return e24.byteLength;
    if (typeof e24 != "string") throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e24);
    let r = e24.length, a = arguments.length > 2 && arguments[2] === true;
    if (!a && r === 0) return 0;
    let i = false;
    for (; ; ) switch (t) {
      case "ascii":
      case "latin1":
      case "binary":
        return r;
      case "utf8":
      case "utf-8":
        return Ro(e24).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return r * 2;
      case "hex":
        return r >>> 1;
      case "base64":
        return cu(e24).length;
      default:
        if (i) return a ? -1 : Ro(e24).length;
        t = ("" + t).toLowerCase(), i = true;
    }
  }
  h.byteLength = tu;
  function ug(e24, t, r) {
    let a = false;
    if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((r === void 0 || r > this.length) && (r = this.length), r <= 0) || (r >>>= 0, t >>>= 0, r <= t)) return "";
    for (e24 || (e24 = "utf8"); ; ) switch (e24) {
      case "hex":
        return Tg(this, t, r);
      case "utf8":
      case "utf-8":
        return nu(this, t, r);
      case "ascii":
        return hg(this, t, r);
      case "latin1":
      case "binary":
        return yg(this, t, r);
      case "base64":
        return gg(this, t, r);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return vg(this, t, r);
      default:
        if (a) throw new TypeError("Unknown encoding: " + e24);
        e24 = (e24 + "").toLowerCase(), a = true;
    }
  }
  h.prototype._isBuffer = true;
  function br(e24, t, r) {
    let a = e24[t];
    e24[t] = e24[r], e24[r] = a;
  }
  h.prototype.swap16 = function() {
    let t = this.length;
    if (t % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let r = 0; r < t; r += 2) br(this, r, r + 1);
    return this;
  };
  h.prototype.swap32 = function() {
    let t = this.length;
    if (t % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let r = 0; r < t; r += 4) br(this, r, r + 3), br(this, r + 1, r + 2);
    return this;
  };
  h.prototype.swap64 = function() {
    let t = this.length;
    if (t % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let r = 0; r < t; r += 8) br(this, r, r + 7), br(this, r + 1, r + 6), br(this, r + 2, r + 5), br(this, r + 3, r + 4);
    return this;
  };
  h.prototype.toString = function() {
    let t = this.length;
    return t === 0 ? "" : arguments.length === 0 ? nu(this, 0, t) : ug.apply(this, arguments);
  };
  h.prototype.toLocaleString = h.prototype.toString;
  h.prototype.equals = function(t) {
    if (!h.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
    return this === t ? true : h.compare(this, t) === 0;
  };
  h.prototype.inspect = function() {
    let t = "", r = Kr.INSPECT_MAX_BYTES;
    return t = this.toString("hex", 0, r).replace(/(.{2})/g, "$1 ").trim(), this.length > r && (t += " ... "), "<Buffer " + t + ">";
  };
  Ks && (h.prototype[Ks] = h.prototype.inspect);
  h.prototype.compare = function(t, r, a, i, n) {
    if (xt(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(t)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof t);
    if (r === void 0 && (r = 0), a === void 0 && (a = t ? t.length : 0), i === void 0 && (i = 0), n === void 0 && (n = this.length), r < 0 || a > t.length || i < 0 || n > this.length) throw new RangeError("out of range index");
    if (i >= n && r >= a) return 0;
    if (i >= n) return -1;
    if (r >= a) return 1;
    if (r >>>= 0, a >>>= 0, i >>>= 0, n >>>= 0, this === t) return 0;
    let o = n - i, s = a - r, u = Math.min(o, s), c = this.slice(i, n), f2 = t.slice(r, a);
    for (let y = 0; y < u; ++y) if (c[y] !== f2[y]) {
      o = c[y], s = f2[y];
      break;
    }
    return o < s ? -1 : s < o ? 1 : 0;
  };
  function ru(e24, t, r, a, i) {
    if (e24.length === 0) return -1;
    if (typeof r == "string" ? (a = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), r = +r, Oo(r) && (r = i ? 0 : e24.length - 1), r < 0 && (r = e24.length + r), r >= e24.length) {
      if (i) return -1;
      r = e24.length - 1;
    } else if (r < 0) if (i) r = 0;
    else return -1;
    if (typeof t == "string" && (t = h.from(t, a)), h.isBuffer(t)) return t.length === 0 ? -1 : Ys(e24, t, r, a, i);
    if (typeof t == "number") return t = t & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(e24, t, r) : Uint8Array.prototype.lastIndexOf.call(e24, t, r) : Ys(e24, [t], r, a, i);
    throw new TypeError("val must be string, number or Buffer");
  }
  function Ys(e24, t, r, a, i) {
    let n = 1, o = e24.length, s = t.length;
    if (a !== void 0 && (a = String(a).toLowerCase(), a === "ucs2" || a === "ucs-2" || a === "utf16le" || a === "utf-16le")) {
      if (e24.length < 2 || t.length < 2) return -1;
      n = 2, o /= 2, s /= 2, r /= 2;
    }
    function u(f2, y) {
      return n === 1 ? f2[y] : f2.readUInt16BE(y * n);
    }
    let c;
    if (i) {
      let f2 = -1;
      for (c = r; c < o; c++) if (u(e24, c) === u(t, f2 === -1 ? 0 : c - f2)) {
        if (f2 === -1 && (f2 = c), c - f2 + 1 === s) return f2 * n;
      } else f2 !== -1 && (c -= c - f2), f2 = -1;
    } else for (r + s > o && (r = o - s), c = r; c >= 0; c--) {
      let f2 = true;
      for (let y = 0; y < s; y++) if (u(e24, c + y) !== u(t, y)) {
        f2 = false;
        break;
      }
      if (f2) return c;
    }
    return -1;
  }
  h.prototype.includes = function(t, r, a) {
    return this.indexOf(t, r, a) !== -1;
  };
  h.prototype.indexOf = function(t, r, a) {
    return ru(this, t, r, a, true);
  };
  h.prototype.lastIndexOf = function(t, r, a) {
    return ru(this, t, r, a, false);
  };
  function dg(e24, t, r, a) {
    r = Number(r) || 0;
    let i = e24.length - r;
    a ? (a = Number(a), a > i && (a = i)) : a = i;
    let n = t.length;
    a > n / 2 && (a = n / 2);
    let o;
    for (o = 0; o < a; ++o) {
      let s = parseInt(t.substr(o * 2, 2), 16);
      if (Oo(s)) return o;
      e24[r + o] = s;
    }
    return o;
  }
  function cg(e24, t, r, a) {
    return Ua(Ro(t, e24.length - r), e24, r, a);
  }
  function lg(e24, t, r, a) {
    return Ua(Pg(t), e24, r, a);
  }
  function fg(e24, t, r, a) {
    return Ua(cu(t), e24, r, a);
  }
  function pg(e24, t, r, a) {
    return Ua(Rg(t, e24.length - r), e24, r, a);
  }
  h.prototype.write = function(t, r, a, i) {
    if (r === void 0) i = "utf8", a = this.length, r = 0;
    else if (a === void 0 && typeof r == "string") i = r, a = this.length, r = 0;
    else if (isFinite(r)) r = r >>> 0, isFinite(a) ? (a = a >>> 0, i === void 0 && (i = "utf8")) : (i = a, a = void 0);
    else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let n = this.length - r;
    if ((a === void 0 || a > n) && (a = n), t.length > 0 && (a < 0 || r < 0) || r > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    i || (i = "utf8");
    let o = false;
    for (; ; ) switch (i) {
      case "hex":
        return dg(this, t, r, a);
      case "utf8":
      case "utf-8":
        return cg(this, t, r, a);
      case "ascii":
      case "latin1":
      case "binary":
        return lg(this, t, r, a);
      case "base64":
        return fg(this, t, r, a);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return pg(this, t, r, a);
      default:
        if (o) throw new TypeError("Unknown encoding: " + i);
        i = ("" + i).toLowerCase(), o = true;
    }
  };
  h.prototype.toJSON = function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  };
  function gg(e24, t, r) {
    return t === 0 && r === e24.length ? xo.fromByteArray(e24) : xo.fromByteArray(e24.slice(t, r));
  }
  function nu(e24, t, r) {
    r = Math.min(e24.length, r);
    let a = [], i = t;
    for (; i < r; ) {
      let n = e24[i], o = null, s = n > 239 ? 4 : n > 223 ? 3 : n > 191 ? 2 : 1;
      if (i + s <= r) {
        let u, c, f2, y;
        switch (s) {
          case 1:
            n < 128 && (o = n);
            break;
          case 2:
            u = e24[i + 1], (u & 192) === 128 && (y = (n & 31) << 6 | u & 63, y > 127 && (o = y));
            break;
          case 3:
            u = e24[i + 1], c = e24[i + 2], (u & 192) === 128 && (c & 192) === 128 && (y = (n & 15) << 12 | (u & 63) << 6 | c & 63, y > 2047 && (y < 55296 || y > 57343) && (o = y));
            break;
          case 4:
            u = e24[i + 1], c = e24[i + 2], f2 = e24[i + 3], (u & 192) === 128 && (c & 192) === 128 && (f2 & 192) === 128 && (y = (n & 15) << 18 | (u & 63) << 12 | (c & 63) << 6 | f2 & 63, y > 65535 && y < 1114112 && (o = y));
        }
      }
      o === null ? (o = 65533, s = 1) : o > 65535 && (o -= 65536, a.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), a.push(o), i += s;
    }
    return mg(a);
  }
  var Zs = 4096;
  function mg(e24) {
    let t = e24.length;
    if (t <= Zs) return String.fromCharCode.apply(String, e24);
    let r = "", a = 0;
    for (; a < t; ) r += String.fromCharCode.apply(String, e24.slice(a, a += Zs));
    return r;
  }
  function hg(e24, t, r) {
    let a = "";
    r = Math.min(e24.length, r);
    for (let i = t; i < r; ++i) a += String.fromCharCode(e24[i] & 127);
    return a;
  }
  function yg(e24, t, r) {
    let a = "";
    r = Math.min(e24.length, r);
    for (let i = t; i < r; ++i) a += String.fromCharCode(e24[i]);
    return a;
  }
  function Tg(e24, t, r) {
    let a = e24.length;
    (!t || t < 0) && (t = 0), (!r || r < 0 || r > a) && (r = a);
    let i = "";
    for (let n = t; n < r; ++n) i += Ag[e24[n]];
    return i;
  }
  function vg(e24, t, r) {
    let a = e24.slice(t, r), i = "";
    for (let n = 0; n < a.length - 1; n += 2) i += String.fromCharCode(a[n] + a[n + 1] * 256);
    return i;
  }
  h.prototype.slice = function(t, r) {
    let a = this.length;
    t = ~~t, r = r === void 0 ? a : ~~r, t < 0 ? (t += a, t < 0 && (t = 0)) : t > a && (t = a), r < 0 ? (r += a, r < 0 && (r = 0)) : r > a && (r = a), r < t && (r = t);
    let i = this.subarray(t, r);
    return Object.setPrototypeOf(i, h.prototype), i;
  };
  function de(e24, t, r) {
    if (e24 % 1 !== 0 || e24 < 0) throw new RangeError("offset is not uint");
    if (e24 + t > r) throw new RangeError("Trying to access beyond buffer length");
  }
  h.prototype.readUintLE = h.prototype.readUIntLE = function(t, r, a) {
    t = t >>> 0, r = r >>> 0, a || de(t, r, this.length);
    let i = this[t], n = 1, o = 0;
    for (; ++o < r && (n *= 256); ) i += this[t + o] * n;
    return i;
  };
  h.prototype.readUintBE = h.prototype.readUIntBE = function(t, r, a) {
    t = t >>> 0, r = r >>> 0, a || de(t, r, this.length);
    let i = this[t + --r], n = 1;
    for (; r > 0 && (n *= 256); ) i += this[t + --r] * n;
    return i;
  };
  h.prototype.readUint8 = h.prototype.readUInt8 = function(t, r) {
    return t = t >>> 0, r || de(t, 1, this.length), this[t];
  };
  h.prototype.readUint16LE = h.prototype.readUInt16LE = function(t, r) {
    return t = t >>> 0, r || de(t, 2, this.length), this[t] | this[t + 1] << 8;
  };
  h.prototype.readUint16BE = h.prototype.readUInt16BE = function(t, r) {
    return t = t >>> 0, r || de(t, 2, this.length), this[t] << 8 | this[t + 1];
  };
  h.prototype.readUint32LE = h.prototype.readUInt32LE = function(t, r) {
    return t = t >>> 0, r || de(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + this[t + 3] * 16777216;
  };
  h.prototype.readUint32BE = h.prototype.readUInt32BE = function(t, r) {
    return t = t >>> 0, r || de(t, 4, this.length), this[t] * 16777216 + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
  };
  h.prototype.readBigUInt64LE = Jt(function(t) {
    t = t >>> 0, Qr(t, "offset");
    let r = this[t], a = this[t + 7];
    (r === void 0 || a === void 0) && oa(t, this.length - 8);
    let i = r + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24, n = this[++t] + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + a * 2 ** 24;
    return BigInt(i) + (BigInt(n) << BigInt(32));
  });
  h.prototype.readBigUInt64BE = Jt(function(t) {
    t = t >>> 0, Qr(t, "offset");
    let r = this[t], a = this[t + 7];
    (r === void 0 || a === void 0) && oa(t, this.length - 8);
    let i = r * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t], n = this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + a;
    return (BigInt(i) << BigInt(32)) + BigInt(n);
  });
  h.prototype.readIntLE = function(t, r, a) {
    t = t >>> 0, r = r >>> 0, a || de(t, r, this.length);
    let i = this[t], n = 1, o = 0;
    for (; ++o < r && (n *= 256); ) i += this[t + o] * n;
    return n *= 128, i >= n && (i -= Math.pow(2, 8 * r)), i;
  };
  h.prototype.readIntBE = function(t, r, a) {
    t = t >>> 0, r = r >>> 0, a || de(t, r, this.length);
    let i = r, n = 1, o = this[t + --i];
    for (; i > 0 && (n *= 256); ) o += this[t + --i] * n;
    return n *= 128, o >= n && (o -= Math.pow(2, 8 * r)), o;
  };
  h.prototype.readInt8 = function(t, r) {
    return t = t >>> 0, r || de(t, 1, this.length), this[t] & 128 ? (255 - this[t] + 1) * -1 : this[t];
  };
  h.prototype.readInt16LE = function(t, r) {
    t = t >>> 0, r || de(t, 2, this.length);
    let a = this[t] | this[t + 1] << 8;
    return a & 32768 ? a | 4294901760 : a;
  };
  h.prototype.readInt16BE = function(t, r) {
    t = t >>> 0, r || de(t, 2, this.length);
    let a = this[t + 1] | this[t] << 8;
    return a & 32768 ? a | 4294901760 : a;
  };
  h.prototype.readInt32LE = function(t, r) {
    return t = t >>> 0, r || de(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
  };
  h.prototype.readInt32BE = function(t, r) {
    return t = t >>> 0, r || de(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
  };
  h.prototype.readBigInt64LE = Jt(function(t) {
    t = t >>> 0, Qr(t, "offset");
    let r = this[t], a = this[t + 7];
    (r === void 0 || a === void 0) && oa(t, this.length - 8);
    let i = this[t + 4] + this[t + 5] * 2 ** 8 + this[t + 6] * 2 ** 16 + (a << 24);
    return (BigInt(i) << BigInt(32)) + BigInt(r + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24);
  });
  h.prototype.readBigInt64BE = Jt(function(t) {
    t = t >>> 0, Qr(t, "offset");
    let r = this[t], a = this[t + 7];
    (r === void 0 || a === void 0) && oa(t, this.length - 8);
    let i = (r << 24) + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t];
    return (BigInt(i) << BigInt(32)) + BigInt(this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + a);
  });
  h.prototype.readFloatLE = function(t, r) {
    return t = t >>> 0, r || de(t, 4, this.length), Hr.read(this, t, true, 23, 4);
  };
  h.prototype.readFloatBE = function(t, r) {
    return t = t >>> 0, r || de(t, 4, this.length), Hr.read(this, t, false, 23, 4);
  };
  h.prototype.readDoubleLE = function(t, r) {
    return t = t >>> 0, r || de(t, 8, this.length), Hr.read(this, t, true, 52, 8);
  };
  h.prototype.readDoubleBE = function(t, r) {
    return t = t >>> 0, r || de(t, 8, this.length), Hr.read(this, t, false, 52, 8);
  };
  function Ie(e24, t, r, a, i, n) {
    if (!h.isBuffer(e24)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (t > i || t < n) throw new RangeError('"value" argument is out of bounds');
    if (r + a > e24.length) throw new RangeError("Index out of range");
  }
  h.prototype.writeUintLE = h.prototype.writeUIntLE = function(t, r, a, i) {
    if (t = +t, r = r >>> 0, a = a >>> 0, !i) {
      let s = Math.pow(2, 8 * a) - 1;
      Ie(this, t, r, a, s, 0);
    }
    let n = 1, o = 0;
    for (this[r] = t & 255; ++o < a && (n *= 256); ) this[r + o] = t / n & 255;
    return r + a;
  };
  h.prototype.writeUintBE = h.prototype.writeUIntBE = function(t, r, a, i) {
    if (t = +t, r = r >>> 0, a = a >>> 0, !i) {
      let s = Math.pow(2, 8 * a) - 1;
      Ie(this, t, r, a, s, 0);
    }
    let n = a - 1, o = 1;
    for (this[r + n] = t & 255; --n >= 0 && (o *= 256); ) this[r + n] = t / o & 255;
    return r + a;
  };
  h.prototype.writeUint8 = h.prototype.writeUInt8 = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 1, 255, 0), this[r] = t & 255, r + 1;
  };
  h.prototype.writeUint16LE = h.prototype.writeUInt16LE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 2, 65535, 0), this[r] = t & 255, this[r + 1] = t >>> 8, r + 2;
  };
  h.prototype.writeUint16BE = h.prototype.writeUInt16BE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 2, 65535, 0), this[r] = t >>> 8, this[r + 1] = t & 255, r + 2;
  };
  h.prototype.writeUint32LE = h.prototype.writeUInt32LE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 4, 4294967295, 0), this[r + 3] = t >>> 24, this[r + 2] = t >>> 16, this[r + 1] = t >>> 8, this[r] = t & 255, r + 4;
  };
  h.prototype.writeUint32BE = h.prototype.writeUInt32BE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 4, 4294967295, 0), this[r] = t >>> 24, this[r + 1] = t >>> 16, this[r + 2] = t >>> 8, this[r + 3] = t & 255, r + 4;
  };
  function iu(e24, t, r, a, i) {
    du(t, a, i, e24, r, 7);
    let n = Number(t & BigInt(4294967295));
    e24[r++] = n, n = n >> 8, e24[r++] = n, n = n >> 8, e24[r++] = n, n = n >> 8, e24[r++] = n;
    let o = Number(t >> BigInt(32) & BigInt(4294967295));
    return e24[r++] = o, o = o >> 8, e24[r++] = o, o = o >> 8, e24[r++] = o, o = o >> 8, e24[r++] = o, r;
  }
  function au(e24, t, r, a, i) {
    du(t, a, i, e24, r, 7);
    let n = Number(t & BigInt(4294967295));
    e24[r + 7] = n, n = n >> 8, e24[r + 6] = n, n = n >> 8, e24[r + 5] = n, n = n >> 8, e24[r + 4] = n;
    let o = Number(t >> BigInt(32) & BigInt(4294967295));
    return e24[r + 3] = o, o = o >> 8, e24[r + 2] = o, o = o >> 8, e24[r + 1] = o, o = o >> 8, e24[r] = o, r + 8;
  }
  h.prototype.writeBigUInt64LE = Jt(function(t, r = 0) {
    return iu(this, t, r, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  h.prototype.writeBigUInt64BE = Jt(function(t, r = 0) {
    return au(this, t, r, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  h.prototype.writeIntLE = function(t, r, a, i) {
    if (t = +t, r = r >>> 0, !i) {
      let u = Math.pow(2, 8 * a - 1);
      Ie(this, t, r, a, u - 1, -u);
    }
    let n = 0, o = 1, s = 0;
    for (this[r] = t & 255; ++n < a && (o *= 256); ) t < 0 && s === 0 && this[r + n - 1] !== 0 && (s = 1), this[r + n] = (t / o >> 0) - s & 255;
    return r + a;
  };
  h.prototype.writeIntBE = function(t, r, a, i) {
    if (t = +t, r = r >>> 0, !i) {
      let u = Math.pow(2, 8 * a - 1);
      Ie(this, t, r, a, u - 1, -u);
    }
    let n = a - 1, o = 1, s = 0;
    for (this[r + n] = t & 255; --n >= 0 && (o *= 256); ) t < 0 && s === 0 && this[r + n + 1] !== 0 && (s = 1), this[r + n] = (t / o >> 0) - s & 255;
    return r + a;
  };
  h.prototype.writeInt8 = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 1, 127, -128), t < 0 && (t = 255 + t + 1), this[r] = t & 255, r + 1;
  };
  h.prototype.writeInt16LE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 2, 32767, -32768), this[r] = t & 255, this[r + 1] = t >>> 8, r + 2;
  };
  h.prototype.writeInt16BE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 2, 32767, -32768), this[r] = t >>> 8, this[r + 1] = t & 255, r + 2;
  };
  h.prototype.writeInt32LE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 4, 2147483647, -2147483648), this[r] = t & 255, this[r + 1] = t >>> 8, this[r + 2] = t >>> 16, this[r + 3] = t >>> 24, r + 4;
  };
  h.prototype.writeInt32BE = function(t, r, a) {
    return t = +t, r = r >>> 0, a || Ie(this, t, r, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), this[r] = t >>> 24, this[r + 1] = t >>> 16, this[r + 2] = t >>> 8, this[r + 3] = t & 255, r + 4;
  };
  h.prototype.writeBigInt64LE = Jt(function(t, r = 0) {
    return iu(this, t, r, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  h.prototype.writeBigInt64BE = Jt(function(t, r = 0) {
    return au(this, t, r, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function ou(e24, t, r, a, i, n) {
    if (r + a > e24.length) throw new RangeError("Index out of range");
    if (r < 0) throw new RangeError("Index out of range");
  }
  function su(e24, t, r, a, i) {
    return t = +t, r = r >>> 0, i || ou(e24, t, r, 4), Hr.write(e24, t, r, a, 23, 4), r + 4;
  }
  h.prototype.writeFloatLE = function(t, r, a) {
    return su(this, t, r, true, a);
  };
  h.prototype.writeFloatBE = function(t, r, a) {
    return su(this, t, r, false, a);
  };
  function uu(e24, t, r, a, i) {
    return t = +t, r = r >>> 0, i || ou(e24, t, r, 8), Hr.write(e24, t, r, a, 52, 8), r + 8;
  }
  h.prototype.writeDoubleLE = function(t, r, a) {
    return uu(this, t, r, true, a);
  };
  h.prototype.writeDoubleBE = function(t, r, a) {
    return uu(this, t, r, false, a);
  };
  h.prototype.copy = function(t, r, a, i) {
    if (!h.isBuffer(t)) throw new TypeError("argument should be a Buffer");
    if (a || (a = 0), !i && i !== 0 && (i = this.length), r >= t.length && (r = t.length), r || (r = 0), i > 0 && i < a && (i = a), i === a || t.length === 0 || this.length === 0) return 0;
    if (r < 0) throw new RangeError("targetStart out of bounds");
    if (a < 0 || a >= this.length) throw new RangeError("Index out of range");
    if (i < 0) throw new RangeError("sourceEnd out of bounds");
    i > this.length && (i = this.length), t.length - r < i - a && (i = t.length - r + a);
    let n = i - a;
    return this === t && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(r, a, i) : Uint8Array.prototype.set.call(t, this.subarray(a, i), r), n;
  };
  h.prototype.fill = function(t, r, a, i) {
    if (typeof t == "string") {
      if (typeof r == "string" ? (i = r, r = 0, a = this.length) : typeof a == "string" && (i = a, a = this.length), i !== void 0 && typeof i != "string") throw new TypeError("encoding must be a string");
      if (typeof i == "string" && !h.isEncoding(i)) throw new TypeError("Unknown encoding: " + i);
      if (t.length === 1) {
        let o = t.charCodeAt(0);
        (i === "utf8" && o < 128 || i === "latin1") && (t = o);
      }
    } else typeof t == "number" ? t = t & 255 : typeof t == "boolean" && (t = Number(t));
    if (r < 0 || this.length < r || this.length < a) throw new RangeError("Out of range index");
    if (a <= r) return this;
    r = r >>> 0, a = a === void 0 ? this.length : a >>> 0, t || (t = 0);
    let n;
    if (typeof t == "number") for (n = r; n < a; ++n) this[n] = t;
    else {
      let o = h.isBuffer(t) ? t : h.from(t, i), s = o.length;
      if (s === 0) throw new TypeError('The value "' + t + '" is invalid for argument "value"');
      for (n = 0; n < a - r; ++n) this[n + r] = o[n % s];
    }
    return this;
  };
  var $r = {};
  function Vo(e24, t, r) {
    $r[e24] = class extends r {
      constructor() {
        super(), Object.defineProperty(this, "message", { value: t.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${e24}]`, this.stack, delete this.name;
      }
      get code() {
        return e24;
      }
      set code(i) {
        Object.defineProperty(this, "code", { configurable: true, enumerable: true, value: i, writable: true });
      }
      toString() {
        return `${this.name} [${e24}]: ${this.message}`;
      }
    };
  }
  Vo("ERR_BUFFER_OUT_OF_BOUNDS", function(e24) {
    return e24 ? `${e24} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Vo("ERR_INVALID_ARG_TYPE", function(e24, t) {
    return `The "${e24}" argument must be of type number. Received type ${typeof t}`;
  }, TypeError);
  Vo("ERR_OUT_OF_RANGE", function(e24, t, r) {
    let a = `The value of "${e24}" is out of range.`, i = r;
    return Number.isInteger(r) && Math.abs(r) > 2 ** 32 ? i = Xs(String(r)) : typeof r == "bigint" && (i = String(r), (r > BigInt(2) ** BigInt(32) || r < -(BigInt(2) ** BigInt(32))) && (i = Xs(i)), i += "n"), a += ` It must be ${t}. Received ${i}`, a;
  }, RangeError);
  function Xs(e24) {
    let t = "", r = e24.length, a = e24[0] === "-" ? 1 : 0;
    for (; r >= a + 4; r -= 3) t = `_${e24.slice(r - 3, r)}${t}`;
    return `${e24.slice(0, r)}${t}`;
  }
  function bg(e24, t, r) {
    Qr(t, "offset"), (e24[t] === void 0 || e24[t + r] === void 0) && oa(t, e24.length - (r + 1));
  }
  function du(e24, t, r, a, i, n) {
    if (e24 > r || e24 < t) {
      let o = typeof t == "bigint" ? "n" : "", s;
      throw t === 0 || t === BigInt(0) ? s = `>= 0${o} and < 2${o} ** ${(n + 1) * 8}${o}` : s = `>= -(2${o} ** ${(n + 1) * 8 - 1}${o}) and < 2 ** ${(n + 1) * 8 - 1}${o}`, new $r.ERR_OUT_OF_RANGE("value", s, e24);
    }
    bg(a, i, n);
  }
  function Qr(e24, t) {
    if (typeof e24 != "number") throw new $r.ERR_INVALID_ARG_TYPE(t, "number", e24);
  }
  function oa(e24, t, r) {
    throw Math.floor(e24) !== e24 ? (Qr(e24, r), new $r.ERR_OUT_OF_RANGE("offset", "an integer", e24)) : t < 0 ? new $r.ERR_BUFFER_OUT_OF_BOUNDS() : new $r.ERR_OUT_OF_RANGE("offset", `>= ${0} and <= ${t}`, e24);
  }
  var xg = /[^+/0-9A-Za-z-_]/g;
  function Cg(e24) {
    if (e24 = e24.split("=")[0], e24 = e24.trim().replace(xg, ""), e24.length < 2) return "";
    for (; e24.length % 4 !== 0; ) e24 = e24 + "=";
    return e24;
  }
  function Ro(e24, t) {
    t = t || 1 / 0;
    let r, a = e24.length, i = null, n = [];
    for (let o = 0; o < a; ++o) {
      if (r = e24.charCodeAt(o), r > 55295 && r < 57344) {
        if (!i) {
          if (r > 56319) {
            (t -= 3) > -1 && n.push(239, 191, 189);
            continue;
          } else if (o + 1 === a) {
            (t -= 3) > -1 && n.push(239, 191, 189);
            continue;
          }
          i = r;
          continue;
        }
        if (r < 56320) {
          (t -= 3) > -1 && n.push(239, 191, 189), i = r;
          continue;
        }
        r = (i - 55296 << 10 | r - 56320) + 65536;
      } else i && (t -= 3) > -1 && n.push(239, 191, 189);
      if (i = null, r < 128) {
        if ((t -= 1) < 0) break;
        n.push(r);
      } else if (r < 2048) {
        if ((t -= 2) < 0) break;
        n.push(r >> 6 | 192, r & 63 | 128);
      } else if (r < 65536) {
        if ((t -= 3) < 0) break;
        n.push(r >> 12 | 224, r >> 6 & 63 | 128, r & 63 | 128);
      } else if (r < 1114112) {
        if ((t -= 4) < 0) break;
        n.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, r & 63 | 128);
      } else throw new Error("Invalid code point");
    }
    return n;
  }
  function Pg(e24) {
    let t = [];
    for (let r = 0; r < e24.length; ++r) t.push(e24.charCodeAt(r) & 255);
    return t;
  }
  function Rg(e24, t) {
    let r, a, i, n = [];
    for (let o = 0; o < e24.length && !((t -= 2) < 0); ++o) r = e24.charCodeAt(o), a = r >> 8, i = r % 256, n.push(i), n.push(a);
    return n;
  }
  function cu(e24) {
    return xo.toByteArray(Cg(e24));
  }
  function Ua(e24, t, r, a) {
    let i;
    for (i = 0; i < a && !(i + r >= t.length || i >= e24.length); ++i) t[i + r] = e24[i];
    return i;
  }
  function xt(e24, t) {
    return e24 instanceof t || e24 != null && e24.constructor != null && e24.constructor.name != null && e24.constructor.name === t.name;
  }
  function Oo(e24) {
    return e24 !== e24;
  }
  var Ag = function() {
    let e24 = "0123456789abcdef", t = new Array(256);
    for (let r = 0; r < 16; ++r) {
      let a = r * 16;
      for (let i = 0; i < 16; ++i) t[a + i] = e24[r] + e24[i];
    }
    return t;
  }();
  function Jt(e24) {
    return typeof BigInt > "u" ? Ng : e24;
  }
  function Ng() {
    throw new Error("BigInt not supported");
  }
});
var p;
var d = Hp(() => {
  p = ze(lu());
});
var Au = re((Nv, Ru) => {
  d();
  Ru.exports = Ug;
  function Ug(e24, t) {
    for (var r = new Array(arguments.length - 1), a = 0, i = 2, n = true; i < arguments.length; ) r[a++] = arguments[i++];
    return new Promise(function(s, u) {
      r[a] = function(f2) {
        if (n) if (n = false, f2) u(f2);
        else {
          for (var y = new Array(arguments.length - 1), P = 0; P < y.length; ) y[P++] = arguments[P];
          s.apply(null, y);
        }
      };
      try {
        e24.apply(t || null, r);
      } catch (c) {
        n && (n = false, u(c));
      }
    });
  }
});
var Su = re((Ou) => {
  d();
  var eo = Ou;
  eo.length = function(t) {
    var r = t.length;
    if (!r) return 0;
    for (var a = 0; --r % 4 > 1 && t.charAt(r) === "="; ) ++a;
    return Math.ceil(t.length * 3) / 4 - a;
  };
  var rn = new Array(64), Vu = new Array(123);
  for (ut = 0; ut < 64; ) Vu[rn[ut] = ut < 26 ? ut + 65 : ut < 52 ? ut + 71 : ut < 62 ? ut - 4 : ut - 59 | 43] = ut++;
  var ut;
  eo.encode = function(t, r, a) {
    for (var i = null, n = [], o = 0, s = 0, u; r < a; ) {
      var c = t[r++];
      switch (s) {
        case 0:
          n[o++] = rn[c >> 2], u = (c & 3) << 4, s = 1;
          break;
        case 1:
          n[o++] = rn[u | c >> 4], u = (c & 15) << 2, s = 2;
          break;
        case 2:
          n[o++] = rn[u | c >> 6], n[o++] = rn[c & 63], s = 0;
          break;
      }
      o > 8191 && ((i || (i = [])).push(String.fromCharCode.apply(String, n)), o = 0);
    }
    return s && (n[o++] = rn[u], n[o++] = 61, s === 1 && (n[o++] = 61)), i ? (o && i.push(String.fromCharCode.apply(String, n.slice(0, o))), i.join("")) : String.fromCharCode.apply(String, n.slice(0, o));
  };
  var Nu = "invalid encoding";
  eo.decode = function(t, r, a) {
    for (var i = a, n = 0, o, s = 0; s < t.length; ) {
      var u = t.charCodeAt(s++);
      if (u === 61 && n > 1) break;
      if ((u = Vu[u]) === void 0) throw Error(Nu);
      switch (n) {
        case 0:
          o = u, n = 1;
          break;
        case 1:
          r[a++] = o << 2 | (u & 48) >> 4, o = u, n = 2;
          break;
        case 2:
          r[a++] = (o & 15) << 4 | (u & 60) >> 2, o = u, n = 3;
          break;
        case 3:
          r[a++] = (o & 3) << 6 | u, n = 0;
          break;
      }
    }
    if (n === 1) throw Error(Nu);
    return a - i;
  };
  eo.test = function(t) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(t);
  };
});
var Iu = re((kv, ku) => {
  d();
  ku.exports = to;
  function to() {
    this._listeners = {};
  }
  to.prototype.on = function(t, r, a) {
    return (this._listeners[t] || (this._listeners[t] = [])).push({ fn: r, ctx: a || this }), this;
  };
  to.prototype.off = function(t, r) {
    if (t === void 0) this._listeners = {};
    else if (r === void 0) this._listeners[t] = [];
    else for (var a = this._listeners[t], i = 0; i < a.length; ) a[i].fn === r ? a.splice(i, 1) : ++i;
    return this;
  };
  to.prototype.emit = function(t) {
    var r = this._listeners[t];
    if (r) {
      for (var a = [], i = 1; i < arguments.length; ) a.push(arguments[i++]);
      for (i = 0; i < r.length; ) r[i].fn.apply(r[i++].ctx, a);
    }
    return this;
  };
});
var Uu = re((_v, Eu) => {
  d();
  Eu.exports = _u(_u);
  function _u(e24) {
    return typeof Float32Array < "u" ? function() {
      var t = new Float32Array([-0]), r = new Uint8Array(t.buffer), a = r[3] === 128;
      function i(u, c, f2) {
        t[0] = u, c[f2] = r[0], c[f2 + 1] = r[1], c[f2 + 2] = r[2], c[f2 + 3] = r[3];
      }
      function n(u, c, f2) {
        t[0] = u, c[f2] = r[3], c[f2 + 1] = r[2], c[f2 + 2] = r[1], c[f2 + 3] = r[0];
      }
      e24.writeFloatLE = a ? i : n, e24.writeFloatBE = a ? n : i;
      function o(u, c) {
        return r[0] = u[c], r[1] = u[c + 1], r[2] = u[c + 2], r[3] = u[c + 3], t[0];
      }
      function s(u, c) {
        return r[3] = u[c], r[2] = u[c + 1], r[1] = u[c + 2], r[0] = u[c + 3], t[0];
      }
      e24.readFloatLE = a ? o : s, e24.readFloatBE = a ? s : o;
    }() : function() {
      function t(a, i, n, o) {
        var s = i < 0 ? 1 : 0;
        if (s && (i = -i), i === 0) a(1 / i > 0 ? 0 : 2147483648, n, o);
        else if (isNaN(i)) a(2143289344, n, o);
        else if (i > 34028234663852886e22) a((s << 31 | 2139095040) >>> 0, n, o);
        else if (i < 11754943508222875e-54) a((s << 31 | Math.round(i / 1401298464324817e-60)) >>> 0, n, o);
        else {
          var u = Math.floor(Math.log(i) / Math.LN2), c = Math.round(i * Math.pow(2, -u) * 8388608) & 8388607;
          a((s << 31 | u + 127 << 23 | c) >>> 0, n, o);
        }
      }
      e24.writeFloatLE = t.bind(null, Bu), e24.writeFloatBE = t.bind(null, Gu);
      function r(a, i, n) {
        var o = a(i, n), s = (o >> 31) * 2 + 1, u = o >>> 23 & 255, c = o & 8388607;
        return u === 255 ? c ? NaN : s * (1 / 0) : u === 0 ? s * 1401298464324817e-60 * c : s * Math.pow(2, u - 150) * (c + 8388608);
      }
      e24.readFloatLE = r.bind(null, wu), e24.readFloatBE = r.bind(null, Mu);
    }(), typeof Float64Array < "u" ? function() {
      var t = new Float64Array([-0]), r = new Uint8Array(t.buffer), a = r[7] === 128;
      function i(u, c, f2) {
        t[0] = u, c[f2] = r[0], c[f2 + 1] = r[1], c[f2 + 2] = r[2], c[f2 + 3] = r[3], c[f2 + 4] = r[4], c[f2 + 5] = r[5], c[f2 + 6] = r[6], c[f2 + 7] = r[7];
      }
      function n(u, c, f2) {
        t[0] = u, c[f2] = r[7], c[f2 + 1] = r[6], c[f2 + 2] = r[5], c[f2 + 3] = r[4], c[f2 + 4] = r[3], c[f2 + 5] = r[2], c[f2 + 6] = r[1], c[f2 + 7] = r[0];
      }
      e24.writeDoubleLE = a ? i : n, e24.writeDoubleBE = a ? n : i;
      function o(u, c) {
        return r[0] = u[c], r[1] = u[c + 1], r[2] = u[c + 2], r[3] = u[c + 3], r[4] = u[c + 4], r[5] = u[c + 5], r[6] = u[c + 6], r[7] = u[c + 7], t[0];
      }
      function s(u, c) {
        return r[7] = u[c], r[6] = u[c + 1], r[5] = u[c + 2], r[4] = u[c + 3], r[3] = u[c + 4], r[2] = u[c + 5], r[1] = u[c + 6], r[0] = u[c + 7], t[0];
      }
      e24.readDoubleLE = a ? o : s, e24.readDoubleBE = a ? s : o;
    }() : function() {
      function t(a, i, n, o, s, u) {
        var c = o < 0 ? 1 : 0;
        if (c && (o = -o), o === 0) a(0, s, u + i), a(1 / o > 0 ? 0 : 2147483648, s, u + n);
        else if (isNaN(o)) a(0, s, u + i), a(2146959360, s, u + n);
        else if (o > 17976931348623157e292) a(0, s, u + i), a((c << 31 | 2146435072) >>> 0, s, u + n);
        else {
          var f2;
          if (o < 22250738585072014e-324) f2 = o / 5e-324, a(f2 >>> 0, s, u + i), a((c << 31 | f2 / 4294967296) >>> 0, s, u + n);
          else {
            var y = Math.floor(Math.log(o) / Math.LN2);
            y === 1024 && (y = 1023), f2 = o * Math.pow(2, -y), a(f2 * 4503599627370496 >>> 0, s, u + i), a((c << 31 | y + 1023 << 20 | f2 * 1048576 & 1048575) >>> 0, s, u + n);
          }
        }
      }
      e24.writeDoubleLE = t.bind(null, Bu, 0, 4), e24.writeDoubleBE = t.bind(null, Gu, 4, 0);
      function r(a, i, n, o, s) {
        var u = a(o, s + i), c = a(o, s + n), f2 = (c >> 31) * 2 + 1, y = c >>> 20 & 2047, P = 4294967296 * (c & 1048575) + u;
        return y === 2047 ? P ? NaN : f2 * (1 / 0) : y === 0 ? f2 * 5e-324 * P : f2 * Math.pow(2, y - 1075) * (P + 4503599627370496);
      }
      e24.readDoubleLE = r.bind(null, wu, 0, 4), e24.readDoubleBE = r.bind(null, Mu, 4, 0);
    }(), e24;
  }
  function Bu(e24, t, r) {
    t[r] = e24 & 255, t[r + 1] = e24 >>> 8 & 255, t[r + 2] = e24 >>> 16 & 255, t[r + 3] = e24 >>> 24;
  }
  function Gu(e24, t, r) {
    t[r] = e24 >>> 24, t[r + 1] = e24 >>> 16 & 255, t[r + 2] = e24 >>> 8 & 255, t[r + 3] = e24 & 255;
  }
  function wu(e24, t) {
    return (e24[t] | e24[t + 1] << 8 | e24[t + 2] << 16 | e24[t + 3] << 24) >>> 0;
  }
  function Mu(e24, t) {
    return (e24[t] << 24 | e24[t + 1] << 16 | e24[t + 2] << 8 | e24[t + 3]) >>> 0;
  }
});
var Du = re((exports$1, module) => {
  d();
  module.exports = inquire;
  function inquire(moduleName) {
    try {
      var mod = eval("quire".replace(/^/, "re"))(moduleName);
      if (mod && (mod.length || Object.keys(mod).length)) return mod;
    } catch (e24) {
    }
    return null;
  }
});
var Wu = re((Fu) => {
  d();
  var Go = Fu;
  Go.length = function(t) {
    for (var r = 0, a = 0, i = 0; i < t.length; ++i) a = t.charCodeAt(i), a < 128 ? r += 1 : a < 2048 ? r += 2 : (a & 64512) === 55296 && (t.charCodeAt(i + 1) & 64512) === 56320 ? (++i, r += 4) : r += 3;
    return r;
  };
  Go.read = function(t, r, a) {
    var i = a - r;
    if (i < 1) return "";
    for (var n = null, o = [], s = 0, u; r < a; ) u = t[r++], u < 128 ? o[s++] = u : u > 191 && u < 224 ? o[s++] = (u & 31) << 6 | t[r++] & 63 : u > 239 && u < 365 ? (u = ((u & 7) << 18 | (t[r++] & 63) << 12 | (t[r++] & 63) << 6 | t[r++] & 63) - 65536, o[s++] = 55296 + (u >> 10), o[s++] = 56320 + (u & 1023)) : o[s++] = (u & 15) << 12 | (t[r++] & 63) << 6 | t[r++] & 63, s > 8191 && ((n || (n = [])).push(String.fromCharCode.apply(String, o)), s = 0);
    return n ? (s && n.push(String.fromCharCode.apply(String, o.slice(0, s))), n.join("")) : String.fromCharCode.apply(String, o.slice(0, s));
  };
  Go.write = function(t, r, a) {
    for (var i = a, n, o, s = 0; s < t.length; ++s) n = t.charCodeAt(s), n < 128 ? r[a++] = n : n < 2048 ? (r[a++] = n >> 6 | 192, r[a++] = n & 63 | 128) : (n & 64512) === 55296 && ((o = t.charCodeAt(s + 1)) & 64512) === 56320 ? (n = 65536 + ((n & 1023) << 10) + (o & 1023), ++s, r[a++] = n >> 18 | 240, r[a++] = n >> 12 & 63 | 128, r[a++] = n >> 6 & 63 | 128, r[a++] = n & 63 | 128) : (r[a++] = n >> 12 | 224, r[a++] = n >> 6 & 63 | 128, r[a++] = n & 63 | 128);
    return a - i;
  };
});
var Lu = re((Ev, qu) => {
  d();
  qu.exports = Dg;
  function Dg(e24, t, r) {
    var a = r || 8192, i = a >>> 1, n = null, o = a;
    return function(u) {
      if (u < 1 || u > i) return e24(u);
      o + u > a && (n = e24(a), o = 0);
      var c = t.call(n, o, o += u);
      return o & 7 && (o = (o | 7) + 1), c;
    };
  }
});
var zu = re((Dv, Ju) => {
  d();
  Ju.exports = le;
  var ca = Zt();
  function le(e24, t) {
    this.lo = e24 >>> 0, this.hi = t >>> 0;
  }
  var Ar = le.zero = new le(0, 0);
  Ar.toNumber = function() {
    return 0;
  };
  Ar.zzEncode = Ar.zzDecode = function() {
    return this;
  };
  Ar.length = function() {
    return 1;
  };
  var Fg = le.zeroHash = "\0\0\0\0\0\0\0\0";
  le.fromNumber = function(t) {
    if (t === 0) return Ar;
    var r = t < 0;
    r && (t = -t);
    var a = t >>> 0, i = (t - a) / 4294967296 >>> 0;
    return r && (i = ~i >>> 0, a = ~a >>> 0, ++a > 4294967295 && (a = 0, ++i > 4294967295 && (i = 0))), new le(a, i);
  };
  le.from = function(t) {
    if (typeof t == "number") return le.fromNumber(t);
    if (ca.isString(t)) if (ca.Long) t = ca.Long.fromString(t);
    else return le.fromNumber(parseInt(t, 10));
    return t.low || t.high ? new le(t.low >>> 0, t.high >>> 0) : Ar;
  };
  le.prototype.toNumber = function(t) {
    if (!t && this.hi >>> 31) {
      var r = ~this.lo + 1 >>> 0, a = ~this.hi >>> 0;
      return r || (a = a + 1 >>> 0), -(r + a * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  };
  le.prototype.toLong = function(t) {
    return ca.Long ? new ca.Long(this.lo | 0, this.hi | 0, !!t) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!t };
  };
  var Yt = String.prototype.charCodeAt;
  le.fromHash = function(t) {
    return t === Fg ? Ar : new le((Yt.call(t, 0) | Yt.call(t, 1) << 8 | Yt.call(t, 2) << 16 | Yt.call(t, 3) << 24) >>> 0, (Yt.call(t, 4) | Yt.call(t, 5) << 8 | Yt.call(t, 6) << 16 | Yt.call(t, 7) << 24) >>> 0);
  };
  le.prototype.toHash = function() {
    return String.fromCharCode(this.lo & 255, this.lo >>> 8 & 255, this.lo >>> 16 & 255, this.lo >>> 24, this.hi & 255, this.hi >>> 8 & 255, this.hi >>> 16 & 255, this.hi >>> 24);
  };
  le.prototype.zzEncode = function() {
    var t = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ t) >>> 0, this.lo = (this.lo << 1 ^ t) >>> 0, this;
  };
  le.prototype.zzDecode = function() {
    var t = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ t) >>> 0, this.hi = (this.hi >>> 1 ^ t) >>> 0, this;
  };
  le.prototype.length = function() {
    var t = this.lo, r = (this.lo >>> 28 | this.hi << 4) >>> 0, a = this.hi >>> 24;
    return a === 0 ? r === 0 ? t < 16384 ? t < 128 ? 1 : 2 : t < 2097152 ? 3 : 4 : r < 16384 ? r < 128 ? 5 : 6 : r < 2097152 ? 7 : 8 : a < 128 ? 9 : 10;
  };
});
var Zt = re((wo) => {
  d();
  var _ = wo;
  _.asPromise = Au();
  _.base64 = Su();
  _.EventEmitter = Iu();
  _.float = Uu();
  _.inquire = Du();
  _.utf8 = Wu();
  _.pool = Lu();
  _.LongBits = zu();
  _.isNode = !!(typeof global < "u" && global && global.process && global.process.versions && global.process.versions.node);
  _.global = _.isNode && global || typeof window < "u" && window || typeof self < "u" && self || wo;
  _.emptyArray = Object.freeze ? Object.freeze([]) : [];
  _.emptyObject = Object.freeze ? Object.freeze({}) : {};
  _.isInteger = Number.isInteger || function(t) {
    return typeof t == "number" && isFinite(t) && Math.floor(t) === t;
  };
  _.isString = function(t) {
    return typeof t == "string" || t instanceof String;
  };
  _.isObject = function(t) {
    return t && typeof t == "object";
  };
  _.isset = _.isSet = function(t, r) {
    var a = t[r];
    return a != null && t.hasOwnProperty(r) ? typeof a != "object" || (Array.isArray(a) ? a.length : Object.keys(a).length) > 0 : false;
  };
  _.Buffer = function() {
    try {
      var e24 = _.inquire("buffer").Buffer;
      return e24.prototype.utf8Write ? e24 : null;
    } catch {
      return null;
    }
  }();
  _._Buffer_from = null;
  _._Buffer_allocUnsafe = null;
  _.newBuffer = function(t) {
    return typeof t == "number" ? _.Buffer ? _._Buffer_allocUnsafe(t) : new _.Array(t) : _.Buffer ? _._Buffer_from(t) : typeof Uint8Array > "u" ? t : new Uint8Array(t);
  };
  _.Array = typeof Uint8Array < "u" ? Uint8Array : Array;
  _.Long = _.global.dcodeIO && _.global.dcodeIO.Long || _.global.Long || _.inquire("long");
  _.key2Re = /^true|false|0|1$/;
  _.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
  _.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
  _.longToHash = function(t) {
    return t ? _.LongBits.from(t).toHash() : _.LongBits.zeroHash;
  };
  _.longFromHash = function(t, r) {
    var a = _.LongBits.fromHash(t);
    return _.Long ? _.Long.fromBits(a.lo, a.hi, r) : a.toNumber(!!r);
  };
  function $u(e24, t, r) {
    for (var a = Object.keys(t), i = 0; i < a.length; ++i) (e24[a[i]] === void 0 || !r) && (e24[a[i]] = t[a[i]]);
    return e24;
  }
  _.merge = $u;
  _.lcFirst = function(t) {
    return t.charAt(0).toLowerCase() + t.substring(1);
  };
  function Hu(e24) {
    function t(r, a) {
      if (!(this instanceof t)) return new t(r, a);
      Object.defineProperty(this, "message", { get: function() {
        return r;
      } }), Error.captureStackTrace ? Error.captureStackTrace(this, t) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), a && $u(this, a);
    }
    return t.prototype = Object.create(Error.prototype, { constructor: { value: t, writable: true, enumerable: false, configurable: true }, name: { get: function() {
      return e24;
    }, set: void 0, enumerable: false, configurable: true }, toString: { value: function() {
      return this.name + ": " + this.message;
    }, writable: true, enumerable: false, configurable: true } }), t;
  }
  _.newError = Hu;
  _.ProtocolError = Hu("ProtocolError");
  _.oneOfGetter = function(t) {
    for (var r = {}, a = 0; a < t.length; ++a) r[t[a]] = 1;
    return function() {
      for (var i = Object.keys(this), n = i.length - 1; n > -1; --n) if (r[i[n]] === 1 && this[i[n]] !== void 0 && this[i[n]] !== null) return i[n];
    };
  };
  _.oneOfSetter = function(t) {
    return function(r) {
      for (var a = 0; a < t.length; ++a) t[a] !== r && delete this[t[a]];
    };
  };
  _.toJSONOptions = { longs: String, enums: String, bytes: String, json: true };
  _._configure = function() {
    var e24 = _.Buffer;
    if (!e24) {
      _._Buffer_from = _._Buffer_allocUnsafe = null;
      return;
    }
    _._Buffer_from = e24.from !== Uint8Array.from && e24.from || function(r, a) {
      return new e24(r, a);
    }, _._Buffer_allocUnsafe = e24.allocUnsafe || function(r) {
      return new e24(r);
    };
  };
});
var qo = re((Lv, Zu) => {
  d();
  Zu.exports = z;
  var Qe = Zt(), Mo, ro = Qe.LongBits, Qu = Qe.base64, Ku = Qe.utf8;
  function la(e24, t, r) {
    this.fn = e24, this.len = t, this.next = void 0, this.val = r;
  }
  function Uo() {
  }
  function Wg(e24) {
    this.head = e24.head, this.tail = e24.tail, this.len = e24.len, this.next = e24.states;
  }
  function z() {
    this.len = 0, this.head = new la(Uo, 0, 0), this.tail = this.head, this.states = null;
  }
  var Yu = function() {
    return Qe.Buffer ? function() {
      return (z.create = function() {
        return new Mo();
      })();
    } : function() {
      return new z();
    };
  };
  z.create = Yu();
  z.alloc = function(t) {
    return new Qe.Array(t);
  };
  Qe.Array !== Array && (z.alloc = Qe.pool(z.alloc, Qe.Array.prototype.subarray));
  z.prototype._push = function(t, r, a) {
    return this.tail = this.tail.next = new la(t, r, a), this.len += r, this;
  };
  function Do(e24, t, r) {
    t[r] = e24 & 255;
  }
  function qg(e24, t, r) {
    for (; e24 > 127; ) t[r++] = e24 & 127 | 128, e24 >>>= 7;
    t[r] = e24;
  }
  function Fo(e24, t) {
    this.len = e24, this.next = void 0, this.val = t;
  }
  Fo.prototype = Object.create(la.prototype);
  Fo.prototype.fn = qg;
  z.prototype.uint32 = function(t) {
    return this.len += (this.tail = this.tail.next = new Fo((t = t >>> 0) < 128 ? 1 : t < 16384 ? 2 : t < 2097152 ? 3 : t < 268435456 ? 4 : 5, t)).len, this;
  };
  z.prototype.int32 = function(t) {
    return t < 0 ? this._push(Wo, 10, ro.fromNumber(t)) : this.uint32(t);
  };
  z.prototype.sint32 = function(t) {
    return this.uint32((t << 1 ^ t >> 31) >>> 0);
  };
  function Wo(e24, t, r) {
    for (; e24.hi; ) t[r++] = e24.lo & 127 | 128, e24.lo = (e24.lo >>> 7 | e24.hi << 25) >>> 0, e24.hi >>>= 7;
    for (; e24.lo > 127; ) t[r++] = e24.lo & 127 | 128, e24.lo = e24.lo >>> 7;
    t[r++] = e24.lo;
  }
  z.prototype.uint64 = function(t) {
    var r = ro.from(t);
    return this._push(Wo, r.length(), r);
  };
  z.prototype.int64 = z.prototype.uint64;
  z.prototype.sint64 = function(t) {
    var r = ro.from(t).zzEncode();
    return this._push(Wo, r.length(), r);
  };
  z.prototype.bool = function(t) {
    return this._push(Do, 1, t ? 1 : 0);
  };
  function Eo(e24, t, r) {
    t[r] = e24 & 255, t[r + 1] = e24 >>> 8 & 255, t[r + 2] = e24 >>> 16 & 255, t[r + 3] = e24 >>> 24;
  }
  z.prototype.fixed32 = function(t) {
    return this._push(Eo, 4, t >>> 0);
  };
  z.prototype.sfixed32 = z.prototype.fixed32;
  z.prototype.fixed64 = function(t) {
    var r = ro.from(t);
    return this._push(Eo, 4, r.lo)._push(Eo, 4, r.hi);
  };
  z.prototype.sfixed64 = z.prototype.fixed64;
  z.prototype.float = function(t) {
    return this._push(Qe.float.writeFloatLE, 4, t);
  };
  z.prototype.double = function(t) {
    return this._push(Qe.float.writeDoubleLE, 8, t);
  };
  var Lg = Qe.Array.prototype.set ? function(t, r, a) {
    r.set(t, a);
  } : function(t, r, a) {
    for (var i = 0; i < t.length; ++i) r[a + i] = t[i];
  };
  z.prototype.bytes = function(t) {
    var r = t.length >>> 0;
    if (!r) return this._push(Do, 1, 0);
    if (Qe.isString(t)) {
      var a = z.alloc(r = Qu.length(t));
      Qu.decode(t, a, 0), t = a;
    }
    return this.uint32(r)._push(Lg, r, t);
  };
  z.prototype.string = function(t) {
    var r = Ku.length(t);
    return r ? this.uint32(r)._push(Ku.write, r, t) : this._push(Do, 1, 0);
  };
  z.prototype.fork = function() {
    return this.states = new Wg(this), this.head = this.tail = new la(Uo, 0, 0), this.len = 0, this;
  };
  z.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new la(Uo, 0, 0), this.len = 0), this;
  };
  z.prototype.ldelim = function() {
    var t = this.head, r = this.tail, a = this.len;
    return this.reset().uint32(a), a && (this.tail.next = t.next, this.tail = r, this.len += a), this;
  };
  z.prototype.finish = function() {
    for (var t = this.head.next, r = this.constructor.alloc(this.len), a = 0; t; ) t.fn(t.val, r, a), a += t.len, t = t.next;
    return r;
  };
  z._configure = function(e24) {
    Mo = e24, z.create = Yu(), Mo._configure();
  };
});
var ed = re((zv, ju) => {
  d();
  ju.exports = At;
  var Xu = qo();
  (At.prototype = Object.create(Xu.prototype)).constructor = At;
  var Xt = Zt();
  function At() {
    Xu.call(this);
  }
  At._configure = function() {
    At.alloc = Xt._Buffer_allocUnsafe, At.writeBytesBuffer = Xt.Buffer && Xt.Buffer.prototype instanceof Uint8Array && Xt.Buffer.prototype.set.name === "set" ? function(t, r, a) {
      r.set(t, a);
    } : function(t, r, a) {
      if (t.copy) t.copy(r, a, 0, t.length);
      else for (var i = 0; i < t.length; ) r[a++] = t[i++];
    };
  };
  At.prototype.bytes = function(t) {
    Xt.isString(t) && (t = Xt._Buffer_from(t, "base64"));
    var r = t.length >>> 0;
    return this.uint32(r), r && this._push(At.writeBytesBuffer, r, t), this;
  };
  function Jg(e24, t, r) {
    e24.length < 40 ? Xt.utf8.write(e24, t, r) : t.utf8Write ? t.utf8Write(e24, r) : t.write(e24, r);
  }
  At.prototype.string = function(t) {
    var r = Xt.Buffer.byteLength(t);
    return this.uint32(r), r && this._push(Jg, r, t), this;
  };
  At._configure();
});
var zo = re((Hv, ad) => {
  d();
  ad.exports = ie;
  var dt = Zt(), Jo, nd = dt.LongBits, zg = dt.utf8;
  function ct(e24, t) {
    return RangeError("index out of range: " + e24.pos + " + " + (t || 1) + " > " + e24.len);
  }
  function ie(e24) {
    this.buf = e24, this.pos = 0, this.len = e24.length;
  }
  var td = typeof Uint8Array < "u" ? function(t) {
    if (t instanceof Uint8Array || Array.isArray(t)) return new ie(t);
    throw Error("illegal buffer");
  } : function(t) {
    if (Array.isArray(t)) return new ie(t);
    throw Error("illegal buffer");
  }, id = function() {
    return dt.Buffer ? function(r) {
      return (ie.create = function(i) {
        return dt.Buffer.isBuffer(i) ? new Jo(i) : td(i);
      })(r);
    } : td;
  };
  ie.create = id();
  ie.prototype._slice = dt.Array.prototype.subarray || dt.Array.prototype.slice;
  ie.prototype.uint32 = /* @__PURE__ */ function() {
    var t = 4294967295;
    return function() {
      if (t = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (t = (t | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (t = (t | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (t = (t | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (t = (t | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return t;
      if ((this.pos += 5) > this.len) throw this.pos = this.len, ct(this, 10);
      return t;
    };
  }();
  ie.prototype.int32 = function() {
    return this.uint32() | 0;
  };
  ie.prototype.sint32 = function() {
    var t = this.uint32();
    return t >>> 1 ^ -(t & 1) | 0;
  };
  function Lo() {
    var e24 = new nd(0, 0), t = 0;
    if (this.len - this.pos > 4) {
      for (; t < 4; ++t) if (e24.lo = (e24.lo | (this.buf[this.pos] & 127) << t * 7) >>> 0, this.buf[this.pos++] < 128) return e24;
      if (e24.lo = (e24.lo | (this.buf[this.pos] & 127) << 28) >>> 0, e24.hi = (e24.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128) return e24;
      t = 0;
    } else {
      for (; t < 3; ++t) {
        if (this.pos >= this.len) throw ct(this);
        if (e24.lo = (e24.lo | (this.buf[this.pos] & 127) << t * 7) >>> 0, this.buf[this.pos++] < 128) return e24;
      }
      return e24.lo = (e24.lo | (this.buf[this.pos++] & 127) << t * 7) >>> 0, e24;
    }
    if (this.len - this.pos > 4) {
      for (; t < 5; ++t) if (e24.hi = (e24.hi | (this.buf[this.pos] & 127) << t * 7 + 3) >>> 0, this.buf[this.pos++] < 128) return e24;
    } else for (; t < 5; ++t) {
      if (this.pos >= this.len) throw ct(this);
      if (e24.hi = (e24.hi | (this.buf[this.pos] & 127) << t * 7 + 3) >>> 0, this.buf[this.pos++] < 128) return e24;
    }
    throw Error("invalid varint encoding");
  }
  ie.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function no(e24, t) {
    return (e24[t - 4] | e24[t - 3] << 8 | e24[t - 2] << 16 | e24[t - 1] << 24) >>> 0;
  }
  ie.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len) throw ct(this, 4);
    return no(this.buf, this.pos += 4);
  };
  ie.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len) throw ct(this, 4);
    return no(this.buf, this.pos += 4) | 0;
  };
  function rd() {
    if (this.pos + 8 > this.len) throw ct(this, 8);
    return new nd(no(this.buf, this.pos += 4), no(this.buf, this.pos += 4));
  }
  ie.prototype.float = function() {
    if (this.pos + 4 > this.len) throw ct(this, 4);
    var t = dt.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, t;
  };
  ie.prototype.double = function() {
    if (this.pos + 8 > this.len) throw ct(this, 4);
    var t = dt.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, t;
  };
  ie.prototype.bytes = function() {
    var t = this.uint32(), r = this.pos, a = this.pos + t;
    if (a > this.len) throw ct(this, t);
    if (this.pos += t, Array.isArray(this.buf)) return this.buf.slice(r, a);
    if (r === a) {
      var i = dt.Buffer;
      return i ? i.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, r, a);
  };
  ie.prototype.string = function() {
    var t = this.bytes();
    return zg.read(t, 0, t.length);
  };
  ie.prototype.skip = function(t) {
    if (typeof t == "number") {
      if (this.pos + t > this.len) throw ct(this, t);
      this.pos += t;
    } else do
      if (this.pos >= this.len) throw ct(this);
    while (this.buf[this.pos++] & 128);
    return this;
  };
  ie.prototype.skipType = function(e24) {
    switch (e24) {
      case 0:
        this.skip();
        break;
      case 1:
        this.skip(8);
        break;
      case 2:
        this.skip(this.uint32());
        break;
      case 3:
        for (; (e24 = this.uint32() & 7) !== 4; ) this.skipType(e24);
        break;
      case 5:
        this.skip(4);
        break;
      default:
        throw Error("invalid wire type " + e24 + " at offset " + this.pos);
    }
    return this;
  };
  ie._configure = function(e24) {
    Jo = e24, ie.create = id(), Jo._configure();
    var t = dt.Long ? "toLong" : "toNumber";
    dt.merge(ie.prototype, { int64: function() {
      return Lo.call(this)[t](false);
    }, uint64: function() {
      return Lo.call(this)[t](true);
    }, sint64: function() {
      return Lo.call(this).zzDecode()[t](false);
    }, fixed64: function() {
      return rd.call(this)[t](true);
    }, sfixed64: function() {
      return rd.call(this)[t](false);
    } });
  };
});
var dd = re((Kv, ud) => {
  d();
  ud.exports = Nr;
  var sd = zo();
  (Nr.prototype = Object.create(sd.prototype)).constructor = Nr;
  var od = Zt();
  function Nr(e24) {
    sd.call(this, e24);
  }
  Nr._configure = function() {
    od.Buffer && (Nr.prototype._slice = od.Buffer.prototype.slice);
  };
  Nr.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  };
  Nr._configure();
});
var ld = re((Zv, cd) => {
  d();
  cd.exports = fa;
  var $o = Zt();
  (fa.prototype = Object.create($o.EventEmitter.prototype)).constructor = fa;
  function fa(e24, t, r) {
    if (typeof e24 != "function") throw TypeError("rpcImpl must be a function");
    $o.EventEmitter.call(this), this.rpcImpl = e24, this.requestDelimited = !!t, this.responseDelimited = !!r;
  }
  fa.prototype.rpcCall = function e24(t, r, a, i, n) {
    if (!i) throw TypeError("request must be specified");
    var o = this;
    if (!n) return $o.asPromise(e24, o, t, r, a, i);
    if (!o.rpcImpl) {
      setTimeout(function() {
        n(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return o.rpcImpl(t, r[o.requestDelimited ? "encodeDelimited" : "encode"](i).finish(), function(u, c) {
        if (u) return o.emit("error", u, t), n(u);
        if (c === null) {
          o.end(true);
          return;
        }
        if (!(c instanceof a)) try {
          c = a[o.responseDelimited ? "decodeDelimited" : "decode"](c);
        } catch (f2) {
          return o.emit("error", f2, t), n(f2);
        }
        return o.emit("data", c, t), n(null, c);
      });
    } catch (s) {
      o.emit("error", s, t), setTimeout(function() {
        n(s);
      }, 0);
      return;
    }
  };
  fa.prototype.end = function(t) {
    return this.rpcImpl && (t || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  };
});
var pd = re((fd) => {
  d();
  var $g = fd;
  $g.Service = ld();
});
var md = re((tb, gd) => {
  d();
  gd.exports = {};
});
var Td = re((yd) => {
  d();
  var _e = yd;
  _e.build = "minimal";
  _e.Writer = qo();
  _e.BufferWriter = ed();
  _e.Reader = zo();
  _e.BufferReader = dd();
  _e.util = Zt();
  _e.rpc = pd();
  _e.roots = md();
  _e.configure = hd;
  function hd() {
    _e.util._configure(), _e.Writer._configure(_e.BufferWriter), _e.Reader._configure(_e.BufferReader);
  }
  hd();
});
var Ke = re((ab, vd) => {
  d();
  vd.exports = Td();
});
d();
d();
d();
var ne = class extends Error {
  message;
  constructor(t) {
    super(t), this.message = t, this.name = this.constructor.name, typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, this.constructor);
  }
};
var F = class extends ne {
  constructor(t) {
    super(`Invalid input provided: ${t}`);
  }
};
var _t = class extends ne {
  constructor(t, r) {
    super(`Query call with protocol ${r} failed with message: ${t}`);
  }
};
var Da = class extends ne {
  constructor(t) {
    super(`Delete many failed with message: ${t}`);
  }
};
var Fa = class extends ne {
  constructor(t) {
    super(`Tenants get failed with message: ${t}`);
  }
};
var Wa = class extends ne {
  constructor(t) {
    super(`Batch objects insert failed with message: ${t}`);
  }
};
var Yr = class extends ne {
  constructor(t) {
    let a = `Weaviate makes use of a high-speed gRPC API as well as a REST API.
      Unfortunately, the gRPC health check against Weaviate could not be completed.

      This error could be due to one of several reasons:
        - The gRPC traffic at the specified port is blocked by a firewall.
        - gRPC is not enabled or incorrectly configured on the server or the client.
            - ${`Please check that the server address and port: ${t} are correct.`}
        - your connection is unstable or has a high latency. In this case you can:
            - increase init-timeout in weaviate.connectToLocal({timeout: {init: X}})'
            - disable startup checks by connecting using 'skipInitChecks=true'
    `;
    super(a);
  }
};
var b = class extends ne {
  constructor(t) {
    super(`Converting data from Weaviate failed with message: ${t}`);
  }
};
var Zr = class extends ne {
  constructor(t) {
    super(`Converting data to Weaviate failed with message: ${t}`);
  }
};
var Ct = class extends ne {
  code;
  constructor(t, r) {
    super(`The request to Weaviate failed with status code: ${t} and message: ${r}`), this.code = t;
  }
};
var Pt = class extends ne {
  constructor(t) {
    super(`The response from Weaviate was unexpected: ${t}`);
  }
};
var Bt = class extends ne {
  constructor(t, r) {
    super(`Backup ${r} failed with message: ${t}`);
  }
};
var sa = class extends ne {
  constructor(t) {
    super(`Backup ${t} was canceled`);
  }
};
var qa = class extends ne {
  constructor(t) {
    super(`Backup cancellation failed with message: ${t}`);
  }
};
var He = class extends ne {
};
var fu = class extends ne {
  constructor(t) {
    super(`Weaviate startup failed with message: ${t}`);
  }
};
var Xr = class extends ne {
  constructor(t) {
    super(`Weaviate request timed out with message: ${t}`);
  }
};
var jr = class extends ne {
  code;
  constructor(t, r) {
    super(`Forbidden: ${r}`), this.code = t;
  }
};
var La = class extends ne {
  constructor(t) {
    super(`Unauthenticated: ${t}`);
  }
};
var Ja = class extends ne {
  constructor(t) {
    super(`Batch stream failed with message: ${t}`);
  }
};
d();
d();
var O = class {
  _errors;
  client;
  constructor(t) {
    this.client = t, this._errors = [];
  }
  get errors() {
    return this._errors;
  }
  addError(t) {
    this._errors = [...this.errors, t];
  }
  addErrors(t) {
    this._errors = [...this.errors, ...t];
  }
};
var en = class extends O {
  class;
  constructor(t) {
    super(t);
  }
  withClass = (t) => (this.class = t, this);
  validateClass = () => {
    (this.class == null || this.class == null) && this.addError("class object must be set - set with .withClass(class)");
  };
  validate() {
    this.validateClass();
  }
  do = () => {
    if (this.validateClass(), this.errors.length > 0) return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
    let t = `/schema/${this.class.class}`;
    return this.client.put(t, this.class, false);
  };
};
d();
d();
var zt = class extends O {
  class;
  constructor(t) {
    super(t);
  }
  withClass = (t) => (this.class = t, this);
  validateClass = () => {
    (this.class == null || this.class == null) && this.addError("class object must be set - set with .withClass(class)");
  };
  validate() {
    this.validateClass();
  }
  do = () => (this.validateClass(), this.errors.length > 0 ? Promise.reject(new Error("invalid usage: " + this.errors.join(", "))) : this.client.postReturn("/schema", this.class));
};
d();
d();
function M(e24) {
  return typeof e24 == "string" && e24.length > 0;
}
var $t = class extends O {
  className;
  constructor(t) {
    super(t);
  }
  withClassName = (t) => (this.className = t, this);
  validateClassName = () => {
    M(this.className) || this.addError("className must be set - set with .withClassName(className)");
  };
  validate = () => {
    this.validateClassName();
  };
  do = () => {
    if (this.validate(), this.errors.length > 0) return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
    let t = `/schema/${this.className}`;
    return this.client.delete(t, void 0, false);
  };
};
d();
var Ht = class extends O {
  className;
  constructor(t) {
    super(t);
  }
  withClassName = (t) => (this.className = t, this);
  validateClassName = () => {
    M(this.className) || this.addError("className must be set - set with .withClassName(className)");
  };
  validate = () => {
    this.validateClassName();
  };
  do = () => (this.validate(), this.errors.length > 0 ? Promise.reject(new Error("invalid usage: " + this.errors.join(", "))) : this.client.get("/schema").then((r) => r.classes ? r.classes.some((a) => a.class === this.className) : false));
};
d();
var st = class extends O {
  className;
  constructor(t) {
    super(t);
  }
  withClassName = (t) => (this.className = t, this);
  validateClassName = () => {
    M(this.className) || this.addError("className must be set - set with .withClassName(className)");
  };
  validate = () => {
    this.validateClassName();
  };
  do = () => {
    if (this.validate(), this.errors.length > 0) return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
    let t = `/schema/${this.className}`;
    return this.client.get(t);
  };
};
d();
d();
var Qt = class extends O {
  constructor(t) {
    super(t);
  }
  validate() {
  }
  do = () => this.errors.length > 0 ? Promise.reject(new Error("invalid usage: " + this.errors.join(", "))) : this.client.get("/schema");
};
d();
var Kt = class extends O {
  className;
  property;
  constructor(t) {
    super(t);
  }
  withClassName = (t) => (this.className = t, this);
  withProperty = (t) => (this.property = t, this);
  validateClassName = () => {
    M(this.className) || this.addError("className must be set - set with .withClassName(className)");
  };
  validateProperty = () => {
    (this.property == null || this.property == null) && this.addError("property must be set - set with .withProperty(property)");
  };
  validate = () => {
    this.validateClassName(), this.validateProperty();
  };
  do = () => {
    if (this.validate(), this.errors.length > 0) return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
    let t = `/schema/${this.className}/properties`;
    return this.client.postReturn(t, this.property);
  };
};
d();
var xr = class extends O {
  className;
  shardName;
  status;
  constructor(t) {
    super(t);
  }
  withClassName = (t) => (this.className = t, this);
  validateClassName = () => {
    M(this.className) || this.addError("className must be set - set with .withClassName(className)");
  };
  withShardName = (t) => (this.shardName = t, this);
  validateShardName = () => {
    M(this.shardName) || this.addError("shardName must be set - set with .withShardName(shardName)");
  };
  withStatus = (t) => (this.status = t, this);
  validateStatus = () => {
    M(this.status) || this.addError("status must be set - set with .withStatus(status)");
  };
  validate = () => {
    this.validateClassName(), this.validateShardName(), this.validateStatus();
  };
  do = () => (this.validate(), this.errors.length > 0 ? Promise.reject(new Error(`invalid usage: ${this.errors.join(", ")}`)) : pu(this.client, this.className, this.shardName, this.status));
};
function pu(e24, t, r, a) {
  let i = `/schema/${t}/shards/${r}`;
  return e24.put(i, { status: a }, true);
}
d();
var tn = class extends O {
  className;
  tenant;
  constructor(t) {
    super(t);
  }
  withClassName = (t) => (this.className = t, this);
  withTenant = (t) => (this.tenant = t, this);
  validateClassName = () => {
    M(this.className) || this.addError("className must be set - set with .withClassName(className)");
  };
  validate = () => {
    this.validateClassName();
  };
  do = () => (this.validate(), this.errors.length > 0 ? Promise.reject(new Error(`invalid usage: ${this.errors.join(", ")}`)) : gu(this.client, this.className, this.tenant));
};
function gu(e24, t, r) {
  let a = `/schema/${t}/shards${r ? `?tenant=${r}` : ""}`;
  return e24.get(a);
}
d();
d();
var Cr = class extends O {
  className;
  tenants;
  constructor(t, r, a) {
    super(t), this.className = r, this.tenants = a;
  }
  validate = () => {
  };
  do = () => this.client.postReturn(`/schema/${this.className}/tenants`, this.tenants);
};
d();
var Pr = class extends O {
  className;
  tenants;
  constructor(t, r, a) {
    super(t), this.className = r, this.tenants = a;
  }
  validate = () => {
  };
  do = () => this.client.delete(`/schema/${this.className}/tenants`, this.tenants, false);
};
d();
d();
d();
var Rr = class extends O {
  className;
  tenants;
  constructor(t, r, a) {
    super(t), this.className = r, this.tenants = a;
  }
  validate = () => {
  };
  do = () => this.client.put(`/schema/${this.className}/tenants`, this.tenants);
};
d();
var ua = class extends O {
  className;
  vectors;
  constructor(t) {
    super(t);
  }
  withClassName = (t) => (this.className = t, this);
  withVectors = (t) => (this.vectors = t, this);
  validateClassName = () => {
    M(this.className) || this.addError("className must be set - set with .withClassName(className)");
  };
  validate = () => {
    this.validateClassName();
  };
  do = () => (this.validate(), this.errors.length > 0 ? Promise.reject(new Error("invalid usage: " + this.errors.join(", "))) : new st(this.client).withClassName(this.className).do().then(async (t) => {
    t.vectorConfig === void 0 && (t.vectorConfig = {});
    for (let [a, i] of Object.entries(this.vectors)) t.vectorConfig[a] === void 0 && (t.vectorConfig[a] = { ...i });
    let r = `/schema/${this.className}`;
    await this.client.put(r, t);
  }));
};
d();
d();
var se = class {
  static isPQCreate(t) {
    return t?.type === "pq";
  }
  static isPQUpdate(t) {
    return t?.type === "pq";
  }
  static isBQCreate(t) {
    return t?.type === "bq";
  }
  static isBQUpdate(t) {
    return t?.type === "bq";
  }
  static isSQCreate(t) {
    return t?.type === "sq";
  }
  static isSQUpdate(t) {
    return t?.type === "sq";
  }
  static isRQCreate(t) {
    return t?.type === "rq";
  }
  static isRQUpdate(t) {
    return t?.type === "rq";
  }
  static isUncompressedCreate(t) {
    return t?.type === "none";
  }
};
var Gt = class {
  static isHNSW(t) {
    return t?.type === "hnsw";
  }
  static isFlat(t) {
    return t?.type === "flat";
  }
  static isHFresh(t) {
    return t?.type === "hfresh";
  }
  static isDynamic(t) {
    return t?.type === "dynamic";
  }
};
var za = class {
  static isMuvera(t) {
    return t?.type === "muvera";
  }
};
function $a(e24, t) {
  return e24 !== void 0 ? e24 : t;
}
var Ha = class e {
  static schema(t, r) {
    if (r === void 0) return t;
    if (r.description !== void 0 && (t.description = r.description), r.propertyDescriptions !== void 0 && (t.properties = e.properties(t.properties, r.propertyDescriptions)), r.generative !== void 0 && (t.moduleConfig = e.generative(t.moduleConfig, r.generative)), r.invertedIndex !== void 0 && (t.invertedIndexConfig = e.invertedIndex(t.invertedIndexConfig, r.invertedIndex)), r.multiTenancy !== void 0 && (t.multiTenancyConfig = e.multiTenancy(t.multiTenancyConfig, r.multiTenancy)), r.objectTTL !== void 0 && (t.objectTtlConfig = e.objectTTL(t.objectTtlConfig, r.objectTTL)), r.replication !== void 0 && (t.replicationConfig = e.replication(t.replicationConfig, r.replication)), r.reranker !== void 0 && (t.moduleConfig = e.reranker(t.moduleConfig, r.reranker)), r.vectorizers !== void 0) if (Array.isArray(r.vectorizers)) t.vectorConfig = e.vectors(t.vectorConfig, r.vectorizers);
    else if (t.vectorConfig !== void 0) {
      let a = { ...r.vectorizers, name: "default" };
      t.vectorConfig = e.vectors(t.vectorConfig, [a]);
    } else t.vectorIndexConfig = r.vectorizers?.vectorIndex ? r.vectorizers.vectorIndex.name === "hnsw" ? e.hnsw(t.vectorIndexConfig, r.vectorizers.vectorIndex.config) : r.vectorizers.vectorIndex.name === "hfresh" ? e.hfresh(t.vectorIndexConfig, r.vectorizers.vectorIndex.config) : r.vectorizers.vectorIndex.name === "dynamic" ? e.dynamic(t.vectorIndexConfig, r.vectorizers.vectorIndex.config) : e.flat(t.vectorIndexConfig, r.vectorizers.vectorIndex.config) : t.vectorIndexConfig;
    return t;
  }
  static properties(t, r) {
    if (t === void 0) throw Error("Properties are missing from the class schema.");
    return t.length === 0 ? t : t.map((a) => ({ ...a, description: r[a.name] ?? a.description }));
  }
  static generative(t, r) {
    if (t === void 0) throw Error("Module config is missing from the class schema.");
    if (r === void 0) return t;
    let a = r.name === "generative-azure-openai" ? "generative-openai" : r.name, i = Object.keys(t).find((o) => o.startsWith("generative-") && o !== r.name);
    i !== void 0 && delete t[i];
    let n = t[a] || {};
    return t[a] = { ...n, ...r.config }, t;
  }
  static reranker(t, r) {
    if (t === void 0) throw Error("Module config is missing from the class schema.");
    if (r === void 0) return t;
    let a = t[r.name], i = Object.keys(t).find((n) => n.startsWith("reranker-") && n !== r.name);
    return i !== void 0 && delete t[i], t[r.name] = { ...a, ...r.config }, t;
  }
  static invertedIndex(t, r) {
    if (t === void 0) throw Error("Inverted index config is missing from the class schema.");
    if (r === void 0) return t;
    let { bm25: a, stopwords: i, ...n } = r, o = { ...t, ...n };
    return a !== void 0 && (o.bm25 = { ...t.bm25, ...a }), i !== void 0 && (o.stopwords = { ...t.stopwords, ...i }), o;
  }
  static objectTTL(t, r) {
    return t === void 0 ? r : { enabled: r.enabled ?? t.enabled, deleteOn: r.deleteOn ?? t.deleteOn, defaultTtl: r.defaultTTLSeconds ?? t.defaultTtl, filterExpiredObjects: r.filterExpiredObjects ?? t.filterExpiredObjects };
  }
  static multiTenancy(t, r) {
    if (t === void 0) throw Error("Multi-tenancy config is missing from the class schema.");
    return { ...t, ...r };
  }
  static replication(t, r) {
    if (t === void 0) throw Error("Replication config is missing from the class schema.");
    return { ...t, ...r };
  }
  static vectors(t, r) {
    if (t === void 0) throw Error("Vector index config is missing from the class schema.");
    return r.forEach((a) => {
      let i = t[a.name];
      i !== void 0 && (t[a.name].vectorIndexConfig = a.vectorIndex ? a.vectorIndex.name === "hnsw" ? e.hnsw(i.vectorIndexConfig, a.vectorIndex.config) : a.vectorIndex.name === "hfresh" ? e.hfresh(i.vectorIndexConfig, a.vectorIndex.config) : a.vectorIndex.name === "dynamic" ? e.dynamic(i.vectorIndexConfig, a.vectorIndex.config) : e.flat(i.vectorIndexConfig, a.vectorIndex.config) : i.vectorIndexConfig);
    }), t;
  }
  static flat(t, r) {
    if (se.isPQUpdate(r.quantizer) && (t?.bq).enabled || se.isBQUpdate(r.quantizer) && (t?.pq).enabled) throw Error("Cannot update the quantizer type of an enabled vector index.");
    let { quantizer: a, ...i } = r, n = { ...t, ...i };
    if (se.isBQUpdate(a)) {
      let { type: o, ...s } = a;
      n.bq = { ...t.bq, ...s, enabled: true };
    }
    return n;
  }
  static hfresh(t, r) {
    return { ...t, ...r };
  }
  static dynamic(t, r) {
    if (!t) return r;
    let { hnsw: a, flat: i, ...n } = r, o = { ...t, ...n };
    return a && (o.hnsw = e.hnsw(t.hnsw, a)), i && (o.flat = e.flat(t.flat, i)), o;
  }
  static hnsw(t, r) {
    let a = (s) => ["pq", "bq", "sq", "rq"].some((u) => u !== s && t?.[u]?.enabled);
    if (se.isBQUpdate(r.quantizer) && a("bq") || se.isPQUpdate(r.quantizer) && a("pq") || se.isSQUpdate(r.quantizer) && a("sq") || se.isRQUpdate(r.quantizer) && a("rq")) throw new F("Cannot update the quantizer type of an enabled vector index.");
    let { quantizer: i, ...n } = r, o = { ...t, ...n };
    if (se.isBQUpdate(i)) {
      let { type: s, ...u } = i;
      o.bq = { ...t.bq, ...u, enabled: true };
    }
    if (se.isPQUpdate(i)) {
      let { type: s, ...u } = i;
      o.pq = { ...t.pq, ...u, enabled: true };
    }
    if (se.isSQUpdate(i)) {
      let { type: s, ...u } = i;
      o.sq = { ...t.sq, ...u, enabled: true };
    }
    if (se.isRQUpdate(i)) {
      let { type: s, ...u } = i;
      o.rq = { ...t.rq, ...u, enabled: true };
    }
    return o;
  }
};
d();
var Io = (e24) => {
  if (e24 == null) return;
  let t = { stopwordPreset: e24.stopwordPreset };
  return typeof e24.asciiFold == "boolean" ? t.asciiFold = e24.asciiFold : typeof e24.asciiFold == "object" && (t.asciiFold = true, t.asciiFoldIgnore = e24.asciiFold.ignore), t;
};
var kg = (e24) => {
  if (e24 == null) return;
  let t = {};
  return e24.stopwordPreset != null && (t.stopwordPreset = e24.stopwordPreset), e24.asciiFoldIgnore && e24.asciiFoldIgnore.length > 0 ? t.asciiFold = { ignore: e24.asciiFoldIgnore } : typeof e24.asciiFold == "boolean" && (t.asciiFold = e24.asciiFold), Object.keys(t).length === 0 ? void 0 : t;
};
var So = class {
  static isSingleTarget(t) {
    return t.targetCollection !== void 0;
  }
  static isMultiTarget(t) {
    return t.targetCollections !== void 0;
  }
};
var Qa = (e24, t) => {
  let { dataType: r, nestedProperties: a, skipVectorization: i, vectorizePropertyName: n, textAnalyzer: o, ...s } = e24, u = {};
  return t?.forEach((c) => {
    u[c] = { skip: i === void 0 ? false : i, vectorizePropertyName: n === void 0 ? true : n };
  }), { ...s, dataType: [r], nestedProperties: a ? a.map((c) => mu(c)) : void 0, moduleConfig: Object.keys(u).length > 0 ? u : void 0, textAnalyzer: Io(o) };
};
var mu = (e24) => {
  let { dataType: t, nestedProperties: r, ...a } = e24;
  return { ...a, dataType: [t], nestedProperties: r ? r.map(mu) : void 0 };
};
var Ka = (e24) => {
  if (So.isSingleTarget(e24)) {
    let { targetCollection: t, ...r } = e24;
    return { ...r, dataType: [t] };
  } else {
    let { targetCollections: t, ...r } = e24;
    return { ...r, dataType: t };
  }
};
var da = (e24) => ({ name: Ee._name(e24.class), description: e24.description, generative: Ee.generative(e24.moduleConfig), invertedIndex: Ee.invertedIndex(e24.invertedIndexConfig), multiTenancy: Ee.multiTenancy(e24.multiTenancyConfig), objectTTL: Ee.objectTTL(e24.objectTtlConfig), properties: Ee.properties(e24.properties), references: Ee.references(e24.properties), replication: Ee.replication(e24.replicationConfig), reranker: Ee.reranker(e24.moduleConfig), sharding: Ee.sharding(e24.shardingConfig), vectorizers: Ee.vectorizer(e24) });
var ko = (e24) => {
  if (e24.config === void 0) return;
  if (Gt.isDynamic(e24.config)) {
    let { hnsw: n, flat: o, ...s } = e24.config;
    return { ...s, hnsw: ko({ config: n }), flat: ko({ config: o }) };
  }
  let t;
  Gt.isHNSW(e24.config) && e24.config.multiVector !== void 0 && (t = { aggregation: e24.config.multiVector.aggregation, enabled: true }, e24.config.multiVector.encoding !== void 0 && za.isMuvera(e24.config.multiVector.encoding) && (t.muvera = { enabled: true, ksim: e24.config.multiVector.encoding.ksim, dprojections: e24.config.multiVector.encoding.dprojections, repetitions: e24.config.multiVector.encoding.repetitions }));
  let { quantizer: r, ...a } = e24.config, i = { ...a, multivector: t };
  if (r === void 0) return i;
  if (se.isBQCreate(r)) {
    let { type: n, ...o } = r;
    return { ...i, bq: { ...o, enabled: true } };
  }
  if (se.isPQCreate(r)) {
    let { type: n, ...o } = r;
    return { ...i, pq: { ...o, enabled: true } };
  }
  if (se.isSQCreate(r)) {
    let { type: n, ...o } = r;
    return { ...i, sq: { ...o, enabled: true } };
  }
  if (se.isRQCreate(r)) {
    let { type: n, ...o } = r;
    return { ...i, rq: { ...o, enabled: true } };
  }
  if (se.isUncompressedCreate(r)) return { ...i, skipDefaultQuantization: true };
};
var Ig = (e24) => {
  if (e24 === void 0) return {};
  let { vectorizeCollectionName: t, ...r } = e24;
  return { ...r, vectorizeClassName: t };
};
var Ya = (e24) => {
  let t = [], r = {};
  return (Array.isArray(e24) ? e24 : [{ ...e24, name: e24.name || "default" }]).forEach((i) => {
    let n = { vectorizer: {} };
    i.vectorIndex && (n.vectorIndexConfig = ko(i.vectorIndex), n.vectorIndexType = i.vectorIndex.name);
    let o = i.vectorizer.name === "text2vec-azure-openai" ? "text2vec-openai" : i.vectorizer.name;
    if (t = [...t, o], n.vectorizer[o] = { properties: i.properties, ...Ig(i.vectorizer.config) }, i.name === void 0) throw new F("vectorName is required for each vectorizer when specifying more than one vectorizer");
    r[i.name] = n;
  }), { vectorsConfig: r, vectorizers: t };
};
function ce(e24) {
  return e24 != null;
}
function G(e24) {
  return e24 != null;
}
var Ee = class e2 {
  static _name(t) {
    if (t === void 0) throw new b("Collection name was not returned by Weaviate");
    return t;
  }
  static bm25(t) {
    if (t === void 0) throw new b("BM25 was not returned by Weaviate");
    if (!ce(t.b)) throw new b("BM25 b was not returned by Weaviate");
    if (!ce(t.k1)) throw new b("BM25 k1 was not returned by Weaviate");
    return { b: t.b, k1: t.k1 };
  }
  static stopwords(t) {
    if (t === void 0) throw new b("Stopwords were not returned by Weaviate");
    return { additions: t.additions ? t.additions : [], preset: t.preset ? t.preset : "none", removals: t.removals ? t.removals : [] };
  }
  static generative(t) {
    if (!ce(t)) return;
    let r = Object.keys(t).find((a) => a.includes("generative"));
    if (r !== void 0) {
      if (!r) throw new b("Generative config was not returned by Weaviate");
      return { name: r, config: t[r] };
    }
  }
  static reranker(t) {
    if (!ce(t)) return;
    let r = Object.keys(t).find((a) => a.includes("reranker"));
    if (r !== void 0) return { name: r, config: t[r] };
  }
  static namedVectors(t) {
    if (!ce(t)) throw new b("Vector config was not returned by Weaviate");
    let r = {};
    return Object.keys(t).forEach((a) => {
      let i = t[a].vectorizer;
      if (!ce(i)) throw new b(`Vectorizer was not returned by Weaviate for ${a} named vector`);
      let n = Object.keys(i);
      if (n.length !== 1) throw new b(`Expected exactly one vectorizer for ${a} named vector, got ${n.length}`);
      let o = n[0], { properties: s, ...u } = i[o] || {}, { vectorizeClassName: c, ...f2 } = u || {};
      r[a] = { vectorizer: { name: o, config: { vectorizeCollectionName: c, ...f2 } }, properties: s, indexConfig: e2.vectorIndex(t[a].vectorIndexConfig, t[a].vectorIndexType), indexType: e2.vectorIndexType(t[a].vectorIndexType) };
    }), r;
  }
  static vectorizer(t) {
    if (!ce(t)) throw new b("Schema was not returned by Weaviate");
    if (ce(t.vectorConfig)) return e2.namedVectors(t.vectorConfig);
    if (!ce(t.vectorizer)) throw new b("Vectorizer was not returned by Weaviate");
    return { default: { vectorizer: t.vectorizer === "none" ? { name: "none", config: void 0 } : { name: t.vectorizer, config: t.moduleConfig ? { ...t.moduleConfig[t.vectorizer], vectorizeCollectionName: t.moduleConfig[t.vectorizer].vectorizeClassName } : void 0 }, indexConfig: e2.vectorIndex(t.vectorIndexConfig, t.vectorIndexType), indexType: e2.vectorIndexType(t.vectorIndexType) } };
  }
  static invertedIndex(t) {
    if (t === void 0) throw new b("Inverted index was not returned by Weaviate");
    if (!ce(t.cleanupIntervalSeconds)) throw new b("Inverted index cleanup interval was not returned by Weaviate");
    return { bm25: e2.bm25(t.bm25), cleanupIntervalSeconds: t.cleanupIntervalSeconds, stopwords: e2.stopwords(t.stopwords), stopwordPresets: t.stopwordPresets, indexNullState: t.indexNullState ? t.indexNullState : false, indexPropertyLength: t.indexPropertyLength ? t.indexPropertyLength : false, indexTimestamps: t.indexTimestamps ? t.indexTimestamps : false };
  }
  static objectTTL(t) {
    return t === void 0 ? { enabled: false } : { ...t, enabled: t.enabled ?? false, deleteOn: t.deleteOn == "_creationTimeUnix" ? "creationTime" : t.deleteOn == "_lastUpdateTimeUnix" ? "updateTime" : t.deleteOn, defaultTTLSeconds: t.defaultTtl, filterExpiredObjects: t.filterExpiredObjects };
  }
  static multiTenancy(t) {
    return t === void 0 ? { autoTenantActivation: false, autoTenantCreation: false, enabled: false } : { autoTenantActivation: t.autoTenantActivation ? t.autoTenantActivation : false, autoTenantCreation: t.autoTenantCreation ? t.autoTenantCreation : false, enabled: t.enabled ? t.enabled : false };
  }
  static replication(t) {
    if (t === void 0) throw new b("Replication was not returned by Weaviate");
    if (!ce(t.factor)) throw new b("Replication factor was not returned by Weaviate");
    return { factor: t.factor, asyncEnabled: t.asyncEnabled ? t.asyncEnabled : false, deletionStrategy: t.deletionStrategy ? t.deletionStrategy : "NoAutomatedResolution" };
  }
  static sharding(t) {
    if (t === void 0) throw new b("Sharding was not returned by Weaviate");
    if (!G(t.virtualPerPhysical)) throw new b("Sharding enabled was not returned by Weaviate");
    if (!G(t.desiredCount)) throw new b("Sharding desired count was not returned by Weaviate");
    if (!G(t.actualCount)) throw new b("Sharding actual count was not returned by Weaviate");
    if (!G(t.desiredVirtualCount)) throw new b("Sharding desired virtual count was not returned by Weaviate");
    if (!G(t.actualVirtualCount)) throw new b("Sharding actual virtual count was not returned by Weaviate");
    if (!G(t.key)) throw new b("Sharding key was not returned by Weaviate");
    if (!G(t.strategy)) throw new b("Sharding strategy was not returned by Weaviate");
    if (!G(t.function)) throw new b("Sharding function was not returned by Weaviate");
    return { virtualPerPhysical: t.virtualPerPhysical, desiredCount: t.desiredCount, actualCount: t.actualCount, desiredVirtualCount: t.desiredVirtualCount, actualVirtualCount: t.actualVirtualCount, key: t.key, strategy: t.strategy, function: t.function };
  }
  static pqEncoder(t) {
    if (t === void 0) throw new b("PQ encoder was not returned by Weaviate");
    if (!G(t.type)) throw new b("PQ encoder name was not returned by Weaviate");
    if (!G(t.distribution)) throw new b("PQ encoder distribution was not returned by Weaviate");
    return { type: t.type, distribution: t.distribution };
  }
  static pq(t) {
    if (t === void 0) throw new b("PQ was not returned by Weaviate");
    if (!G(t.enabled)) throw new b("PQ enabled was not returned by Weaviate");
    if (t.enabled !== false) {
      if (!G(t.bitCompression)) throw new b("PQ bit compression was not returned by Weaviate");
      if (!G(t.segments)) throw new b("PQ segments was not returned by Weaviate");
      if (!G(t.trainingLimit)) throw new b("PQ training limit was not returned by Weaviate");
      if (!G(t.centroids)) throw new b("PQ centroids was not returned by Weaviate");
      if (!G(t.encoder)) throw new b("PQ encoder was not returned by Weaviate");
      return { bitCompression: t.bitCompression, segments: t.segments, centroids: t.centroids, trainingLimit: t.trainingLimit, encoder: e2.pqEncoder(t.encoder), type: "pq" };
    }
  }
  static vectorIndexHNSW(t) {
    if (t === void 0) throw new b("Vector index was not returned by Weaviate");
    if (!G(t.cleanupIntervalSeconds)) throw new b("Vector index cleanup interval was not returned by Weaviate");
    if (!G(t.distance)) throw new b("Vector index distance was not returned by Weaviate");
    if (!G(t.dynamicEfMin)) throw new b("Vector index dynamic ef min was not returned by Weaviate");
    if (!G(t.dynamicEfMax)) throw new b("Vector index dynamic ef max was not returned by Weaviate");
    if (!G(t.dynamicEfFactor)) throw new b("Vector index dynamic ef factor was not returned by Weaviate");
    if (!G(t.ef)) throw new b("Vector index ef was not returned by Weaviate");
    if (!G(t.efConstruction)) throw new b("Vector index ef construction was not returned by Weaviate");
    if (!G(t.flatSearchCutoff)) throw new b("Vector index flat search cut off was not returned by Weaviate");
    if (!G(t.maxConnections)) throw new b("Vector index max connections was not returned by Weaviate");
    if (!G(t.skip)) throw new b("Vector index skip was not returned by Weaviate");
    if (!G(t.vectorCacheMaxObjects)) throw new b("Vector index vector cache max objects was not returned by Weaviate");
    let r;
    return G(t.pq) && t.pq.enabled === true ? r = e2.pq(t.pq) : G(t.bq) && t.bq.enabled === true ? r = e2.bq(t.bq) : G(t.rq) && t.rq.enabled === true ? r = e2.rq(t.rq) : G(t.sq) && t.sq.enabled === true ? r = e2.sq(t.sq) : r = void 0, { cleanupIntervalSeconds: t.cleanupIntervalSeconds, distance: t.distance, dynamicEfMin: t.dynamicEfMin, dynamicEfMax: t.dynamicEfMax, dynamicEfFactor: t.dynamicEfFactor, ef: t.ef, efConstruction: t.efConstruction, filterStrategy: G(t.filterStrategy) ? t.filterStrategy : "sweeping", flatSearchCutoff: t.flatSearchCutoff, maxConnections: t.maxConnections, multiVector: G(t.multivector) ? e2.multiVector(t.multivector) : void 0, quantizer: r, skip: t.skip, vectorCacheMaxObjects: t.vectorCacheMaxObjects, type: "hnsw" };
  }
  static multiVector(t) {
    if (!G(t.enabled)) throw new b("Multi vector enabled was not returned by Weaviate");
    if (t.enabled === false) return;
    if (!G(t.aggregation)) throw new b("Multi vector aggregation was not returned by Weaviate");
    let r;
    return G(t.muvera) && (r = t.muvera.enabled ? { type: "muvera", ...t.muvera } : void 0), { aggregation: t.aggregation, encoding: r };
  }
  static bq(t) {
    if (t === void 0) throw new b("BQ was not returned by Weaviate");
    if (!G(t.enabled)) throw new b("BQ enabled was not returned by Weaviate");
    if (t.enabled === false) return;
    let r = t.cache === void 0 ? false : t.cache, a = t.rescoreLimit === void 0 ? 1e3 : t.rescoreLimit;
    return { cache: r, rescoreLimit: a, type: "bq" };
  }
  static rq(t) {
    if (t === void 0) throw new b("RQ was not returned by Weaviate");
    if (!G(t.enabled)) throw new b("RQ enabled was not returned by Weaviate");
    if (t.enabled === false) return;
    let r = t.bits === void 0 ? 6 : t.bits, a = t.rescoreLimit === void 0 ? 20 : t.rescoreLimit;
    return { bits: r, rescoreLimit: a, type: "rq" };
  }
  static sq(t) {
    if (t === void 0) throw new b("SQ was not returned by Weaviate");
    if (!G(t.enabled)) throw new b("SQ enabled was not returned by Weaviate");
    if (t.enabled === false) return;
    let r = t.rescoreLimit === void 0 ? 1e3 : t.rescoreLimit, a = t.trainingLimit === void 0 ? 1e5 : t.trainingLimit;
    return { rescoreLimit: r, trainingLimit: a, type: "sq" };
  }
  static vectorIndexHFresh(t) {
    if (t === void 0) throw new b("Vector index was not returned by Weaviate");
    if (!G(t.distance)) throw new b("Vector index distance was not returned by Weaviate");
    if (!G(t.maxPostingSizeKB)) throw new b("Vector index maxPostingSizeKb was not returned by Weaviate");
    if (!G(t.searchProbe)) throw new b("Vector index searchProbe was not returned by Weaviate");
    if (!G(t.replicas)) throw new b("Vector index replicas was not returned by Weaviate");
    if (!G(t.rq)) throw new b("Vector index rq was not returned by Weaviate");
    return { distance: t.distance, maxPostingSizeKb: t.maxPostingSizeKB, searchProbe: t.searchProbe, replicas: t.replicas, quantizer: e2.rq(t.rq), type: "hfresh" };
  }
  static vectorIndexFlat(t) {
    if (t === void 0) throw new b("Vector index was not returned by Weaviate");
    if (!G(t.vectorCacheMaxObjects)) throw new b("Vector index vector cache max objects was not returned by Weaviate");
    if (!G(t.distance)) throw new b("Vector index distance was not returned by Weaviate");
    let r;
    return G(t.bq) && t.bq.enabled === true ? r = e2.bq(t.bq) : G(t.rq) && t.rq.enabled === true ? r = e2.rq(t.rq) : r = void 0, { vectorCacheMaxObjects: t.vectorCacheMaxObjects, distance: t.distance, quantizer: r, type: "flat" };
  }
  static vectorIndexDynamic(t) {
    if (t === void 0) throw new b("Vector index was not returned by Weaviate");
    if (!G(t.threshold)) throw new b("Vector index threshold was not returned by Weaviate");
    if (!G(t.distance)) throw new b("Vector index distance was not returned by Weaviate");
    if (!G(t.hnsw)) throw new b("Vector index hnsw was not returned by Weaviate");
    if (!G(t.flat)) throw new b("Vector index flat was not returned by Weaviate");
    return { distance: t.distance, hnsw: e2.vectorIndexHNSW(t.hnsw), flat: e2.vectorIndexFlat(t.flat), threshold: t.threshold, type: "dynamic" };
  }
  static vectorIndex(t, r) {
    return r === "hnsw" ? e2.vectorIndexHNSW(t) : r === "hfresh" ? e2.vectorIndexHFresh(t) : r === "flat" ? e2.vectorIndexFlat(t) : r === "dynamic" ? e2.vectorIndexDynamic(t) : t;
  }
  static vectorIndexType(t) {
    if (!ce(t)) throw new b("Vector index type was not returned by Weaviate");
    return t;
  }
  static properties(t) {
    if (t === void 0) throw new b("Properties were not returned by Weaviate");
    return t === null ? [] : t.filter((r) => {
      if (!ce(r.dataType)) throw new b("Property data type was not returned by Weaviate");
      return r.dataType[0][0].toLowerCase() === r.dataType[0][0];
    }).map((r) => {
      if (!ce(r.name)) throw new b("Property name was not returned by Weaviate");
      if (!ce(r.dataType)) throw new b("Property data type was not returned by Weaviate");
      return { name: r.name, dataType: r.dataType[0], description: r.description, indexFilterable: r.indexFilterable ? r.indexFilterable : false, indexInverted: r.indexInverted ? r.indexInverted : false, indexRangeFilters: r.indexRangeFilters ? r.indexRangeFilters : false, indexSearchable: r.indexSearchable ? r.indexSearchable : false, vectorizerConfig: r.moduleConfig ? "none" in r.moduleConfig ? void 0 : r.moduleConfig : void 0, nestedProperties: r.nestedProperties ? e2.properties(r.nestedProperties) : void 0, tokenization: r.tokenization ? r.tokenization : "none", textAnalyzer: kg(r.textAnalyzer) };
    });
  }
  static references(t) {
    if (t === void 0) throw new b("Properties were not returned by Weaviate");
    return t === null ? [] : t.filter((r) => {
      if (!ce(r.dataType)) throw new b("Reference data type was not returned by Weaviate");
      return r.dataType[0][0].toLowerCase() !== r.dataType[0][0];
    }).map((r) => {
      if (!ce(r.name)) throw new b("Reference name was not returned by Weaviate");
      if (!ce(r.dataType)) throw new b("Reference data type was not returned by Weaviate");
      return { name: r.name, description: r.description, targetCollections: r.dataType };
    });
  }
};
var _g = (e24, t, r, a) => {
  let i = new st(e24).withClassName(t).do;
  return { addProperty: (n) => new Kt(e24).withClassName(t).withProperty(Qa(n, [])).do().then(() => {
  }), addReference: (n) => new Kt(e24).withClassName(t).withProperty(Ka(n)).do().then(() => {
  }), addVector: async (n) => {
    let { vectorsConfig: o } = Ya(n), { supports: s } = await r.supportsServerSideDefaultVectorIndexType();
    if (!s && o) for (let u of Object.values(o)) u.vectorIndexType || (u.vectorIndexType = "hnsw");
    return new ua(e24).withClassName(t).withVectors(o).do();
  }, get: () => i().then(da), getShards: () => {
    let n = new tn(e24).withClassName(t);
    return a && (n = n.withTenant(a)), n.do().then((o) => o.map((s) => {
      if (s.name === void 0) throw new b("Shard name was not returned by Weaviate");
      if (s.status === void 0) throw new b("Shard status was not returned by Weaviate");
      if (s.vectorQueueSize === void 0) throw new b("Shard vector queue size was not returned by Weaviate");
      return { name: s.name, status: s.status, vectorQueueSize: s.vectorQueueSize };
    }));
  }, updateShards: async function(n, o) {
    let s;
    return o === void 0 ? s = await this.getShards().then((u) => u.map((c) => c.name)) : typeof o == "string" ? s = [o] : s = o, Promise.all(s.map((u) => new xr(e24).withClassName(t).withShardName(u).withStatus(n).do())).then(() => this.getShards());
  }, update: (n) => i().then((o) => Ha.schema(o, n)).then((o) => new en(e24).withClass(o).do()).then(() => {
  }), dropInvertedIndex: (n, o) => e24.delete(`/schema/${t}/properties/${n}/index/${o}`, null) };
};
var hu = _g;
var _o = class {
  static isHNSW(t) {
    return t?.type === "hnsw";
  }
  static isFlat(t) {
    return t?.type === "flat";
  }
  static isDynamic(t) {
    return t?.type === "dynamic";
  }
};
var Bo = class {
  static isPQ(t) {
    return t?.type === "pq";
  }
  static isBQ(t) {
    return t?.type === "bq";
  }
  static isSQ(t) {
    return t?.type === "sq";
  }
  static isRQ(t) {
    return t?.type === "rq";
  }
};
var yu = { quantizer: Bo, vectorIndex: _o };
d();
d();
var Tu = { anthropic(e24) {
  return { name: "generative-anthropic", config: e24 };
}, contextualai: (e24) => ({ name: "generative-contextualai", config: e24 ? { model: e24.model, temperature: e24.temperature, topP: e24.topP, maxNewTokens: e24.maxNewTokens, systemPrompt: e24.systemPrompt, avoidCommentary: e24.avoidCommentary } : void 0 }), anyscale(e24) {
  return { name: "generative-anyscale", config: e24 };
}, aws(e24) {
  return { name: "generative-aws", config: e24 };
}, azureOpenAI: (e24) => ({ name: "generative-openai", config: { deploymentId: e24.deploymentId, resourceName: e24.resourceName, baseURL: e24.baseURL, frequencyPenaltyProperty: e24.frequencyPenalty, maxTokensProperty: e24.maxTokens, presencePenaltyProperty: e24.presencePenalty, temperatureProperty: e24.temperature, topPProperty: e24.topP } }), cohere: (e24) => ({ name: "generative-cohere", config: e24 ? { kProperty: e24.k, maxTokensProperty: e24.maxTokens, model: e24.model, returnLikelihoodsProperty: e24.returnLikelihoods, stopSequencesProperty: e24.stopSequences, temperatureProperty: e24.temperature } : void 0 }), databricks: (e24) => ({ name: "generative-databricks", config: e24 }), friendliai(e24) {
  return { name: "generative-friendliai", config: e24 };
}, mistral(e24) {
  return { name: "generative-mistral", config: e24 };
}, nvidia(e24) {
  return { name: "generative-nvidia", config: e24 };
}, ollama(e24) {
  return { name: "generative-ollama", config: e24 };
}, openAI: (e24) => ({ name: "generative-openai", config: e24 ? { baseURL: e24.baseURL, frequencyPenaltyProperty: e24.frequencyPenalty, maxTokensProperty: e24.maxTokens, model: e24.model, presencePenaltyProperty: e24.presencePenalty, temperatureProperty: e24.temperature, topPProperty: e24.topP } : void 0 }), palm: (e24) => (console.warn("The `generative-palm` module is deprecated. Use `generative-google` instead."), { name: "generative-palm", config: e24 ? { ...e24, ...e24?.modelId || e24?.model ? { modelId: e24?.model ?? e24?.model } : void 0 } : void 0 }), google: (e24) => ({ name: "generative-google", config: e24 ? { ...e24, ...e24?.modelId || e24?.model ? { modelId: e24?.model ?? e24?.model } : void 0 } : void 0 }), xai: (e24) => ({ name: "generative-xai", config: e24 }) };
d();
var vu = { cohere: (e24) => ({ name: "reranker-cohere", config: e24 }), contextualai: (e24) => ({ name: "reranker-contextualai", config: e24 }), jinaai: (e24) => ({ name: "reranker-jinaai", config: e24 }), nvidia: (e24) => ({ name: "reranker-nvidia", config: e24 }), transformers: () => ({ name: "reranker-transformers", config: {} }), voyageAI: (e24) => ({ name: "reranker-voyageai", config: e24 }) };
d();
var Za = (e24) => e24 && typeof e24 == "object" && "name" in e24 && "config" in e24;
var Rt = { flat: (e24) => {
  let { distanceMetric: t, vectorCacheMaxObjects: r, quantizer: a } = e24 || {};
  return { name: "flat", config: { distance: t, vectorCacheMaxObjects: r, quantizer: a, type: "flat" } };
}, hnsw: (e24) => {
  let { distanceMetric: t, ...r } = e24 || {};
  return { name: "hnsw", config: r ? { ...r, distance: t, type: "hnsw" } : void 0 };
}, hfresh: (e24) => {
  let { distanceMetric: t, ...r } = e24 || {};
  return { name: "hfresh", config: r ? { ...r, distance: t, type: "hfresh" } : void 0 };
}, dynamic: (e24) => ({ name: "dynamic", config: e24 ? { distance: e24.distanceMetric, threshold: e24.threshold, hnsw: Za(e24.hnsw) ? e24.hnsw.config : Rt.hnsw(e24.hnsw).config, flat: Za(e24.flat) ? e24.flat.config : Rt.flat(e24.flat).config, type: "dynamic" } : void 0 }), multiVector: { encoding: { muvera: (e24) => ({ ksim: e24?.ksim, dprojections: e24?.dprojections, repetitions: e24?.repetitions, type: "muvera" }) }, multiVector: (e24) => ({ aggregation: e24?.aggregation, encoding: e24?.encoding }) }, quantizer: { none: () => ({ type: "none" }), bq: (e24) => ({ cache: e24?.cache, rescoreLimit: e24?.rescoreLimit, type: "bq" }), rq: (e24) => ({ bits: e24?.bits, rescoreLimit: e24?.rescoreLimit, type: "rq" }), pq: (e24) => ({ bitCompression: e24?.bitCompression, centroids: e24?.centroids, encoder: e24?.encoder ? { distribution: e24.encoder.distribution, type: e24.encoder.type } : void 0, segments: e24?.segments, trainingLimit: e24?.trainingLimit, type: "pq" }), sq: (e24) => ({ rescoreLimit: e24?.rescoreLimit, trainingLimit: e24?.trainingLimit, type: "sq" }) } };
var Xa = { flat: (e24) => ({ name: "flat", config: e24 }), hfresh: (e24) => ({ name: "hfresh", config: e24 }), hnsw: (e24) => ({ name: "hnsw", config: e24 }), dynamic: (e24) => ({ name: "dynamic", config: { threshold: e24.threshold, hnsw: e24.hnsw ? Za(e24.hnsw) ? e24.hnsw.config : Xa.hnsw({ ...e24.hnsw }).config : void 0, flat: e24.flat ? Za(e24.flat) ? e24.flat.config : Xa.flat({ ...e24.flat }).config : void 0, type: "dynamic" } }), quantizer: { bq: (e24) => ({ ...e24, type: "bq" }), rq: (e24) => ({ ...e24, type: "rq" }), pq: (e24) => {
  let { pqEncoderDistribution: t, pqEncoderType: r, ...a } = e24 || {};
  return { ...a, encoder: t || r ? { distribution: t, type: r } : void 0, type: "pq" };
}, sq: (e24) => ({ ...e24, type: "sq" }) } };
d();
var Bg = (e24) => {
  let t = e24?.config?.config;
  if (e24?.encoding || e24?.multiVec) {
    if (t && !Gt.isHNSW(t)) throw new F("Cannot set multi-vector encoding on a non-HNSW index");
    t = t ? { ...t, multiVector: t.multiVector ? { ...t.multiVector, encoding: t.multiVector.encoding ? { ...t.multiVector.encoding, ...e24.encoding } : e24.encoding } : Rt.multiVector.multiVector({ encoding: e24.encoding }) } : { multiVector: Rt.multiVector.multiVector({ encoding: e24.encoding }), type: "hnsw" };
  }
  return e24?.quantizer && (t || (t = Rt.hnsw({ quantizer: e24.quantizer }).config), Gt.isDynamic(t) ? (t.hnsw = t.hnsw ? { ...t.hnsw, quantizer: e24.quantizer } : Rt.hnsw({ quantizer: e24.quantizer }).config, t.flat = t.flat ? { ...t.flat, quantizer: e24.quantizer } : Rt.flat({ quantizer: e24.quantizer }).config) : Gt.isHFresh(t) || (t.quantizer = e24.quantizer)), { name: e24?.config?.name || "hnsw", config: t };
};
var L = (e24, t, r) => {
  let a = t?.vectorIndexConfig !== void 0 || t?.quantizer !== void 0 || t?.encoding !== void 0 || !!r;
  return { name: e24, properties: t?.sourceProperties, vectorIndex: a ? Bg({ config: t?.vectorIndexConfig, encoding: t?.encoding, quantizer: t?.quantizer, multiVec: r }) : void 0, vectorizer: t?.vectorizerConfig ? t.vectorizerConfig : { name: "none", config: void 0 } };
};
var Q = (e24) => typeof e24 == "string" ? { name: e24 } : e24;
var K = (e24, t, r) => (r !== void 0 && r.length > 0 && (e24[t] = r.filter((a) => a.weight !== void 0).map((a) => a.weight), e24[t].length === 0 && delete e24[t]), e24);
var Z = { none: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a } = e24 || {};
  return L(t, { quantizer: r, vectorIndexConfig: a });
}, selfProvided: (e24) => Z.none(e24), img2VecNeural: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24;
  return L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "img2vec-neural", config: i } });
}, multi2VecBind: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24 || {}, n = i.audioFields?.map(Q), o = i.depthFields?.map(Q), s = i.imageFields?.map(Q), u = i.IMUFields?.map(Q), c = i.textFields?.map(Q), f2 = i.thermalFields?.map(Q), y = i.videoFields?.map(Q), P = {};
  return P = K(P, "audioFields", n), P = K(P, "depthFields", o), P = K(P, "imageFields", s), P = K(P, "IMUFields", u), P = K(P, "textFields", c), P = K(P, "thermalFields", f2), P = K(P, "videoFields", y), L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "multi2vec-bind", config: Object.keys(i).length === 0 ? void 0 : { ...i, audioFields: n?.map((V) => V.name), depthFields: o?.map((V) => V.name), imageFields: s?.map((V) => V.name), IMUFields: u?.map((V) => V.name), textFields: c?.map((V) => V.name), thermalFields: f2?.map((V) => V.name), videoFields: y?.map((V) => V.name), weights: Object.keys(P).length === 0 ? void 0 : P } } });
}, multi2VecCohere: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24 || {}, n = i.imageFields?.map(Q), o = i.textFields?.map(Q), s = {};
  return s = K(s, "imageFields", n), s = K(s, "textFields", o), L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "multi2vec-cohere", config: Object.keys(i).length === 0 ? void 0 : { ...i, imageFields: n?.map((u) => u.name), textFields: o?.map((u) => u.name), weights: Object.keys(s).length === 0 ? void 0 : s } } });
}, multi2VecClip: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24 || {}, n = i.imageFields?.map(Q), o = i.textFields?.map(Q), s = {};
  return s = K(s, "imageFields", n), s = K(s, "textFields", o), L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "multi2vec-clip", config: Object.keys(i).length === 0 ? void 0 : { ...i, imageFields: n?.map((u) => u.name), textFields: o?.map((u) => u.name), weights: Object.keys(s).length === 0 ? void 0 : s } } });
}, multi2VecJinaAI: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24 || {}, n = i.imageFields?.map(Q), o = i.textFields?.map(Q), s = {};
  return s = K(s, "imageFields", n), s = K(s, "textFields", o), L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "multi2vec-jinaai", config: Object.keys(i).length === 0 ? void 0 : { ...i, imageFields: n?.map((u) => u.name), textFields: o?.map((u) => u.name), weights: Object.keys(s).length === 0 ? void 0 : s } } });
}, multi2VecPalm: (e24) => {
  console.warn("The `multi2vec-palm` vectorizer is deprecated. Use `multi2vec-google` instead.");
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24, n = i.imageFields?.map(Q), o = i.textFields?.map(Q), s = i.videoFields?.map(Q), u = {};
  return u = K(u, "imageFields", n), u = K(u, "textFields", o), u = K(u, "videoFields", s), L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "multi2vec-palm", config: { ...i, imageFields: n?.map((c) => c.name), textFields: o?.map((c) => c.name), videoFields: s?.map((c) => c.name), weights: Object.keys(u).length === 0 ? void 0 : u } } });
}, multi2VecGoogle: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24, n = i.imageFields?.map(Q), o = i.textFields?.map(Q), s = i.videoFields?.map(Q), u = {};
  return u = K(u, "imageFields", n), u = K(u, "textFields", o), u = K(u, "videoFields", s), L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "multi2vec-google", config: { ...i, imageFields: n?.map((c) => c.name), textFields: o?.map((c) => c.name), videoFields: s?.map((c) => c.name), weights: Object.keys(u).length === 0 ? void 0 : u } } });
}, multi2VecVoyageAI: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24 || {}, n = i.imageFields?.map(Q), o = i.textFields?.map(Q), s = i.videoFields?.map(Q), u = {};
  return u = K(u, "imageFields", n), u = K(u, "textFields", o), u = K(u, "videoFields", s), L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "multi2vec-voyageai", config: Object.keys(i).length === 0 ? void 0 : { ...i, imageFields: n?.map((c) => c.name), textFields: o?.map((c) => c.name), videoFields: s?.map((c) => c.name), weights: Object.keys(u).length === 0 ? void 0 : u } } });
}, ref2VecCentroid: (e24) => {
  let { name: t, quantizer: r, vectorIndexConfig: a, ...i } = e24;
  return L(t, { quantizer: r, vectorIndexConfig: a, vectorizerConfig: { name: "ref2vec-centroid", config: i } });
}, text2VecAWS: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24;
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-aws", config: n } });
}, text2VecAzureOpenAI: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24;
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-azure-openai", config: n } });
}, text2VecCohere: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-cohere", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecContextionary: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-contextionary", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecDatabricks: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24;
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-databricks", config: n } });
}, text2VecGPT4All: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-gpt4all", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecHuggingFace: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-huggingface", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecJinaAI: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-jinaai", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecNvidia: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-nvidia", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecDigitalOcean: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24;
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-digitalocean", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecMistral: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-mistral", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecOpenAI: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-openai", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecOllama: (e24) => {
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-ollama", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecPalm: (e24) => {
  console.warn("The `text2VecPalm` vectorizer is deprecated. Use `text2VecGoogle` instead.");
  let { name: t, quantizer: r, sourceProperties: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: r, sourceProperties: a, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-palm", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecGoogle: (e24) => {
  let { name: t, sourceProperties: r, quantizer: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: a, sourceProperties: r, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-google", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecTransformers: (e24) => {
  let { name: t, sourceProperties: r, quantizer: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: a, sourceProperties: r, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-transformers", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecVoyageAI: (e24) => {
  let { name: t, sourceProperties: r, quantizer: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { quantizer: a, sourceProperties: r, vectorIndexConfig: i, vectorizerConfig: { name: "text2vec-voyageai", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecWeaviate: (e24) => {
  let { name: t, sourceProperties: r, quantizer: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { sourceProperties: r, vectorIndexConfig: i, quantizer: a, vectorizerConfig: { name: "text2vec-weaviate", config: Object.keys(n).length === 0 ? void 0 : n } });
}, text2VecModel2Vec: (e24) => {
  let { name: t, sourceProperties: r, quantizer: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { sourceProperties: r, vectorIndexConfig: i, quantizer: a, vectorizerConfig: { name: "text2vec-model2vec", config: Object.keys(n).length === 0 ? void 0 : n } });
} };
var Gg = { text2VecWeaviate: (e24) => Z.text2VecWeaviate(e24), text2VecContextionary: (e24) => Z.text2VecContextionary(e24), text2VecNvidia: (e24) => Z.text2VecNvidia(e24), text2VecTransformers: (e24) => Z.text2VecTransformers(e24), text2VecVoyageAI: (e24) => Z.text2VecVoyageAI(e24), text2VecGoogle: (e24) => Z.text2VecGoogle(e24 ? { ...e24, ...e24?.modelId || e24?.model ? { modelId: e24?.modelId || e24?.model } : void 0 } : void 0), text2VecOpenAI: (e24) => Z.text2VecOpenAI(e24), text2VecOllama: (e24) => Z.text2VecOllama(e24), text2VecDigitalOcean: (e24) => Z.text2VecDigitalOcean(e24), text2VecMistral: (e24) => Z.text2VecMistral(e24), text2VecJinaAI: (e24) => Z.text2VecJinaAI(e24), text2VecHuggingFace: (e24) => Z.text2VecHuggingFace(e24), text2VecGPT4All: (e24) => Z.text2VecGPT4All(e24), text2VecDatabricks: (e24) => Z.text2VecDatabricks(e24), text2VecCohere: (e24) => Z.text2VecCohere(e24), text2VecAzureOpenAI: (e24) => Z.text2VecAzureOpenAI(e24), text2VecAWS: (e24) => Z.text2VecAWS(e24), multi2VecClip: (e24) => Z.multi2VecClip(e24), multi2VecCohere: (e24) => Z.multi2VecCohere(e24), multi2VecBind: (e24) => Z.multi2VecBind(e24), multi2VecJinaAI: (e24) => Z.multi2VecJinaAI(e24), multi2VecGoogle: (e24) => Z.multi2VecGoogle({ ...e24, modelId: e24.modelId || e24.model }), multi2VecVoyageAI: (e24) => Z.multi2VecVoyageAI(e24) };
var bu = Z;
var xu = (({ text2VecPalm: e24, multi2VecPalm: t, ...r }) => ({ ...r, ...Gg, multi2VecNvidia: (a) => {
  let { name: i, quantizer: n, vectorIndexConfig: o, outputEncoding: s, ...u } = a || {}, c = u.imageFields?.map(Q), f2 = u.textFields?.map(Q), y = {};
  return y = K(y, "imageFields", c), y = K(y, "textFields", f2), L(i, { quantizer: n, vectorIndexConfig: o, vectorizerConfig: { name: "multi2vec-nvidia", config: { ...u, output_encoding: s, imageFields: c?.map((P) => P.name), textFields: f2?.map((P) => P.name), weights: Object.keys(y).length === 0 ? void 0 : y } } });
}, text2VecGoogleAiStudio: (a) => {
  let { name: i, sourceProperties: n, quantizer: o, vectorIndexConfig: s, ...u } = a || {};
  return L(i, { quantizer: o, sourceProperties: n, vectorIndexConfig: s, vectorizerConfig: { name: "text2vec-google", config: { apiEndpoint: "generativelanguage.googleapis.com", ...u } } });
}, text2VecGoogleGemini: (a) => {
  let { name: i, sourceProperties: n, quantizer: o, vectorIndexConfig: s, ...u } = a || {};
  return L(i, { quantizer: o, sourceProperties: n, vectorIndexConfig: s, vectorizerConfig: { name: "text2vec-google", config: { apiEndpoint: "generativelanguage.googleapis.com", ...u } } });
}, multi2VecGoogleGemini: (a) => {
  let { name: i, quantizer: n, vectorIndexConfig: o, ...s } = a || {}, u = s.imageFields?.map(Q), c = s.textFields?.map(Q), f2 = s.videoFields?.map(Q), y = {};
  return y = K(y, "imageFields", u), y = K(y, "textFields", c), y = K(y, "videoFields", f2), L(i, { quantizer: n, vectorIndexConfig: o, vectorizerConfig: { name: "multi2vec-google", config: { ...s, apiEndpoint: "generativelanguage.googleapis.com", imageFields: u?.map((P) => P.name), textFields: c?.map((P) => P.name), videoFields: f2?.map((P) => P.name), weights: Object.keys(y).length === 0 ? void 0 : y } } });
}, text2VecMorph: (a) => {
  let { name: i, quantizer: n, sourceProperties: o, vectorIndexConfig: s, ...u } = a || {};
  return L(i, { quantizer: n, sourceProperties: o, vectorIndexConfig: s, vectorizerConfig: { name: "text2vec-morph", config: Object.keys(u).length === 0 ? void 0 : u } });
} }))(Z);
var Cu = { selfProvided: (e24) => {
  let { name: t, encoding: r, quantizer: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { encoding: r, quantizer: a, vectorIndexConfig: i, vectorizerConfig: { name: "none", config: Object.keys(n).length === 0 ? {} : n } }, true);
}, text2VecJinaAI: (e24) => {
  let { name: t, encoding: r, sourceProperties: a, quantizer: i, vectorIndexConfig: n, ...o } = e24 || {};
  return L(t, { encoding: r, quantizer: i, sourceProperties: a, vectorIndexConfig: n, vectorizerConfig: { name: "text2multivec-jinaai", config: Object.keys(o).length === 0 ? void 0 : o } }, true);
}, multi2VecJinaAI: (e24) => {
  let { name: t, encoding: r, quantizer: a, vectorIndexConfig: i, ...n } = e24 || {};
  return L(t, { encoding: r, quantizer: a, vectorIndexConfig: i, vectorizerConfig: { name: "multi2multivec-jinaai", config: n } });
}, multi2VecWeaviate: (e24) => {
  let { name: t, encoding: r, quantizer: a, vectorIndexConfig: i, imageField: n, ...o } = e24;
  return L(t, { encoding: r, quantizer: a, vectorIndexConfig: i, vectorizerConfig: { name: "multi2multivec-weaviate", config: { ...o, imageFields: [n] } } });
} };
var wg = { INT: "int", INT_ARRAY: "int[]", NUMBER: "number", NUMBER_ARRAY: "number[]", TEXT: "text", TEXT_ARRAY: "text[]", UUID: "uuid", UUID_ARRAY: "uuid[]", BOOLEAN: "boolean", BOOLEAN_ARRAY: "boolean[]", DATE: "date", DATE_ARRAY: "date[]", OBJECT: "object", OBJECT_ARRAY: "object[]", BLOB: "blob", BLOBHASH: "blobHash", GEO_COORDINATES: "geoCoordinates", PHONE_NUMBER: "phoneNumber" };
var Mg = { WORD: "word", LOWERCASE: "lowercase", WHITESPACE: "whitespace", FIELD: "field", TRIGRAM: "trigram", GSE: "gse", KAGOME_KR: "kagome_kr" };
var Eg = { COSINE: "cosine", DOT: "dot", HAMMING: "hamming", L2_SQUARED: "l2-squared" };
var ja = { generative: Tu, multiVectors: Cu, reranker: vu, vectorizer: bu, vectors: xu, vectorIndex: Rt, dataType: wg, tokenization: Mg, vectorDistances: Eg, invertedIndex: (e24) => ({ bm25: e24.bm25b || e24.bm25k1 ? { b: e24.bm25b, k1: e24.bm25k1 } : void 0, cleanupIntervalSeconds: e24.cleanupIntervalSeconds, indexTimestamps: e24.indexTimestamps, indexPropertyLength: e24.indexPropertyLength, indexNullState: e24.indexNullState, stopwords: e24.stopwordsAdditions || e24.stopwordsRemovals || e24.stopwordsPreset ? { preset: e24.stopwordsPreset, additions: e24.stopwordsAdditions, removals: e24.stopwordsRemovals } : void 0, stopwordPresets: e24.stopwordPresets }), objectTTL: { deleteByCreationTime: (e24) => ({ enabled: true, deleteOn: "_creationTimeUnix", ...e24 }), deleteByUpdateTime: (e24) => ({ enabled: true, deleteOn: "_lastUpdateTimeUnix", ...e24 }), deleteByDateProperty: (e24) => ({ enabled: true, deleteOn: e24.property, ...e24 }) }, multiTenancy: (e24) => e24 ? { autoTenantActivation: $a(e24.autoTenantActivation, false), autoTenantCreation: $a(e24.autoTenantCreation, false), enabled: $a(e24.enabled, true) } : { autoTenantActivation: false, autoTenantCreation: false, enabled: true }, replication: (e24) => ({ asyncEnabled: e24.asyncEnabled, deletionStrategy: e24.deletionStrategy, factor: e24.factor, asyncConfig: e24.asyncConfig }), sharding: (e24) => ({ virtualPerPhysical: e24.virtualPerPhysical, desiredCount: e24.desiredCount, desiredVirtualCount: e24.desiredVirtualCount }) };
var Pu = { vectorIndex: Xa, invertedIndex: (e24) => ({ bm25: e24.bm25b || e24.bm25k1 ? { b: e24.bm25b, k1: e24.bm25k1 } : void 0, cleanupIntervalSeconds: e24.cleanupIntervalSeconds, stopwords: e24.stopwordsAdditions || e24.stopwordsRemovals || e24.stopwordsPreset ? { preset: e24.stopwordsPreset, additions: e24.stopwordsAdditions, removals: e24.stopwordsRemovals } : void 0, stopwordPresets: e24.stopwordPresets }), vectorizer: { update: (e24) => ({ name: e24?.name, vectorIndex: e24.vectorIndexConfig }) }, vectors: { update: (e24) => ({ name: e24?.name, vectorIndex: e24.vectorIndexConfig }) }, replication: (e24) => ({ asyncEnabled: e24.asyncEnabled, deletionStrategy: e24.deletionStrategy, factor: e24.factor, asyncConfig: e24.asyncConfig }), multiTenancy: (e24) => ({ autoTenantActivation: e24.autoTenantActivation, autoTenantCreation: e24.autoTenantCreation }), objectTTL: { disable: () => ({ enabled: false }), deleteByCreationTime: (e24) => ({ deleteOn: "_creationTimeUnix", ...e24 }), deleteByUpdateTime: (e24) => ({ deleteOn: "_lastUpdateTimeUnix", ...e24 }), deleteByDateProperty: (e24) => ({ deleteOn: e24.propertyName, ...e24 }) }, generative: ja.generative, reranker: ja.reranker };
d();
d();
d();
var k = ze(Ke());
d();
var Ue = ze(Ke());
function Zo(e24) {
  switch (e24) {
    case 0:
    case "NULL_VALUE":
      return 0;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Xo(e24) {
  switch (e24) {
    case 0:
      return "NULL_VALUE";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function Ho() {
  return { fields: {} };
}
var ye = { encode(e24, t = Ue.default.Writer.create()) {
  return Object.entries(e24.fields).forEach(([r, a]) => {
    a !== void 0 && Yo.encode({ key: r, value: a }, t.uint32(10).fork()).ldelim();
  }), t;
}, decode(e24, t) {
  let r = e24 instanceof Ue.default.Reader ? e24 : Ue.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ho();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        let o = Yo.decode(r, r.uint32());
        o.value !== void 0 && (i.fields[o.key] = o.value);
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { fields: xd(e24.fields) ? Object.entries(e24.fields).reduce((t, [r, a]) => (t[r] = a, t), {}) : {} };
}, toJSON(e24) {
  let t = {};
  if (e24.fields) {
    let r = Object.entries(e24.fields);
    r.length > 0 && (t.fields = {}, r.forEach(([a, i]) => {
      t.fields[a] = i;
    }));
  }
  return t;
}, create(e24) {
  return ye.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ho();
  return t.fields = Object.entries(e24.fields ?? {}).reduce((r, [a, i]) => (i !== void 0 && (r[a] = i), r), {}), t;
}, wrap(e24) {
  let t = Ho();
  if (e24 !== void 0) for (let r of Object.keys(e24)) t.fields[r] = e24[r];
  return t;
}, unwrap(e24) {
  let t = {};
  if (e24.fields) for (let r of Object.keys(e24.fields)) t[r] = e24.fields[r];
  return t;
} };
function bd() {
  return { key: "", value: void 0 };
}
var Yo = { encode(e24, t = Ue.default.Writer.create()) {
  return e24.key !== "" && t.uint32(10).string(e24.key), e24.value !== void 0 && wt.encode(wt.wrap(e24.value), t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof Ue.default.Reader ? e24 : Ue.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = bd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.key = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.value = wt.unwrap(wt.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { key: nn(e24.key) ? globalThis.String(e24.key) : "", value: nn(e24?.value) ? e24.value : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.key !== "" && (t.key = e24.key), e24.value !== void 0 && (t.value = e24.value), t;
}, create(e24) {
  return Yo.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = bd();
  return t.key = e24.key ?? "", t.value = e24.value ?? void 0, t;
} };
function Qo() {
  return { nullValue: void 0, numberValue: void 0, stringValue: void 0, boolValue: void 0, structValue: void 0, listValue: void 0 };
}
var wt = { encode(e24, t = Ue.default.Writer.create()) {
  return e24.nullValue !== void 0 && t.uint32(8).int32(e24.nullValue), e24.numberValue !== void 0 && t.uint32(17).double(e24.numberValue), e24.stringValue !== void 0 && t.uint32(26).string(e24.stringValue), e24.boolValue !== void 0 && t.uint32(32).bool(e24.boolValue), e24.structValue !== void 0 && ye.encode(ye.wrap(e24.structValue), t.uint32(42).fork()).ldelim(), e24.listValue !== void 0 && pa.encode(pa.wrap(e24.listValue), t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof Ue.default.Reader ? e24 : Ue.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Qo();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.nullValue = r.int32();
        continue;
      case 2:
        if (n !== 17) break;
        i.numberValue = r.double();
        continue;
      case 3:
        if (n !== 26) break;
        i.stringValue = r.string();
        continue;
      case 4:
        if (n !== 32) break;
        i.boolValue = r.bool();
        continue;
      case 5:
        if (n !== 42) break;
        i.structValue = ye.unwrap(ye.decode(r, r.uint32()));
        continue;
      case 6:
        if (n !== 50) break;
        i.listValue = pa.unwrap(pa.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { nullValue: nn(e24.nullValue) ? Zo(e24.nullValue) : void 0, numberValue: nn(e24.numberValue) ? globalThis.Number(e24.numberValue) : void 0, stringValue: nn(e24.stringValue) ? globalThis.String(e24.stringValue) : void 0, boolValue: nn(e24.boolValue) ? globalThis.Boolean(e24.boolValue) : void 0, structValue: xd(e24.structValue) ? e24.structValue : void 0, listValue: globalThis.Array.isArray(e24.listValue) ? [...e24.listValue] : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.nullValue !== void 0 && (t.nullValue = Xo(e24.nullValue)), e24.numberValue !== void 0 && (t.numberValue = e24.numberValue), e24.stringValue !== void 0 && (t.stringValue = e24.stringValue), e24.boolValue !== void 0 && (t.boolValue = e24.boolValue), e24.structValue !== void 0 && (t.structValue = e24.structValue), e24.listValue !== void 0 && (t.listValue = e24.listValue), t;
}, create(e24) {
  return wt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Qo();
  return t.nullValue = e24.nullValue ?? void 0, t.numberValue = e24.numberValue ?? void 0, t.stringValue = e24.stringValue ?? void 0, t.boolValue = e24.boolValue ?? void 0, t.structValue = e24.structValue ?? void 0, t.listValue = e24.listValue ?? void 0, t;
}, wrap(e24) {
  let t = Qo();
  if (e24 === null) t.nullValue = 0;
  else if (typeof e24 == "boolean") t.boolValue = e24;
  else if (typeof e24 == "number") t.numberValue = e24;
  else if (typeof e24 == "string") t.stringValue = e24;
  else if (globalThis.Array.isArray(e24)) t.listValue = e24;
  else if (typeof e24 == "object") t.structValue = e24;
  else if (typeof e24 < "u") throw new globalThis.Error("Unsupported any value type: " + typeof e24);
  return t;
}, unwrap(e24) {
  if (e24.stringValue !== void 0) return e24.stringValue;
  if (e24?.numberValue !== void 0) return e24.numberValue;
  if (e24?.boolValue !== void 0) return e24.boolValue;
  if (e24?.structValue !== void 0) return e24.structValue;
  if (e24?.listValue !== void 0) return e24.listValue;
  if (e24?.nullValue !== void 0) return null;
} };
function Ko() {
  return { values: [] };
}
var pa = { encode(e24, t = Ue.default.Writer.create()) {
  for (let r of e24.values) wt.encode(wt.wrap(r), t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof Ue.default.Reader ? e24 : Ue.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ko();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(wt.unwrap(wt.decode(r, r.uint32())));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? [...e24.values] : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return pa.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ko();
  return t.values = e24.values?.map((r) => r) || [], t;
}, wrap(e24) {
  let t = Ko();
  return t.values = e24 ?? [], t;
}, unwrap(e24) {
  return e24?.hasOwnProperty("values") && globalThis.Array.isArray(e24.values) ? e24.values : e24;
} };
function xd(e24) {
  return typeof e24 == "object" && e24 !== null;
}
function nn(e24) {
  return e24 != null;
}
function tr(e24) {
  switch (e24) {
    case 0:
    case "CONSISTENCY_LEVEL_UNSPECIFIED":
      return 0;
    case 1:
    case "CONSISTENCY_LEVEL_ONE":
      return 1;
    case 2:
    case "CONSISTENCY_LEVEL_QUORUM":
      return 2;
    case 3:
    case "CONSISTENCY_LEVEL_ALL":
      return 3;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function rr(e24) {
  switch (e24) {
    case 0:
      return "CONSISTENCY_LEVEL_UNSPECIFIED";
    case 1:
      return "CONSISTENCY_LEVEL_ONE";
    case 2:
      return "CONSISTENCY_LEVEL_QUORUM";
    case 3:
      return "CONSISTENCY_LEVEL_ALL";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function Hg(e24) {
  switch (e24) {
    case 0:
    case "OPERATOR_UNSPECIFIED":
      return 0;
    case 1:
    case "OPERATOR_EQUAL":
      return 1;
    case 2:
    case "OPERATOR_NOT_EQUAL":
      return 2;
    case 3:
    case "OPERATOR_GREATER_THAN":
      return 3;
    case 4:
    case "OPERATOR_GREATER_THAN_EQUAL":
      return 4;
    case 5:
    case "OPERATOR_LESS_THAN":
      return 5;
    case 6:
    case "OPERATOR_LESS_THAN_EQUAL":
      return 6;
    case 7:
    case "OPERATOR_AND":
      return 7;
    case 8:
    case "OPERATOR_OR":
      return 8;
    case 9:
    case "OPERATOR_WITHIN_GEO_RANGE":
      return 9;
    case 10:
    case "OPERATOR_LIKE":
      return 10;
    case 11:
    case "OPERATOR_IS_NULL":
      return 11;
    case 12:
    case "OPERATOR_CONTAINS_ANY":
      return 12;
    case 13:
    case "OPERATOR_CONTAINS_ALL":
      return 13;
    case 14:
    case "OPERATOR_CONTAINS_NONE":
      return 14;
    case 15:
    case "OPERATOR_NOT":
      return 15;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Qg(e24) {
  switch (e24) {
    case 0:
      return "OPERATOR_UNSPECIFIED";
    case 1:
      return "OPERATOR_EQUAL";
    case 2:
      return "OPERATOR_NOT_EQUAL";
    case 3:
      return "OPERATOR_GREATER_THAN";
    case 4:
      return "OPERATOR_GREATER_THAN_EQUAL";
    case 5:
      return "OPERATOR_LESS_THAN";
    case 6:
      return "OPERATOR_LESS_THAN_EQUAL";
    case 7:
      return "OPERATOR_AND";
    case 8:
      return "OPERATOR_OR";
    case 9:
      return "OPERATOR_WITHIN_GEO_RANGE";
    case 10:
      return "OPERATOR_LIKE";
    case 11:
      return "OPERATOR_IS_NULL";
    case 12:
      return "OPERATOR_CONTAINS_ANY";
    case 13:
      return "OPERATOR_CONTAINS_ALL";
    case 14:
      return "OPERATOR_CONTAINS_NONE";
    case 15:
      return "OPERATOR_NOT";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function Kg(e24) {
  switch (e24) {
    case 0:
    case "VECTOR_TYPE_UNSPECIFIED":
      return 0;
    case 1:
    case "VECTOR_TYPE_SINGLE_FP32":
      return 1;
    case 2:
    case "VECTOR_TYPE_MULTI_FP32":
      return 2;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Yg(e24) {
  switch (e24) {
    case 0:
      return "VECTOR_TYPE_UNSPECIFIED";
    case 1:
      return "VECTOR_TYPE_SINGLE_FP32";
    case 2:
      return "VECTOR_TYPE_MULTI_FP32";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function Pd() {
  return { values: [], propName: "", valuesBytes: new Uint8Array(0) };
}
var Ye = { encode(e24, t = k.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.values) t.double(r);
  return t.ldelim(), e24.propName !== "" && t.uint32(18).string(e24.propName), e24.valuesBytes.length !== 0 && t.uint32(26).bytes(e24.valuesBytes), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Pd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 9) {
          i.values.push(r.double());
          continue;
        }
        if (n === 10) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.values.push(r.double());
          continue;
        }
        break;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.valuesBytes = r.bytes();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.Number(t)) : [], propName: J(e24.propName) ? globalThis.String(e24.propName) : "", valuesBytes: J(e24.valuesBytes) ? Wd(e24.valuesBytes) : new Uint8Array(0) };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), e24.propName !== "" && (t.propName = e24.propName), e24.valuesBytes.length !== 0 && (t.valuesBytes = qd(e24.valuesBytes)), t;
}, create(e24) {
  return Ye.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Pd();
  return t.values = e24.values?.map((r) => r) || [], t.propName = e24.propName ?? "", t.valuesBytes = e24.valuesBytes ?? new Uint8Array(0), t;
} };
function Rd() {
  return { values: [], propName: "" };
}
var Ze = { encode(e24, t = k.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.values) t.int64(r);
  return t.ldelim(), e24.propName !== "" && t.uint32(18).string(e24.propName), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Rd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 8) {
          i.values.push(an(r.int64()));
          continue;
        }
        if (n === 10) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.values.push(an(r.int64()));
          continue;
        }
        break;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.Number(t)) : [], propName: J(e24.propName) ? globalThis.String(e24.propName) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values.map((r) => Math.round(r))), e24.propName !== "" && (t.propName = e24.propName), t;
}, create(e24) {
  return Ze.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Rd();
  return t.values = e24.values?.map((r) => r) || [], t.propName = e24.propName ?? "", t;
} };
function Ad() {
  return { values: [], propName: "" };
}
var Xe = { encode(e24, t = k.default.Writer.create()) {
  for (let r of e24.values) t.uint32(10).string(r);
  return e24.propName !== "" && t.uint32(18).string(e24.propName), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ad();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(r.string());
        continue;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.String(t)) : [], propName: J(e24.propName) ? globalThis.String(e24.propName) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), e24.propName !== "" && (t.propName = e24.propName), t;
}, create(e24) {
  return Xe.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ad();
  return t.values = e24.values?.map((r) => r) || [], t.propName = e24.propName ?? "", t;
} };
function Nd() {
  return { values: [], propName: "" };
}
var je = { encode(e24, t = k.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.values) t.bool(r);
  return t.ldelim(), e24.propName !== "" && t.uint32(18).string(e24.propName), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Nd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 8) {
          i.values.push(r.bool());
          continue;
        }
        if (n === 10) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.values.push(r.bool());
          continue;
        }
        break;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.Boolean(t)) : [], propName: J(e24.propName) ? globalThis.String(e24.propName) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), e24.propName !== "" && (t.propName = e24.propName), t;
}, create(e24) {
  return je.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Nd();
  return t.values = e24.values?.map((r) => r) || [], t.propName = e24.propName ?? "", t;
} };
function Vd() {
  return { nonRefProperties: void 0, numberArrayProperties: [], intArrayProperties: [], textArrayProperties: [], booleanArrayProperties: [], objectProperties: [], objectArrayProperties: [], emptyListProps: [] };
}
var Be = { encode(e24, t = k.default.Writer.create()) {
  e24.nonRefProperties !== void 0 && ye.encode(ye.wrap(e24.nonRefProperties), t.uint32(10).fork()).ldelim();
  for (let r of e24.numberArrayProperties) Ye.encode(r, t.uint32(18).fork()).ldelim();
  for (let r of e24.intArrayProperties) Ze.encode(r, t.uint32(26).fork()).ldelim();
  for (let r of e24.textArrayProperties) Xe.encode(r, t.uint32(34).fork()).ldelim();
  for (let r of e24.booleanArrayProperties) je.encode(r, t.uint32(42).fork()).ldelim();
  for (let r of e24.objectProperties) tt.encode(r, t.uint32(50).fork()).ldelim();
  for (let r of e24.objectArrayProperties) et.encode(r, t.uint32(58).fork()).ldelim();
  for (let r of e24.emptyListProps) t.uint32(82).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Vd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.nonRefProperties = ye.unwrap(ye.decode(r, r.uint32()));
        continue;
      case 2:
        if (n !== 18) break;
        i.numberArrayProperties.push(Ye.decode(r, r.uint32()));
        continue;
      case 3:
        if (n !== 26) break;
        i.intArrayProperties.push(Ze.decode(r, r.uint32()));
        continue;
      case 4:
        if (n !== 34) break;
        i.textArrayProperties.push(Xe.decode(r, r.uint32()));
        continue;
      case 5:
        if (n !== 42) break;
        i.booleanArrayProperties.push(je.decode(r, r.uint32()));
        continue;
      case 6:
        if (n !== 50) break;
        i.objectProperties.push(tt.decode(r, r.uint32()));
        continue;
      case 7:
        if (n !== 58) break;
        i.objectArrayProperties.push(et.decode(r, r.uint32()));
        continue;
      case 10:
        if (n !== 82) break;
        i.emptyListProps.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { nonRefProperties: Zg(e24.nonRefProperties) ? e24.nonRefProperties : void 0, numberArrayProperties: globalThis.Array.isArray(e24?.numberArrayProperties) ? e24.numberArrayProperties.map((t) => Ye.fromJSON(t)) : [], intArrayProperties: globalThis.Array.isArray(e24?.intArrayProperties) ? e24.intArrayProperties.map((t) => Ze.fromJSON(t)) : [], textArrayProperties: globalThis.Array.isArray(e24?.textArrayProperties) ? e24.textArrayProperties.map((t) => Xe.fromJSON(t)) : [], booleanArrayProperties: globalThis.Array.isArray(e24?.booleanArrayProperties) ? e24.booleanArrayProperties.map((t) => je.fromJSON(t)) : [], objectProperties: globalThis.Array.isArray(e24?.objectProperties) ? e24.objectProperties.map((t) => tt.fromJSON(t)) : [], objectArrayProperties: globalThis.Array.isArray(e24?.objectArrayProperties) ? e24.objectArrayProperties.map((t) => et.fromJSON(t)) : [], emptyListProps: globalThis.Array.isArray(e24?.emptyListProps) ? e24.emptyListProps.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.nonRefProperties !== void 0 && (t.nonRefProperties = e24.nonRefProperties), e24.numberArrayProperties?.length && (t.numberArrayProperties = e24.numberArrayProperties.map((r) => Ye.toJSON(r))), e24.intArrayProperties?.length && (t.intArrayProperties = e24.intArrayProperties.map((r) => Ze.toJSON(r))), e24.textArrayProperties?.length && (t.textArrayProperties = e24.textArrayProperties.map((r) => Xe.toJSON(r))), e24.booleanArrayProperties?.length && (t.booleanArrayProperties = e24.booleanArrayProperties.map((r) => je.toJSON(r))), e24.objectProperties?.length && (t.objectProperties = e24.objectProperties.map((r) => tt.toJSON(r))), e24.objectArrayProperties?.length && (t.objectArrayProperties = e24.objectArrayProperties.map((r) => et.toJSON(r))), e24.emptyListProps?.length && (t.emptyListProps = e24.emptyListProps), t;
}, create(e24) {
  return Be.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Vd();
  return t.nonRefProperties = e24.nonRefProperties ?? void 0, t.numberArrayProperties = e24.numberArrayProperties?.map((r) => Ye.fromPartial(r)) || [], t.intArrayProperties = e24.intArrayProperties?.map((r) => Ze.fromPartial(r)) || [], t.textArrayProperties = e24.textArrayProperties?.map((r) => Xe.fromPartial(r)) || [], t.booleanArrayProperties = e24.booleanArrayProperties?.map((r) => je.fromPartial(r)) || [], t.objectProperties = e24.objectProperties?.map((r) => tt.fromPartial(r)) || [], t.objectArrayProperties = e24.objectArrayProperties?.map((r) => et.fromPartial(r)) || [], t.emptyListProps = e24.emptyListProps?.map((r) => r) || [], t;
} };
function Od() {
  return { values: [], propName: "" };
}
var et = { encode(e24, t = k.default.Writer.create()) {
  for (let r of e24.values) Be.encode(r, t.uint32(10).fork()).ldelim();
  return e24.propName !== "" && t.uint32(18).string(e24.propName), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Od();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(Be.decode(r, r.uint32()));
        continue;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => Be.fromJSON(t)) : [], propName: J(e24.propName) ? globalThis.String(e24.propName) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values.map((r) => Be.toJSON(r))), e24.propName !== "" && (t.propName = e24.propName), t;
}, create(e24) {
  return et.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Od();
  return t.values = e24.values?.map((r) => Be.fromPartial(r)) || [], t.propName = e24.propName ?? "", t;
} };
function Sd() {
  return { value: void 0, propName: "" };
}
var tt = { encode(e24, t = k.default.Writer.create()) {
  return e24.value !== void 0 && Be.encode(e24.value, t.uint32(10).fork()).ldelim(), e24.propName !== "" && t.uint32(18).string(e24.propName), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Sd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.value = Be.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { value: J(e24.value) ? Be.fromJSON(e24.value) : void 0, propName: J(e24.propName) ? globalThis.String(e24.propName) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.value !== void 0 && (t.value = Be.toJSON(e24.value)), e24.propName !== "" && (t.propName = e24.propName), t;
}, create(e24) {
  return tt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Sd();
  return t.value = e24.value !== void 0 && e24.value !== null ? Be.fromPartial(e24.value) : void 0, t.propName = e24.propName ?? "", t;
} };
function kd() {
  return { values: [] };
}
var m = { encode(e24, t = k.default.Writer.create()) {
  for (let r of e24.values) t.uint32(10).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = kd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return m.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = kd();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Id() {
  return { values: [] };
}
var rt = { encode(e24, t = k.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.values) t.int64(r);
  return t.ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Id();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 8) {
          i.values.push(an(r.int64()));
          continue;
        }
        if (n === 10) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.values.push(an(r.int64()));
          continue;
        }
        break;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.Number(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values.map((r) => Math.round(r))), t;
}, create(e24) {
  return rt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Id();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function _d() {
  return { values: [] };
}
var nt = { encode(e24, t = k.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.values) t.double(r);
  return t.ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = _d();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 9) {
          i.values.push(r.double());
          continue;
        }
        if (n === 10) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.values.push(r.double());
          continue;
        }
        break;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.Number(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return nt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = _d();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Bd() {
  return { values: [] };
}
var it = { encode(e24, t = k.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.values) t.bool(r);
  return t.ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Bd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 8) {
          i.values.push(r.bool());
          continue;
        }
        if (n === 10) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.values.push(r.bool());
          continue;
        }
        break;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.Boolean(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return it.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Bd();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Gd() {
  return { operator: 0, on: [], filters: [], valueText: void 0, valueInt: void 0, valueBoolean: void 0, valueNumber: void 0, valueTextArray: void 0, valueIntArray: void 0, valueBooleanArray: void 0, valueNumberArray: void 0, valueGeo: void 0, target: void 0 };
}
var H = { encode(e24, t = k.default.Writer.create()) {
  e24.operator !== 0 && t.uint32(8).int32(e24.operator);
  for (let r of e24.on) t.uint32(18).string(r);
  for (let r of e24.filters) H.encode(r, t.uint32(26).fork()).ldelim();
  return e24.valueText !== void 0 && t.uint32(34).string(e24.valueText), e24.valueInt !== void 0 && t.uint32(40).int64(e24.valueInt), e24.valueBoolean !== void 0 && t.uint32(48).bool(e24.valueBoolean), e24.valueNumber !== void 0 && t.uint32(57).double(e24.valueNumber), e24.valueTextArray !== void 0 && m.encode(e24.valueTextArray, t.uint32(74).fork()).ldelim(), e24.valueIntArray !== void 0 && rt.encode(e24.valueIntArray, t.uint32(82).fork()).ldelim(), e24.valueBooleanArray !== void 0 && it.encode(e24.valueBooleanArray, t.uint32(90).fork()).ldelim(), e24.valueNumberArray !== void 0 && nt.encode(e24.valueNumberArray, t.uint32(98).fork()).ldelim(), e24.valueGeo !== void 0 && at.encode(e24.valueGeo, t.uint32(106).fork()).ldelim(), e24.target !== void 0 && ue.encode(e24.target, t.uint32(162).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Gd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.operator = r.int32();
        continue;
      case 2:
        if (n !== 18) break;
        i.on.push(r.string());
        continue;
      case 3:
        if (n !== 26) break;
        i.filters.push(H.decode(r, r.uint32()));
        continue;
      case 4:
        if (n !== 34) break;
        i.valueText = r.string();
        continue;
      case 5:
        if (n !== 40) break;
        i.valueInt = an(r.int64());
        continue;
      case 6:
        if (n !== 48) break;
        i.valueBoolean = r.bool();
        continue;
      case 7:
        if (n !== 57) break;
        i.valueNumber = r.double();
        continue;
      case 9:
        if (n !== 74) break;
        i.valueTextArray = m.decode(r, r.uint32());
        continue;
      case 10:
        if (n !== 82) break;
        i.valueIntArray = rt.decode(r, r.uint32());
        continue;
      case 11:
        if (n !== 90) break;
        i.valueBooleanArray = it.decode(r, r.uint32());
        continue;
      case 12:
        if (n !== 98) break;
        i.valueNumberArray = nt.decode(r, r.uint32());
        continue;
      case 13:
        if (n !== 106) break;
        i.valueGeo = at.decode(r, r.uint32());
        continue;
      case 20:
        if (n !== 162) break;
        i.target = ue.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { operator: J(e24.operator) ? Hg(e24.operator) : 0, on: globalThis.Array.isArray(e24?.on) ? e24.on.map((t) => globalThis.String(t)) : [], filters: globalThis.Array.isArray(e24?.filters) ? e24.filters.map((t) => H.fromJSON(t)) : [], valueText: J(e24.valueText) ? globalThis.String(e24.valueText) : void 0, valueInt: J(e24.valueInt) ? globalThis.Number(e24.valueInt) : void 0, valueBoolean: J(e24.valueBoolean) ? globalThis.Boolean(e24.valueBoolean) : void 0, valueNumber: J(e24.valueNumber) ? globalThis.Number(e24.valueNumber) : void 0, valueTextArray: J(e24.valueTextArray) ? m.fromJSON(e24.valueTextArray) : void 0, valueIntArray: J(e24.valueIntArray) ? rt.fromJSON(e24.valueIntArray) : void 0, valueBooleanArray: J(e24.valueBooleanArray) ? it.fromJSON(e24.valueBooleanArray) : void 0, valueNumberArray: J(e24.valueNumberArray) ? nt.fromJSON(e24.valueNumberArray) : void 0, valueGeo: J(e24.valueGeo) ? at.fromJSON(e24.valueGeo) : void 0, target: J(e24.target) ? ue.fromJSON(e24.target) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.operator !== 0 && (t.operator = Qg(e24.operator)), e24.on?.length && (t.on = e24.on), e24.filters?.length && (t.filters = e24.filters.map((r) => H.toJSON(r))), e24.valueText !== void 0 && (t.valueText = e24.valueText), e24.valueInt !== void 0 && (t.valueInt = Math.round(e24.valueInt)), e24.valueBoolean !== void 0 && (t.valueBoolean = e24.valueBoolean), e24.valueNumber !== void 0 && (t.valueNumber = e24.valueNumber), e24.valueTextArray !== void 0 && (t.valueTextArray = m.toJSON(e24.valueTextArray)), e24.valueIntArray !== void 0 && (t.valueIntArray = rt.toJSON(e24.valueIntArray)), e24.valueBooleanArray !== void 0 && (t.valueBooleanArray = it.toJSON(e24.valueBooleanArray)), e24.valueNumberArray !== void 0 && (t.valueNumberArray = nt.toJSON(e24.valueNumberArray)), e24.valueGeo !== void 0 && (t.valueGeo = at.toJSON(e24.valueGeo)), e24.target !== void 0 && (t.target = ue.toJSON(e24.target)), t;
}, create(e24) {
  return H.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Gd();
  return t.operator = e24.operator ?? 0, t.on = e24.on?.map((r) => r) || [], t.filters = e24.filters?.map((r) => H.fromPartial(r)) || [], t.valueText = e24.valueText ?? void 0, t.valueInt = e24.valueInt ?? void 0, t.valueBoolean = e24.valueBoolean ?? void 0, t.valueNumber = e24.valueNumber ?? void 0, t.valueTextArray = e24.valueTextArray !== void 0 && e24.valueTextArray !== null ? m.fromPartial(e24.valueTextArray) : void 0, t.valueIntArray = e24.valueIntArray !== void 0 && e24.valueIntArray !== null ? rt.fromPartial(e24.valueIntArray) : void 0, t.valueBooleanArray = e24.valueBooleanArray !== void 0 && e24.valueBooleanArray !== null ? it.fromPartial(e24.valueBooleanArray) : void 0, t.valueNumberArray = e24.valueNumberArray !== void 0 && e24.valueNumberArray !== null ? nt.fromPartial(e24.valueNumberArray) : void 0, t.valueGeo = e24.valueGeo !== void 0 && e24.valueGeo !== null ? at.fromPartial(e24.valueGeo) : void 0, t.target = e24.target !== void 0 && e24.target !== null ? ue.fromPartial(e24.target) : void 0, t;
} };
function wd() {
  return { on: "", target: void 0 };
}
var jt = { encode(e24, t = k.default.Writer.create()) {
  return e24.on !== "" && t.uint32(10).string(e24.on), e24.target !== void 0 && ue.encode(e24.target, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = wd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.on = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.target = ue.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { on: J(e24.on) ? globalThis.String(e24.on) : "", target: J(e24.target) ? ue.fromJSON(e24.target) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.on !== "" && (t.on = e24.on), e24.target !== void 0 && (t.target = ue.toJSON(e24.target)), t;
}, create(e24) {
  return jt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = wd();
  return t.on = e24.on ?? "", t.target = e24.target !== void 0 && e24.target !== null ? ue.fromPartial(e24.target) : void 0, t;
} };
function Md() {
  return { on: "", target: void 0, targetCollection: "" };
}
var er = { encode(e24, t = k.default.Writer.create()) {
  return e24.on !== "" && t.uint32(10).string(e24.on), e24.target !== void 0 && ue.encode(e24.target, t.uint32(18).fork()).ldelim(), e24.targetCollection !== "" && t.uint32(26).string(e24.targetCollection), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Md();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.on = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.target = ue.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.targetCollection = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { on: J(e24.on) ? globalThis.String(e24.on) : "", target: J(e24.target) ? ue.fromJSON(e24.target) : void 0, targetCollection: J(e24.targetCollection) ? globalThis.String(e24.targetCollection) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.on !== "" && (t.on = e24.on), e24.target !== void 0 && (t.target = ue.toJSON(e24.target)), e24.targetCollection !== "" && (t.targetCollection = e24.targetCollection), t;
}, create(e24) {
  return er.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Md();
  return t.on = e24.on ?? "", t.target = e24.target !== void 0 && e24.target !== null ? ue.fromPartial(e24.target) : void 0, t.targetCollection = e24.targetCollection ?? "", t;
} };
function Ed() {
  return { on: "" };
}
var Mt = { encode(e24, t = k.default.Writer.create()) {
  return e24.on !== "" && t.uint32(10).string(e24.on), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ed();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.on = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { on: J(e24.on) ? globalThis.String(e24.on) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.on !== "" && (t.on = e24.on), t;
}, create(e24) {
  return Mt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ed();
  return t.on = e24.on ?? "", t;
} };
function Ud() {
  return { property: void 0, singleTarget: void 0, multiTarget: void 0, count: void 0 };
}
var ue = { encode(e24, t = k.default.Writer.create()) {
  return e24.property !== void 0 && t.uint32(10).string(e24.property), e24.singleTarget !== void 0 && jt.encode(e24.singleTarget, t.uint32(18).fork()).ldelim(), e24.multiTarget !== void 0 && er.encode(e24.multiTarget, t.uint32(26).fork()).ldelim(), e24.count !== void 0 && Mt.encode(e24.count, t.uint32(34).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ud();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.property = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.singleTarget = jt.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.multiTarget = er.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.count = Mt.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { property: J(e24.property) ? globalThis.String(e24.property) : void 0, singleTarget: J(e24.singleTarget) ? jt.fromJSON(e24.singleTarget) : void 0, multiTarget: J(e24.multiTarget) ? er.fromJSON(e24.multiTarget) : void 0, count: J(e24.count) ? Mt.fromJSON(e24.count) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.property !== void 0 && (t.property = e24.property), e24.singleTarget !== void 0 && (t.singleTarget = jt.toJSON(e24.singleTarget)), e24.multiTarget !== void 0 && (t.multiTarget = er.toJSON(e24.multiTarget)), e24.count !== void 0 && (t.count = Mt.toJSON(e24.count)), t;
}, create(e24) {
  return ue.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ud();
  return t.property = e24.property ?? void 0, t.singleTarget = e24.singleTarget !== void 0 && e24.singleTarget !== null ? jt.fromPartial(e24.singleTarget) : void 0, t.multiTarget = e24.multiTarget !== void 0 && e24.multiTarget !== null ? er.fromPartial(e24.multiTarget) : void 0, t.count = e24.count !== void 0 && e24.count !== null ? Mt.fromPartial(e24.count) : void 0, t;
} };
function Dd() {
  return { latitude: 0, longitude: 0, distance: 0 };
}
var at = { encode(e24, t = k.default.Writer.create()) {
  return e24.latitude !== 0 && t.uint32(13).float(e24.latitude), e24.longitude !== 0 && t.uint32(21).float(e24.longitude), e24.distance !== 0 && t.uint32(29).float(e24.distance), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Dd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.latitude = r.float();
        continue;
      case 2:
        if (n !== 21) break;
        i.longitude = r.float();
        continue;
      case 3:
        if (n !== 29) break;
        i.distance = r.float();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { latitude: J(e24.latitude) ? globalThis.Number(e24.latitude) : 0, longitude: J(e24.longitude) ? globalThis.Number(e24.longitude) : 0, distance: J(e24.distance) ? globalThis.Number(e24.distance) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.latitude !== 0 && (t.latitude = e24.latitude), e24.longitude !== 0 && (t.longitude = e24.longitude), e24.distance !== 0 && (t.distance = e24.distance), t;
}, create(e24) {
  return at.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Dd();
  return t.latitude = e24.latitude ?? 0, t.longitude = e24.longitude ?? 0, t.distance = e24.distance ?? 0, t;
} };
function Fd() {
  return { name: "", index: 0, vectorBytes: new Uint8Array(0), type: 0 };
}
var q = { encode(e24, t = k.default.Writer.create()) {
  return e24.name !== "" && t.uint32(10).string(e24.name), e24.index !== 0 && t.uint32(16).uint64(e24.index), e24.vectorBytes.length !== 0 && t.uint32(26).bytes(e24.vectorBytes), e24.type !== 0 && t.uint32(32).int32(e24.type), t;
}, decode(e24, t) {
  let r = e24 instanceof k.default.Reader ? e24 : k.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Fd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.name = r.string();
        continue;
      case 2:
        if (n !== 16) break;
        i.index = an(r.uint64());
        continue;
      case 3:
        if (n !== 26) break;
        i.vectorBytes = r.bytes();
        continue;
      case 4:
        if (n !== 32) break;
        i.type = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { name: J(e24.name) ? globalThis.String(e24.name) : "", index: J(e24.index) ? globalThis.Number(e24.index) : 0, vectorBytes: J(e24.vectorBytes) ? Wd(e24.vectorBytes) : new Uint8Array(0), type: J(e24.type) ? Kg(e24.type) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.name !== "" && (t.name = e24.name), e24.index !== 0 && (t.index = Math.round(e24.index)), e24.vectorBytes.length !== 0 && (t.vectorBytes = qd(e24.vectorBytes)), e24.type !== 0 && (t.type = Yg(e24.type)), t;
}, create(e24) {
  return q.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Fd();
  return t.name = e24.name ?? "", t.index = e24.index ?? 0, t.vectorBytes = e24.vectorBytes ?? new Uint8Array(0), t.type = e24.type ?? 0, t;
} };
function Wd(e24) {
  if (globalThis.Buffer) return Uint8Array.from(globalThis.Buffer.from(e24, "base64"));
  {
    let t = globalThis.atob(e24), r = new Uint8Array(t.length);
    for (let a = 0; a < t.length; ++a) r[a] = t.charCodeAt(a);
    return r;
  }
}
function qd(e24) {
  if (globalThis.Buffer) return globalThis.Buffer.from(e24).toString("base64");
  {
    let t = [];
    return e24.forEach((r) => {
      t.push(globalThis.String.fromCharCode(r));
    }), globalThis.btoa(t.join(""));
  }
}
function an(e24) {
  if (e24.gt(globalThis.Number.MAX_SAFE_INTEGER)) throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  return e24.toNumber();
}
k.default.util.Long !== long_default && (k.default.util.Long = long_default, k.default.configure());
function Zg(e24) {
  return typeof e24 == "object" && e24 !== null;
}
function J(e24) {
  return e24 != null;
}
d();
var Nt = class e3 {
  static isSingleTargetRef(t) {
    return t ? t.type_ === "single" : false;
  }
  static isMultiTargetRef(t) {
    return t ? t.type_ === "multi" : false;
  }
  static isCountRef(t) {
    return t ? t.type_ === "count" : false;
  }
  static isProperty(t) {
    return t ? typeof t == "string" : false;
  }
  static isTargetRef(t) {
    return t ? e3.isSingleTargetRef(t) || e3.isMultiTargetRef(t) : false;
  }
};
var ga = class {
  static and(...t) {
    return { operator: "And", filters: t, value: null };
  }
  static or(...t) {
    return { operator: "Or", filters: t, value: null };
  }
  static not(t) {
    return { operator: "Not", filters: [t], value: null };
  }
};
var on = class {
  target;
  property;
  constructor(t, r) {
    this.property = t, this.target = r;
  }
  targetPath() {
    if (!this.target) return ue.fromPartial({ property: Nt.isProperty(this.property) ? this.property : void 0, count: Nt.isCountRef(this.property) ? Mt.fromPartial({ on: this.property.linkOn }) : void 0 });
    let t = this.target;
    for (; t.target !== void 0; ) if (Nt.isTargetRef(t.target)) t = t.target;
    else throw new F("Invalid target reference");
    return t.target = this.property, this.resolveTargets(this.target);
  }
  resolveTargets(t) {
    return ue.fromPartial({ property: Nt.isProperty(t) ? t : void 0, singleTarget: Nt.isSingleTargetRef(t) ? jt.fromPartial({ on: t.linkOn, target: this.resolveTargets(t.target) }) : void 0, multiTarget: Nt.isMultiTargetRef(t) ? er.fromPartial({ on: t.linkOn, targetCollection: t.targetCollection, target: this.resolveTargets(t.target) }) : void 0, count: Nt.isCountRef(t) ? Mt.fromPartial({ on: t.linkOn }) : void 0 });
  }
};
var ma = class extends on {
  constructor(t, r, a) {
    super(r ? `len(${t})` : t, a);
  }
  isNull(t) {
    return { operator: "IsNull", target: this.targetPath(), value: t };
  }
  containsAny(t) {
    return { operator: "ContainsAny", target: this.targetPath(), value: t };
  }
  containsNone(t) {
    return { operator: "ContainsNone", target: this.targetPath(), value: t };
  }
  containsAll(t) {
    return { operator: "ContainsAll", target: this.targetPath(), value: t };
  }
  equal(t) {
    return { operator: "Equal", target: this.targetPath(), value: t };
  }
  notEqual(t) {
    return { operator: "NotEqual", target: this.targetPath(), value: t };
  }
  lessThan(t) {
    return { operator: "LessThan", target: this.targetPath(), value: t };
  }
  lessOrEqual(t) {
    return { operator: "LessThanEqual", target: this.targetPath(), value: t };
  }
  greaterThan(t) {
    return { operator: "GreaterThan", target: this.targetPath(), value: t };
  }
  greaterOrEqual(t) {
    return { operator: "GreaterThanEqual", target: this.targetPath(), value: t };
  }
  like(t) {
    return { operator: "Like", target: this.targetPath(), value: t };
  }
  withinGeoRange(t) {
    return { operator: "WithinGeoRange", target: this.targetPath(), value: t };
  }
};
var ha = class e4 {
  target;
  constructor(t) {
    this.target = t;
  }
  byRef(t) {
    return this.target.target = { type_: "single", linkOn: t }, new e4(Object.assign({}, this.target));
  }
  byRefMultiTarget(t, r) {
    return this.target.target = { type_: "multi", linkOn: t, targetCollection: r }, new e4(Object.assign({}, this.target));
  }
  byProperty(t, r = false) {
    return new ma(t, r, Object.assign({}, this.target));
  }
  byRefCount(t) {
    return new ya(t, Object.assign({}, this.target));
  }
  byId() {
    return new Vr(Object.assign({}, this.target));
  }
  byCreationTime() {
    return new Ta(Object.assign({}, this.target));
  }
  byUpdateTime() {
    return new va(Object.assign({}, this.target));
  }
};
var ya = class extends on {
  constructor(t, r) {
    super({ type_: "count", linkOn: t }, r);
  }
  equal(t) {
    return { operator: "Equal", target: this.targetPath(), value: t };
  }
  notEqual(t) {
    return { operator: "NotEqual", target: this.targetPath(), value: t };
  }
  lessThan(t) {
    return { operator: "LessThan", target: this.targetPath(), value: t };
  }
  lessOrEqual(t) {
    return { operator: "LessThanEqual", target: this.targetPath(), value: t };
  }
  greaterThan(t) {
    return { operator: "GreaterThan", target: this.targetPath(), value: t };
  }
  greaterOrEqual(t) {
    return { operator: "GreaterThanEqual", target: this.targetPath(), value: t };
  }
};
var Vr = class extends on {
  constructor(t) {
    super("_id", t);
  }
  equal(t) {
    return { operator: "Equal", target: this.targetPath(), value: t };
  }
  notEqual(t) {
    return { operator: "NotEqual", target: this.targetPath(), value: t };
  }
  containsAny(t) {
    return { operator: "ContainsAny", target: this.targetPath(), value: t };
  }
};
var io = class extends on {
  containsAny(t) {
    return { operator: "ContainsAny", target: this.targetPath(), value: t.map(this.toValue) };
  }
  equal(t) {
    return { operator: "Equal", target: this.targetPath(), value: this.toValue(t) };
  }
  notEqual(t) {
    return { operator: "NotEqual", target: this.targetPath(), value: this.toValue(t) };
  }
  lessThan(t) {
    return { operator: "LessThan", target: this.targetPath(), value: this.toValue(t) };
  }
  lessOrEqual(t) {
    return { operator: "LessThanEqual", target: this.targetPath(), value: this.toValue(t) };
  }
  greaterThan(t) {
    return { operator: "GreaterThan", target: this.targetPath(), value: this.toValue(t) };
  }
  greaterOrEqual(t) {
    return { operator: "GreaterThanEqual", target: this.targetPath(), value: this.toValue(t) };
  }
  toValue(t) {
    return t instanceof Date ? t.toISOString() : t;
  }
};
var Ta = class extends io {
  constructor(t) {
    super("_creationTimeUnix", t);
  }
};
var va = class extends io {
  constructor(t) {
    super("_lastUpdateTimeUnix", t);
  }
};
var Xg = () => ({ byProperty: (e24, t = false) => new ma(e24, t), byRef: (e24) => new ha({ type_: "single", linkOn: e24 }), byRefMultiTarget: (e24, t) => new ha({ type_: "multi", linkOn: e24, targetCollection: t }), byRefCount: (e24) => new ya(e24), byId: () => new Vr(), byCreationTime: () => new Ta(), byUpdateTime: () => new va() });
var ao = Xg;
d();
d();
d();
d();
d();
d();
function jg(e24) {
  return Number.isInteger(e24);
}
function Ld(e24) {
  return jg(e24) && e24 >= 0;
}
d();
d();
var Or = class {
  autocorrect;
  certainty;
  concepts;
  distance;
  moveAwayFrom;
  moveTo;
  targetVectors;
  constructor(t) {
    this.autocorrect = t.autocorrect, this.certainty = t.certainty, this.concepts = t.concepts, this.distance = t.distance, this.moveAwayFrom = t.moveAwayFrom, this.moveTo = t.moveTo, this.targetVectors = t.targetVectors;
  }
  toString() {
    this.validate();
    let t = [`concepts:${JSON.stringify(this.concepts)}`];
    return this.certainty && (t = [...t, `certainty:${this.certainty}`]), this.distance && (t = [...t, `distance:${this.distance}`]), this.targetVectors && this.targetVectors.length > 0 && (t = [...t, `targetVectors:${JSON.stringify(this.targetVectors)}`]), this.moveTo && (t = [...t, ba("moveTo", this.moveTo)]), this.moveAwayFrom && (t = [...t, ba("moveAwayFrom", this.moveAwayFrom)]), this.autocorrect !== void 0 && (t = [...t, `autocorrect:${this.autocorrect}`]), `{${t.join(",")}}`;
  }
  validate() {
    if (this.moveTo) {
      if (!this.moveTo.concepts && !this.moveTo.objects) throw new Error("nearText filter: moveTo.concepts or moveTo.objects must be present");
      if (!this.moveTo.force || !this.moveTo.concepts && !this.moveTo.objects) throw new Error("nearText filter: moveTo must have fields 'concepts' or 'objects' and 'force'");
    }
    if (this.moveAwayFrom) {
      if (!this.moveAwayFrom.concepts && !this.moveAwayFrom.objects) throw new Error("nearText filter: moveAwayFrom.concepts or moveAwayFrom.objects must be present");
      if (!this.moveAwayFrom.force || !this.moveAwayFrom.concepts && !this.moveAwayFrom.objects) throw new Error("nearText filter: moveAwayFrom must have fields 'concepts' or 'objects' and 'force'");
    }
  }
};
function em(e24, t) {
  let r = [];
  for (let a in t) {
    if (!t[a].id && !t[a].beacon) throw new Error(`nearText: ${e24}.objects[${a}].id or ${e24}.objects[${a}].beacon must be present`);
    let i = [];
    t[a].id && i.push(`id:"${t[a].id}"`), t[a].beacon && i.push(`beacon:"${t[a].beacon}"`), r.push(`{${i.join(",")}}`);
  }
  return `[${r.join(",")}]`;
}
function ba(e24, t) {
  let r = [];
  return t.concepts && (r = [...r, `concepts:${JSON.stringify(t.concepts)}`]), t.objects && (r = [...r, `objects:${em(e24, t.objects)}`]), t.force && (r = [...r, `force:${t.force}`]), `${e24}:{${r.join(",")}}`;
}
var jo = class {
  nearText;
  nearVector;
  constructor(t) {
    this.nearText = t.nearText, this.nearVector = t.nearVector;
  }
  toString() {
    let t = [];
    if (this.nearText !== void 0) {
      let r = [`concepts:${JSON.stringify(this.nearText.concepts)}`];
      this.nearText.certainty && (r = [...r, `certainty:${this.nearText.certainty}`]), this.nearText.distance && (r = [...r, `distance:${this.nearText.distance}`]), this.nearText.moveTo && (r = [...r, ba("moveTo", this.nearText.moveTo)]), this.nearText.moveAwayFrom && (r = [...r, ba("moveAwayFrom", this.nearText.moveAwayFrom)]), t = [...t, `nearText:{${r.join(",")}}`];
    }
    if (this.nearVector !== void 0) {
      let r = [`vector:${JSON.stringify(this.nearVector.vector)}`];
      this.nearVector.certainty && (r = [...r, `certainty:${this.nearVector.certainty}`]), this.nearVector.distance && (r = [...r, `distance:${this.nearVector.distance}`]), this.nearVector.targetVectors && this.nearVector.targetVectors.length > 0 && (r = [...r, `targetVectors:${JSON.stringify(this.nearVector.targetVectors)}`]), t = [...t, `nearVector:{${r.join(",")}}`];
    }
    return `{${t.join(",")}}`;
  }
};
var sn = class {
  alpha;
  query;
  vector;
  properties;
  targetVectors;
  fusionType;
  searches;
  maxVectorDistance;
  constructor(t) {
    this.alpha = t.alpha, this.query = t.query, this.vector = t.vector, this.properties = t.properties, this.targetVectors = t.targetVectors, this.fusionType = t.fusionType, this.searches = t.searches?.map((r) => new jo(r)), this.maxVectorDistance = t.maxVectorDistance;
  }
  toString() {
    let t = [`query:${JSON.stringify(this.query)}`];
    return this.alpha !== void 0 && (t = [...t, `alpha:${JSON.stringify(this.alpha)}`]), this.vector !== void 0 && (t = [...t, `vector:${JSON.stringify(this.vector)}`]), this.properties && this.properties.length > 0 && (t = [...t, `properties:${JSON.stringify(this.properties)}`]), this.targetVectors && this.targetVectors.length > 0 && (t = [...t, `targetVectors:${JSON.stringify(this.targetVectors)}`]), this.fusionType !== void 0 && (t = [...t, `fusionType:${this.fusionType}`]), this.searches !== void 0 && (t = [...t, `searches:[${this.searches.map((r) => r.toString()).join(",")}]`]), this.maxVectorDistance !== void 0 && (t = [...t, `maxVectorDistance:${this.maxVectorDistance}`]), `{${t.join(",")}}`;
  }
};
d();
var Sr = class {
  certainty;
  distance;
  media;
  type;
  targetVectors;
  constructor(t) {
    this.certainty = t.certainty, this.distance = t.distance, this.media = t.media, this.type = t.type, this.targetVectors = t.targetVectors;
  }
  toString(t = true) {
    let r = [];
    if (this.media.startsWith("data:")) {
      let a = ";base64,";
      this.media = this.media.substring(this.media.indexOf(a) + a.length);
    }
    return r = [...r, `${this.type.toLowerCase()}:${JSON.stringify(this.media)}`], this.certainty && (r = [...r, `certainty:${this.certainty}`]), this.distance && (r = [...r, `distance:${this.distance}`]), this.targetVectors && this.targetVectors.length > 0 && (r = [...r, `targetVectors:${JSON.stringify(this.targetVectors)}`]), t ? `{${r.join(",")}}` : `${r.join(",")}`;
  }
};
d();
var kr = class {
  beacon;
  certainty;
  distance;
  id;
  targetVectors;
  constructor(t) {
    this.beacon = t.beacon, this.certainty = t.certainty, this.distance = t.distance, this.id = t.id, this.targetVectors = t.targetVectors;
  }
  toString(t = true) {
    this.validate();
    let r = [];
    return this.id && (r = [...r, `id:${JSON.stringify(this.id)}`]), this.beacon && (r = [...r, `beacon:${JSON.stringify(this.beacon)}`]), this.certainty && (r = [...r, `certainty:${this.certainty}`]), this.distance && (r = [...r, `distance:${this.distance}`]), this.targetVectors && this.targetVectors.length > 0 && (r = [...r, `targetVectors:${JSON.stringify(this.targetVectors)}`]), t ? `{${r.join(",")}}` : `${r.join(",")}`;
  }
  validate() {
    if (!this.id && !this.beacon) throw new Error("nearObject filter: id or beacon needs to be set");
  }
};
d();
var Ir = class {
  certainty;
  distance;
  vector;
  targetVectors;
  constructor(t) {
    this.certainty = t.certainty, this.distance = t.distance, this.vector = t.vector, this.targetVectors = t.targetVectors;
  }
  toString(t = true) {
    let r = [`vector:${JSON.stringify(this.vector)}`];
    return this.certainty && (r = [...r, `certainty:${this.certainty}`]), this.distance && (r = [...r, `distance:${this.distance}`]), this.targetVectors && this.targetVectors.length > 0 && (r = [...r, `targetVectors:${JSON.stringify(this.targetVectors)}`]), t ? `{${r.join(",")}}` : `${r.join(",")}`;
  }
};
d();
var un = class e5 {
  operands;
  operator;
  path;
  source;
  valueContent;
  valueType;
  constructor(t) {
    this.source = t;
  }
  toString() {
    if (this.parse(), this.validate(), this.operands) return `{operator:${this.operator},operands:[${this.operands}]}`;
    {
      let t = this.getValueType(), r = this.marshalValueContent();
      return `{operator:${this.operator},${t}:${r},path:${JSON.stringify(this.path)}}`;
    }
  }
  marshalValueContent() {
    return this.valueType == "valueGeoRange" ? this.marshalValueGeoRange() : JSON.stringify(this.valueContent);
  }
  getValueType() {
    switch (this.valueType) {
      case "valueStringArray":
        return "valueString";
      case "valueTextArray":
        return "valueText";
      case "valueIntArray":
        return "valueInt";
      case "valueNumberArray":
        return "valueNumber";
      case "valueDateArray":
        return "valueDate";
      case "valueBooleanArray":
        return "valueBoolean";
      default:
        return this.valueType;
    }
  }
  marshalValueGeoRange() {
    let t = [], r = this.valueContent.geoCoordinates;
    if (r) {
      let i = [];
      r.latitude && (i = [...i, `latitude:${r.latitude}`]), r.longitude && (i = [...i, `longitude:${r.longitude}`]), t = [...t, `geoCoordinates:{${i.join(",")}}`];
    }
    let a = this.valueContent.distance;
    if (a) {
      let i = [];
      a.max && (i = [...i, `max:${a.max}`]), t = [...t, `distance:{${i.join(",")}}`];
    }
    return `{${t.join(",")}}`;
  }
  validate() {
    if (!this.operator) throw new Error("where filter: operator cannot be empty");
    if (!this.operands) {
      if (!this.valueType) throw new Error("where filter: value<Type> cannot be empty");
      if (!this.path) throw new Error("where filter: path cannot be empty");
    }
  }
  parse() {
    for (let t in this.source) switch (t) {
      case "operator":
        this.parseOperator(this.source[t]);
        break;
      case "operands":
        this.parseOperands(this.source[t]);
        break;
      case "path":
        this.parsePath(this.source[t]);
        break;
      default:
        if (t.indexOf("value") != 0) throw new Error("where filter: unrecognized key '" + t + "'");
        this.parseValue(t, this.source[t]);
    }
  }
  parseOperator(t) {
    if (typeof t != "string") throw new Error("where filter: operator must be a string");
    this.operator = t;
  }
  parsePath(t) {
    if (!Array.isArray(t)) throw new Error("where filter: path must be an array");
    this.path = t;
  }
  parseValue(t, r) {
    switch (t) {
      case "valueString":
      case "valueText":
      case "valueInt":
      case "valueNumber":
      case "valueDate":
      case "valueBoolean":
      case "valueStringArray":
      case "valueTextArray":
      case "valueIntArray":
      case "valueNumberArray":
      case "valueDateArray":
      case "valueBooleanArray":
      case "valueGeoRange":
        break;
      default:
        throw new Error("where filter: unrecognized value prop '" + t + "'");
    }
    this.valueType = t, this.valueContent = r;
  }
  parseOperands(t) {
    if (!Array.isArray(t)) throw new Error("where filter: operands must be an array");
    this.operands = t.map((r) => new e5(r).toString()).join(",");
  }
};
var _r = class extends O {
  className;
  fields;
  groupBy;
  hybridString;
  includesNearMediaFilter;
  limit;
  nearMediaString;
  nearMediaType;
  nearObjectString;
  nearTextString;
  nearVectorString;
  objectLimit;
  whereString;
  tenant;
  constructor(t) {
    super(t), this.includesNearMediaFilter = false;
  }
  withFields = (t) => (this.fields = t, this);
  withClassName = (t) => (this.className = t, this);
  withWhere = (t) => {
    try {
      this.whereString = new un(t).toString();
    } catch (r) {
      this.addError(r);
    }
    return this;
  };
  withNearMedia = (t) => {
    if (this.includesNearMediaFilter) throw new Error("cannot use multiple near<Media> filters in a single query");
    try {
      this.nearMediaString = new Sr(t).toString(), this.nearMediaType = t.type, this.includesNearMediaFilter = true;
    } catch (r) {
      this.addError(r.toString());
    }
    return this;
  };
  withNearImage = (t) => this.withNearMedia({ ...t, media: t.image, type: "Image" });
  withNearAudio = (t) => this.withNearMedia({ ...t, media: t.audio, type: "Audio" });
  withNearVideo = (t) => this.withNearMedia({ ...t, media: t.video, type: "Video" });
  withNearDepth = (t) => this.withNearMedia({ ...t, media: t.depth, type: "Depth" });
  withNearIMU = (t) => this.withNearMedia({ ...t, media: t.imu, type: "IMU" });
  withNearText = (t) => {
    if (this.includesNearMediaFilter) throw new Error("cannot use multiple near<Media> filters in a single query");
    try {
      this.nearTextString = new Or(t).toString(), this.includesNearMediaFilter = true;
    } catch (r) {
      this.addError(r.toString());
    }
    return this;
  };
  withNearObject = (t) => {
    if (this.includesNearMediaFilter) throw new Error("cannot use multiple near<Media> filters in a single query");
    try {
      this.nearObjectString = new kr(t).toString(), this.includesNearMediaFilter = true;
    } catch (r) {
      this.addError(r.toString());
    }
    return this;
  };
  withNearVector = (t) => {
    if (this.includesNearMediaFilter) throw new Error("cannot use multiple near<Media> filters in a single query");
    try {
      this.nearVectorString = new Ir(t).toString(), this.includesNearMediaFilter = true;
    } catch (r) {
      this.addError(r.toString());
    }
    return this;
  };
  withHybrid = (t) => {
    try {
      this.hybridString = new sn(t).toString();
    } catch (r) {
      this.addError(r.toString());
    }
    return this;
  };
  withObjectLimit = (t) => {
    if (!Ld(t)) throw new Error("objectLimit must be a non-negative integer");
    return this.objectLimit = t, this;
  };
  withLimit = (t) => (this.limit = t, this);
  withGroupBy = (t) => (this.groupBy = t, this);
  withTenant = (t) => (this.tenant = t, this);
  validateGroup = () => {
    if (this.groupBy && !Array.isArray(this.groupBy)) throw new Error("groupBy must be an array");
  };
  validateIsSet = (t, r, a) => {
    (t == null || t == null || t.length == 0) && this.addError(`${r} must be set - set with ${a}`);
  };
  validate = () => {
    this.validateGroup(), this.validateIsSet(this.className, "className", ".withClassName(className)"), this.validateIsSet(this.fields, "fields", ".withFields(fields)");
  };
  do = () => {
    let t = "";
    if (this.validate(), this.errors.length > 0) return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
    if (this.whereString || this.nearTextString || this.nearObjectString || this.nearVectorString || this.limit || this.groupBy || this.hybridString || this.tenant) {
      let r = [];
      this.whereString && (r = [...r, `where:${this.whereString}`]), this.nearTextString && (r = [...r, `nearText:${this.nearTextString}`]), this.nearObjectString && (r = [...r, `nearObject:${this.nearObjectString}`]), this.nearVectorString && (r = [...r, `nearVector:${this.nearVectorString}`]), this.nearMediaString && (r = [...r, `${this.nearMediaType}:${this.nearMediaString}`]), this.groupBy && (r = [...r, `groupBy:${JSON.stringify(this.groupBy)}`]), this.hybridString && (r = [...r, `hybrid:${this.hybridString}`]), this.limit && (r = [...r, `limit:${this.limit}`]), this.objectLimit && (r = [...r, `objectLimit:${this.objectLimit}`]), this.tenant && (r = [...r, `tenant:"${this.tenant}"`]), t = `(${r.join(",")})`;
    }
    return this.client.query(`{Aggregate{${this.className}${t}{${this.fields}}}}`);
  };
};
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
var es = {};
d();
d();
var Et = class {
  client;
  constructor(t) {
    this.client = t;
  }
  do = () => this.client.getRaw("/.well-known/openid-configuration").then((t) => t.status < 400 ? t.json() : t.status == 404 ? Promise.resolve(void 0) : Promise.reject(new Error(`unexpected status code: ${t.status}`)));
};
d();
var zd = "3.13.1";
d();
var is = (e24) => typeof e24 == "string" || e24 instanceof Br;
var $d = (e24) => e24 instanceof Br ? e24 : new Br(e24);
var oo = class {
  http;
  creds;
  accessToken;
  refreshToken;
  expiresAt;
  refreshRunning;
  refreshInterval;
  constructor(t, r) {
    this.http = t, this.creds = r, this.accessToken = "", this.refreshToken = "", this.expiresAt = 0, this.refreshRunning = false, this.creds instanceof dn && (this.accessToken = this.creds.accessToken, this.expiresAt = this.creds.expiresAt, this.refreshToken = this.creds.refreshToken);
  }
  refresh = async (t) => {
    let r = await this.getOpenidConfig(t), a;
    switch (this.creds.constructor) {
      case xa:
        a = new ts(this.http, this.creds, r);
        break;
      case dn:
        a = new rs(this.http, this.creds, r);
        break;
      case Ca:
        a = new ns(this.http, this.creds, r);
        break;
      default:
        throw new Error("unsupported credential type");
    }
    return a.refresh().then((i) => {
      this.accessToken = i.accessToken, this.expiresAt = i.expiresAt, this.refreshToken = i.refreshToken, this.startTokenRefresh(a);
    });
  };
  getOpenidConfig = (t) => this.http.externalGet(t.href).then((r) => {
    let a = t.scopes || [];
    return { clientId: t.clientId, provider: r, scopes: a };
  });
  startTokenRefresh = (t) => {
    this.creds.silentRefresh && !this.refreshRunning && this.refreshTokenProvided() && (this.refreshInterval = setInterval(async () => {
      if (this.expiresAt - Date.now() <= 6e4) {
        let r = await t.refresh();
        this.accessToken = r.accessToken, this.expiresAt = r.expiresAt, this.refreshToken = r.refreshToken;
      }
    }, 3e4), this.refreshRunning = true);
  };
  stopTokenRefresh = () => {
    clearInterval(this.refreshInterval), this.refreshRunning = false;
  };
  refreshTokenProvided = () => this.refreshToken && this.refreshToken != "";
  getAccessToken = () => this.accessToken;
  getExpiresAt = () => this.expiresAt;
  resetExpiresAt() {
    this.expiresAt = 0;
  }
};
var xa = class {
  username;
  password;
  scopes;
  silentRefresh;
  constructor(t) {
    this.username = t.username, this.password = t.password, this.scopes = t.scopes, this.silentRefresh = as(t.silentRefresh);
  }
};
var ts = class {
  creds;
  http;
  openidConfig;
  constructor(t, r, a) {
    this.http = t, this.creds = r, this.openidConfig = a, r.scopes && this.openidConfig.scopes.push(r.scopes);
  }
  refresh = () => (this.validateOpenidConfig(), this.requestAccessToken().then((t) => ({ accessToken: t.access_token, expiresAt: so(t.expires_in), refreshToken: t.refresh_token })).catch((t) => Promise.reject(new Error(`failed to refresh access token: ${t}`))));
  validateOpenidConfig = () => {
    if (this.openidConfig.provider.grant_types_supported !== void 0 && !this.openidConfig.provider.grant_types_supported.includes("password")) throw new Error("grant_type password not supported");
    if (this.openidConfig.provider.token_endpoint.includes("https://login.microsoftonline.com")) throw new Error("microsoft/azure recommends to avoid authentication using username and password, so this method is not supported by this client");
    this.openidConfig.scopes.push("offline_access");
  };
  requestAccessToken = () => {
    let t = this.openidConfig.provider.token_endpoint, r = new URLSearchParams({ grant_type: "password", client_id: this.openidConfig.clientId, username: this.creds.username, password: this.creds.password, scope: this.openidConfig.scopes.join(" ") });
    return this.http.externalPost(t, r, "application/x-www-form-urlencoded;charset=UTF-8");
  };
};
var dn = class {
  accessToken;
  expiresAt;
  refreshToken;
  silentRefresh;
  constructor(t) {
    this.validate(t), this.accessToken = t.accessToken, this.expiresAt = so(t.expiresIn), this.refreshToken = t.refreshToken, this.silentRefresh = as(t.silentRefresh);
  }
  validate = (t) => {
    if (t.expiresIn === void 0) throw new Error("AuthAccessTokenCredentials: expiresIn is required");
    if (!Number.isInteger(t.expiresIn) || t.expiresIn <= 0) throw new Error("AuthAccessTokenCredentials: expiresIn must be int > 0");
  };
};
var rs = class {
  creds;
  http;
  openidConfig;
  constructor(t, r, a) {
    this.http = t, this.creds = r, this.openidConfig = a;
  }
  refresh = () => this.creds.refreshToken === void 0 || this.creds.refreshToken == "" ? (console.warn("AuthAccessTokenCredentials not provided with refreshToken, cannot refresh"), Promise.resolve({ accessToken: this.creds.accessToken, expiresAt: this.creds.expiresAt })) : (this.validateOpenidConfig(), this.requestAccessToken().then((t) => ({ accessToken: t.access_token, expiresAt: so(t.expires_in), refreshToken: t.refresh_token })).catch((t) => Promise.reject(new Error(`failed to refresh access token: ${t}`))));
  validateOpenidConfig = () => {
  };
  requestAccessToken = () => {
    let t = this.openidConfig.provider.token_endpoint, r = new URLSearchParams({ grant_type: "refresh_token", client_id: this.openidConfig.clientId, refresh_token: this.creds.refreshToken });
    return this.http.externalPost(t, r, "application/x-www-form-urlencoded;charset=UTF-8");
  };
};
var Ca = class {
  clientSecret;
  scopes;
  silentRefresh;
  constructor(t) {
    this.clientSecret = t.clientSecret, this.scopes = t.scopes, this.silentRefresh = as(t.silentRefresh);
  }
};
var ns = class {
  creds;
  http;
  openidConfig;
  constructor(t, r, a) {
    this.http = t, this.creds = r, this.openidConfig = a, r.scopes && this.openidConfig.scopes.push(r.scopes);
  }
  refresh = () => (this.validateOpenidConfig(), this.requestAccessToken().then((t) => ({ accessToken: t.access_token, expiresAt: so(t.expires_in), refreshToken: t.refresh_token })).catch((t) => Promise.reject(new Error(`failed to refresh access token: ${t}`))));
  validateOpenidConfig = () => {
    this.openidConfig.scopes.length > 0 || this.openidConfig.provider.token_endpoint.includes("https://login.microsoftonline.com") && this.openidConfig.scopes.push(this.openidConfig.clientId + "/.default");
  };
  requestAccessToken = () => {
    let t = this.openidConfig.provider.token_endpoint, r = new URLSearchParams({ grant_type: "client_credentials", client_id: this.openidConfig.clientId, client_secret: this.creds.clientSecret, scope: this.openidConfig.scopes.join(" ") });
    return this.http.externalPost(t, r, "application/x-www-form-urlencoded;charset=UTF-8");
  };
};
var Br = class {
  apiKey;
  constructor(t) {
    this.apiKey = t;
  }
};
function so(e24) {
  return Date.now() + (e24 - 2) * 1e3;
}
function as(e24) {
  return e24 === void 0 ? true : e24;
}
var cn = class {
  apiKey;
  headers;
  authEnabled;
  host;
  http;
  oidcAuth;
  constructor(t) {
    t = this.sanitizeParams(t), this.host = t.host, this.headers = t.headers, this.http = os(t), this.authEnabled = this.parseAuthParams(t);
  }
  isWcdOnGcp = () => ["weaviate.io", "semi.technology", "weaviate.cloud"].some((t) => this.host.toLowerCase().includes(t)) && this.host.toLowerCase().includes("gcp");
  parseAuthParams(t) {
    if (t.authClientSecret && t.apiKey) throw new F("must provide one of authClientSecret (OIDC) or apiKey, cannot provide both");
    return t.authClientSecret ? (this.oidcAuth = new oo(this.http, t.authClientSecret), true) : t.apiKey ? (this.apiKey = t.apiKey?.apiKey, true) : false;
  }
  sanitizeParams(t) {
    for (; t.host.endsWith("/"); ) t.host = t.host.slice(0, -1);
    let r = /^(https?|ftp|file)(?::\/\/)/, a = t.host.match(r);
    if (t.scheme) {
      if (a && a[1] !== `${t.scheme}`) throw new F(`The host contains a different protocol than specified in the scheme (scheme: ${t.scheme} != host: ${a[1]})`);
      a || (t.host = `${t.scheme}://${t.host}`);
    } else if (!a) throw new F("The host must start with a recognized protocol (e.g., http or https) if no scheme is provided.");
    return t;
  }
  postReturn = (t, r) => this.authEnabled ? this.login().then((a) => this.http.post(t, r, true, a)) : this.http.post(t, r, true, "");
  postEmpty = (t, r) => this.authEnabled ? this.login().then((a) => this.http.post(t, r, false, a)) : this.http.post(t, r, false, "");
  put = (t, r, a = true) => this.authEnabled ? this.login().then((i) => this.http.put(t, r, a, i)) : this.http.put(t, r, a);
  patch = (t, r) => this.authEnabled ? this.login().then((a) => this.http.patch(t, r, a)) : this.http.patch(t, r);
  delete = (t, r, a = false) => this.authEnabled ? this.login().then((i) => this.http.delete(t, r, a, i)) : this.http.delete(t, r, a);
  head = (t, r) => this.authEnabled ? this.login().then((a) => this.http.head(t, r, a)) : this.http.head(t, r);
  get = (t, r = true) => this.authEnabled ? this.login().then((a) => this.http.get(t, r, a)) : this.http.get(t, r);
  login = async () => {
    if (this.apiKey) return this.apiKey;
    if (!this.oidcAuth) return "";
    let t = await new Et(this.http).do();
    return t === void 0 ? (console.warn("client is configured for authentication, but server is not"), "") : (Date.now() >= this.oidcAuth.getExpiresAt() && await this.oidcAuth.refresh(t), this.oidcAuth.getAccessToken());
  };
  getDetails = async () => ({ host: new URL(this.host).host, bearerToken: this.authEnabled ? await this.login().then((t) => `Bearer ${t}`) : void 0, headers: this.headers });
};
var Gr = (e24, t, r) => {
  let a = new AbortController(), i = setTimeout(() => a.abort(), t * 1e3);
  return fetch(e24, { ...r, signal: a.signal }).catch((n) => {
    throw (0, import_abort_controller_x.isAbortError)(n) ? new Xr(`Request timed out after ${t}ms`) : n;
  }).finally(() => clearTimeout(i));
};
var os = (e24) => {
  let r = `${e24.host}/v1`, a = um(r);
  return { close: () => e24.agent?.destroy?.(), post: (i, n, o, s) => {
    let u = { method: "POST", headers: { ...e24.headers, "content-type": "application/json", ...wr(e24, s), ...Ut() }, body: JSON.stringify(n), agent: e24.agent };
    return Gr(a(i), e24.timeout?.insert || 90, u).then(nr(o));
  }, put: (i, n, o = true, s = "") => {
    let u = { method: "PUT", headers: { ...e24.headers, "content-type": "application/json", ...wr(e24, s), ...Ut() }, body: JSON.stringify(n), agent: e24.agent };
    return Gr(a(i), e24.timeout?.insert || 90, u).then(nr(o));
  }, patch: (i, n, o = "") => {
    let s = { method: "PATCH", headers: { ...e24.headers, "content-type": "application/json", ...wr(e24, o), ...Ut() }, body: JSON.stringify(n), agent: e24.agent };
    return Gr(a(i), e24.timeout?.insert || 90, s).then(nr(false));
  }, delete: (i, n = null, o = false, s = "") => {
    let u = { method: "DELETE", headers: { ...e24.headers, "content-type": "application/json", ...wr(e24, s), ...Ut() }, body: n ? JSON.stringify(n) : void 0, agent: e24.agent };
    return Gr(a(i), e24.timeout?.insert || 90, u).then(nr(o));
  }, head: (i, n = null, o = "") => {
    let s = { method: "HEAD", headers: { ...e24.headers, "content-type": "application/json", ...wr(e24, o), ...Ut() }, body: n ? JSON.stringify(n) : void 0, agent: e24.agent };
    return Gr(a(i), e24.timeout?.query || 30, s).then(dm(false));
  }, get: (i, n = true, o = "") => {
    let s = { method: "GET", headers: { ...e24.headers, ...wr(e24, o), ...Ut() }, agent: e24.agent };
    return Gr(a(i), e24.timeout?.query || 30, s).then(nr(n));
  }, getRaw: (i, n = "") => {
    let o = { method: "GET", headers: { ...e24.headers, ...wr(e24, n), ...Ut() }, agent: e24.agent };
    return Gr(a(i), e24.timeout?.query || 30, o);
  }, externalGet: (i) => fetch(i, { method: "GET", headers: { ...e24.headers } }).then(nr(true)), externalPost: (i, n, o) => {
    (o == null || o == "") && (o = "application/json");
    let s = { body: void 0, method: "POST", headers: { ...e24.headers, "content-type": o } };
    return n != null && (s.body = n), fetch(i, s).then(nr(true));
  } };
};
var um = (e24) => (t) => e24 + t;
var nr = (e24) => (t) => t.status >= 400 ? t.text().then((r) => {
  let a;
  try {
    a = JSON.stringify(JSON.parse(r));
  } catch {
    a = r;
  }
  return t.status === 401 ? Promise.reject(new La(a)) : t.status === 403 ? Promise.reject(new jr(403, a)) : Promise.reject(new Ct(t.status, a));
}) : e24 ? t.json() : Promise.resolve(void 0);
var dm = (e24) => (t) => t.status == 200 || t.status == 204 || t.status == 404 ? Promise.resolve(t.status == 200 || t.status == 204) : nr(e24)(t);
var wr = (e24, t) => t ? { Authorization: `Bearer ${t}`, "X-Weaviate-Cluster-Url": e24.host } : void 0;
var Ut = () => ({ "X-Weaviate-Client": `weaviate-client-typescript/${zd}` });
var cm = (e24) => new Promise((t, r) => {
  e24 instanceof p.Buffer && t(false), es.stat(e24, (a, i) => {
    if (a) {
      if (a.code == "ENAMETOOLONG") {
        t(false);
        return;
      }
      r(a);
      return;
    }
    if (i === void 0) {
      t(false);
      return;
    }
    t(i.isFile());
  });
});
var Hd = (e24) => {
  if (typeof e24 != "string") return false;
  try {
    return !!new URL(e24);
  } catch {
    return false;
  }
};
var lm = async (e24) => {
  if (!Hd(e24)) throw new Error("Invalid URL");
  try {
    let r = await os({ headers: { "Content-Type": "image/*" }, host: "" }).externalGet(e24);
    if (!p.Buffer.isBuffer(r)) throw new Error("Response is not a buffer");
    return r.toString("base64");
  } catch {
    throw new Error(`Failed to download image from URL: ${e24}`);
  }
};
var fm = (e24) => e24 instanceof p.Buffer;
var pm = (e24) => cm(e24).then((t) => t ? new Promise((r, a) => {
  es.readFile(e24, (i, n) => {
    i && a(i), r(n.toString("base64"));
  });
}) : fm(e24) ? Promise.resolve(e24.toString("base64")) : Hd(e24) ? lm(e24) : Promise.resolve(e24));
var lt = (e24) => pm(e24);
d();
d();
var De = ze(Ke());
function gm(e24) {
  switch (e24) {
    case 0:
    case "TENANT_ACTIVITY_STATUS_UNSPECIFIED":
      return 0;
    case 1:
    case "TENANT_ACTIVITY_STATUS_HOT":
      return 1;
    case 2:
    case "TENANT_ACTIVITY_STATUS_COLD":
      return 2;
    case 4:
    case "TENANT_ACTIVITY_STATUS_FROZEN":
      return 4;
    case 5:
    case "TENANT_ACTIVITY_STATUS_UNFREEZING":
      return 5;
    case 6:
    case "TENANT_ACTIVITY_STATUS_FREEZING":
      return 6;
    case 7:
    case "TENANT_ACTIVITY_STATUS_ACTIVE":
      return 7;
    case 8:
    case "TENANT_ACTIVITY_STATUS_INACTIVE":
      return 8;
    case 9:
    case "TENANT_ACTIVITY_STATUS_OFFLOADED":
      return 9;
    case 10:
    case "TENANT_ACTIVITY_STATUS_OFFLOADING":
      return 10;
    case 11:
    case "TENANT_ACTIVITY_STATUS_ONLOADING":
      return 11;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function mm(e24) {
  switch (e24) {
    case 0:
      return "TENANT_ACTIVITY_STATUS_UNSPECIFIED";
    case 1:
      return "TENANT_ACTIVITY_STATUS_HOT";
    case 2:
      return "TENANT_ACTIVITY_STATUS_COLD";
    case 4:
      return "TENANT_ACTIVITY_STATUS_FROZEN";
    case 5:
      return "TENANT_ACTIVITY_STATUS_UNFREEZING";
    case 6:
      return "TENANT_ACTIVITY_STATUS_FREEZING";
    case 7:
      return "TENANT_ACTIVITY_STATUS_ACTIVE";
    case 8:
      return "TENANT_ACTIVITY_STATUS_INACTIVE";
    case 9:
      return "TENANT_ACTIVITY_STATUS_OFFLOADED";
    case 10:
      return "TENANT_ACTIVITY_STATUS_OFFLOADING";
    case 11:
      return "TENANT_ACTIVITY_STATUS_ONLOADING";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function Qd() {
  return { collection: "", names: void 0 };
}
var Ra = { encode(e24, t = De.default.Writer.create()) {
  return e24.collection !== "" && t.uint32(10).string(e24.collection), e24.names !== void 0 && ln.encode(e24.names, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof De.default.Reader ? e24 : De.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Qd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.collection = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.names = ln.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { collection: Pa(e24.collection) ? globalThis.String(e24.collection) : "", names: Pa(e24.names) ? ln.fromJSON(e24.names) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.collection !== "" && (t.collection = e24.collection), e24.names !== void 0 && (t.names = ln.toJSON(e24.names)), t;
}, create(e24) {
  return Ra.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Qd();
  return t.collection = e24.collection ?? "", t.names = e24.names !== void 0 && e24.names !== null ? ln.fromPartial(e24.names) : void 0, t;
} };
function Kd() {
  return { values: [] };
}
var ln = { encode(e24, t = De.default.Writer.create()) {
  for (let r of e24.values) t.uint32(10).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof De.default.Reader ? e24 : De.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Kd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return ln.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Kd();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Yd() {
  return { took: 0, tenants: [] };
}
var ss = { encode(e24, t = De.default.Writer.create()) {
  e24.took !== 0 && t.uint32(13).float(e24.took);
  for (let r of e24.tenants) fn.encode(r, t.uint32(18).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof De.default.Reader ? e24 : De.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Yd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.took = r.float();
        continue;
      case 2:
        if (n !== 18) break;
        i.tenants.push(fn.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { took: Pa(e24.took) ? globalThis.Number(e24.took) : 0, tenants: globalThis.Array.isArray(e24?.tenants) ? e24.tenants.map((t) => fn.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.took !== 0 && (t.took = e24.took), e24.tenants?.length && (t.tenants = e24.tenants.map((r) => fn.toJSON(r))), t;
}, create(e24) {
  return ss.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Yd();
  return t.took = e24.took ?? 0, t.tenants = e24.tenants?.map((r) => fn.fromPartial(r)) || [], t;
} };
function Zd() {
  return { name: "", activityStatus: 0 };
}
var fn = { encode(e24, t = De.default.Writer.create()) {
  return e24.name !== "" && t.uint32(10).string(e24.name), e24.activityStatus !== 0 && t.uint32(16).int32(e24.activityStatus), t;
}, decode(e24, t) {
  let r = e24 instanceof De.default.Reader ? e24 : De.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Zd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.name = r.string();
        continue;
      case 2:
        if (n !== 16) break;
        i.activityStatus = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { name: Pa(e24.name) ? globalThis.String(e24.name) : "", activityStatus: Pa(e24.activityStatus) ? gm(e24.activityStatus) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.name !== "" && (t.name = e24.name), e24.activityStatus !== 0 && (t.activityStatus = mm(e24.activityStatus)), t;
}, create(e24) {
  return fn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Zd();
  return t.name = e24.name ?? "", t.activityStatus = e24.activityStatus ?? 0, t;
} };
function Pa(e24) {
  return e24 != null;
}
d();
var uo = () => new Promise((e24) => setTimeout(e24, 0));
d();
d();
var ir = class {
  objects;
  targetCollection;
  uuids;
  constructor(t, r, a) {
    this.objects = r ?? [], this.targetCollection = t, this.uuids = a;
  }
  toBeaconObjs() {
    return this.uuids ? this.uuids.map((t) => Fe(t, this.targetCollection)) : [];
  }
  toBeaconStrings() {
    return this.uuids ? this.uuids.map((t) => Fe(t, this.targetCollection).beacon) : [];
  }
  isMultiTarget() {
    return this.targetCollection !== "";
  }
};
var us = class {
  static to(t) {
    return new ir("", void 0, Array.isArray(t) ? t : [t]);
  }
  static toMultiTarget(t, r) {
    return new ir(r, void 0, Array.isArray(t) ? t : [t]);
  }
};
var fe = class {
  static isReferenceManager(t) {
    return t instanceof ir;
  }
  static isUuid(t) {
    return typeof t == "string";
  }
  static isUuids(t) {
    return Array.isArray(t);
  }
  static isMultiTarget(t) {
    return t.targetCollection !== void 0;
  }
};
function Fe(e24, t) {
  return { beacon: `weaviate://localhost/${t ? `${t}/` : ""}${e24}` };
}
var Xd = (e24, t, r) => new ir(t, e24, r);
var Aa = (e24) => fe.isReferenceManager(e24) ? e24.toBeaconObjs() : fe.isUuid(e24) ? [Fe(e24)] : fe.isUuids(e24) ? e24.map((t) => Fe(t)) : fe.isMultiTarget(e24) ? typeof e24.uuids == "string" ? [Fe(e24.uuids, e24.targetCollection)] : e24.uuids.map((t) => Fe(t, e24.targetCollection)) : [];
var Tm = 2;
var vm = 4;
var Y = class e6 {
  static use(t) {
    return Promise.resolve(new e6());
  }
  static aggregateBoolean(t) {
    return { count: t.count, percentageFalse: t.percentageFalse, percentageTrue: t.percentageTrue, totalFalse: t.totalFalse, totalTrue: t.totalTrue };
  }
  static aggregateDate(t) {
    let r = (a) => a !== void 0 ? a : void 0;
    return { count: t.count, maximum: r(t.maximum), median: r(t.median), minimum: r(t.minimum), mode: r(t.mode) };
  }
  static aggregateInt(t) {
    return { count: t.count, maximum: t.maximum, mean: t.mean, median: t.median, minimum: t.minimum, mode: t.mode, sum: t.sum };
  }
  static aggregateNumber(t) {
    return { count: t.count, maximum: t.maximum, mean: t.mean, median: t.median, minimum: t.minimum, mode: t.mode, sum: t.sum };
  }
  static aggregateText(t) {
    return { count: t.count, topOccurrences: t.topOccurences?.items.map((r) => ({ occurs: r.occurs, value: r.value })) };
  }
  static mapAggregate(t) {
    if (t.boolean !== void 0) return e6.aggregateBoolean(t.boolean);
    if (t.date !== void 0) return e6.aggregateDate(t.date);
    if (t.int !== void 0) return e6.aggregateInt(t.int);
    if (t.number !== void 0) return e6.aggregateNumber(t.number);
    if (t.text !== void 0) return e6.aggregateText(t.text);
    throw new b(`Unknown aggregation type: ${t}`);
  }
  static aggregations(t) {
    return t ? Object.fromEntries(t.aggregations.map((r) => [r.property, e6.mapAggregate(r)])) : {};
  }
  static aggregate(t) {
    if (t.singleResult === void 0) throw new b("No single result in aggregate response");
    return { totalCount: t.singleResult.objectsCount, properties: e6.aggregations(t.singleResult.aggregations) };
  }
  static aggregateGroupBy(t) {
    if (t.groupedResults === void 0) throw new b("No grouped results in aggregate response");
    let r = (a) => {
      if (a === void 0) throw new b("No groupedBy in aggregate response");
      let i;
      return a.boolean !== void 0 ? i = a.boolean : a.booleans !== void 0 ? i = a.booleans.values : a.geo !== void 0 ? i = a.geo : a.int !== void 0 ? i = a.int : a.ints !== void 0 ? i = a.ints.values : a.number !== void 0 ? i = a.number : a.numbers !== void 0 ? i = a.numbers.values : a.text !== void 0 ? i = a.text : a.texts !== void 0 ? i = a.texts.values : (console.warn(`Unknown groupBy type: ${JSON.stringify(a, null, 2)}`), i = ""), { prop: a.path[0], value: i };
    };
    return t.groupedResults.groups.map((a) => ({ totalCount: a.objectsCount, groupedBy: r(a.groupedBy), properties: e6.aggregations(a.aggregations) }));
  }
  async query(t) {
    return { objects: await Promise.all(t.results.map(async (r) => ({ metadata: e6.metadata(r.metadata), properties: this.properties(r.properties), references: await this.references(r.properties), uuid: e6.uuid(r.metadata), vectors: await e6.vectors(r.metadata) }))), queryProfile: t.queryProfile };
  }
  async generate(t) {
    return { objects: await Promise.all(t.results.map(async (r) => ({ generated: r.metadata?.generativePresent ? r.metadata?.generative : r.generative ? r.generative.values[0].result : void 0, generative: r.generative ? { text: r.generative.values[0].result, debug: r.generative.values[0].debug, metadata: r.generative.values[0].metadata } : r.metadata?.generativePresent ? { text: r.metadata?.generative } : void 0, metadata: e6.metadata(r.metadata), properties: this.properties(r.properties), references: await this.references(r.properties), uuid: e6.uuid(r.metadata), vectors: await e6.vectors(r.metadata) }))), generated: t.generativeGroupedResult !== "" ? t.generativeGroupedResult : t.generativeGroupedResults ? t.generativeGroupedResults.values[0].result : void 0, generative: t.generativeGroupedResults ? { text: t.generativeGroupedResults?.values[0].result, metadata: t.generativeGroupedResults?.values[0].metadata } : t.generativeGroupedResult !== "" ? { text: t.generativeGroupedResult } : void 0, queryProfile: t.queryProfile };
  }
  async queryGroupBy(t) {
    let r = [], a = {};
    for (let i of t.groupByResults) {
      let n = await Promise.all(i.objects.map(async (o) => ({ belongsToGroup: i.name, metadata: e6.metadata(o.metadata), properties: this.properties(o.properties), references: await this.references(o.properties), uuid: e6.uuid(o.metadata), vectors: await e6.vectors(o.metadata) })));
      a[i.name] = { maxDistance: i.maxDistance, minDistance: i.minDistance, name: i.name, numberOfObjects: i.numberOfObjects, objects: n }, r.push(...n);
    }
    return { objects: r, groups: a, queryProfile: t.queryProfile };
  }
  async generateGroupBy(t) {
    let r = [], a = {};
    for (let i of t.groupByResults) {
      let n = await Promise.all(i.objects.map(async (o) => ({ belongsToGroup: i.name, metadata: e6.metadata(o.metadata), properties: this.properties(o.properties), references: await this.references(o.properties), uuid: e6.uuid(o.metadata), vectors: await e6.vectors(o.metadata) })));
      a[i.name] = { maxDistance: i.maxDistance, minDistance: i.minDistance, name: i.name, numberOfObjects: i.numberOfObjects, objects: n, generated: i.generative?.result }, r.push(...n);
    }
    return { objects: r, groups: a, generated: t.generativeGroupedResult, queryProfile: t.queryProfile };
  }
  properties(t) {
    return t ? this.objectProperties(t.nonRefProps) : {};
  }
  async references(t) {
    if (!t) return;
    if (t.refProps.length === 0) return t.refPropsRequested ? {} : void 0;
    let r = {};
    for (let a of t.refProps) {
      let i = [];
      r[a.propName] = Xd(await Promise.all(a.properties.map(async (n) => {
        let o = e6.uuid(n.metadata);
        return i.push(o), { metadata: e6.metadata(n.metadata), properties: this.properties(n), references: await this.references(n), uuid: o, vectors: await e6.vectors(n.metadata) };
      })), a.properties.length > 0 ? a.properties[0].targetCollection : "", i);
    }
    return r;
  }
  parsePropertyValue(t) {
    if (t.boolValue !== void 0) return t.boolValue;
    if (t.dateValue !== void 0) return new Date(t.dateValue);
    if (t.intValue !== void 0) return t.intValue;
    if (t.listValue !== void 0) return this.parseListValue(t.listValue);
    if (t.numberValue !== void 0) return t.numberValue;
    if (t.objectValue !== void 0) return this.objectProperties(t.objectValue);
    if (t.textValue !== void 0) return t.textValue;
    if (t.uuidValue !== void 0) return t.uuidValue;
    if (t.blobValue !== void 0) return t.blobValue;
    if (t.geoValue !== void 0) return t.geoValue;
    if (t.phoneValue !== void 0) return t.phoneValue;
    if (t.nullValue === void 0) throw new b(`Unknown value type: ${JSON.stringify(t, null, 2)}`);
  }
  parseListValue(t) {
    if (t.boolValues !== void 0) return t.boolValues.values;
    if (t.dateValues !== void 0) return t.dateValues.values.map((r) => new Date(r));
    if (t.intValues !== void 0) return e6.intsFromBytes(t.intValues.values);
    if (t.numberValues !== void 0) return e6.numbersFromBytes(t.numberValues.values);
    if (t.objectValues !== void 0) return t.objectValues.values.map((r) => this.objectProperties(r));
    if (t.textValues !== void 0) return t.textValues.values;
    if (t.uuidValues !== void 0) return t.uuidValues.values;
    throw new Error(`Unknown list value type: ${JSON.stringify(t, null, 2)}`);
  }
  objectProperties(t) {
    let r = {};
    return t && Object.entries(t.fields).forEach(([a, i]) => {
      r[a] = this.parsePropertyValue(i);
    }), r;
  }
  static metadata(t) {
    let r = {};
    if (t) return t.creationTimeUnixPresent && (r.creationTime = new Date(t.creationTimeUnix)), t.lastUpdateTimeUnixPresent && (r.updateTime = new Date(t.lastUpdateTimeUnix)), t.distancePresent && (r.distance = t.distance), t.certaintyPresent && (r.certainty = t.certainty), t.scorePresent && (r.score = t.score), t.explainScorePresent && (r.explainScore = t.explainScore), t.rerankScorePresent && (r.rerankScore = t.rerankScore), t.isConsistent && (r.isConsistent = t.isConsistent), r;
  }
  static uuid(t) {
    if (!t || !(t.id.length > 0)) throw new b("No uuid returned from server");
    return t.id;
  }
  static vectorsFromBytes(t) {
    let r = Tm, i = p.Buffer.from(t.slice(0, r)).readUInt16LE(0), n = vm * i, o = (t.byteLength - r) / n;
    return Promise.all(Array(o).fill(0).map((s, u) => uo().then(() => e6.vectorFromBytes(t.slice(r + u * n, r + (u + 1) * n)))));
  }
  static vectorFromBytes(t) {
    let r = p.Buffer.from(t), a = new Float32Array(r.buffer, r.byteOffset, r.byteLength / 4);
    return Array.from(a);
  }
  static intsFromBytes(t) {
    let r = p.Buffer.from(t), a = new BigInt64Array(r.buffer, r.byteOffset, r.byteLength / 8);
    return Array.from(a).map(Number);
  }
  static numbersFromBytes(t) {
    let r = p.Buffer.from(t), a = new Float64Array(r.buffer, r.byteOffset, r.byteLength / 8);
    return Array.from(a);
  }
  static async vectors(t) {
    return t ? t.vectorBytes.length === 0 && t.vector.length === 0 && t.vectors.length === 0 ? {} : t.vectorBytes.length > 0 ? { default: e6.vectorFromBytes(t.vectorBytes) } : Object.fromEntries(await Promise.all(t.vectors.map(async (r) => [r.name, r.type === 2 ? await e6.vectorsFromBytes(r.vectorBytes) : e6.vectorFromBytes(r.vectorBytes)]))) : {};
  }
  static batchObjects(t, r, a, i) {
    let n = [], o = {}, s = {}, u = {};
    t.errors.forEach((c) => {
      u[c.index] = c.error;
    });
    for (let [c, f2] of r.entries()) if (c in u) {
      let y = { message: u[c], object: f2, originalUuid: f2.id };
      o[c] = y, n[c] = y;
    } else {
      let y = a[c];
      s[c] = y.uuid, n[c] = y.uuid;
    }
    return { uuids: s, errors: o, hasErrors: t.errors.length > 0, allResponses: n, elapsedSeconds: i };
  }
  static deleteMany(t, r) {
    return { ...t, objects: r ? t.objects.map((a) => ({ id: stringify_default(a.uuid), successful: a.successful, error: a.error })) : void 0 };
  }
  static activityStatusGRPC(t) {
    switch (t) {
      case 2:
      case 8:
        return "INACTIVE";
      case 1:
      case 7:
        return "ACTIVE";
      case 4:
      case 9:
        return "OFFLOADED";
      case 6:
      case 10:
        return "OFFLOADING";
      case 5:
      case 11:
        return "ONLOADING";
      default:
        throw new Error(`Unsupported tenant activity status: ${t}`);
    }
  }
  static activityStatusREST(t) {
    switch (t) {
      case "COLD":
        return "INACTIVE";
      case "HOT":
        return "ACTIVE";
      case "FROZEN":
        return "OFFLOADED";
      case "FREEZING":
        return "OFFLOADING";
      case "UNFREEZING":
        return "ONLOADING";
      case void 0:
        return "ACTIVE";
      default:
        return t;
    }
  }
  static tenantsGet(t) {
    let r = {};
    return t.tenants.forEach((a) => {
      r[a.name] = { name: a.name, activityStatus: e6.activityStatusGRPC(a.activityStatus) };
    }), r;
  }
};
d();
var Te = class {
  static is1D(t) {
    return Array.isArray(t) && t.length > 0 && !Array.isArray(t[0]);
  }
  static is2D(t) {
    return Array.isArray(t) && t.length > 0 && Array.isArray(t[0]) && t[0].length > 0;
  }
  static isObject(t) {
    return !Array.isArray(t);
  }
  static isListOf1D(t) {
    let r = t;
    return !Array.isArray(t) && r.kind === "listOfVectors" && r.dimensionality == "1D";
  }
  static isListOf2D(t) {
    let r = t;
    return !Array.isArray(t) && r.kind === "listOfVectors" && r.dimensionality == "2D";
  }
};
var Dt = class {
  static is1DArray(t) {
    return Array.isArray(t) && t.length > 0 && !Array.isArray(t[0]);
  }
  static is2DArray(t) {
    return Array.isArray(t) && t.length > 0 && Array.isArray(t[0]);
  }
};
var Mr = class {
  static isSingle(t) {
    return typeof t == "string";
  }
  static isMulti(t) {
    return Array.isArray(t);
  }
  static isMultiJoin(t) {
    let r = t;
    return r.combination !== void 0 && r.targetVectors !== void 0;
  }
};
var ds = class {
  static and() {
    return { operator: "And" };
  }
  static or(t) {
    return { ...t, operator: "Or" };
  }
};
d();
d();
var I = ze(Ke());
function bm(e24) {
  switch (e24) {
    case 0:
    case "COMBINATION_METHOD_UNSPECIFIED":
      return 0;
    case 1:
    case "COMBINATION_METHOD_TYPE_SUM":
      return 1;
    case 2:
    case "COMBINATION_METHOD_TYPE_MIN":
      return 2;
    case 3:
    case "COMBINATION_METHOD_TYPE_AVERAGE":
      return 3;
    case 4:
    case "COMBINATION_METHOD_TYPE_RELATIVE_SCORE":
      return 4;
    case 5:
    case "COMBINATION_METHOD_TYPE_MANUAL":
      return 5;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function xm(e24) {
  switch (e24) {
    case 0:
      return "COMBINATION_METHOD_UNSPECIFIED";
    case 1:
      return "COMBINATION_METHOD_TYPE_SUM";
    case 2:
      return "COMBINATION_METHOD_TYPE_MIN";
    case 3:
      return "COMBINATION_METHOD_TYPE_AVERAGE";
    case 4:
      return "COMBINATION_METHOD_TYPE_RELATIVE_SCORE";
    case 5:
      return "COMBINATION_METHOD_TYPE_MANUAL";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function Cm(e24) {
  switch (e24) {
    case 0:
    case "OPERATOR_UNSPECIFIED":
      return 0;
    case 1:
    case "OPERATOR_OR":
      return 1;
    case 2:
    case "OPERATOR_AND":
      return 2;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Pm(e24) {
  switch (e24) {
    case 0:
      return "OPERATOR_UNSPECIFIED";
    case 1:
      return "OPERATOR_OR";
    case 2:
      return "OPERATOR_AND";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function Rm(e24) {
  switch (e24) {
    case 0:
    case "FUSION_TYPE_UNSPECIFIED":
      return 0;
    case 1:
    case "FUSION_TYPE_RANKED":
      return 1;
    case 2:
    case "FUSION_TYPE_RELATIVE_SCORE":
      return 2;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Am(e24) {
  switch (e24) {
    case 0:
      return "FUSION_TYPE_UNSPECIFIED";
    case 1:
      return "FUSION_TYPE_RANKED";
    case 2:
      return "FUSION_TYPE_RELATIVE_SCORE";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function jd() {
  return { target: "", weight: 0 };
}
var pn = { encode(e24, t = I.default.Writer.create()) {
  return e24.target !== "" && t.uint32(10).string(e24.target), e24.weight !== 0 && t.uint32(21).float(e24.weight), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = jd();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.target = r.string();
        continue;
      case 2:
        if (n !== 21) break;
        i.weight = r.float();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { target: A(e24.target) ? globalThis.String(e24.target) : "", weight: A(e24.weight) ? globalThis.Number(e24.weight) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.target !== "" && (t.target = e24.target), e24.weight !== 0 && (t.weight = e24.weight), t;
}, create(e24) {
  return pn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = jd();
  return t.target = e24.target ?? "", t.weight = e24.weight ?? 0, t;
} };
function ec() {
  return { targetVectors: [], combination: 0, weightsForTargets: [] };
}
var B = { encode(e24, t = I.default.Writer.create()) {
  for (let r of e24.targetVectors) t.uint32(10).string(r);
  e24.combination !== 0 && t.uint32(16).int32(e24.combination);
  for (let r of e24.weightsForTargets) pn.encode(r, t.uint32(34).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ec();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.targetVectors.push(r.string());
        continue;
      case 2:
        if (n !== 16) break;
        i.combination = r.int32();
        continue;
      case 4:
        if (n !== 34) break;
        i.weightsForTargets.push(pn.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], combination: A(e24.combination) ? bm(e24.combination) : 0, weightsForTargets: globalThis.Array.isArray(e24?.weightsForTargets) ? e24.weightsForTargets.map((t) => pn.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.combination !== 0 && (t.combination = xm(e24.combination)), e24.weightsForTargets?.length && (t.weightsForTargets = e24.weightsForTargets.map((r) => pn.toJSON(r))), t;
}, create(e24) {
  return B.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ec();
  return t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.combination = e24.combination ?? 0, t.weightsForTargets = e24.weightsForTargets?.map((r) => pn.fromPartial(r)) || [], t;
} };
function tc() {
  return { name: "", vectorBytes: new Uint8Array(0), vectors: [] };
}
var gn = { encode(e24, t = I.default.Writer.create()) {
  e24.name !== "" && t.uint32(10).string(e24.name), e24.vectorBytes.length !== 0 && t.uint32(18).bytes(e24.vectorBytes);
  for (let r of e24.vectors) q.encode(r, t.uint32(26).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = tc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.name = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.vectorBytes = r.bytes();
        continue;
      case 3:
        if (n !== 26) break;
        i.vectors.push(q.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { name: A(e24.name) ? globalThis.String(e24.name) : "", vectorBytes: A(e24.vectorBytes) ? Na(e24.vectorBytes) : new Uint8Array(0), vectors: globalThis.Array.isArray(e24?.vectors) ? e24.vectors.map((t) => q.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.name !== "" && (t.name = e24.name), e24.vectorBytes.length !== 0 && (t.vectorBytes = Va(e24.vectorBytes)), e24.vectors?.length && (t.vectors = e24.vectors.map((r) => q.toJSON(r))), t;
}, create(e24) {
  return gn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = tc();
  return t.name = e24.name ?? "", t.vectorBytes = e24.vectorBytes ?? new Uint8Array(0), t.vectors = e24.vectors?.map((r) => q.fromPartial(r)) || [], t;
} };
function rc() {
  return { mmr: void 0 };
}
var w = { encode(e24, t = I.default.Writer.create()) {
  return e24.mmr !== void 0 && mn.encode(e24.mmr, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = rc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.mmr = mn.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { mmr: A(e24.mmr) ? mn.fromJSON(e24.mmr) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.mmr !== void 0 && (t.mmr = mn.toJSON(e24.mmr)), t;
}, create(e24) {
  return w.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = rc();
  return t.mmr = e24.mmr !== void 0 && e24.mmr !== null ? mn.fromPartial(e24.mmr) : void 0, t;
} };
function nc() {
  return { limit: void 0, balance: void 0 };
}
var mn = { encode(e24, t = I.default.Writer.create()) {
  return e24.limit !== void 0 && t.uint32(8).uint32(e24.limit), e24.balance !== void 0 && t.uint32(21).float(e24.balance), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = nc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.limit = r.uint32();
        continue;
      case 2:
        if (n !== 21) break;
        i.balance = r.float();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { limit: A(e24.limit) ? globalThis.Number(e24.limit) : void 0, balance: A(e24.balance) ? globalThis.Number(e24.balance) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.limit !== void 0 && (t.limit = Math.round(e24.limit)), e24.balance !== void 0 && (t.balance = e24.balance), t;
}, create(e24) {
  return mn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = nc();
  return t.limit = e24.limit ?? void 0, t.balance = e24.balance ?? void 0, t;
} };
function ic() {
  return { operator: 0, minimumOrTokensMatch: void 0 };
}
var We = { encode(e24, t = I.default.Writer.create()) {
  return e24.operator !== 0 && t.uint32(8).int32(e24.operator), e24.minimumOrTokensMatch !== void 0 && t.uint32(16).int32(e24.minimumOrTokensMatch), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ic();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.operator = r.int32();
        continue;
      case 2:
        if (n !== 16) break;
        i.minimumOrTokensMatch = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { operator: A(e24.operator) ? Cm(e24.operator) : 0, minimumOrTokensMatch: A(e24.minimumOrTokensMatch) ? globalThis.Number(e24.minimumOrTokensMatch) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.operator !== 0 && (t.operator = Pm(e24.operator)), e24.minimumOrTokensMatch !== void 0 && (t.minimumOrTokensMatch = Math.round(e24.minimumOrTokensMatch)), t;
}, create(e24) {
  return We.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ic();
  return t.operator = e24.operator ?? 0, t.minimumOrTokensMatch = e24.minimumOrTokensMatch ?? void 0, t;
} };
function ac() {
  return { query: "", properties: [], vector: [], alpha: 0, fusionType: 0, vectorBytes: new Uint8Array(0), targetVectors: [], nearText: void 0, nearVector: void 0, targets: void 0, bm25SearchOperator: void 0, alphaParam: void 0, useAlphaParam: false, selection: void 0, vectorDistance: void 0, vectors: [] };
}
var ve = { encode(e24, t = I.default.Writer.create()) {
  e24.query !== "" && t.uint32(10).string(e24.query);
  for (let r of e24.properties) t.uint32(18).string(r);
  t.uint32(26).fork();
  for (let r of e24.vector) t.float(r);
  t.ldelim(), e24.alpha !== 0 && t.uint32(37).float(e24.alpha), e24.fusionType !== 0 && t.uint32(40).int32(e24.fusionType), e24.vectorBytes.length !== 0 && t.uint32(50).bytes(e24.vectorBytes);
  for (let r of e24.targetVectors) t.uint32(58).string(r);
  e24.nearText !== void 0 && ae.encode(e24.nearText, t.uint32(66).fork()).ldelim(), e24.nearVector !== void 0 && te.encode(e24.nearVector, t.uint32(74).fork()).ldelim(), e24.targets !== void 0 && B.encode(e24.targets, t.uint32(82).fork()).ldelim(), e24.bm25SearchOperator !== void 0 && We.encode(e24.bm25SearchOperator, t.uint32(90).fork()).ldelim(), e24.alphaParam !== void 0 && t.uint32(101).float(e24.alphaParam), e24.useAlphaParam !== false && t.uint32(104).bool(e24.useAlphaParam), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(114).fork()).ldelim(), e24.vectorDistance !== void 0 && t.uint32(165).float(e24.vectorDistance);
  for (let r of e24.vectors) q.encode(r, t.uint32(170).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ac();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.query = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.properties.push(r.string());
        continue;
      case 3:
        if (n === 29) {
          i.vector.push(r.float());
          continue;
        }
        if (n === 26) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.vector.push(r.float());
          continue;
        }
        break;
      case 4:
        if (n !== 37) break;
        i.alpha = r.float();
        continue;
      case 5:
        if (n !== 40) break;
        i.fusionType = r.int32();
        continue;
      case 6:
        if (n !== 50) break;
        i.vectorBytes = r.bytes();
        continue;
      case 7:
        if (n !== 58) break;
        i.targetVectors.push(r.string());
        continue;
      case 8:
        if (n !== 66) break;
        i.nearText = ae.decode(r, r.uint32());
        continue;
      case 9:
        if (n !== 74) break;
        i.nearVector = te.decode(r, r.uint32());
        continue;
      case 10:
        if (n !== 82) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 11:
        if (n !== 90) break;
        i.bm25SearchOperator = We.decode(r, r.uint32());
        continue;
      case 12:
        if (n !== 101) break;
        i.alphaParam = r.float();
        continue;
      case 13:
        if (n !== 104) break;
        i.useAlphaParam = r.bool();
        continue;
      case 14:
        if (n !== 114) break;
        i.selection = w.decode(r, r.uint32());
        continue;
      case 20:
        if (n !== 165) break;
        i.vectorDistance = r.float();
        continue;
      case 21:
        if (n !== 170) break;
        i.vectors.push(q.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { query: A(e24.query) ? globalThis.String(e24.query) : "", properties: globalThis.Array.isArray(e24?.properties) ? e24.properties.map((t) => globalThis.String(t)) : [], vector: globalThis.Array.isArray(e24?.vector) ? e24.vector.map((t) => globalThis.Number(t)) : [], alpha: A(e24.alpha) ? globalThis.Number(e24.alpha) : 0, fusionType: A(e24.fusionType) ? Rm(e24.fusionType) : 0, vectorBytes: A(e24.vectorBytes) ? Na(e24.vectorBytes) : new Uint8Array(0), targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], nearText: A(e24.nearText) ? ae.fromJSON(e24.nearText) : void 0, nearVector: A(e24.nearVector) ? te.fromJSON(e24.nearVector) : void 0, targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, bm25SearchOperator: A(e24.bm25SearchOperator) ? We.fromJSON(e24.bm25SearchOperator) : void 0, alphaParam: A(e24.alphaParam) ? globalThis.Number(e24.alphaParam) : void 0, useAlphaParam: A(e24.useAlphaParam) ? globalThis.Boolean(e24.useAlphaParam) : false, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0, vectorDistance: A(e24.vectorDistance) ? globalThis.Number(e24.vectorDistance) : void 0, vectors: globalThis.Array.isArray(e24?.vectors) ? e24.vectors.map((t) => q.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.query !== "" && (t.query = e24.query), e24.properties?.length && (t.properties = e24.properties), e24.vector?.length && (t.vector = e24.vector), e24.alpha !== 0 && (t.alpha = e24.alpha), e24.fusionType !== 0 && (t.fusionType = Am(e24.fusionType)), e24.vectorBytes.length !== 0 && (t.vectorBytes = Va(e24.vectorBytes)), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.nearText !== void 0 && (t.nearText = ae.toJSON(e24.nearText)), e24.nearVector !== void 0 && (t.nearVector = te.toJSON(e24.nearVector)), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.bm25SearchOperator !== void 0 && (t.bm25SearchOperator = We.toJSON(e24.bm25SearchOperator)), e24.alphaParam !== void 0 && (t.alphaParam = e24.alphaParam), e24.useAlphaParam !== false && (t.useAlphaParam = e24.useAlphaParam), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), e24.vectorDistance !== void 0 && (t.vectorDistance = e24.vectorDistance), e24.vectors?.length && (t.vectors = e24.vectors.map((r) => q.toJSON(r))), t;
}, create(e24) {
  return ve.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ac();
  return t.query = e24.query ?? "", t.properties = e24.properties?.map((r) => r) || [], t.vector = e24.vector?.map((r) => r) || [], t.alpha = e24.alpha ?? 0, t.fusionType = e24.fusionType ?? 0, t.vectorBytes = e24.vectorBytes ?? new Uint8Array(0), t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.nearText = e24.nearText !== void 0 && e24.nearText !== null ? ae.fromPartial(e24.nearText) : void 0, t.nearVector = e24.nearVector !== void 0 && e24.nearVector !== null ? te.fromPartial(e24.nearVector) : void 0, t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.bm25SearchOperator = e24.bm25SearchOperator !== void 0 && e24.bm25SearchOperator !== null ? We.fromPartial(e24.bm25SearchOperator) : void 0, t.alphaParam = e24.alphaParam ?? void 0, t.useAlphaParam = e24.useAlphaParam ?? false, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t.vectorDistance = e24.vectorDistance ?? void 0, t.vectors = e24.vectors?.map((r) => q.fromPartial(r)) || [], t;
} };
function oc() {
  return { vector: [], certainty: void 0, distance: void 0, vectorBytes: new Uint8Array(0), targetVectors: [], targets: void 0, vectorPerTarget: {}, vectorForTargets: [], vectors: [], selection: void 0 };
}
var te = { encode(e24, t = I.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.vector) t.float(r);
  t.ldelim(), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance), e24.vectorBytes.length !== 0 && t.uint32(34).bytes(e24.vectorBytes);
  for (let r of e24.targetVectors) t.uint32(42).string(r);
  e24.targets !== void 0 && B.encode(e24.targets, t.uint32(50).fork()).ldelim(), Object.entries(e24.vectorPerTarget).forEach(([r, a]) => {
    cs.encode({ key: r, value: a }, t.uint32(58).fork()).ldelim();
  });
  for (let r of e24.vectorForTargets) gn.encode(r, t.uint32(66).fork()).ldelim();
  for (let r of e24.vectors) q.encode(r, t.uint32(74).fork()).ldelim();
  return e24.selection !== void 0 && w.encode(e24.selection, t.uint32(82).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = oc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 13) {
          i.vector.push(r.float());
          continue;
        }
        if (n === 10) {
          let s = r.uint32() + r.pos;
          for (; r.pos < s; ) i.vector.push(r.float());
          continue;
        }
        break;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.vectorBytes = r.bytes();
        continue;
      case 5:
        if (n !== 42) break;
        i.targetVectors.push(r.string());
        continue;
      case 6:
        if (n !== 50) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        let o = cs.decode(r, r.uint32());
        o.value !== void 0 && (i.vectorPerTarget[o.key] = o.value);
        continue;
      case 8:
        if (n !== 66) break;
        i.vectorForTargets.push(gn.decode(r, r.uint32()));
        continue;
      case 9:
        if (n !== 74) break;
        i.vectors.push(q.decode(r, r.uint32()));
        continue;
      case 10:
        if (n !== 82) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { vector: globalThis.Array.isArray(e24?.vector) ? e24.vector.map((t) => globalThis.Number(t)) : [], certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, vectorBytes: A(e24.vectorBytes) ? Na(e24.vectorBytes) : new Uint8Array(0), targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, vectorPerTarget: Nm(e24.vectorPerTarget) ? Object.entries(e24.vectorPerTarget).reduce((t, [r, a]) => (t[r] = Na(a), t), {}) : {}, vectorForTargets: globalThis.Array.isArray(e24?.vectorForTargets) ? e24.vectorForTargets.map((t) => gn.fromJSON(t)) : [], vectors: globalThis.Array.isArray(e24?.vectors) ? e24.vectors.map((t) => q.fromJSON(t)) : [], selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  if (e24.vector?.length && (t.vector = e24.vector), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.vectorBytes.length !== 0 && (t.vectorBytes = Va(e24.vectorBytes)), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.vectorPerTarget) {
    let r = Object.entries(e24.vectorPerTarget);
    r.length > 0 && (t.vectorPerTarget = {}, r.forEach(([a, i]) => {
      t.vectorPerTarget[a] = Va(i);
    }));
  }
  return e24.vectorForTargets?.length && (t.vectorForTargets = e24.vectorForTargets.map((r) => gn.toJSON(r))), e24.vectors?.length && (t.vectors = e24.vectors.map((r) => q.toJSON(r))), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return te.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = oc();
  return t.vector = e24.vector?.map((r) => r) || [], t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.vectorBytes = e24.vectorBytes ?? new Uint8Array(0), t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.vectorPerTarget = Object.entries(e24.vectorPerTarget ?? {}).reduce((r, [a, i]) => (i !== void 0 && (r[a] = i), r), {}), t.vectorForTargets = e24.vectorForTargets?.map((r) => gn.fromPartial(r)) || [], t.vectors = e24.vectors?.map((r) => q.fromPartial(r)) || [], t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function sc() {
  return { key: "", value: new Uint8Array(0) };
}
var cs = { encode(e24, t = I.default.Writer.create()) {
  return e24.key !== "" && t.uint32(10).string(e24.key), e24.value.length !== 0 && t.uint32(18).bytes(e24.value), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = sc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.key = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.value = r.bytes();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { key: A(e24.key) ? globalThis.String(e24.key) : "", value: A(e24.value) ? Na(e24.value) : new Uint8Array(0) };
}, toJSON(e24) {
  let t = {};
  return e24.key !== "" && (t.key = e24.key), e24.value.length !== 0 && (t.value = Va(e24.value)), t;
}, create(e24) {
  return cs.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = sc();
  return t.key = e24.key ?? "", t.value = e24.value ?? new Uint8Array(0), t;
} };
function uc() {
  return { id: "", certainty: void 0, distance: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var be = { encode(e24, t = I.default.Writer.create()) {
  e24.id !== "" && t.uint32(10).string(e24.id), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance);
  for (let r of e24.targetVectors) t.uint32(34).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(42).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = uc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.id = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.targetVectors.push(r.string());
        continue;
      case 5:
        if (n !== 42) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { id: A(e24.id) ? globalThis.String(e24.id) : "", certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.id !== "" && (t.id = e24.id), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return be.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = uc();
  return t.id = e24.id ?? "", t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function dc() {
  return { query: [], certainty: void 0, distance: void 0, moveTo: void 0, moveAway: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var ae = { encode(e24, t = I.default.Writer.create()) {
  for (let r of e24.query) t.uint32(10).string(r);
  e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance), e24.moveTo !== void 0 && me.encode(e24.moveTo, t.uint32(34).fork()).ldelim(), e24.moveAway !== void 0 && me.encode(e24.moveAway, t.uint32(42).fork()).ldelim();
  for (let r of e24.targetVectors) t.uint32(50).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(58).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(66).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = dc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.query.push(r.string());
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.moveTo = me.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.moveAway = me.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.targetVectors.push(r.string());
        continue;
      case 7:
        if (n !== 58) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 8:
        if (n !== 66) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { query: globalThis.Array.isArray(e24?.query) ? e24.query.map((t) => globalThis.String(t)) : [], certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, moveTo: A(e24.moveTo) ? me.fromJSON(e24.moveTo) : void 0, moveAway: A(e24.moveAway) ? me.fromJSON(e24.moveAway) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.query?.length && (t.query = e24.query), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.moveTo !== void 0 && (t.moveTo = me.toJSON(e24.moveTo)), e24.moveAway !== void 0 && (t.moveAway = me.toJSON(e24.moveAway)), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return ae.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = dc();
  return t.query = e24.query?.map((r) => r) || [], t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.moveTo = e24.moveTo !== void 0 && e24.moveTo !== null ? me.fromPartial(e24.moveTo) : void 0, t.moveAway = e24.moveAway !== void 0 && e24.moveAway !== null ? me.fromPartial(e24.moveAway) : void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function cc() {
  return { force: 0, concepts: [], uuids: [] };
}
var me = { encode(e24, t = I.default.Writer.create()) {
  e24.force !== 0 && t.uint32(13).float(e24.force);
  for (let r of e24.concepts) t.uint32(18).string(r);
  for (let r of e24.uuids) t.uint32(26).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = cc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.force = r.float();
        continue;
      case 2:
        if (n !== 18) break;
        i.concepts.push(r.string());
        continue;
      case 3:
        if (n !== 26) break;
        i.uuids.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { force: A(e24.force) ? globalThis.Number(e24.force) : 0, concepts: globalThis.Array.isArray(e24?.concepts) ? e24.concepts.map((t) => globalThis.String(t)) : [], uuids: globalThis.Array.isArray(e24?.uuids) ? e24.uuids.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.force !== 0 && (t.force = e24.force), e24.concepts?.length && (t.concepts = e24.concepts), e24.uuids?.length && (t.uuids = e24.uuids), t;
}, create(e24) {
  return me.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = cc();
  return t.force = e24.force ?? 0, t.concepts = e24.concepts?.map((r) => r) || [], t.uuids = e24.uuids?.map((r) => r) || [], t;
} };
function lc() {
  return { image: "", certainty: void 0, distance: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var xe = { encode(e24, t = I.default.Writer.create()) {
  e24.image !== "" && t.uint32(10).string(e24.image), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance);
  for (let r of e24.targetVectors) t.uint32(34).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(42).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = lc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.image = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.targetVectors.push(r.string());
        continue;
      case 5:
        if (n !== 42) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { image: A(e24.image) ? globalThis.String(e24.image) : "", certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.image !== "" && (t.image = e24.image), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return xe.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = lc();
  return t.image = e24.image ?? "", t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function fc() {
  return { audio: "", certainty: void 0, distance: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var Ce = { encode(e24, t = I.default.Writer.create()) {
  e24.audio !== "" && t.uint32(10).string(e24.audio), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance);
  for (let r of e24.targetVectors) t.uint32(34).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(42).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = fc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.audio = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.targetVectors.push(r.string());
        continue;
      case 5:
        if (n !== 42) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { audio: A(e24.audio) ? globalThis.String(e24.audio) : "", certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.audio !== "" && (t.audio = e24.audio), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return Ce.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = fc();
  return t.audio = e24.audio ?? "", t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function pc() {
  return { video: "", certainty: void 0, distance: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var Pe = { encode(e24, t = I.default.Writer.create()) {
  e24.video !== "" && t.uint32(10).string(e24.video), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance);
  for (let r of e24.targetVectors) t.uint32(34).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(42).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = pc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.video = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.targetVectors.push(r.string());
        continue;
      case 5:
        if (n !== 42) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { video: A(e24.video) ? globalThis.String(e24.video) : "", certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.video !== "" && (t.video = e24.video), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return Pe.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = pc();
  return t.video = e24.video ?? "", t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function gc() {
  return { depth: "", certainty: void 0, distance: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var Re = { encode(e24, t = I.default.Writer.create()) {
  e24.depth !== "" && t.uint32(10).string(e24.depth), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance);
  for (let r of e24.targetVectors) t.uint32(34).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(42).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = gc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.depth = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.targetVectors.push(r.string());
        continue;
      case 5:
        if (n !== 42) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { depth: A(e24.depth) ? globalThis.String(e24.depth) : "", certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.depth !== "" && (t.depth = e24.depth), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return Re.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = gc();
  return t.depth = e24.depth ?? "", t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function mc() {
  return { thermal: "", certainty: void 0, distance: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var Ae = { encode(e24, t = I.default.Writer.create()) {
  e24.thermal !== "" && t.uint32(10).string(e24.thermal), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance);
  for (let r of e24.targetVectors) t.uint32(34).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(42).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = mc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.thermal = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.targetVectors.push(r.string());
        continue;
      case 5:
        if (n !== 42) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { thermal: A(e24.thermal) ? globalThis.String(e24.thermal) : "", certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.thermal !== "" && (t.thermal = e24.thermal), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return Ae.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = mc();
  return t.thermal = e24.thermal ?? "", t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function hc() {
  return { imu: "", certainty: void 0, distance: void 0, targetVectors: [], targets: void 0, selection: void 0 };
}
var Ne = { encode(e24, t = I.default.Writer.create()) {
  e24.imu !== "" && t.uint32(10).string(e24.imu), e24.certainty !== void 0 && t.uint32(17).double(e24.certainty), e24.distance !== void 0 && t.uint32(25).double(e24.distance);
  for (let r of e24.targetVectors) t.uint32(34).string(r);
  return e24.targets !== void 0 && B.encode(e24.targets, t.uint32(42).fork()).ldelim(), e24.selection !== void 0 && w.encode(e24.selection, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = hc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.imu = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.certainty = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.distance = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.targetVectors.push(r.string());
        continue;
      case 5:
        if (n !== 42) break;
        i.targets = B.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.selection = w.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { imu: A(e24.imu) ? globalThis.String(e24.imu) : "", certainty: A(e24.certainty) ? globalThis.Number(e24.certainty) : void 0, distance: A(e24.distance) ? globalThis.Number(e24.distance) : void 0, targetVectors: globalThis.Array.isArray(e24?.targetVectors) ? e24.targetVectors.map((t) => globalThis.String(t)) : [], targets: A(e24.targets) ? B.fromJSON(e24.targets) : void 0, selection: A(e24.selection) ? w.fromJSON(e24.selection) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.imu !== "" && (t.imu = e24.imu), e24.certainty !== void 0 && (t.certainty = e24.certainty), e24.distance !== void 0 && (t.distance = e24.distance), e24.targetVectors?.length && (t.targetVectors = e24.targetVectors), e24.targets !== void 0 && (t.targets = B.toJSON(e24.targets)), e24.selection !== void 0 && (t.selection = w.toJSON(e24.selection)), t;
}, create(e24) {
  return Ne.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = hc();
  return t.imu = e24.imu ?? "", t.certainty = e24.certainty ?? void 0, t.distance = e24.distance ?? void 0, t.targetVectors = e24.targetVectors?.map((r) => r) || [], t.targets = e24.targets !== void 0 && e24.targets !== null ? B.fromPartial(e24.targets) : void 0, t.selection = e24.selection !== void 0 && e24.selection !== null ? w.fromPartial(e24.selection) : void 0, t;
} };
function yc() {
  return { query: "", properties: [], searchOperator: void 0 };
}
var Ft = { encode(e24, t = I.default.Writer.create()) {
  e24.query !== "" && t.uint32(10).string(e24.query);
  for (let r of e24.properties) t.uint32(18).string(r);
  return e24.searchOperator !== void 0 && We.encode(e24.searchOperator, t.uint32(26).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof I.default.Reader ? e24 : I.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = yc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.query = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.properties.push(r.string());
        continue;
      case 3:
        if (n !== 26) break;
        i.searchOperator = We.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { query: A(e24.query) ? globalThis.String(e24.query) : "", properties: globalThis.Array.isArray(e24?.properties) ? e24.properties.map((t) => globalThis.String(t)) : [], searchOperator: A(e24.searchOperator) ? We.fromJSON(e24.searchOperator) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.query !== "" && (t.query = e24.query), e24.properties?.length && (t.properties = e24.properties), e24.searchOperator !== void 0 && (t.searchOperator = We.toJSON(e24.searchOperator)), t;
}, create(e24) {
  return Ft.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = yc();
  return t.query = e24.query ?? "", t.properties = e24.properties?.map((r) => r) || [], t.searchOperator = e24.searchOperator !== void 0 && e24.searchOperator !== null ? We.fromPartial(e24.searchOperator) : void 0, t;
} };
function Na(e24) {
  if (globalThis.Buffer) return Uint8Array.from(globalThis.Buffer.from(e24, "base64"));
  {
    let t = globalThis.atob(e24), r = new Uint8Array(t.length);
    for (let a = 0; a < t.length; ++a) r[a] = t.charCodeAt(a);
    return r;
  }
}
function Va(e24) {
  if (globalThis.Buffer) return globalThis.Buffer.from(e24).toString("base64");
  {
    let t = [];
    return e24.forEach((r) => {
      t.push(globalThis.String.fromCharCode(r));
    }), globalThis.btoa(t.join(""));
  }
}
function Nm(e24) {
  return typeof e24 == "object" && e24 !== null;
}
function A(e24) {
  return e24 != null;
}
d();
var C = ze(Ke());
function Tc() {
  return { objects: [], consistencyLevel: void 0 };
}
var Oa = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.objects) Ve.encode(r, t.uint32(10).fork()).ldelim();
  return e24.consistencyLevel !== void 0 && t.uint32(16).int32(e24.consistencyLevel), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Tc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.objects.push(Ve.decode(r, r.uint32()));
        continue;
      case 2:
        if (n !== 16) break;
        i.consistencyLevel = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { objects: globalThis.Array.isArray(e24?.objects) ? e24.objects.map((t) => Ve.fromJSON(t)) : [], consistencyLevel: W(e24.consistencyLevel) ? tr(e24.consistencyLevel) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.objects?.length && (t.objects = e24.objects.map((r) => Ve.toJSON(r))), e24.consistencyLevel !== void 0 && (t.consistencyLevel = rr(e24.consistencyLevel)), t;
}, create(e24) {
  return Oa.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Tc();
  return t.objects = e24.objects?.map((r) => Ve.fromPartial(r)) || [], t.consistencyLevel = e24.consistencyLevel ?? void 0, t;
} };
function vc() {
  return { references: [], consistencyLevel: void 0 };
}
var ls = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.references) Oe.encode(r, t.uint32(10).fork()).ldelim();
  return e24.consistencyLevel !== void 0 && t.uint32(16).int32(e24.consistencyLevel), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = vc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.references.push(Oe.decode(r, r.uint32()));
        continue;
      case 2:
        if (n !== 16) break;
        i.consistencyLevel = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { references: globalThis.Array.isArray(e24?.references) ? e24.references.map((t) => Oe.fromJSON(t)) : [], consistencyLevel: W(e24.consistencyLevel) ? tr(e24.consistencyLevel) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.references?.length && (t.references = e24.references.map((r) => Oe.toJSON(r))), e24.consistencyLevel !== void 0 && (t.consistencyLevel = rr(e24.consistencyLevel)), t;
}, create(e24) {
  return ls.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = vc();
  return t.references = e24.references?.map((r) => Oe.fromPartial(r)) || [], t.consistencyLevel = e24.consistencyLevel ?? void 0, t;
} };
function bc() {
  return { start: void 0, data: void 0, stop: void 0 };
}
var Ge = { encode(e24, t = C.default.Writer.create()) {
  return e24.start !== void 0 && hn.encode(e24.start, t.uint32(10).fork()).ldelim(), e24.data !== void 0 && Tn.encode(e24.data, t.uint32(18).fork()).ldelim(), e24.stop !== void 0 && yn.encode(e24.stop, t.uint32(26).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = bc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.start = hn.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.data = Tn.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.stop = yn.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { start: W(e24.start) ? hn.fromJSON(e24.start) : void 0, data: W(e24.data) ? Tn.fromJSON(e24.data) : void 0, stop: W(e24.stop) ? yn.fromJSON(e24.stop) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.start !== void 0 && (t.start = hn.toJSON(e24.start)), e24.data !== void 0 && (t.data = Tn.toJSON(e24.data)), e24.stop !== void 0 && (t.stop = yn.toJSON(e24.stop)), t;
}, create(e24) {
  return Ge.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = bc();
  return t.start = e24.start !== void 0 && e24.start !== null ? hn.fromPartial(e24.start) : void 0, t.data = e24.data !== void 0 && e24.data !== null ? Tn.fromPartial(e24.data) : void 0, t.stop = e24.stop !== void 0 && e24.stop !== null ? yn.fromPartial(e24.stop) : void 0, t;
} };
function xc() {
  return { consistencyLevel: void 0 };
}
var hn = { encode(e24, t = C.default.Writer.create()) {
  return e24.consistencyLevel !== void 0 && t.uint32(8).int32(e24.consistencyLevel), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = xc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.consistencyLevel = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { consistencyLevel: W(e24.consistencyLevel) ? tr(e24.consistencyLevel) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.consistencyLevel !== void 0 && (t.consistencyLevel = rr(e24.consistencyLevel)), t;
}, create(e24) {
  return hn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = xc();
  return t.consistencyLevel = e24.consistencyLevel ?? void 0, t;
} };
function Cc() {
  return {};
}
var yn = { encode(e24, t = C.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Cc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return yn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return Cc();
} };
function Pc() {
  return { objects: void 0, references: void 0 };
}
var Tn = { encode(e24, t = C.default.Writer.create()) {
  return e24.objects !== void 0 && vn.encode(e24.objects, t.uint32(10).fork()).ldelim(), e24.references !== void 0 && bn.encode(e24.references, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Pc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.objects = vn.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.references = bn.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { objects: W(e24.objects) ? vn.fromJSON(e24.objects) : void 0, references: W(e24.references) ? bn.fromJSON(e24.references) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.objects !== void 0 && (t.objects = vn.toJSON(e24.objects)), e24.references !== void 0 && (t.references = bn.toJSON(e24.references)), t;
}, create(e24) {
  return Tn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Pc();
  return t.objects = e24.objects !== void 0 && e24.objects !== null ? vn.fromPartial(e24.objects) : void 0, t.references = e24.references !== void 0 && e24.references !== null ? bn.fromPartial(e24.references) : void 0, t;
} };
function Rc() {
  return { values: [] };
}
var vn = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.values) Ve.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Rc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(Ve.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => Ve.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values.map((r) => Ve.toJSON(r))), t;
}, create(e24) {
  return vn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Rc();
  return t.values = e24.values?.map((r) => Ve.fromPartial(r)) || [], t;
} };
function Ac() {
  return { values: [] };
}
var bn = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.values) Oe.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ac();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(Oe.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => Oe.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values.map((r) => Oe.toJSON(r))), t;
}, create(e24) {
  return bn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ac();
  return t.values = e24.values?.map((r) => Oe.fromPartial(r)) || [], t;
} };
function Nc() {
  return { results: void 0, shuttingDown: void 0, started: void 0, backoff: void 0, acks: void 0, outOfMemory: void 0 };
}
var fs = { encode(e24, t = C.default.Writer.create()) {
  return e24.results !== void 0 && Nn.encode(e24.results, t.uint32(10).fork()).ldelim(), e24.shuttingDown !== void 0 && Cn.encode(e24.shuttingDown, t.uint32(18).fork()).ldelim(), e24.started !== void 0 && xn.encode(e24.started, t.uint32(34).fork()).ldelim(), e24.backoff !== void 0 && Rn.encode(e24.backoff, t.uint32(42).fork()).ldelim(), e24.acks !== void 0 && An.encode(e24.acks, t.uint32(50).fork()).ldelim(), e24.outOfMemory !== void 0 && Pn.encode(e24.outOfMemory, t.uint32(58).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Nc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.results = Nn.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.shuttingDown = Cn.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.started = xn.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.backoff = Rn.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.acks = An.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.outOfMemory = Pn.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { results: W(e24.results) ? Nn.fromJSON(e24.results) : void 0, shuttingDown: W(e24.shuttingDown) ? Cn.fromJSON(e24.shuttingDown) : void 0, started: W(e24.started) ? xn.fromJSON(e24.started) : void 0, backoff: W(e24.backoff) ? Rn.fromJSON(e24.backoff) : void 0, acks: W(e24.acks) ? An.fromJSON(e24.acks) : void 0, outOfMemory: W(e24.outOfMemory) ? Pn.fromJSON(e24.outOfMemory) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.results !== void 0 && (t.results = Nn.toJSON(e24.results)), e24.shuttingDown !== void 0 && (t.shuttingDown = Cn.toJSON(e24.shuttingDown)), e24.started !== void 0 && (t.started = xn.toJSON(e24.started)), e24.backoff !== void 0 && (t.backoff = Rn.toJSON(e24.backoff)), e24.acks !== void 0 && (t.acks = An.toJSON(e24.acks)), e24.outOfMemory !== void 0 && (t.outOfMemory = Pn.toJSON(e24.outOfMemory)), t;
}, create(e24) {
  return fs.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Nc();
  return t.results = e24.results !== void 0 && e24.results !== null ? Nn.fromPartial(e24.results) : void 0, t.shuttingDown = e24.shuttingDown !== void 0 && e24.shuttingDown !== null ? Cn.fromPartial(e24.shuttingDown) : void 0, t.started = e24.started !== void 0 && e24.started !== null ? xn.fromPartial(e24.started) : void 0, t.backoff = e24.backoff !== void 0 && e24.backoff !== null ? Rn.fromPartial(e24.backoff) : void 0, t.acks = e24.acks !== void 0 && e24.acks !== null ? An.fromPartial(e24.acks) : void 0, t.outOfMemory = e24.outOfMemory !== void 0 && e24.outOfMemory !== null ? Pn.fromPartial(e24.outOfMemory) : void 0, t;
} };
function Vc() {
  return {};
}
var xn = { encode(e24, t = C.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Vc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return xn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return Vc();
} };
function Oc() {
  return {};
}
var Cn = { encode(e24, t = C.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Oc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return Cn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return Oc();
} };
function Sc() {
  return { uuids: [], beacons: [], waitTime: 0 };
}
var Pn = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.uuids) t.uint32(10).string(r);
  for (let r of e24.beacons) t.uint32(18).string(r);
  return e24.waitTime !== 0 && t.uint32(24).int32(e24.waitTime), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Sc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.uuids.push(r.string());
        continue;
      case 2:
        if (n !== 18) break;
        i.beacons.push(r.string());
        continue;
      case 3:
        if (n !== 24) break;
        i.waitTime = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuids: globalThis.Array.isArray(e24?.uuids) ? e24.uuids.map((t) => globalThis.String(t)) : [], beacons: globalThis.Array.isArray(e24?.beacons) ? e24.beacons.map((t) => globalThis.String(t)) : [], waitTime: W(e24.waitTime) ? globalThis.Number(e24.waitTime) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.uuids?.length && (t.uuids = e24.uuids), e24.beacons?.length && (t.beacons = e24.beacons), e24.waitTime !== 0 && (t.waitTime = Math.round(e24.waitTime)), t;
}, create(e24) {
  return Pn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Sc();
  return t.uuids = e24.uuids?.map((r) => r) || [], t.beacons = e24.beacons?.map((r) => r) || [], t.waitTime = e24.waitTime ?? 0, t;
} };
function kc() {
  return { batchSize: 0 };
}
var Rn = { encode(e24, t = C.default.Writer.create()) {
  return e24.batchSize !== 0 && t.uint32(8).int32(e24.batchSize), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = kc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.batchSize = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { batchSize: W(e24.batchSize) ? globalThis.Number(e24.batchSize) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.batchSize !== 0 && (t.batchSize = Math.round(e24.batchSize)), t;
}, create(e24) {
  return Rn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = kc();
  return t.batchSize = e24.batchSize ?? 0, t;
} };
function Ic() {
  return { uuids: [], beacons: [] };
}
var An = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.uuids) t.uint32(10).string(r);
  for (let r of e24.beacons) t.uint32(18).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ic();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.uuids.push(r.string());
        continue;
      case 2:
        if (n !== 18) break;
        i.beacons.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuids: globalThis.Array.isArray(e24?.uuids) ? e24.uuids.map((t) => globalThis.String(t)) : [], beacons: globalThis.Array.isArray(e24?.beacons) ? e24.beacons.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.uuids?.length && (t.uuids = e24.uuids), e24.beacons?.length && (t.beacons = e24.beacons), t;
}, create(e24) {
  return An.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ic();
  return t.uuids = e24.uuids?.map((r) => r) || [], t.beacons = e24.beacons?.map((r) => r) || [], t;
} };
function _c() {
  return { errors: [], successes: [] };
}
var Nn = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.errors) Vn.encode(r, t.uint32(10).fork()).ldelim();
  for (let r of e24.successes) On.encode(r, t.uint32(18).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = _c();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.errors.push(Vn.decode(r, r.uint32()));
        continue;
      case 2:
        if (n !== 18) break;
        i.successes.push(On.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { errors: globalThis.Array.isArray(e24?.errors) ? e24.errors.map((t) => Vn.fromJSON(t)) : [], successes: globalThis.Array.isArray(e24?.successes) ? e24.successes.map((t) => On.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.errors?.length && (t.errors = e24.errors.map((r) => Vn.toJSON(r))), e24.successes?.length && (t.successes = e24.successes.map((r) => On.toJSON(r))), t;
}, create(e24) {
  return Nn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = _c();
  return t.errors = e24.errors?.map((r) => Vn.fromPartial(r)) || [], t.successes = e24.successes?.map((r) => On.fromPartial(r)) || [], t;
} };
function Bc() {
  return { error: "", uuid: void 0, beacon: void 0 };
}
var Vn = { encode(e24, t = C.default.Writer.create()) {
  return e24.error !== "" && t.uint32(10).string(e24.error), e24.uuid !== void 0 && t.uint32(18).string(e24.uuid), e24.beacon !== void 0 && t.uint32(26).string(e24.beacon), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Bc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.error = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.uuid = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.beacon = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { error: W(e24.error) ? globalThis.String(e24.error) : "", uuid: W(e24.uuid) ? globalThis.String(e24.uuid) : void 0, beacon: W(e24.beacon) ? globalThis.String(e24.beacon) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.error !== "" && (t.error = e24.error), e24.uuid !== void 0 && (t.uuid = e24.uuid), e24.beacon !== void 0 && (t.beacon = e24.beacon), t;
}, create(e24) {
  return Vn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Bc();
  return t.error = e24.error ?? "", t.uuid = e24.uuid ?? void 0, t.beacon = e24.beacon ?? void 0, t;
} };
function Gc() {
  return { uuid: void 0, beacon: void 0 };
}
var On = { encode(e24, t = C.default.Writer.create()) {
  return e24.uuid !== void 0 && t.uint32(18).string(e24.uuid), e24.beacon !== void 0 && t.uint32(26).string(e24.beacon), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Gc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 2:
        if (n !== 18) break;
        i.uuid = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.beacon = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuid: W(e24.uuid) ? globalThis.String(e24.uuid) : void 0, beacon: W(e24.beacon) ? globalThis.String(e24.beacon) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.uuid !== void 0 && (t.uuid = e24.uuid), e24.beacon !== void 0 && (t.beacon = e24.beacon), t;
}, create(e24) {
  return On.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Gc();
  return t.uuid = e24.uuid ?? void 0, t.beacon = e24.beacon ?? void 0, t;
} };
function wc() {
  return { uuid: "", vector: [], properties: void 0, collection: "", tenant: "", vectorBytes: new Uint8Array(0), vectors: [] };
}
var Ve = { encode(e24, t = C.default.Writer.create()) {
  e24.uuid !== "" && t.uint32(10).string(e24.uuid), t.uint32(18).fork();
  for (let r of e24.vector) t.float(r);
  t.ldelim(), e24.properties !== void 0 && Sn.encode(e24.properties, t.uint32(26).fork()).ldelim(), e24.collection !== "" && t.uint32(34).string(e24.collection), e24.tenant !== "" && t.uint32(42).string(e24.tenant), e24.vectorBytes.length !== 0 && t.uint32(50).bytes(e24.vectorBytes);
  for (let r of e24.vectors) q.encode(r, t.uint32(186).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = wc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.uuid = r.string();
        continue;
      case 2:
        if (n === 21) {
          i.vector.push(r.float());
          continue;
        }
        if (n === 18) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.vector.push(r.float());
          continue;
        }
        break;
      case 3:
        if (n !== 26) break;
        i.properties = Sn.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.collection = r.string();
        continue;
      case 5:
        if (n !== 42) break;
        i.tenant = r.string();
        continue;
      case 6:
        if (n !== 50) break;
        i.vectorBytes = r.bytes();
        continue;
      case 23:
        if (n !== 186) break;
        i.vectors.push(q.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuid: W(e24.uuid) ? globalThis.String(e24.uuid) : "", vector: globalThis.Array.isArray(e24?.vector) ? e24.vector.map((t) => globalThis.Number(t)) : [], properties: W(e24.properties) ? Sn.fromJSON(e24.properties) : void 0, collection: W(e24.collection) ? globalThis.String(e24.collection) : "", tenant: W(e24.tenant) ? globalThis.String(e24.tenant) : "", vectorBytes: W(e24.vectorBytes) ? Vm(e24.vectorBytes) : new Uint8Array(0), vectors: globalThis.Array.isArray(e24?.vectors) ? e24.vectors.map((t) => q.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.uuid !== "" && (t.uuid = e24.uuid), e24.vector?.length && (t.vector = e24.vector), e24.properties !== void 0 && (t.properties = Sn.toJSON(e24.properties)), e24.collection !== "" && (t.collection = e24.collection), e24.tenant !== "" && (t.tenant = e24.tenant), e24.vectorBytes.length !== 0 && (t.vectorBytes = Om(e24.vectorBytes)), e24.vectors?.length && (t.vectors = e24.vectors.map((r) => q.toJSON(r))), t;
}, create(e24) {
  return Ve.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = wc();
  return t.uuid = e24.uuid ?? "", t.vector = e24.vector?.map((r) => r) || [], t.properties = e24.properties !== void 0 && e24.properties !== null ? Sn.fromPartial(e24.properties) : void 0, t.collection = e24.collection ?? "", t.tenant = e24.tenant ?? "", t.vectorBytes = e24.vectorBytes ?? new Uint8Array(0), t.vectors = e24.vectors?.map((r) => q.fromPartial(r)) || [], t;
} };
function Mc() {
  return { nonRefProperties: void 0, singleTargetRefProps: [], multiTargetRefProps: [], numberArrayProperties: [], intArrayProperties: [], textArrayProperties: [], booleanArrayProperties: [], objectProperties: [], objectArrayProperties: [], emptyListProps: [] };
}
var Sn = { encode(e24, t = C.default.Writer.create()) {
  e24.nonRefProperties !== void 0 && ye.encode(ye.wrap(e24.nonRefProperties), t.uint32(10).fork()).ldelim();
  for (let r of e24.singleTargetRefProps) kn.encode(r, t.uint32(18).fork()).ldelim();
  for (let r of e24.multiTargetRefProps) In.encode(r, t.uint32(26).fork()).ldelim();
  for (let r of e24.numberArrayProperties) Ye.encode(r, t.uint32(34).fork()).ldelim();
  for (let r of e24.intArrayProperties) Ze.encode(r, t.uint32(42).fork()).ldelim();
  for (let r of e24.textArrayProperties) Xe.encode(r, t.uint32(50).fork()).ldelim();
  for (let r of e24.booleanArrayProperties) je.encode(r, t.uint32(58).fork()).ldelim();
  for (let r of e24.objectProperties) tt.encode(r, t.uint32(66).fork()).ldelim();
  for (let r of e24.objectArrayProperties) et.encode(r, t.uint32(74).fork()).ldelim();
  for (let r of e24.emptyListProps) t.uint32(82).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Mc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.nonRefProperties = ye.unwrap(ye.decode(r, r.uint32()));
        continue;
      case 2:
        if (n !== 18) break;
        i.singleTargetRefProps.push(kn.decode(r, r.uint32()));
        continue;
      case 3:
        if (n !== 26) break;
        i.multiTargetRefProps.push(In.decode(r, r.uint32()));
        continue;
      case 4:
        if (n !== 34) break;
        i.numberArrayProperties.push(Ye.decode(r, r.uint32()));
        continue;
      case 5:
        if (n !== 42) break;
        i.intArrayProperties.push(Ze.decode(r, r.uint32()));
        continue;
      case 6:
        if (n !== 50) break;
        i.textArrayProperties.push(Xe.decode(r, r.uint32()));
        continue;
      case 7:
        if (n !== 58) break;
        i.booleanArrayProperties.push(je.decode(r, r.uint32()));
        continue;
      case 8:
        if (n !== 66) break;
        i.objectProperties.push(tt.decode(r, r.uint32()));
        continue;
      case 9:
        if (n !== 74) break;
        i.objectArrayProperties.push(et.decode(r, r.uint32()));
        continue;
      case 10:
        if (n !== 82) break;
        i.emptyListProps.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { nonRefProperties: Sm(e24.nonRefProperties) ? e24.nonRefProperties : void 0, singleTargetRefProps: globalThis.Array.isArray(e24?.singleTargetRefProps) ? e24.singleTargetRefProps.map((t) => kn.fromJSON(t)) : [], multiTargetRefProps: globalThis.Array.isArray(e24?.multiTargetRefProps) ? e24.multiTargetRefProps.map((t) => In.fromJSON(t)) : [], numberArrayProperties: globalThis.Array.isArray(e24?.numberArrayProperties) ? e24.numberArrayProperties.map((t) => Ye.fromJSON(t)) : [], intArrayProperties: globalThis.Array.isArray(e24?.intArrayProperties) ? e24.intArrayProperties.map((t) => Ze.fromJSON(t)) : [], textArrayProperties: globalThis.Array.isArray(e24?.textArrayProperties) ? e24.textArrayProperties.map((t) => Xe.fromJSON(t)) : [], booleanArrayProperties: globalThis.Array.isArray(e24?.booleanArrayProperties) ? e24.booleanArrayProperties.map((t) => je.fromJSON(t)) : [], objectProperties: globalThis.Array.isArray(e24?.objectProperties) ? e24.objectProperties.map((t) => tt.fromJSON(t)) : [], objectArrayProperties: globalThis.Array.isArray(e24?.objectArrayProperties) ? e24.objectArrayProperties.map((t) => et.fromJSON(t)) : [], emptyListProps: globalThis.Array.isArray(e24?.emptyListProps) ? e24.emptyListProps.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.nonRefProperties !== void 0 && (t.nonRefProperties = e24.nonRefProperties), e24.singleTargetRefProps?.length && (t.singleTargetRefProps = e24.singleTargetRefProps.map((r) => kn.toJSON(r))), e24.multiTargetRefProps?.length && (t.multiTargetRefProps = e24.multiTargetRefProps.map((r) => In.toJSON(r))), e24.numberArrayProperties?.length && (t.numberArrayProperties = e24.numberArrayProperties.map((r) => Ye.toJSON(r))), e24.intArrayProperties?.length && (t.intArrayProperties = e24.intArrayProperties.map((r) => Ze.toJSON(r))), e24.textArrayProperties?.length && (t.textArrayProperties = e24.textArrayProperties.map((r) => Xe.toJSON(r))), e24.booleanArrayProperties?.length && (t.booleanArrayProperties = e24.booleanArrayProperties.map((r) => je.toJSON(r))), e24.objectProperties?.length && (t.objectProperties = e24.objectProperties.map((r) => tt.toJSON(r))), e24.objectArrayProperties?.length && (t.objectArrayProperties = e24.objectArrayProperties.map((r) => et.toJSON(r))), e24.emptyListProps?.length && (t.emptyListProps = e24.emptyListProps), t;
}, create(e24) {
  return Sn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Mc();
  return t.nonRefProperties = e24.nonRefProperties ?? void 0, t.singleTargetRefProps = e24.singleTargetRefProps?.map((r) => kn.fromPartial(r)) || [], t.multiTargetRefProps = e24.multiTargetRefProps?.map((r) => In.fromPartial(r)) || [], t.numberArrayProperties = e24.numberArrayProperties?.map((r) => Ye.fromPartial(r)) || [], t.intArrayProperties = e24.intArrayProperties?.map((r) => Ze.fromPartial(r)) || [], t.textArrayProperties = e24.textArrayProperties?.map((r) => Xe.fromPartial(r)) || [], t.booleanArrayProperties = e24.booleanArrayProperties?.map((r) => je.fromPartial(r)) || [], t.objectProperties = e24.objectProperties?.map((r) => tt.fromPartial(r)) || [], t.objectArrayProperties = e24.objectArrayProperties?.map((r) => et.fromPartial(r)) || [], t.emptyListProps = e24.emptyListProps?.map((r) => r) || [], t;
} };
function Ec() {
  return { uuids: [], propName: "" };
}
var kn = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.uuids) t.uint32(10).string(r);
  return e24.propName !== "" && t.uint32(18).string(e24.propName), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ec();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.uuids.push(r.string());
        continue;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuids: globalThis.Array.isArray(e24?.uuids) ? e24.uuids.map((t) => globalThis.String(t)) : [], propName: W(e24.propName) ? globalThis.String(e24.propName) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.uuids?.length && (t.uuids = e24.uuids), e24.propName !== "" && (t.propName = e24.propName), t;
}, create(e24) {
  return kn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ec();
  return t.uuids = e24.uuids?.map((r) => r) || [], t.propName = e24.propName ?? "", t;
} };
function Uc() {
  return { uuids: [], propName: "", targetCollection: "" };
}
var In = { encode(e24, t = C.default.Writer.create()) {
  for (let r of e24.uuids) t.uint32(10).string(r);
  return e24.propName !== "" && t.uint32(18).string(e24.propName), e24.targetCollection !== "" && t.uint32(26).string(e24.targetCollection), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Uc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.uuids.push(r.string());
        continue;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.targetCollection = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuids: globalThis.Array.isArray(e24?.uuids) ? e24.uuids.map((t) => globalThis.String(t)) : [], propName: W(e24.propName) ? globalThis.String(e24.propName) : "", targetCollection: W(e24.targetCollection) ? globalThis.String(e24.targetCollection) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.uuids?.length && (t.uuids = e24.uuids), e24.propName !== "" && (t.propName = e24.propName), e24.targetCollection !== "" && (t.targetCollection = e24.targetCollection), t;
}, create(e24) {
  return In.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Uc();
  return t.uuids = e24.uuids?.map((r) => r) || [], t.propName = e24.propName ?? "", t.targetCollection = e24.targetCollection ?? "", t;
} };
function Dc() {
  return { name: "", fromCollection: "", fromUuid: "", toCollection: void 0, toUuid: "", tenant: "" };
}
var Oe = { encode(e24, t = C.default.Writer.create()) {
  return e24.name !== "" && t.uint32(10).string(e24.name), e24.fromCollection !== "" && t.uint32(18).string(e24.fromCollection), e24.fromUuid !== "" && t.uint32(26).string(e24.fromUuid), e24.toCollection !== void 0 && t.uint32(34).string(e24.toCollection), e24.toUuid !== "" && t.uint32(42).string(e24.toUuid), e24.tenant !== "" && t.uint32(50).string(e24.tenant), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Dc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.name = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.fromCollection = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.fromUuid = r.string();
        continue;
      case 4:
        if (n !== 34) break;
        i.toCollection = r.string();
        continue;
      case 5:
        if (n !== 42) break;
        i.toUuid = r.string();
        continue;
      case 6:
        if (n !== 50) break;
        i.tenant = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { name: W(e24.name) ? globalThis.String(e24.name) : "", fromCollection: W(e24.fromCollection) ? globalThis.String(e24.fromCollection) : "", fromUuid: W(e24.fromUuid) ? globalThis.String(e24.fromUuid) : "", toCollection: W(e24.toCollection) ? globalThis.String(e24.toCollection) : void 0, toUuid: W(e24.toUuid) ? globalThis.String(e24.toUuid) : "", tenant: W(e24.tenant) ? globalThis.String(e24.tenant) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.name !== "" && (t.name = e24.name), e24.fromCollection !== "" && (t.fromCollection = e24.fromCollection), e24.fromUuid !== "" && (t.fromUuid = e24.fromUuid), e24.toCollection !== void 0 && (t.toCollection = e24.toCollection), e24.toUuid !== "" && (t.toUuid = e24.toUuid), e24.tenant !== "" && (t.tenant = e24.tenant), t;
}, create(e24) {
  return Oe.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Dc();
  return t.name = e24.name ?? "", t.fromCollection = e24.fromCollection ?? "", t.fromUuid = e24.fromUuid ?? "", t.toCollection = e24.toCollection ?? void 0, t.toUuid = e24.toUuid ?? "", t.tenant = e24.tenant ?? "", t;
} };
function Fc() {
  return { took: 0, errors: [] };
}
var ps = { encode(e24, t = C.default.Writer.create()) {
  e24.took !== 0 && t.uint32(13).float(e24.took);
  for (let r of e24.errors) _n.encode(r, t.uint32(18).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Fc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.took = r.float();
        continue;
      case 2:
        if (n !== 18) break;
        i.errors.push(_n.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { took: W(e24.took) ? globalThis.Number(e24.took) : 0, errors: globalThis.Array.isArray(e24?.errors) ? e24.errors.map((t) => _n.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.took !== 0 && (t.took = e24.took), e24.errors?.length && (t.errors = e24.errors.map((r) => _n.toJSON(r))), t;
}, create(e24) {
  return ps.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Fc();
  return t.took = e24.took ?? 0, t.errors = e24.errors?.map((r) => _n.fromPartial(r)) || [], t;
} };
function Wc() {
  return { index: 0, error: "" };
}
var _n = { encode(e24, t = C.default.Writer.create()) {
  return e24.index !== 0 && t.uint32(8).int32(e24.index), e24.error !== "" && t.uint32(18).string(e24.error), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Wc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.index = r.int32();
        continue;
      case 2:
        if (n !== 18) break;
        i.error = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { index: W(e24.index) ? globalThis.Number(e24.index) : 0, error: W(e24.error) ? globalThis.String(e24.error) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.index !== 0 && (t.index = Math.round(e24.index)), e24.error !== "" && (t.error = e24.error), t;
}, create(e24) {
  return _n.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Wc();
  return t.index = e24.index ?? 0, t.error = e24.error ?? "", t;
} };
function qc() {
  return { took: 0, errors: [] };
}
var gs = { encode(e24, t = C.default.Writer.create()) {
  e24.took !== 0 && t.uint32(13).float(e24.took);
  for (let r of e24.errors) Bn.encode(r, t.uint32(18).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = qc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.took = r.float();
        continue;
      case 2:
        if (n !== 18) break;
        i.errors.push(Bn.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { took: W(e24.took) ? globalThis.Number(e24.took) : 0, errors: globalThis.Array.isArray(e24?.errors) ? e24.errors.map((t) => Bn.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.took !== 0 && (t.took = e24.took), e24.errors?.length && (t.errors = e24.errors.map((r) => Bn.toJSON(r))), t;
}, create(e24) {
  return gs.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = qc();
  return t.took = e24.took ?? 0, t.errors = e24.errors?.map((r) => Bn.fromPartial(r)) || [], t;
} };
function Lc() {
  return { index: 0, error: "" };
}
var Bn = { encode(e24, t = C.default.Writer.create()) {
  return e24.index !== 0 && t.uint32(8).int32(e24.index), e24.error !== "" && t.uint32(18).string(e24.error), t;
}, decode(e24, t) {
  let r = e24 instanceof C.default.Reader ? e24 : C.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Lc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.index = r.int32();
        continue;
      case 2:
        if (n !== 18) break;
        i.error = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { index: W(e24.index) ? globalThis.Number(e24.index) : 0, error: W(e24.error) ? globalThis.String(e24.error) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.index !== 0 && (t.index = Math.round(e24.index)), e24.error !== "" && (t.error = e24.error), t;
}, create(e24) {
  return Bn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Lc();
  return t.index = e24.index ?? 0, t.error = e24.error ?? "", t;
} };
function Vm(e24) {
  if (globalThis.Buffer) return Uint8Array.from(globalThis.Buffer.from(e24, "base64"));
  {
    let t = globalThis.atob(e24), r = new Uint8Array(t.length);
    for (let a = 0; a < t.length; ++a) r[a] = t.charCodeAt(a);
    return r;
  }
}
function Om(e24) {
  if (globalThis.Buffer) return globalThis.Buffer.from(e24).toString("base64");
  {
    let t = [];
    return e24.forEach((r) => {
      t.push(globalThis.String.fromCharCode(r));
    }), globalThis.btoa(t.join(""));
  }
}
function Sm(e24) {
  return typeof e24 == "object" && e24 !== null;
}
function W(e24) {
  return e24 != null;
}
d();
var g = ze(Ke());
function km(e24) {
  switch (e24) {
    case 0:
    case "REASONING_EFFORT_UNSPECIFIED":
      return 0;
    case 1:
    case "REASONING_EFFORT_MINIMAL":
      return 1;
    case 2:
    case "REASONING_EFFORT_LOW":
      return 2;
    case 3:
    case "REASONING_EFFORT_MEDIUM":
      return 3;
    case 4:
    case "REASONING_EFFORT_HIGH":
      return 4;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Im(e24) {
  switch (e24) {
    case 0:
      return "REASONING_EFFORT_UNSPECIFIED";
    case 1:
      return "REASONING_EFFORT_MINIMAL";
    case 2:
      return "REASONING_EFFORT_LOW";
    case 3:
      return "REASONING_EFFORT_MEDIUM";
    case 4:
      return "REASONING_EFFORT_HIGH";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function _m(e24) {
  switch (e24) {
    case 0:
    case "VERBOSITY_UNSPECIFIED":
      return 0;
    case 1:
    case "VERBOSITY_LOW":
      return 1;
    case 2:
    case "VERBOSITY_MEDIUM":
      return 2;
    case 3:
    case "VERBOSITY_HIGH":
      return 3;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Bm(e24) {
  switch (e24) {
    case 0:
      return "VERBOSITY_UNSPECIFIED";
    case 1:
      return "VERBOSITY_LOW";
    case 2:
      return "VERBOSITY_MEDIUM";
    case 3:
      return "VERBOSITY_HIGH";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function zc() {
  return { singleResponsePrompt: "", groupedResponseTask: "", groupedProperties: [], single: void 0, grouped: void 0 };
}
var Vt = { encode(e24, t = g.default.Writer.create()) {
  e24.singleResponsePrompt !== "" && t.uint32(10).string(e24.singleResponsePrompt), e24.groupedResponseTask !== "" && t.uint32(18).string(e24.groupedResponseTask);
  for (let r of e24.groupedProperties) t.uint32(26).string(r);
  return e24.single !== void 0 && ar.encode(e24.single, t.uint32(34).fork()).ldelim(), e24.grouped !== void 0 && or2.encode(e24.grouped, t.uint32(42).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = zc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.singleResponsePrompt = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.groupedResponseTask = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.groupedProperties.push(r.string());
        continue;
      case 4:
        if (n !== 34) break;
        i.single = ar.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.grouped = or2.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { singleResponsePrompt: l(e24.singleResponsePrompt) ? globalThis.String(e24.singleResponsePrompt) : "", groupedResponseTask: l(e24.groupedResponseTask) ? globalThis.String(e24.groupedResponseTask) : "", groupedProperties: globalThis.Array.isArray(e24?.groupedProperties) ? e24.groupedProperties.map((t) => globalThis.String(t)) : [], single: l(e24.single) ? ar.fromJSON(e24.single) : void 0, grouped: l(e24.grouped) ? or2.fromJSON(e24.grouped) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.singleResponsePrompt !== "" && (t.singleResponsePrompt = e24.singleResponsePrompt), e24.groupedResponseTask !== "" && (t.groupedResponseTask = e24.groupedResponseTask), e24.groupedProperties?.length && (t.groupedProperties = e24.groupedProperties), e24.single !== void 0 && (t.single = ar.toJSON(e24.single)), e24.grouped !== void 0 && (t.grouped = or2.toJSON(e24.grouped)), t;
}, create(e24) {
  return Vt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = zc();
  return t.singleResponsePrompt = e24.singleResponsePrompt ?? "", t.groupedResponseTask = e24.groupedResponseTask ?? "", t.groupedProperties = e24.groupedProperties?.map((r) => r) || [], t.single = e24.single !== void 0 && e24.single !== null ? ar.fromPartial(e24.single) : void 0, t.grouped = e24.grouped !== void 0 && e24.grouped !== null ? or2.fromPartial(e24.grouped) : void 0, t;
} };
function $c() {
  return { prompt: "", debug: false, queries: [] };
}
var ar = { encode(e24, t = g.default.Writer.create()) {
  e24.prompt !== "" && t.uint32(10).string(e24.prompt), e24.debug !== false && t.uint32(16).bool(e24.debug);
  for (let r of e24.queries) qe.encode(r, t.uint32(26).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = $c();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.prompt = r.string();
        continue;
      case 2:
        if (n !== 16) break;
        i.debug = r.bool();
        continue;
      case 3:
        if (n !== 26) break;
        i.queries.push(qe.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { prompt: l(e24.prompt) ? globalThis.String(e24.prompt) : "", debug: l(e24.debug) ? globalThis.Boolean(e24.debug) : false, queries: globalThis.Array.isArray(e24?.queries) ? e24.queries.map((t) => qe.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.prompt !== "" && (t.prompt = e24.prompt), e24.debug !== false && (t.debug = e24.debug), e24.queries?.length && (t.queries = e24.queries.map((r) => qe.toJSON(r))), t;
}, create(e24) {
  return ar.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = $c();
  return t.prompt = e24.prompt ?? "", t.debug = e24.debug ?? false, t.queries = e24.queries?.map((r) => qe.fromPartial(r)) || [], t;
} };
function Hc() {
  return { task: "", properties: void 0, queries: [], debug: false };
}
var or2 = { encode(e24, t = g.default.Writer.create()) {
  e24.task !== "" && t.uint32(10).string(e24.task), e24.properties !== void 0 && m.encode(e24.properties, t.uint32(18).fork()).ldelim();
  for (let r of e24.queries) qe.encode(r, t.uint32(26).fork()).ldelim();
  return e24.debug !== false && t.uint32(32).bool(e24.debug), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Hc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.task = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.properties = m.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.queries.push(qe.decode(r, r.uint32()));
        continue;
      case 4:
        if (n !== 32) break;
        i.debug = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { task: l(e24.task) ? globalThis.String(e24.task) : "", properties: l(e24.properties) ? m.fromJSON(e24.properties) : void 0, queries: globalThis.Array.isArray(e24?.queries) ? e24.queries.map((t) => qe.fromJSON(t)) : [], debug: l(e24.debug) ? globalThis.Boolean(e24.debug) : false };
}, toJSON(e24) {
  let t = {};
  return e24.task !== "" && (t.task = e24.task), e24.properties !== void 0 && (t.properties = m.toJSON(e24.properties)), e24.queries?.length && (t.queries = e24.queries.map((r) => qe.toJSON(r))), e24.debug !== false && (t.debug = e24.debug), t;
}, create(e24) {
  return or2.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Hc();
  return t.task = e24.task ?? "", t.properties = e24.properties !== void 0 && e24.properties !== null ? m.fromPartial(e24.properties) : void 0, t.queries = e24.queries?.map((r) => qe.fromPartial(r)) || [], t.debug = e24.debug ?? false, t;
} };
function Qc() {
  return { returnMetadata: false, anthropic: void 0, anyscale: void 0, aws: void 0, cohere: void 0, dummy: void 0, mistral: void 0, ollama: void 0, openai: void 0, google: void 0, databricks: void 0, friendliai: void 0, nvidia: void 0, xai: void 0, contextualai: void 0 };
}
var qe = { encode(e24, t = g.default.Writer.create()) {
  return e24.returnMetadata !== false && t.uint32(8).bool(e24.returnMetadata), e24.anthropic !== void 0 && Gn.encode(e24.anthropic, t.uint32(18).fork()).ldelim(), e24.anyscale !== void 0 && wn.encode(e24.anyscale, t.uint32(26).fork()).ldelim(), e24.aws !== void 0 && Mn.encode(e24.aws, t.uint32(34).fork()).ldelim(), e24.cohere !== void 0 && En.encode(e24.cohere, t.uint32(42).fork()).ldelim(), e24.dummy !== void 0 && Un.encode(e24.dummy, t.uint32(50).fork()).ldelim(), e24.mistral !== void 0 && Dn.encode(e24.mistral, t.uint32(58).fork()).ldelim(), e24.ollama !== void 0 && Fn.encode(e24.ollama, t.uint32(66).fork()).ldelim(), e24.openai !== void 0 && Wn.encode(e24.openai, t.uint32(74).fork()).ldelim(), e24.google !== void 0 && qn.encode(e24.google, t.uint32(82).fork()).ldelim(), e24.databricks !== void 0 && Ln.encode(e24.databricks, t.uint32(90).fork()).ldelim(), e24.friendliai !== void 0 && Jn.encode(e24.friendliai, t.uint32(98).fork()).ldelim(), e24.nvidia !== void 0 && zn.encode(e24.nvidia, t.uint32(106).fork()).ldelim(), e24.xai !== void 0 && $n.encode(e24.xai, t.uint32(114).fork()).ldelim(), e24.contextualai !== void 0 && Hn.encode(e24.contextualai, t.uint32(122).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Qc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.returnMetadata = r.bool();
        continue;
      case 2:
        if (n !== 18) break;
        i.anthropic = Gn.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.anyscale = wn.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.aws = Mn.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.cohere = En.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.dummy = Un.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.mistral = Dn.decode(r, r.uint32());
        continue;
      case 8:
        if (n !== 66) break;
        i.ollama = Fn.decode(r, r.uint32());
        continue;
      case 9:
        if (n !== 74) break;
        i.openai = Wn.decode(r, r.uint32());
        continue;
      case 10:
        if (n !== 82) break;
        i.google = qn.decode(r, r.uint32());
        continue;
      case 11:
        if (n !== 90) break;
        i.databricks = Ln.decode(r, r.uint32());
        continue;
      case 12:
        if (n !== 98) break;
        i.friendliai = Jn.decode(r, r.uint32());
        continue;
      case 13:
        if (n !== 106) break;
        i.nvidia = zn.decode(r, r.uint32());
        continue;
      case 14:
        if (n !== 114) break;
        i.xai = $n.decode(r, r.uint32());
        continue;
      case 15:
        if (n !== 122) break;
        i.contextualai = Hn.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { returnMetadata: l(e24.returnMetadata) ? globalThis.Boolean(e24.returnMetadata) : false, anthropic: l(e24.anthropic) ? Gn.fromJSON(e24.anthropic) : void 0, anyscale: l(e24.anyscale) ? wn.fromJSON(e24.anyscale) : void 0, aws: l(e24.aws) ? Mn.fromJSON(e24.aws) : void 0, cohere: l(e24.cohere) ? En.fromJSON(e24.cohere) : void 0, dummy: l(e24.dummy) ? Un.fromJSON(e24.dummy) : void 0, mistral: l(e24.mistral) ? Dn.fromJSON(e24.mistral) : void 0, ollama: l(e24.ollama) ? Fn.fromJSON(e24.ollama) : void 0, openai: l(e24.openai) ? Wn.fromJSON(e24.openai) : void 0, google: l(e24.google) ? qn.fromJSON(e24.google) : void 0, databricks: l(e24.databricks) ? Ln.fromJSON(e24.databricks) : void 0, friendliai: l(e24.friendliai) ? Jn.fromJSON(e24.friendliai) : void 0, nvidia: l(e24.nvidia) ? zn.fromJSON(e24.nvidia) : void 0, xai: l(e24.xai) ? $n.fromJSON(e24.xai) : void 0, contextualai: l(e24.contextualai) ? Hn.fromJSON(e24.contextualai) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.returnMetadata !== false && (t.returnMetadata = e24.returnMetadata), e24.anthropic !== void 0 && (t.anthropic = Gn.toJSON(e24.anthropic)), e24.anyscale !== void 0 && (t.anyscale = wn.toJSON(e24.anyscale)), e24.aws !== void 0 && (t.aws = Mn.toJSON(e24.aws)), e24.cohere !== void 0 && (t.cohere = En.toJSON(e24.cohere)), e24.dummy !== void 0 && (t.dummy = Un.toJSON(e24.dummy)), e24.mistral !== void 0 && (t.mistral = Dn.toJSON(e24.mistral)), e24.ollama !== void 0 && (t.ollama = Fn.toJSON(e24.ollama)), e24.openai !== void 0 && (t.openai = Wn.toJSON(e24.openai)), e24.google !== void 0 && (t.google = qn.toJSON(e24.google)), e24.databricks !== void 0 && (t.databricks = Ln.toJSON(e24.databricks)), e24.friendliai !== void 0 && (t.friendliai = Jn.toJSON(e24.friendliai)), e24.nvidia !== void 0 && (t.nvidia = zn.toJSON(e24.nvidia)), e24.xai !== void 0 && (t.xai = $n.toJSON(e24.xai)), e24.contextualai !== void 0 && (t.contextualai = Hn.toJSON(e24.contextualai)), t;
}, create(e24) {
  return qe.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Qc();
  return t.returnMetadata = e24.returnMetadata ?? false, t.anthropic = e24.anthropic !== void 0 && e24.anthropic !== null ? Gn.fromPartial(e24.anthropic) : void 0, t.anyscale = e24.anyscale !== void 0 && e24.anyscale !== null ? wn.fromPartial(e24.anyscale) : void 0, t.aws = e24.aws !== void 0 && e24.aws !== null ? Mn.fromPartial(e24.aws) : void 0, t.cohere = e24.cohere !== void 0 && e24.cohere !== null ? En.fromPartial(e24.cohere) : void 0, t.dummy = e24.dummy !== void 0 && e24.dummy !== null ? Un.fromPartial(e24.dummy) : void 0, t.mistral = e24.mistral !== void 0 && e24.mistral !== null ? Dn.fromPartial(e24.mistral) : void 0, t.ollama = e24.ollama !== void 0 && e24.ollama !== null ? Fn.fromPartial(e24.ollama) : void 0, t.openai = e24.openai !== void 0 && e24.openai !== null ? Wn.fromPartial(e24.openai) : void 0, t.google = e24.google !== void 0 && e24.google !== null ? qn.fromPartial(e24.google) : void 0, t.databricks = e24.databricks !== void 0 && e24.databricks !== null ? Ln.fromPartial(e24.databricks) : void 0, t.friendliai = e24.friendliai !== void 0 && e24.friendliai !== null ? Jn.fromPartial(e24.friendliai) : void 0, t.nvidia = e24.nvidia !== void 0 && e24.nvidia !== null ? zn.fromPartial(e24.nvidia) : void 0, t.xai = e24.xai !== void 0 && e24.xai !== null ? $n.fromPartial(e24.xai) : void 0, t.contextualai = e24.contextualai !== void 0 && e24.contextualai !== null ? Hn.fromPartial(e24.contextualai) : void 0, t;
} };
function Kc() {
  return { baseUrl: void 0, maxTokens: void 0, model: void 0, temperature: void 0, topK: void 0, topP: void 0, stopSequences: void 0, images: void 0, imageProperties: void 0 };
}
var Gn = { encode(e24, t = g.default.Writer.create()) {
  return e24.baseUrl !== void 0 && t.uint32(10).string(e24.baseUrl), e24.maxTokens !== void 0 && t.uint32(16).int64(e24.maxTokens), e24.model !== void 0 && t.uint32(26).string(e24.model), e24.temperature !== void 0 && t.uint32(33).double(e24.temperature), e24.topK !== void 0 && t.uint32(40).int64(e24.topK), e24.topP !== void 0 && t.uint32(49).double(e24.topP), e24.stopSequences !== void 0 && m.encode(e24.stopSequences, t.uint32(58).fork()).ldelim(), e24.images !== void 0 && m.encode(e24.images, t.uint32(66).fork()).ldelim(), e24.imageProperties !== void 0 && m.encode(e24.imageProperties, t.uint32(74).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Kc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.baseUrl = r.string();
        continue;
      case 2:
        if (n !== 16) break;
        i.maxTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 26) break;
        i.model = r.string();
        continue;
      case 4:
        if (n !== 33) break;
        i.temperature = r.double();
        continue;
      case 5:
        if (n !== 40) break;
        i.topK = E(r.int64());
        continue;
      case 6:
        if (n !== 49) break;
        i.topP = r.double();
        continue;
      case 7:
        if (n !== 58) break;
        i.stopSequences = m.decode(r, r.uint32());
        continue;
      case 8:
        if (n !== 66) break;
        i.images = m.decode(r, r.uint32());
        continue;
      case 9:
        if (n !== 74) break;
        i.imageProperties = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topK: l(e24.topK) ? globalThis.Number(e24.topK) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0, stopSequences: l(e24.stopSequences) ? m.fromJSON(e24.stopSequences) : void 0, images: l(e24.images) ? m.fromJSON(e24.images) : void 0, imageProperties: l(e24.imageProperties) ? m.fromJSON(e24.imageProperties) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topK !== void 0 && (t.topK = Math.round(e24.topK)), e24.topP !== void 0 && (t.topP = e24.topP), e24.stopSequences !== void 0 && (t.stopSequences = m.toJSON(e24.stopSequences)), e24.images !== void 0 && (t.images = m.toJSON(e24.images)), e24.imageProperties !== void 0 && (t.imageProperties = m.toJSON(e24.imageProperties)), t;
}, create(e24) {
  return Gn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Kc();
  return t.baseUrl = e24.baseUrl ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t.topK = e24.topK ?? void 0, t.topP = e24.topP ?? void 0, t.stopSequences = e24.stopSequences !== void 0 && e24.stopSequences !== null ? m.fromPartial(e24.stopSequences) : void 0, t.images = e24.images !== void 0 && e24.images !== null ? m.fromPartial(e24.images) : void 0, t.imageProperties = e24.imageProperties !== void 0 && e24.imageProperties !== null ? m.fromPartial(e24.imageProperties) : void 0, t;
} };
function Yc() {
  return { baseUrl: void 0, model: void 0, temperature: void 0 };
}
var wn = { encode(e24, t = g.default.Writer.create()) {
  return e24.baseUrl !== void 0 && t.uint32(10).string(e24.baseUrl), e24.model !== void 0 && t.uint32(18).string(e24.model), e24.temperature !== void 0 && t.uint32(25).double(e24.temperature), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Yc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.baseUrl = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.model = r.string();
        continue;
      case 3:
        if (n !== 25) break;
        i.temperature = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), t;
}, create(e24) {
  return wn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Yc();
  return t.baseUrl = e24.baseUrl ?? void 0, t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t;
} };
function Zc() {
  return { model: void 0, temperature: void 0, service: void 0, region: void 0, endpoint: void 0, targetModel: void 0, targetVariant: void 0, images: void 0, imageProperties: void 0, maxTokens: void 0, stopSequences: void 0 };
}
var Mn = { encode(e24, t = g.default.Writer.create()) {
  return e24.model !== void 0 && t.uint32(26).string(e24.model), e24.temperature !== void 0 && t.uint32(65).double(e24.temperature), e24.service !== void 0 && t.uint32(74).string(e24.service), e24.region !== void 0 && t.uint32(82).string(e24.region), e24.endpoint !== void 0 && t.uint32(90).string(e24.endpoint), e24.targetModel !== void 0 && t.uint32(98).string(e24.targetModel), e24.targetVariant !== void 0 && t.uint32(106).string(e24.targetVariant), e24.images !== void 0 && m.encode(e24.images, t.uint32(114).fork()).ldelim(), e24.imageProperties !== void 0 && m.encode(e24.imageProperties, t.uint32(122).fork()).ldelim(), e24.maxTokens !== void 0 && t.uint32(128).int64(e24.maxTokens), e24.stopSequences !== void 0 && m.encode(e24.stopSequences, t.uint32(138).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Zc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 3:
        if (n !== 26) break;
        i.model = r.string();
        continue;
      case 8:
        if (n !== 65) break;
        i.temperature = r.double();
        continue;
      case 9:
        if (n !== 74) break;
        i.service = r.string();
        continue;
      case 10:
        if (n !== 82) break;
        i.region = r.string();
        continue;
      case 11:
        if (n !== 90) break;
        i.endpoint = r.string();
        continue;
      case 12:
        if (n !== 98) break;
        i.targetModel = r.string();
        continue;
      case 13:
        if (n !== 106) break;
        i.targetVariant = r.string();
        continue;
      case 14:
        if (n !== 114) break;
        i.images = m.decode(r, r.uint32());
        continue;
      case 15:
        if (n !== 122) break;
        i.imageProperties = m.decode(r, r.uint32());
        continue;
      case 16:
        if (n !== 128) break;
        i.maxTokens = E(r.int64());
        continue;
      case 17:
        if (n !== 138) break;
        i.stopSequences = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, service: l(e24.service) ? globalThis.String(e24.service) : void 0, region: l(e24.region) ? globalThis.String(e24.region) : void 0, endpoint: l(e24.endpoint) ? globalThis.String(e24.endpoint) : void 0, targetModel: l(e24.targetModel) ? globalThis.String(e24.targetModel) : void 0, targetVariant: l(e24.targetVariant) ? globalThis.String(e24.targetVariant) : void 0, images: l(e24.images) ? m.fromJSON(e24.images) : void 0, imageProperties: l(e24.imageProperties) ? m.fromJSON(e24.imageProperties) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, stopSequences: l(e24.stopSequences) ? m.fromJSON(e24.stopSequences) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.service !== void 0 && (t.service = e24.service), e24.region !== void 0 && (t.region = e24.region), e24.endpoint !== void 0 && (t.endpoint = e24.endpoint), e24.targetModel !== void 0 && (t.targetModel = e24.targetModel), e24.targetVariant !== void 0 && (t.targetVariant = e24.targetVariant), e24.images !== void 0 && (t.images = m.toJSON(e24.images)), e24.imageProperties !== void 0 && (t.imageProperties = m.toJSON(e24.imageProperties)), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.stopSequences !== void 0 && (t.stopSequences = m.toJSON(e24.stopSequences)), t;
}, create(e24) {
  return Mn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Zc();
  return t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t.service = e24.service ?? void 0, t.region = e24.region ?? void 0, t.endpoint = e24.endpoint ?? void 0, t.targetModel = e24.targetModel ?? void 0, t.targetVariant = e24.targetVariant ?? void 0, t.images = e24.images !== void 0 && e24.images !== null ? m.fromPartial(e24.images) : void 0, t.imageProperties = e24.imageProperties !== void 0 && e24.imageProperties !== null ? m.fromPartial(e24.imageProperties) : void 0, t.maxTokens = e24.maxTokens ?? void 0, t.stopSequences = e24.stopSequences !== void 0 && e24.stopSequences !== null ? m.fromPartial(e24.stopSequences) : void 0, t;
} };
function Xc() {
  return { baseUrl: void 0, frequencyPenalty: void 0, maxTokens: void 0, model: void 0, k: void 0, p: void 0, presencePenalty: void 0, stopSequences: void 0, temperature: void 0, images: void 0, imageProperties: void 0 };
}
var En = { encode(e24, t = g.default.Writer.create()) {
  return e24.baseUrl !== void 0 && t.uint32(10).string(e24.baseUrl), e24.frequencyPenalty !== void 0 && t.uint32(17).double(e24.frequencyPenalty), e24.maxTokens !== void 0 && t.uint32(24).int64(e24.maxTokens), e24.model !== void 0 && t.uint32(34).string(e24.model), e24.k !== void 0 && t.uint32(40).int64(e24.k), e24.p !== void 0 && t.uint32(49).double(e24.p), e24.presencePenalty !== void 0 && t.uint32(57).double(e24.presencePenalty), e24.stopSequences !== void 0 && m.encode(e24.stopSequences, t.uint32(66).fork()).ldelim(), e24.temperature !== void 0 && t.uint32(73).double(e24.temperature), e24.images !== void 0 && m.encode(e24.images, t.uint32(82).fork()).ldelim(), e24.imageProperties !== void 0 && m.encode(e24.imageProperties, t.uint32(90).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Xc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.baseUrl = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.frequencyPenalty = r.double();
        continue;
      case 3:
        if (n !== 24) break;
        i.maxTokens = E(r.int64());
        continue;
      case 4:
        if (n !== 34) break;
        i.model = r.string();
        continue;
      case 5:
        if (n !== 40) break;
        i.k = E(r.int64());
        continue;
      case 6:
        if (n !== 49) break;
        i.p = r.double();
        continue;
      case 7:
        if (n !== 57) break;
        i.presencePenalty = r.double();
        continue;
      case 8:
        if (n !== 66) break;
        i.stopSequences = m.decode(r, r.uint32());
        continue;
      case 9:
        if (n !== 73) break;
        i.temperature = r.double();
        continue;
      case 10:
        if (n !== 82) break;
        i.images = m.decode(r, r.uint32());
        continue;
      case 11:
        if (n !== 90) break;
        i.imageProperties = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, frequencyPenalty: l(e24.frequencyPenalty) ? globalThis.Number(e24.frequencyPenalty) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, k: l(e24.k) ? globalThis.Number(e24.k) : void 0, p: l(e24.p) ? globalThis.Number(e24.p) : void 0, presencePenalty: l(e24.presencePenalty) ? globalThis.Number(e24.presencePenalty) : void 0, stopSequences: l(e24.stopSequences) ? m.fromJSON(e24.stopSequences) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, images: l(e24.images) ? m.fromJSON(e24.images) : void 0, imageProperties: l(e24.imageProperties) ? m.fromJSON(e24.imageProperties) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.frequencyPenalty !== void 0 && (t.frequencyPenalty = e24.frequencyPenalty), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.model !== void 0 && (t.model = e24.model), e24.k !== void 0 && (t.k = Math.round(e24.k)), e24.p !== void 0 && (t.p = e24.p), e24.presencePenalty !== void 0 && (t.presencePenalty = e24.presencePenalty), e24.stopSequences !== void 0 && (t.stopSequences = m.toJSON(e24.stopSequences)), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.images !== void 0 && (t.images = m.toJSON(e24.images)), e24.imageProperties !== void 0 && (t.imageProperties = m.toJSON(e24.imageProperties)), t;
}, create(e24) {
  return En.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Xc();
  return t.baseUrl = e24.baseUrl ?? void 0, t.frequencyPenalty = e24.frequencyPenalty ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.model = e24.model ?? void 0, t.k = e24.k ?? void 0, t.p = e24.p ?? void 0, t.presencePenalty = e24.presencePenalty ?? void 0, t.stopSequences = e24.stopSequences !== void 0 && e24.stopSequences !== null ? m.fromPartial(e24.stopSequences) : void 0, t.temperature = e24.temperature ?? void 0, t.images = e24.images !== void 0 && e24.images !== null ? m.fromPartial(e24.images) : void 0, t.imageProperties = e24.imageProperties !== void 0 && e24.imageProperties !== null ? m.fromPartial(e24.imageProperties) : void 0, t;
} };
function jc() {
  return {};
}
var Un = { encode(e24, t = g.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = jc();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return Un.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return jc();
} };
function el() {
  return { baseUrl: void 0, maxTokens: void 0, model: void 0, temperature: void 0, topP: void 0 };
}
var Dn = { encode(e24, t = g.default.Writer.create()) {
  return e24.baseUrl !== void 0 && t.uint32(10).string(e24.baseUrl), e24.maxTokens !== void 0 && t.uint32(16).int64(e24.maxTokens), e24.model !== void 0 && t.uint32(26).string(e24.model), e24.temperature !== void 0 && t.uint32(33).double(e24.temperature), e24.topP !== void 0 && t.uint32(41).double(e24.topP), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = el();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.baseUrl = r.string();
        continue;
      case 2:
        if (n !== 16) break;
        i.maxTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 26) break;
        i.model = r.string();
        continue;
      case 4:
        if (n !== 33) break;
        i.temperature = r.double();
        continue;
      case 5:
        if (n !== 41) break;
        i.topP = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topP !== void 0 && (t.topP = e24.topP), t;
}, create(e24) {
  return Dn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = el();
  return t.baseUrl = e24.baseUrl ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t.topP = e24.topP ?? void 0, t;
} };
function tl() {
  return { apiEndpoint: void 0, model: void 0, temperature: void 0, images: void 0, imageProperties: void 0 };
}
var Fn = { encode(e24, t = g.default.Writer.create()) {
  return e24.apiEndpoint !== void 0 && t.uint32(10).string(e24.apiEndpoint), e24.model !== void 0 && t.uint32(18).string(e24.model), e24.temperature !== void 0 && t.uint32(25).double(e24.temperature), e24.images !== void 0 && m.encode(e24.images, t.uint32(34).fork()).ldelim(), e24.imageProperties !== void 0 && m.encode(e24.imageProperties, t.uint32(42).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = tl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.apiEndpoint = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.model = r.string();
        continue;
      case 3:
        if (n !== 25) break;
        i.temperature = r.double();
        continue;
      case 4:
        if (n !== 34) break;
        i.images = m.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.imageProperties = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { apiEndpoint: l(e24.apiEndpoint) ? globalThis.String(e24.apiEndpoint) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, images: l(e24.images) ? m.fromJSON(e24.images) : void 0, imageProperties: l(e24.imageProperties) ? m.fromJSON(e24.imageProperties) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.apiEndpoint !== void 0 && (t.apiEndpoint = e24.apiEndpoint), e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.images !== void 0 && (t.images = m.toJSON(e24.images)), e24.imageProperties !== void 0 && (t.imageProperties = m.toJSON(e24.imageProperties)), t;
}, create(e24) {
  return Fn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = tl();
  return t.apiEndpoint = e24.apiEndpoint ?? void 0, t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t.images = e24.images !== void 0 && e24.images !== null ? m.fromPartial(e24.images) : void 0, t.imageProperties = e24.imageProperties !== void 0 && e24.imageProperties !== null ? m.fromPartial(e24.imageProperties) : void 0, t;
} };
function rl() {
  return { frequencyPenalty: void 0, maxTokens: void 0, model: void 0, n: void 0, presencePenalty: void 0, stop: void 0, temperature: void 0, topP: void 0, baseUrl: void 0, apiVersion: void 0, resourceName: void 0, deploymentId: void 0, isAzure: void 0, images: void 0, imageProperties: void 0, reasoningEffort: void 0, verbosity: void 0 };
}
var Wn = { encode(e24, t = g.default.Writer.create()) {
  return e24.frequencyPenalty !== void 0 && t.uint32(9).double(e24.frequencyPenalty), e24.maxTokens !== void 0 && t.uint32(16).int64(e24.maxTokens), e24.model !== void 0 && t.uint32(26).string(e24.model), e24.n !== void 0 && t.uint32(32).int64(e24.n), e24.presencePenalty !== void 0 && t.uint32(41).double(e24.presencePenalty), e24.stop !== void 0 && m.encode(e24.stop, t.uint32(50).fork()).ldelim(), e24.temperature !== void 0 && t.uint32(57).double(e24.temperature), e24.topP !== void 0 && t.uint32(65).double(e24.topP), e24.baseUrl !== void 0 && t.uint32(74).string(e24.baseUrl), e24.apiVersion !== void 0 && t.uint32(82).string(e24.apiVersion), e24.resourceName !== void 0 && t.uint32(90).string(e24.resourceName), e24.deploymentId !== void 0 && t.uint32(98).string(e24.deploymentId), e24.isAzure !== void 0 && t.uint32(104).bool(e24.isAzure), e24.images !== void 0 && m.encode(e24.images, t.uint32(114).fork()).ldelim(), e24.imageProperties !== void 0 && m.encode(e24.imageProperties, t.uint32(122).fork()).ldelim(), e24.reasoningEffort !== void 0 && t.uint32(128).int32(e24.reasoningEffort), e24.verbosity !== void 0 && t.uint32(136).int32(e24.verbosity), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = rl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 9) break;
        i.frequencyPenalty = r.double();
        continue;
      case 2:
        if (n !== 16) break;
        i.maxTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 26) break;
        i.model = r.string();
        continue;
      case 4:
        if (n !== 32) break;
        i.n = E(r.int64());
        continue;
      case 5:
        if (n !== 41) break;
        i.presencePenalty = r.double();
        continue;
      case 6:
        if (n !== 50) break;
        i.stop = m.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 57) break;
        i.temperature = r.double();
        continue;
      case 8:
        if (n !== 65) break;
        i.topP = r.double();
        continue;
      case 9:
        if (n !== 74) break;
        i.baseUrl = r.string();
        continue;
      case 10:
        if (n !== 82) break;
        i.apiVersion = r.string();
        continue;
      case 11:
        if (n !== 90) break;
        i.resourceName = r.string();
        continue;
      case 12:
        if (n !== 98) break;
        i.deploymentId = r.string();
        continue;
      case 13:
        if (n !== 104) break;
        i.isAzure = r.bool();
        continue;
      case 14:
        if (n !== 114) break;
        i.images = m.decode(r, r.uint32());
        continue;
      case 15:
        if (n !== 122) break;
        i.imageProperties = m.decode(r, r.uint32());
        continue;
      case 16:
        if (n !== 128) break;
        i.reasoningEffort = r.int32();
        continue;
      case 17:
        if (n !== 136) break;
        i.verbosity = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { frequencyPenalty: l(e24.frequencyPenalty) ? globalThis.Number(e24.frequencyPenalty) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, n: l(e24.n) ? globalThis.Number(e24.n) : void 0, presencePenalty: l(e24.presencePenalty) ? globalThis.Number(e24.presencePenalty) : void 0, stop: l(e24.stop) ? m.fromJSON(e24.stop) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0, baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, apiVersion: l(e24.apiVersion) ? globalThis.String(e24.apiVersion) : void 0, resourceName: l(e24.resourceName) ? globalThis.String(e24.resourceName) : void 0, deploymentId: l(e24.deploymentId) ? globalThis.String(e24.deploymentId) : void 0, isAzure: l(e24.isAzure) ? globalThis.Boolean(e24.isAzure) : void 0, images: l(e24.images) ? m.fromJSON(e24.images) : void 0, imageProperties: l(e24.imageProperties) ? m.fromJSON(e24.imageProperties) : void 0, reasoningEffort: l(e24.reasoningEffort) ? km(e24.reasoningEffort) : void 0, verbosity: l(e24.verbosity) ? _m(e24.verbosity) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.frequencyPenalty !== void 0 && (t.frequencyPenalty = e24.frequencyPenalty), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.model !== void 0 && (t.model = e24.model), e24.n !== void 0 && (t.n = Math.round(e24.n)), e24.presencePenalty !== void 0 && (t.presencePenalty = e24.presencePenalty), e24.stop !== void 0 && (t.stop = m.toJSON(e24.stop)), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topP !== void 0 && (t.topP = e24.topP), e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.apiVersion !== void 0 && (t.apiVersion = e24.apiVersion), e24.resourceName !== void 0 && (t.resourceName = e24.resourceName), e24.deploymentId !== void 0 && (t.deploymentId = e24.deploymentId), e24.isAzure !== void 0 && (t.isAzure = e24.isAzure), e24.images !== void 0 && (t.images = m.toJSON(e24.images)), e24.imageProperties !== void 0 && (t.imageProperties = m.toJSON(e24.imageProperties)), e24.reasoningEffort !== void 0 && (t.reasoningEffort = Im(e24.reasoningEffort)), e24.verbosity !== void 0 && (t.verbosity = Bm(e24.verbosity)), t;
}, create(e24) {
  return Wn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = rl();
  return t.frequencyPenalty = e24.frequencyPenalty ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.model = e24.model ?? void 0, t.n = e24.n ?? void 0, t.presencePenalty = e24.presencePenalty ?? void 0, t.stop = e24.stop !== void 0 && e24.stop !== null ? m.fromPartial(e24.stop) : void 0, t.temperature = e24.temperature ?? void 0, t.topP = e24.topP ?? void 0, t.baseUrl = e24.baseUrl ?? void 0, t.apiVersion = e24.apiVersion ?? void 0, t.resourceName = e24.resourceName ?? void 0, t.deploymentId = e24.deploymentId ?? void 0, t.isAzure = e24.isAzure ?? void 0, t.images = e24.images !== void 0 && e24.images !== null ? m.fromPartial(e24.images) : void 0, t.imageProperties = e24.imageProperties !== void 0 && e24.imageProperties !== null ? m.fromPartial(e24.imageProperties) : void 0, t.reasoningEffort = e24.reasoningEffort ?? void 0, t.verbosity = e24.verbosity ?? void 0, t;
} };
function nl() {
  return { frequencyPenalty: void 0, maxTokens: void 0, model: void 0, presencePenalty: void 0, temperature: void 0, topK: void 0, topP: void 0, stopSequences: void 0, apiEndpoint: void 0, projectId: void 0, endpointId: void 0, region: void 0, images: void 0, imageProperties: void 0 };
}
var qn = { encode(e24, t = g.default.Writer.create()) {
  return e24.frequencyPenalty !== void 0 && t.uint32(9).double(e24.frequencyPenalty), e24.maxTokens !== void 0 && t.uint32(16).int64(e24.maxTokens), e24.model !== void 0 && t.uint32(26).string(e24.model), e24.presencePenalty !== void 0 && t.uint32(33).double(e24.presencePenalty), e24.temperature !== void 0 && t.uint32(41).double(e24.temperature), e24.topK !== void 0 && t.uint32(48).int64(e24.topK), e24.topP !== void 0 && t.uint32(57).double(e24.topP), e24.stopSequences !== void 0 && m.encode(e24.stopSequences, t.uint32(66).fork()).ldelim(), e24.apiEndpoint !== void 0 && t.uint32(74).string(e24.apiEndpoint), e24.projectId !== void 0 && t.uint32(82).string(e24.projectId), e24.endpointId !== void 0 && t.uint32(90).string(e24.endpointId), e24.region !== void 0 && t.uint32(98).string(e24.region), e24.images !== void 0 && m.encode(e24.images, t.uint32(106).fork()).ldelim(), e24.imageProperties !== void 0 && m.encode(e24.imageProperties, t.uint32(114).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = nl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 9) break;
        i.frequencyPenalty = r.double();
        continue;
      case 2:
        if (n !== 16) break;
        i.maxTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 26) break;
        i.model = r.string();
        continue;
      case 4:
        if (n !== 33) break;
        i.presencePenalty = r.double();
        continue;
      case 5:
        if (n !== 41) break;
        i.temperature = r.double();
        continue;
      case 6:
        if (n !== 48) break;
        i.topK = E(r.int64());
        continue;
      case 7:
        if (n !== 57) break;
        i.topP = r.double();
        continue;
      case 8:
        if (n !== 66) break;
        i.stopSequences = m.decode(r, r.uint32());
        continue;
      case 9:
        if (n !== 74) break;
        i.apiEndpoint = r.string();
        continue;
      case 10:
        if (n !== 82) break;
        i.projectId = r.string();
        continue;
      case 11:
        if (n !== 90) break;
        i.endpointId = r.string();
        continue;
      case 12:
        if (n !== 98) break;
        i.region = r.string();
        continue;
      case 13:
        if (n !== 106) break;
        i.images = m.decode(r, r.uint32());
        continue;
      case 14:
        if (n !== 114) break;
        i.imageProperties = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { frequencyPenalty: l(e24.frequencyPenalty) ? globalThis.Number(e24.frequencyPenalty) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, presencePenalty: l(e24.presencePenalty) ? globalThis.Number(e24.presencePenalty) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topK: l(e24.topK) ? globalThis.Number(e24.topK) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0, stopSequences: l(e24.stopSequences) ? m.fromJSON(e24.stopSequences) : void 0, apiEndpoint: l(e24.apiEndpoint) ? globalThis.String(e24.apiEndpoint) : void 0, projectId: l(e24.projectId) ? globalThis.String(e24.projectId) : void 0, endpointId: l(e24.endpointId) ? globalThis.String(e24.endpointId) : void 0, region: l(e24.region) ? globalThis.String(e24.region) : void 0, images: l(e24.images) ? m.fromJSON(e24.images) : void 0, imageProperties: l(e24.imageProperties) ? m.fromJSON(e24.imageProperties) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.frequencyPenalty !== void 0 && (t.frequencyPenalty = e24.frequencyPenalty), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.model !== void 0 && (t.model = e24.model), e24.presencePenalty !== void 0 && (t.presencePenalty = e24.presencePenalty), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topK !== void 0 && (t.topK = Math.round(e24.topK)), e24.topP !== void 0 && (t.topP = e24.topP), e24.stopSequences !== void 0 && (t.stopSequences = m.toJSON(e24.stopSequences)), e24.apiEndpoint !== void 0 && (t.apiEndpoint = e24.apiEndpoint), e24.projectId !== void 0 && (t.projectId = e24.projectId), e24.endpointId !== void 0 && (t.endpointId = e24.endpointId), e24.region !== void 0 && (t.region = e24.region), e24.images !== void 0 && (t.images = m.toJSON(e24.images)), e24.imageProperties !== void 0 && (t.imageProperties = m.toJSON(e24.imageProperties)), t;
}, create(e24) {
  return qn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = nl();
  return t.frequencyPenalty = e24.frequencyPenalty ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.model = e24.model ?? void 0, t.presencePenalty = e24.presencePenalty ?? void 0, t.temperature = e24.temperature ?? void 0, t.topK = e24.topK ?? void 0, t.topP = e24.topP ?? void 0, t.stopSequences = e24.stopSequences !== void 0 && e24.stopSequences !== null ? m.fromPartial(e24.stopSequences) : void 0, t.apiEndpoint = e24.apiEndpoint ?? void 0, t.projectId = e24.projectId ?? void 0, t.endpointId = e24.endpointId ?? void 0, t.region = e24.region ?? void 0, t.images = e24.images !== void 0 && e24.images !== null ? m.fromPartial(e24.images) : void 0, t.imageProperties = e24.imageProperties !== void 0 && e24.imageProperties !== null ? m.fromPartial(e24.imageProperties) : void 0, t;
} };
function il() {
  return { endpoint: void 0, model: void 0, frequencyPenalty: void 0, logProbs: void 0, topLogProbs: void 0, maxTokens: void 0, n: void 0, presencePenalty: void 0, stop: void 0, temperature: void 0, topP: void 0 };
}
var Ln = { encode(e24, t = g.default.Writer.create()) {
  return e24.endpoint !== void 0 && t.uint32(10).string(e24.endpoint), e24.model !== void 0 && t.uint32(18).string(e24.model), e24.frequencyPenalty !== void 0 && t.uint32(25).double(e24.frequencyPenalty), e24.logProbs !== void 0 && t.uint32(32).bool(e24.logProbs), e24.topLogProbs !== void 0 && t.uint32(40).int64(e24.topLogProbs), e24.maxTokens !== void 0 && t.uint32(48).int64(e24.maxTokens), e24.n !== void 0 && t.uint32(56).int64(e24.n), e24.presencePenalty !== void 0 && t.uint32(65).double(e24.presencePenalty), e24.stop !== void 0 && m.encode(e24.stop, t.uint32(74).fork()).ldelim(), e24.temperature !== void 0 && t.uint32(81).double(e24.temperature), e24.topP !== void 0 && t.uint32(89).double(e24.topP), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = il();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.endpoint = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.model = r.string();
        continue;
      case 3:
        if (n !== 25) break;
        i.frequencyPenalty = r.double();
        continue;
      case 4:
        if (n !== 32) break;
        i.logProbs = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.topLogProbs = E(r.int64());
        continue;
      case 6:
        if (n !== 48) break;
        i.maxTokens = E(r.int64());
        continue;
      case 7:
        if (n !== 56) break;
        i.n = E(r.int64());
        continue;
      case 8:
        if (n !== 65) break;
        i.presencePenalty = r.double();
        continue;
      case 9:
        if (n !== 74) break;
        i.stop = m.decode(r, r.uint32());
        continue;
      case 10:
        if (n !== 81) break;
        i.temperature = r.double();
        continue;
      case 11:
        if (n !== 89) break;
        i.topP = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { endpoint: l(e24.endpoint) ? globalThis.String(e24.endpoint) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, frequencyPenalty: l(e24.frequencyPenalty) ? globalThis.Number(e24.frequencyPenalty) : void 0, logProbs: l(e24.logProbs) ? globalThis.Boolean(e24.logProbs) : void 0, topLogProbs: l(e24.topLogProbs) ? globalThis.Number(e24.topLogProbs) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, n: l(e24.n) ? globalThis.Number(e24.n) : void 0, presencePenalty: l(e24.presencePenalty) ? globalThis.Number(e24.presencePenalty) : void 0, stop: l(e24.stop) ? m.fromJSON(e24.stop) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.endpoint !== void 0 && (t.endpoint = e24.endpoint), e24.model !== void 0 && (t.model = e24.model), e24.frequencyPenalty !== void 0 && (t.frequencyPenalty = e24.frequencyPenalty), e24.logProbs !== void 0 && (t.logProbs = e24.logProbs), e24.topLogProbs !== void 0 && (t.topLogProbs = Math.round(e24.topLogProbs)), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.n !== void 0 && (t.n = Math.round(e24.n)), e24.presencePenalty !== void 0 && (t.presencePenalty = e24.presencePenalty), e24.stop !== void 0 && (t.stop = m.toJSON(e24.stop)), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topP !== void 0 && (t.topP = e24.topP), t;
}, create(e24) {
  return Ln.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = il();
  return t.endpoint = e24.endpoint ?? void 0, t.model = e24.model ?? void 0, t.frequencyPenalty = e24.frequencyPenalty ?? void 0, t.logProbs = e24.logProbs ?? void 0, t.topLogProbs = e24.topLogProbs ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.n = e24.n ?? void 0, t.presencePenalty = e24.presencePenalty ?? void 0, t.stop = e24.stop !== void 0 && e24.stop !== null ? m.fromPartial(e24.stop) : void 0, t.temperature = e24.temperature ?? void 0, t.topP = e24.topP ?? void 0, t;
} };
function al() {
  return { baseUrl: void 0, model: void 0, maxTokens: void 0, temperature: void 0, n: void 0, topP: void 0 };
}
var Jn = { encode(e24, t = g.default.Writer.create()) {
  return e24.baseUrl !== void 0 && t.uint32(10).string(e24.baseUrl), e24.model !== void 0 && t.uint32(18).string(e24.model), e24.maxTokens !== void 0 && t.uint32(24).int64(e24.maxTokens), e24.temperature !== void 0 && t.uint32(33).double(e24.temperature), e24.n !== void 0 && t.uint32(40).int64(e24.n), e24.topP !== void 0 && t.uint32(49).double(e24.topP), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = al();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.baseUrl = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.model = r.string();
        continue;
      case 3:
        if (n !== 24) break;
        i.maxTokens = E(r.int64());
        continue;
      case 4:
        if (n !== 33) break;
        i.temperature = r.double();
        continue;
      case 5:
        if (n !== 40) break;
        i.n = E(r.int64());
        continue;
      case 6:
        if (n !== 49) break;
        i.topP = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, n: l(e24.n) ? globalThis.Number(e24.n) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.model !== void 0 && (t.model = e24.model), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.n !== void 0 && (t.n = Math.round(e24.n)), e24.topP !== void 0 && (t.topP = e24.topP), t;
}, create(e24) {
  return Jn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = al();
  return t.baseUrl = e24.baseUrl ?? void 0, t.model = e24.model ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.temperature = e24.temperature ?? void 0, t.n = e24.n ?? void 0, t.topP = e24.topP ?? void 0, t;
} };
function ol() {
  return { baseUrl: void 0, model: void 0, temperature: void 0, topP: void 0, maxTokens: void 0 };
}
var zn = { encode(e24, t = g.default.Writer.create()) {
  return e24.baseUrl !== void 0 && t.uint32(10).string(e24.baseUrl), e24.model !== void 0 && t.uint32(18).string(e24.model), e24.temperature !== void 0 && t.uint32(25).double(e24.temperature), e24.topP !== void 0 && t.uint32(33).double(e24.topP), e24.maxTokens !== void 0 && t.uint32(40).int64(e24.maxTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ol();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.baseUrl = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.model = r.string();
        continue;
      case 3:
        if (n !== 25) break;
        i.temperature = r.double();
        continue;
      case 4:
        if (n !== 33) break;
        i.topP = r.double();
        continue;
      case 5:
        if (n !== 40) break;
        i.maxTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topP !== void 0 && (t.topP = e24.topP), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), t;
}, create(e24) {
  return zn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ol();
  return t.baseUrl = e24.baseUrl ?? void 0, t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t.topP = e24.topP ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t;
} };
function sl() {
  return { baseUrl: void 0, model: void 0, temperature: void 0, topP: void 0, maxTokens: void 0, images: void 0, imageProperties: void 0 };
}
var $n = { encode(e24, t = g.default.Writer.create()) {
  return e24.baseUrl !== void 0 && t.uint32(10).string(e24.baseUrl), e24.model !== void 0 && t.uint32(18).string(e24.model), e24.temperature !== void 0 && t.uint32(25).double(e24.temperature), e24.topP !== void 0 && t.uint32(33).double(e24.topP), e24.maxTokens !== void 0 && t.uint32(40).int64(e24.maxTokens), e24.images !== void 0 && m.encode(e24.images, t.uint32(50).fork()).ldelim(), e24.imageProperties !== void 0 && m.encode(e24.imageProperties, t.uint32(58).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = sl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.baseUrl = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.model = r.string();
        continue;
      case 3:
        if (n !== 25) break;
        i.temperature = r.double();
        continue;
      case 4:
        if (n !== 33) break;
        i.topP = r.double();
        continue;
      case 5:
        if (n !== 40) break;
        i.maxTokens = E(r.int64());
        continue;
      case 6:
        if (n !== 50) break;
        i.images = m.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.imageProperties = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { baseUrl: l(e24.baseUrl) ? globalThis.String(e24.baseUrl) : void 0, model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0, maxTokens: l(e24.maxTokens) ? globalThis.Number(e24.maxTokens) : void 0, images: l(e24.images) ? m.fromJSON(e24.images) : void 0, imageProperties: l(e24.imageProperties) ? m.fromJSON(e24.imageProperties) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.baseUrl !== void 0 && (t.baseUrl = e24.baseUrl), e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topP !== void 0 && (t.topP = e24.topP), e24.maxTokens !== void 0 && (t.maxTokens = Math.round(e24.maxTokens)), e24.images !== void 0 && (t.images = m.toJSON(e24.images)), e24.imageProperties !== void 0 && (t.imageProperties = m.toJSON(e24.imageProperties)), t;
}, create(e24) {
  return $n.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = sl();
  return t.baseUrl = e24.baseUrl ?? void 0, t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t.topP = e24.topP ?? void 0, t.maxTokens = e24.maxTokens ?? void 0, t.images = e24.images !== void 0 && e24.images !== null ? m.fromPartial(e24.images) : void 0, t.imageProperties = e24.imageProperties !== void 0 && e24.imageProperties !== null ? m.fromPartial(e24.imageProperties) : void 0, t;
} };
function ul() {
  return { model: void 0, temperature: void 0, topP: void 0, maxNewTokens: void 0, systemPrompt: void 0, avoidCommentary: void 0, knowledge: void 0 };
}
var Hn = { encode(e24, t = g.default.Writer.create()) {
  return e24.model !== void 0 && t.uint32(10).string(e24.model), e24.temperature !== void 0 && t.uint32(17).double(e24.temperature), e24.topP !== void 0 && t.uint32(25).double(e24.topP), e24.maxNewTokens !== void 0 && t.uint32(32).int64(e24.maxNewTokens), e24.systemPrompt !== void 0 && t.uint32(42).string(e24.systemPrompt), e24.avoidCommentary !== void 0 && t.uint32(48).bool(e24.avoidCommentary), e24.knowledge !== void 0 && m.encode(e24.knowledge, t.uint32(58).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ul();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.model = r.string();
        continue;
      case 2:
        if (n !== 17) break;
        i.temperature = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.topP = r.double();
        continue;
      case 4:
        if (n !== 32) break;
        i.maxNewTokens = E(r.int64());
        continue;
      case 5:
        if (n !== 42) break;
        i.systemPrompt = r.string();
        continue;
      case 6:
        if (n !== 48) break;
        i.avoidCommentary = r.bool();
        continue;
      case 7:
        if (n !== 58) break;
        i.knowledge = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { model: l(e24.model) ? globalThis.String(e24.model) : void 0, temperature: l(e24.temperature) ? globalThis.Number(e24.temperature) : void 0, topP: l(e24.topP) ? globalThis.Number(e24.topP) : void 0, maxNewTokens: l(e24.maxNewTokens) ? globalThis.Number(e24.maxNewTokens) : void 0, systemPrompt: l(e24.systemPrompt) ? globalThis.String(e24.systemPrompt) : void 0, avoidCommentary: l(e24.avoidCommentary) ? globalThis.Boolean(e24.avoidCommentary) : void 0, knowledge: l(e24.knowledge) ? m.fromJSON(e24.knowledge) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.model !== void 0 && (t.model = e24.model), e24.temperature !== void 0 && (t.temperature = e24.temperature), e24.topP !== void 0 && (t.topP = e24.topP), e24.maxNewTokens !== void 0 && (t.maxNewTokens = Math.round(e24.maxNewTokens)), e24.systemPrompt !== void 0 && (t.systemPrompt = e24.systemPrompt), e24.avoidCommentary !== void 0 && (t.avoidCommentary = e24.avoidCommentary), e24.knowledge !== void 0 && (t.knowledge = m.toJSON(e24.knowledge)), t;
}, create(e24) {
  return Hn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ul();
  return t.model = e24.model ?? void 0, t.temperature = e24.temperature ?? void 0, t.topP = e24.topP ?? void 0, t.maxNewTokens = e24.maxNewTokens ?? void 0, t.systemPrompt = e24.systemPrompt ?? void 0, t.avoidCommentary = e24.avoidCommentary ?? void 0, t.knowledge = e24.knowledge !== void 0 && e24.knowledge !== null ? m.fromPartial(e24.knowledge) : void 0, t;
} };
function dl() {
  return { usage: void 0 };
}
var Qn = { encode(e24, t = g.default.Writer.create()) {
  return e24.usage !== void 0 && Kn.encode(e24.usage, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = dl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.usage = Kn.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { usage: l(e24.usage) ? Kn.fromJSON(e24.usage) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.usage !== void 0 && (t.usage = Kn.toJSON(e24.usage)), t;
}, create(e24) {
  return Qn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = dl();
  return t.usage = e24.usage !== void 0 && e24.usage !== null ? Kn.fromPartial(e24.usage) : void 0, t;
} };
function cl() {
  return { inputTokens: 0, outputTokens: 0 };
}
var Kn = { encode(e24, t = g.default.Writer.create()) {
  return e24.inputTokens !== 0 && t.uint32(8).int64(e24.inputTokens), e24.outputTokens !== 0 && t.uint32(16).int64(e24.outputTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = cl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.inputTokens = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.outputTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { inputTokens: l(e24.inputTokens) ? globalThis.Number(e24.inputTokens) : 0, outputTokens: l(e24.outputTokens) ? globalThis.Number(e24.outputTokens) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.inputTokens !== 0 && (t.inputTokens = Math.round(e24.inputTokens)), e24.outputTokens !== 0 && (t.outputTokens = Math.round(e24.outputTokens)), t;
}, create(e24) {
  return Kn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = cl();
  return t.inputTokens = e24.inputTokens ?? 0, t.outputTokens = e24.outputTokens ?? 0, t;
} };
function ll() {
  return {};
}
var Yn = { encode(e24, t = g.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ll();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return Yn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return ll();
} };
function fl() {
  return {};
}
var Zn = { encode(e24, t = g.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = fl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return Zn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return fl();
} };
function pl() {
  return { apiVersion: void 0, billedUnits: void 0, tokens: void 0, warnings: void 0 };
}
var Xn = { encode(e24, t = g.default.Writer.create()) {
  return e24.apiVersion !== void 0 && jn.encode(e24.apiVersion, t.uint32(10).fork()).ldelim(), e24.billedUnits !== void 0 && ei.encode(e24.billedUnits, t.uint32(18).fork()).ldelim(), e24.tokens !== void 0 && ti.encode(e24.tokens, t.uint32(26).fork()).ldelim(), e24.warnings !== void 0 && m.encode(e24.warnings, t.uint32(34).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = pl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.apiVersion = jn.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.billedUnits = ei.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.tokens = ti.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.warnings = m.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { apiVersion: l(e24.apiVersion) ? jn.fromJSON(e24.apiVersion) : void 0, billedUnits: l(e24.billedUnits) ? ei.fromJSON(e24.billedUnits) : void 0, tokens: l(e24.tokens) ? ti.fromJSON(e24.tokens) : void 0, warnings: l(e24.warnings) ? m.fromJSON(e24.warnings) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.apiVersion !== void 0 && (t.apiVersion = jn.toJSON(e24.apiVersion)), e24.billedUnits !== void 0 && (t.billedUnits = ei.toJSON(e24.billedUnits)), e24.tokens !== void 0 && (t.tokens = ti.toJSON(e24.tokens)), e24.warnings !== void 0 && (t.warnings = m.toJSON(e24.warnings)), t;
}, create(e24) {
  return Xn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = pl();
  return t.apiVersion = e24.apiVersion !== void 0 && e24.apiVersion !== null ? jn.fromPartial(e24.apiVersion) : void 0, t.billedUnits = e24.billedUnits !== void 0 && e24.billedUnits !== null ? ei.fromPartial(e24.billedUnits) : void 0, t.tokens = e24.tokens !== void 0 && e24.tokens !== null ? ti.fromPartial(e24.tokens) : void 0, t.warnings = e24.warnings !== void 0 && e24.warnings !== null ? m.fromPartial(e24.warnings) : void 0, t;
} };
function gl() {
  return { version: void 0, isDeprecated: void 0, isExperimental: void 0 };
}
var jn = { encode(e24, t = g.default.Writer.create()) {
  return e24.version !== void 0 && t.uint32(10).string(e24.version), e24.isDeprecated !== void 0 && t.uint32(16).bool(e24.isDeprecated), e24.isExperimental !== void 0 && t.uint32(24).bool(e24.isExperimental), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = gl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.version = r.string();
        continue;
      case 2:
        if (n !== 16) break;
        i.isDeprecated = r.bool();
        continue;
      case 3:
        if (n !== 24) break;
        i.isExperimental = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { version: l(e24.version) ? globalThis.String(e24.version) : void 0, isDeprecated: l(e24.isDeprecated) ? globalThis.Boolean(e24.isDeprecated) : void 0, isExperimental: l(e24.isExperimental) ? globalThis.Boolean(e24.isExperimental) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.version !== void 0 && (t.version = e24.version), e24.isDeprecated !== void 0 && (t.isDeprecated = e24.isDeprecated), e24.isExperimental !== void 0 && (t.isExperimental = e24.isExperimental), t;
}, create(e24) {
  return jn.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = gl();
  return t.version = e24.version ?? void 0, t.isDeprecated = e24.isDeprecated ?? void 0, t.isExperimental = e24.isExperimental ?? void 0, t;
} };
function ml() {
  return { inputTokens: void 0, outputTokens: void 0, searchUnits: void 0, classifications: void 0 };
}
var ei = { encode(e24, t = g.default.Writer.create()) {
  return e24.inputTokens !== void 0 && t.uint32(9).double(e24.inputTokens), e24.outputTokens !== void 0 && t.uint32(17).double(e24.outputTokens), e24.searchUnits !== void 0 && t.uint32(25).double(e24.searchUnits), e24.classifications !== void 0 && t.uint32(33).double(e24.classifications), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ml();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 9) break;
        i.inputTokens = r.double();
        continue;
      case 2:
        if (n !== 17) break;
        i.outputTokens = r.double();
        continue;
      case 3:
        if (n !== 25) break;
        i.searchUnits = r.double();
        continue;
      case 4:
        if (n !== 33) break;
        i.classifications = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { inputTokens: l(e24.inputTokens) ? globalThis.Number(e24.inputTokens) : void 0, outputTokens: l(e24.outputTokens) ? globalThis.Number(e24.outputTokens) : void 0, searchUnits: l(e24.searchUnits) ? globalThis.Number(e24.searchUnits) : void 0, classifications: l(e24.classifications) ? globalThis.Number(e24.classifications) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.inputTokens !== void 0 && (t.inputTokens = e24.inputTokens), e24.outputTokens !== void 0 && (t.outputTokens = e24.outputTokens), e24.searchUnits !== void 0 && (t.searchUnits = e24.searchUnits), e24.classifications !== void 0 && (t.classifications = e24.classifications), t;
}, create(e24) {
  return ei.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ml();
  return t.inputTokens = e24.inputTokens ?? void 0, t.outputTokens = e24.outputTokens ?? void 0, t.searchUnits = e24.searchUnits ?? void 0, t.classifications = e24.classifications ?? void 0, t;
} };
function hl() {
  return { inputTokens: void 0, outputTokens: void 0 };
}
var ti = { encode(e24, t = g.default.Writer.create()) {
  return e24.inputTokens !== void 0 && t.uint32(9).double(e24.inputTokens), e24.outputTokens !== void 0 && t.uint32(17).double(e24.outputTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = hl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 9) break;
        i.inputTokens = r.double();
        continue;
      case 2:
        if (n !== 17) break;
        i.outputTokens = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { inputTokens: l(e24.inputTokens) ? globalThis.Number(e24.inputTokens) : void 0, outputTokens: l(e24.outputTokens) ? globalThis.Number(e24.outputTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.inputTokens !== void 0 && (t.inputTokens = e24.inputTokens), e24.outputTokens !== void 0 && (t.outputTokens = e24.outputTokens), t;
}, create(e24) {
  return ti.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = hl();
  return t.inputTokens = e24.inputTokens ?? void 0, t.outputTokens = e24.outputTokens ?? void 0, t;
} };
function yl() {
  return {};
}
var ri = { encode(e24, t = g.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = yl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return ri.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return yl();
} };
function Tl() {
  return { usage: void 0 };
}
var ni = { encode(e24, t = g.default.Writer.create()) {
  return e24.usage !== void 0 && ii.encode(e24.usage, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Tl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.usage = ii.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { usage: l(e24.usage) ? ii.fromJSON(e24.usage) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.usage !== void 0 && (t.usage = ii.toJSON(e24.usage)), t;
}, create(e24) {
  return ni.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Tl();
  return t.usage = e24.usage !== void 0 && e24.usage !== null ? ii.fromPartial(e24.usage) : void 0, t;
} };
function vl() {
  return { promptTokens: void 0, completionTokens: void 0, totalTokens: void 0 };
}
var ii = { encode(e24, t = g.default.Writer.create()) {
  return e24.promptTokens !== void 0 && t.uint32(8).int64(e24.promptTokens), e24.completionTokens !== void 0 && t.uint32(16).int64(e24.completionTokens), e24.totalTokens !== void 0 && t.uint32(24).int64(e24.totalTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = vl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.promptTokens = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.completionTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { promptTokens: l(e24.promptTokens) ? globalThis.Number(e24.promptTokens) : void 0, completionTokens: l(e24.completionTokens) ? globalThis.Number(e24.completionTokens) : void 0, totalTokens: l(e24.totalTokens) ? globalThis.Number(e24.totalTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.promptTokens !== void 0 && (t.promptTokens = Math.round(e24.promptTokens)), e24.completionTokens !== void 0 && (t.completionTokens = Math.round(e24.completionTokens)), e24.totalTokens !== void 0 && (t.totalTokens = Math.round(e24.totalTokens)), t;
}, create(e24) {
  return ii.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = vl();
  return t.promptTokens = e24.promptTokens ?? void 0, t.completionTokens = e24.completionTokens ?? void 0, t.totalTokens = e24.totalTokens ?? void 0, t;
} };
function bl() {
  return {};
}
var ai = { encode(e24, t = g.default.Writer.create()) {
  return t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = bl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return {};
}, toJSON(e24) {
  return {};
}, create(e24) {
  return ai.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  return bl();
} };
function xl() {
  return { usage: void 0 };
}
var oi = { encode(e24, t = g.default.Writer.create()) {
  return e24.usage !== void 0 && si.encode(e24.usage, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = xl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.usage = si.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { usage: l(e24.usage) ? si.fromJSON(e24.usage) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.usage !== void 0 && (t.usage = si.toJSON(e24.usage)), t;
}, create(e24) {
  return oi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = xl();
  return t.usage = e24.usage !== void 0 && e24.usage !== null ? si.fromPartial(e24.usage) : void 0, t;
} };
function Cl() {
  return { promptTokens: void 0, completionTokens: void 0, totalTokens: void 0 };
}
var si = { encode(e24, t = g.default.Writer.create()) {
  return e24.promptTokens !== void 0 && t.uint32(8).int64(e24.promptTokens), e24.completionTokens !== void 0 && t.uint32(16).int64(e24.completionTokens), e24.totalTokens !== void 0 && t.uint32(24).int64(e24.totalTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Cl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.promptTokens = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.completionTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { promptTokens: l(e24.promptTokens) ? globalThis.Number(e24.promptTokens) : void 0, completionTokens: l(e24.completionTokens) ? globalThis.Number(e24.completionTokens) : void 0, totalTokens: l(e24.totalTokens) ? globalThis.Number(e24.totalTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.promptTokens !== void 0 && (t.promptTokens = Math.round(e24.promptTokens)), e24.completionTokens !== void 0 && (t.completionTokens = Math.round(e24.completionTokens)), e24.totalTokens !== void 0 && (t.totalTokens = Math.round(e24.totalTokens)), t;
}, create(e24) {
  return si.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Cl();
  return t.promptTokens = e24.promptTokens ?? void 0, t.completionTokens = e24.completionTokens ?? void 0, t.totalTokens = e24.totalTokens ?? void 0, t;
} };
function Pl() {
  return { metadata: void 0, usageMetadata: void 0 };
}
var ui = { encode(e24, t = g.default.Writer.create()) {
  return e24.metadata !== void 0 && ci.encode(e24.metadata, t.uint32(10).fork()).ldelim(), e24.usageMetadata !== void 0 && li.encode(e24.usageMetadata, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Pl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.metadata = ci.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.usageMetadata = li.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { metadata: l(e24.metadata) ? ci.fromJSON(e24.metadata) : void 0, usageMetadata: l(e24.usageMetadata) ? li.fromJSON(e24.usageMetadata) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.metadata !== void 0 && (t.metadata = ci.toJSON(e24.metadata)), e24.usageMetadata !== void 0 && (t.usageMetadata = li.toJSON(e24.usageMetadata)), t;
}, create(e24) {
  return ui.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Pl();
  return t.metadata = e24.metadata !== void 0 && e24.metadata !== null ? ci.fromPartial(e24.metadata) : void 0, t.usageMetadata = e24.usageMetadata !== void 0 && e24.usageMetadata !== null ? li.fromPartial(e24.usageMetadata) : void 0, t;
} };
function Rl() {
  return { totalBillableCharacters: void 0, totalTokens: void 0 };
}
var ft = { encode(e24, t = g.default.Writer.create()) {
  return e24.totalBillableCharacters !== void 0 && t.uint32(8).int64(e24.totalBillableCharacters), e24.totalTokens !== void 0 && t.uint32(16).int64(e24.totalTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Rl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.totalBillableCharacters = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.totalTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { totalBillableCharacters: l(e24.totalBillableCharacters) ? globalThis.Number(e24.totalBillableCharacters) : void 0, totalTokens: l(e24.totalTokens) ? globalThis.Number(e24.totalTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.totalBillableCharacters !== void 0 && (t.totalBillableCharacters = Math.round(e24.totalBillableCharacters)), e24.totalTokens !== void 0 && (t.totalTokens = Math.round(e24.totalTokens)), t;
}, create(e24) {
  return ft.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Rl();
  return t.totalBillableCharacters = e24.totalBillableCharacters ?? void 0, t.totalTokens = e24.totalTokens ?? void 0, t;
} };
function Al() {
  return { inputTokenCount: void 0, outputTokenCount: void 0 };
}
var di = { encode(e24, t = g.default.Writer.create()) {
  return e24.inputTokenCount !== void 0 && ft.encode(e24.inputTokenCount, t.uint32(10).fork()).ldelim(), e24.outputTokenCount !== void 0 && ft.encode(e24.outputTokenCount, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Al();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.inputTokenCount = ft.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.outputTokenCount = ft.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { inputTokenCount: l(e24.inputTokenCount) ? ft.fromJSON(e24.inputTokenCount) : void 0, outputTokenCount: l(e24.outputTokenCount) ? ft.fromJSON(e24.outputTokenCount) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.inputTokenCount !== void 0 && (t.inputTokenCount = ft.toJSON(e24.inputTokenCount)), e24.outputTokenCount !== void 0 && (t.outputTokenCount = ft.toJSON(e24.outputTokenCount)), t;
}, create(e24) {
  return di.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Al();
  return t.inputTokenCount = e24.inputTokenCount !== void 0 && e24.inputTokenCount !== null ? ft.fromPartial(e24.inputTokenCount) : void 0, t.outputTokenCount = e24.outputTokenCount !== void 0 && e24.outputTokenCount !== null ? ft.fromPartial(e24.outputTokenCount) : void 0, t;
} };
function Nl() {
  return { tokenMetadata: void 0 };
}
var ci = { encode(e24, t = g.default.Writer.create()) {
  return e24.tokenMetadata !== void 0 && di.encode(e24.tokenMetadata, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Nl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.tokenMetadata = di.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { tokenMetadata: l(e24.tokenMetadata) ? di.fromJSON(e24.tokenMetadata) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.tokenMetadata !== void 0 && (t.tokenMetadata = di.toJSON(e24.tokenMetadata)), t;
}, create(e24) {
  return ci.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Nl();
  return t.tokenMetadata = e24.tokenMetadata !== void 0 && e24.tokenMetadata !== null ? di.fromPartial(e24.tokenMetadata) : void 0, t;
} };
function Vl() {
  return { promptTokenCount: void 0, candidatesTokenCount: void 0, totalTokenCount: void 0 };
}
var li = { encode(e24, t = g.default.Writer.create()) {
  return e24.promptTokenCount !== void 0 && t.uint32(8).int64(e24.promptTokenCount), e24.candidatesTokenCount !== void 0 && t.uint32(16).int64(e24.candidatesTokenCount), e24.totalTokenCount !== void 0 && t.uint32(24).int64(e24.totalTokenCount), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Vl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.promptTokenCount = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.candidatesTokenCount = E(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTokenCount = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { promptTokenCount: l(e24.promptTokenCount) ? globalThis.Number(e24.promptTokenCount) : void 0, candidatesTokenCount: l(e24.candidatesTokenCount) ? globalThis.Number(e24.candidatesTokenCount) : void 0, totalTokenCount: l(e24.totalTokenCount) ? globalThis.Number(e24.totalTokenCount) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.promptTokenCount !== void 0 && (t.promptTokenCount = Math.round(e24.promptTokenCount)), e24.candidatesTokenCount !== void 0 && (t.candidatesTokenCount = Math.round(e24.candidatesTokenCount)), e24.totalTokenCount !== void 0 && (t.totalTokenCount = Math.round(e24.totalTokenCount)), t;
}, create(e24) {
  return li.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Vl();
  return t.promptTokenCount = e24.promptTokenCount ?? void 0, t.candidatesTokenCount = e24.candidatesTokenCount ?? void 0, t.totalTokenCount = e24.totalTokenCount ?? void 0, t;
} };
function Ol() {
  return { usage: void 0 };
}
var fi = { encode(e24, t = g.default.Writer.create()) {
  return e24.usage !== void 0 && pi.encode(e24.usage, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ol();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.usage = pi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { usage: l(e24.usage) ? pi.fromJSON(e24.usage) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.usage !== void 0 && (t.usage = pi.toJSON(e24.usage)), t;
}, create(e24) {
  return fi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ol();
  return t.usage = e24.usage !== void 0 && e24.usage !== null ? pi.fromPartial(e24.usage) : void 0, t;
} };
function Sl() {
  return { promptTokens: void 0, completionTokens: void 0, totalTokens: void 0 };
}
var pi = { encode(e24, t = g.default.Writer.create()) {
  return e24.promptTokens !== void 0 && t.uint32(8).int64(e24.promptTokens), e24.completionTokens !== void 0 && t.uint32(16).int64(e24.completionTokens), e24.totalTokens !== void 0 && t.uint32(24).int64(e24.totalTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Sl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.promptTokens = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.completionTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { promptTokens: l(e24.promptTokens) ? globalThis.Number(e24.promptTokens) : void 0, completionTokens: l(e24.completionTokens) ? globalThis.Number(e24.completionTokens) : void 0, totalTokens: l(e24.totalTokens) ? globalThis.Number(e24.totalTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.promptTokens !== void 0 && (t.promptTokens = Math.round(e24.promptTokens)), e24.completionTokens !== void 0 && (t.completionTokens = Math.round(e24.completionTokens)), e24.totalTokens !== void 0 && (t.totalTokens = Math.round(e24.totalTokens)), t;
}, create(e24) {
  return pi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Sl();
  return t.promptTokens = e24.promptTokens ?? void 0, t.completionTokens = e24.completionTokens ?? void 0, t.totalTokens = e24.totalTokens ?? void 0, t;
} };
function kl() {
  return { usage: void 0 };
}
var gi = { encode(e24, t = g.default.Writer.create()) {
  return e24.usage !== void 0 && mi.encode(e24.usage, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = kl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.usage = mi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { usage: l(e24.usage) ? mi.fromJSON(e24.usage) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.usage !== void 0 && (t.usage = mi.toJSON(e24.usage)), t;
}, create(e24) {
  return gi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = kl();
  return t.usage = e24.usage !== void 0 && e24.usage !== null ? mi.fromPartial(e24.usage) : void 0, t;
} };
function Il() {
  return { promptTokens: void 0, completionTokens: void 0, totalTokens: void 0 };
}
var mi = { encode(e24, t = g.default.Writer.create()) {
  return e24.promptTokens !== void 0 && t.uint32(8).int64(e24.promptTokens), e24.completionTokens !== void 0 && t.uint32(16).int64(e24.completionTokens), e24.totalTokens !== void 0 && t.uint32(24).int64(e24.totalTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Il();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.promptTokens = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.completionTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { promptTokens: l(e24.promptTokens) ? globalThis.Number(e24.promptTokens) : void 0, completionTokens: l(e24.completionTokens) ? globalThis.Number(e24.completionTokens) : void 0, totalTokens: l(e24.totalTokens) ? globalThis.Number(e24.totalTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.promptTokens !== void 0 && (t.promptTokens = Math.round(e24.promptTokens)), e24.completionTokens !== void 0 && (t.completionTokens = Math.round(e24.completionTokens)), e24.totalTokens !== void 0 && (t.totalTokens = Math.round(e24.totalTokens)), t;
}, create(e24) {
  return mi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Il();
  return t.promptTokens = e24.promptTokens ?? void 0, t.completionTokens = e24.completionTokens ?? void 0, t.totalTokens = e24.totalTokens ?? void 0, t;
} };
function _l() {
  return { usage: void 0 };
}
var hi = { encode(e24, t = g.default.Writer.create()) {
  return e24.usage !== void 0 && yi.encode(e24.usage, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = _l();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.usage = yi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { usage: l(e24.usage) ? yi.fromJSON(e24.usage) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.usage !== void 0 && (t.usage = yi.toJSON(e24.usage)), t;
}, create(e24) {
  return hi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = _l();
  return t.usage = e24.usage !== void 0 && e24.usage !== null ? yi.fromPartial(e24.usage) : void 0, t;
} };
function Bl() {
  return { promptTokens: void 0, completionTokens: void 0, totalTokens: void 0 };
}
var yi = { encode(e24, t = g.default.Writer.create()) {
  return e24.promptTokens !== void 0 && t.uint32(8).int64(e24.promptTokens), e24.completionTokens !== void 0 && t.uint32(16).int64(e24.completionTokens), e24.totalTokens !== void 0 && t.uint32(24).int64(e24.totalTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Bl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.promptTokens = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.completionTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { promptTokens: l(e24.promptTokens) ? globalThis.Number(e24.promptTokens) : void 0, completionTokens: l(e24.completionTokens) ? globalThis.Number(e24.completionTokens) : void 0, totalTokens: l(e24.totalTokens) ? globalThis.Number(e24.totalTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.promptTokens !== void 0 && (t.promptTokens = Math.round(e24.promptTokens)), e24.completionTokens !== void 0 && (t.completionTokens = Math.round(e24.completionTokens)), e24.totalTokens !== void 0 && (t.totalTokens = Math.round(e24.totalTokens)), t;
}, create(e24) {
  return yi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Bl();
  return t.promptTokens = e24.promptTokens ?? void 0, t.completionTokens = e24.completionTokens ?? void 0, t.totalTokens = e24.totalTokens ?? void 0, t;
} };
function Gl() {
  return { usage: void 0 };
}
var Ti = { encode(e24, t = g.default.Writer.create()) {
  return e24.usage !== void 0 && vi.encode(e24.usage, t.uint32(10).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Gl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.usage = vi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { usage: l(e24.usage) ? vi.fromJSON(e24.usage) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.usage !== void 0 && (t.usage = vi.toJSON(e24.usage)), t;
}, create(e24) {
  return Ti.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Gl();
  return t.usage = e24.usage !== void 0 && e24.usage !== null ? vi.fromPartial(e24.usage) : void 0, t;
} };
function wl() {
  return { promptTokens: void 0, completionTokens: void 0, totalTokens: void 0 };
}
var vi = { encode(e24, t = g.default.Writer.create()) {
  return e24.promptTokens !== void 0 && t.uint32(8).int64(e24.promptTokens), e24.completionTokens !== void 0 && t.uint32(16).int64(e24.completionTokens), e24.totalTokens !== void 0 && t.uint32(24).int64(e24.totalTokens), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = wl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.promptTokens = E(r.int64());
        continue;
      case 2:
        if (n !== 16) break;
        i.completionTokens = E(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTokens = E(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { promptTokens: l(e24.promptTokens) ? globalThis.Number(e24.promptTokens) : void 0, completionTokens: l(e24.completionTokens) ? globalThis.Number(e24.completionTokens) : void 0, totalTokens: l(e24.totalTokens) ? globalThis.Number(e24.totalTokens) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.promptTokens !== void 0 && (t.promptTokens = Math.round(e24.promptTokens)), e24.completionTokens !== void 0 && (t.completionTokens = Math.round(e24.completionTokens)), e24.totalTokens !== void 0 && (t.totalTokens = Math.round(e24.totalTokens)), t;
}, create(e24) {
  return vi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = wl();
  return t.promptTokens = e24.promptTokens ?? void 0, t.completionTokens = e24.completionTokens ?? void 0, t.totalTokens = e24.totalTokens ?? void 0, t;
} };
function Ml() {
  return { anthropic: void 0, anyscale: void 0, aws: void 0, cohere: void 0, dummy: void 0, mistral: void 0, ollama: void 0, openai: void 0, google: void 0, databricks: void 0, friendliai: void 0, nvidia: void 0, xai: void 0 };
}
var bi = { encode(e24, t = g.default.Writer.create()) {
  return e24.anthropic !== void 0 && Qn.encode(e24.anthropic, t.uint32(10).fork()).ldelim(), e24.anyscale !== void 0 && Yn.encode(e24.anyscale, t.uint32(18).fork()).ldelim(), e24.aws !== void 0 && Zn.encode(e24.aws, t.uint32(26).fork()).ldelim(), e24.cohere !== void 0 && Xn.encode(e24.cohere, t.uint32(34).fork()).ldelim(), e24.dummy !== void 0 && ri.encode(e24.dummy, t.uint32(42).fork()).ldelim(), e24.mistral !== void 0 && ni.encode(e24.mistral, t.uint32(50).fork()).ldelim(), e24.ollama !== void 0 && ai.encode(e24.ollama, t.uint32(58).fork()).ldelim(), e24.openai !== void 0 && oi.encode(e24.openai, t.uint32(66).fork()).ldelim(), e24.google !== void 0 && ui.encode(e24.google, t.uint32(74).fork()).ldelim(), e24.databricks !== void 0 && fi.encode(e24.databricks, t.uint32(82).fork()).ldelim(), e24.friendliai !== void 0 && gi.encode(e24.friendliai, t.uint32(90).fork()).ldelim(), e24.nvidia !== void 0 && hi.encode(e24.nvidia, t.uint32(98).fork()).ldelim(), e24.xai !== void 0 && Ti.encode(e24.xai, t.uint32(106).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ml();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.anthropic = Qn.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.anyscale = Yn.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.aws = Zn.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.cohere = Xn.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.dummy = ri.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.mistral = ni.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.ollama = ai.decode(r, r.uint32());
        continue;
      case 8:
        if (n !== 66) break;
        i.openai = oi.decode(r, r.uint32());
        continue;
      case 9:
        if (n !== 74) break;
        i.google = ui.decode(r, r.uint32());
        continue;
      case 10:
        if (n !== 82) break;
        i.databricks = fi.decode(r, r.uint32());
        continue;
      case 11:
        if (n !== 90) break;
        i.friendliai = gi.decode(r, r.uint32());
        continue;
      case 12:
        if (n !== 98) break;
        i.nvidia = hi.decode(r, r.uint32());
        continue;
      case 13:
        if (n !== 106) break;
        i.xai = Ti.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { anthropic: l(e24.anthropic) ? Qn.fromJSON(e24.anthropic) : void 0, anyscale: l(e24.anyscale) ? Yn.fromJSON(e24.anyscale) : void 0, aws: l(e24.aws) ? Zn.fromJSON(e24.aws) : void 0, cohere: l(e24.cohere) ? Xn.fromJSON(e24.cohere) : void 0, dummy: l(e24.dummy) ? ri.fromJSON(e24.dummy) : void 0, mistral: l(e24.mistral) ? ni.fromJSON(e24.mistral) : void 0, ollama: l(e24.ollama) ? ai.fromJSON(e24.ollama) : void 0, openai: l(e24.openai) ? oi.fromJSON(e24.openai) : void 0, google: l(e24.google) ? ui.fromJSON(e24.google) : void 0, databricks: l(e24.databricks) ? fi.fromJSON(e24.databricks) : void 0, friendliai: l(e24.friendliai) ? gi.fromJSON(e24.friendliai) : void 0, nvidia: l(e24.nvidia) ? hi.fromJSON(e24.nvidia) : void 0, xai: l(e24.xai) ? Ti.fromJSON(e24.xai) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.anthropic !== void 0 && (t.anthropic = Qn.toJSON(e24.anthropic)), e24.anyscale !== void 0 && (t.anyscale = Yn.toJSON(e24.anyscale)), e24.aws !== void 0 && (t.aws = Zn.toJSON(e24.aws)), e24.cohere !== void 0 && (t.cohere = Xn.toJSON(e24.cohere)), e24.dummy !== void 0 && (t.dummy = ri.toJSON(e24.dummy)), e24.mistral !== void 0 && (t.mistral = ni.toJSON(e24.mistral)), e24.ollama !== void 0 && (t.ollama = ai.toJSON(e24.ollama)), e24.openai !== void 0 && (t.openai = oi.toJSON(e24.openai)), e24.google !== void 0 && (t.google = ui.toJSON(e24.google)), e24.databricks !== void 0 && (t.databricks = fi.toJSON(e24.databricks)), e24.friendliai !== void 0 && (t.friendliai = gi.toJSON(e24.friendliai)), e24.nvidia !== void 0 && (t.nvidia = hi.toJSON(e24.nvidia)), e24.xai !== void 0 && (t.xai = Ti.toJSON(e24.xai)), t;
}, create(e24) {
  return bi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ml();
  return t.anthropic = e24.anthropic !== void 0 && e24.anthropic !== null ? Qn.fromPartial(e24.anthropic) : void 0, t.anyscale = e24.anyscale !== void 0 && e24.anyscale !== null ? Yn.fromPartial(e24.anyscale) : void 0, t.aws = e24.aws !== void 0 && e24.aws !== null ? Zn.fromPartial(e24.aws) : void 0, t.cohere = e24.cohere !== void 0 && e24.cohere !== null ? Xn.fromPartial(e24.cohere) : void 0, t.dummy = e24.dummy !== void 0 && e24.dummy !== null ? ri.fromPartial(e24.dummy) : void 0, t.mistral = e24.mistral !== void 0 && e24.mistral !== null ? ni.fromPartial(e24.mistral) : void 0, t.ollama = e24.ollama !== void 0 && e24.ollama !== null ? ai.fromPartial(e24.ollama) : void 0, t.openai = e24.openai !== void 0 && e24.openai !== null ? oi.fromPartial(e24.openai) : void 0, t.google = e24.google !== void 0 && e24.google !== null ? ui.fromPartial(e24.google) : void 0, t.databricks = e24.databricks !== void 0 && e24.databricks !== null ? fi.fromPartial(e24.databricks) : void 0, t.friendliai = e24.friendliai !== void 0 && e24.friendliai !== null ? gi.fromPartial(e24.friendliai) : void 0, t.nvidia = e24.nvidia !== void 0 && e24.nvidia !== null ? hi.fromPartial(e24.nvidia) : void 0, t.xai = e24.xai !== void 0 && e24.xai !== null ? Ti.fromPartial(e24.xai) : void 0, t;
} };
function El() {
  return { result: "", debug: void 0, metadata: void 0 };
}
var ot = { encode(e24, t = g.default.Writer.create()) {
  return e24.result !== "" && t.uint32(10).string(e24.result), e24.debug !== void 0 && xi.encode(e24.debug, t.uint32(18).fork()).ldelim(), e24.metadata !== void 0 && bi.encode(e24.metadata, t.uint32(26).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = El();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.result = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.debug = xi.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.metadata = bi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { result: l(e24.result) ? globalThis.String(e24.result) : "", debug: l(e24.debug) ? xi.fromJSON(e24.debug) : void 0, metadata: l(e24.metadata) ? bi.fromJSON(e24.metadata) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.result !== "" && (t.result = e24.result), e24.debug !== void 0 && (t.debug = xi.toJSON(e24.debug)), e24.metadata !== void 0 && (t.metadata = bi.toJSON(e24.metadata)), t;
}, create(e24) {
  return ot.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = El();
  return t.result = e24.result ?? "", t.debug = e24.debug !== void 0 && e24.debug !== null ? xi.fromPartial(e24.debug) : void 0, t.metadata = e24.metadata !== void 0 && e24.metadata !== null ? bi.fromPartial(e24.metadata) : void 0, t;
} };
function Ul() {
  return { values: [] };
}
var pe = { encode(e24, t = g.default.Writer.create()) {
  for (let r of e24.values) ot.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ul();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(ot.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => ot.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values.map((r) => ot.toJSON(r))), t;
}, create(e24) {
  return pe.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ul();
  return t.values = e24.values?.map((r) => ot.fromPartial(r)) || [], t;
} };
function Dl() {
  return { fullPrompt: void 0 };
}
var xi = { encode(e24, t = g.default.Writer.create()) {
  return e24.fullPrompt !== void 0 && t.uint32(10).string(e24.fullPrompt), t;
}, decode(e24, t) {
  let r = e24 instanceof g.default.Reader ? e24 : g.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Dl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.fullPrompt = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { fullPrompt: l(e24.fullPrompt) ? globalThis.String(e24.fullPrompt) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.fullPrompt !== void 0 && (t.fullPrompt = e24.fullPrompt), t;
}, create(e24) {
  return xi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Dl();
  return t.fullPrompt = e24.fullPrompt ?? void 0, t;
} };
function E(e24) {
  if (e24.gt(globalThis.Number.MAX_SAFE_INTEGER)) throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  return e24.toNumber();
}
g.default.util.Long !== long_default && (g.default.util.Long = long_default, g.default.configure());
function l(e24) {
  return e24 != null;
}
d();
var N = ze(Ke());
d();
var U = ze(Ke());
function Wl() {
  return { fields: {} };
}
var ge = { encode(e24, t = U.default.Writer.create()) {
  return Object.entries(e24.fields).forEach(([r, a]) => {
    ms.encode({ key: r, value: a }, t.uint32(10).fork()).ldelim();
  }), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Wl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        let o = ms.decode(r, r.uint32());
        o.value !== void 0 && (i.fields[o.key] = o.value);
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { fields: Gm(e24.fields) ? Object.entries(e24.fields).reduce((t, [r, a]) => (t[r] = Wt.fromJSON(a), t), {}) : {} };
}, toJSON(e24) {
  let t = {};
  if (e24.fields) {
    let r = Object.entries(e24.fields);
    r.length > 0 && (t.fields = {}, r.forEach(([a, i]) => {
      t.fields[a] = Wt.toJSON(i);
    }));
  }
  return t;
}, create(e24) {
  return ge.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Wl();
  return t.fields = Object.entries(e24.fields ?? {}).reduce((r, [a, i]) => (i !== void 0 && (r[a] = Wt.fromPartial(i)), r), {}), t;
} };
function ql() {
  return { key: "", value: void 0 };
}
var ms = { encode(e24, t = U.default.Writer.create()) {
  return e24.key !== "" && t.uint32(10).string(e24.key), e24.value !== void 0 && Wt.encode(e24.value, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ql();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.key = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.value = Wt.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { key: $(e24.key) ? globalThis.String(e24.key) : "", value: $(e24.value) ? Wt.fromJSON(e24.value) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.key !== "" && (t.key = e24.key), e24.value !== void 0 && (t.value = Wt.toJSON(e24.value)), t;
}, create(e24) {
  return ms.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ql();
  return t.key = e24.key ?? "", t.value = e24.value !== void 0 && e24.value !== null ? Wt.fromPartial(e24.value) : void 0, t;
} };
function Ll() {
  return { numberValue: void 0, boolValue: void 0, objectValue: void 0, listValue: void 0, dateValue: void 0, uuidValue: void 0, intValue: void 0, geoValue: void 0, blobValue: void 0, phoneValue: void 0, nullValue: void 0, textValue: void 0 };
}
var Wt = { encode(e24, t = U.default.Writer.create()) {
  return e24.numberValue !== void 0 && t.uint32(9).double(e24.numberValue), e24.boolValue !== void 0 && t.uint32(24).bool(e24.boolValue), e24.objectValue !== void 0 && ge.encode(e24.objectValue, t.uint32(34).fork()).ldelim(), e24.listValue !== void 0 && Ci.encode(e24.listValue, t.uint32(42).fork()).ldelim(), e24.dateValue !== void 0 && t.uint32(50).string(e24.dateValue), e24.uuidValue !== void 0 && t.uint32(58).string(e24.uuidValue), e24.intValue !== void 0 && t.uint32(64).int64(e24.intValue), e24.geoValue !== void 0 && ki.encode(e24.geoValue, t.uint32(74).fork()).ldelim(), e24.blobValue !== void 0 && t.uint32(82).string(e24.blobValue), e24.phoneValue !== void 0 && Ii.encode(e24.phoneValue, t.uint32(90).fork()).ldelim(), e24.nullValue !== void 0 && t.uint32(96).int32(e24.nullValue), e24.textValue !== void 0 && t.uint32(106).string(e24.textValue), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ll();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 9) break;
        i.numberValue = r.double();
        continue;
      case 3:
        if (n !== 24) break;
        i.boolValue = r.bool();
        continue;
      case 4:
        if (n !== 34) break;
        i.objectValue = ge.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.listValue = Ci.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.dateValue = r.string();
        continue;
      case 7:
        if (n !== 58) break;
        i.uuidValue = r.string();
        continue;
      case 8:
        if (n !== 64) break;
        i.intValue = hs(r.int64());
        continue;
      case 9:
        if (n !== 74) break;
        i.geoValue = ki.decode(r, r.uint32());
        continue;
      case 10:
        if (n !== 82) break;
        i.blobValue = r.string();
        continue;
      case 11:
        if (n !== 90) break;
        i.phoneValue = Ii.decode(r, r.uint32());
        continue;
      case 12:
        if (n !== 96) break;
        i.nullValue = r.int32();
        continue;
      case 13:
        if (n !== 106) break;
        i.textValue = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { numberValue: $(e24.numberValue) ? globalThis.Number(e24.numberValue) : void 0, boolValue: $(e24.boolValue) ? globalThis.Boolean(e24.boolValue) : void 0, objectValue: $(e24.objectValue) ? ge.fromJSON(e24.objectValue) : void 0, listValue: $(e24.listValue) ? Ci.fromJSON(e24.listValue) : void 0, dateValue: $(e24.dateValue) ? globalThis.String(e24.dateValue) : void 0, uuidValue: $(e24.uuidValue) ? globalThis.String(e24.uuidValue) : void 0, intValue: $(e24.intValue) ? globalThis.Number(e24.intValue) : void 0, geoValue: $(e24.geoValue) ? ki.fromJSON(e24.geoValue) : void 0, blobValue: $(e24.blobValue) ? globalThis.String(e24.blobValue) : void 0, phoneValue: $(e24.phoneValue) ? Ii.fromJSON(e24.phoneValue) : void 0, nullValue: $(e24.nullValue) ? Zo(e24.nullValue) : void 0, textValue: $(e24.textValue) ? globalThis.String(e24.textValue) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.numberValue !== void 0 && (t.numberValue = e24.numberValue), e24.boolValue !== void 0 && (t.boolValue = e24.boolValue), e24.objectValue !== void 0 && (t.objectValue = ge.toJSON(e24.objectValue)), e24.listValue !== void 0 && (t.listValue = Ci.toJSON(e24.listValue)), e24.dateValue !== void 0 && (t.dateValue = e24.dateValue), e24.uuidValue !== void 0 && (t.uuidValue = e24.uuidValue), e24.intValue !== void 0 && (t.intValue = Math.round(e24.intValue)), e24.geoValue !== void 0 && (t.geoValue = ki.toJSON(e24.geoValue)), e24.blobValue !== void 0 && (t.blobValue = e24.blobValue), e24.phoneValue !== void 0 && (t.phoneValue = Ii.toJSON(e24.phoneValue)), e24.nullValue !== void 0 && (t.nullValue = Xo(e24.nullValue)), e24.textValue !== void 0 && (t.textValue = e24.textValue), t;
}, create(e24) {
  return Wt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ll();
  return t.numberValue = e24.numberValue ?? void 0, t.boolValue = e24.boolValue ?? void 0, t.objectValue = e24.objectValue !== void 0 && e24.objectValue !== null ? ge.fromPartial(e24.objectValue) : void 0, t.listValue = e24.listValue !== void 0 && e24.listValue !== null ? Ci.fromPartial(e24.listValue) : void 0, t.dateValue = e24.dateValue ?? void 0, t.uuidValue = e24.uuidValue ?? void 0, t.intValue = e24.intValue ?? void 0, t.geoValue = e24.geoValue !== void 0 && e24.geoValue !== null ? ki.fromPartial(e24.geoValue) : void 0, t.blobValue = e24.blobValue ?? void 0, t.phoneValue = e24.phoneValue !== void 0 && e24.phoneValue !== null ? Ii.fromPartial(e24.phoneValue) : void 0, t.nullValue = e24.nullValue ?? void 0, t.textValue = e24.textValue ?? void 0, t;
} };
function Jl() {
  return { numberValues: void 0, boolValues: void 0, objectValues: void 0, dateValues: void 0, uuidValues: void 0, intValues: void 0, textValues: void 0 };
}
var Ci = { encode(e24, t = U.default.Writer.create()) {
  return e24.numberValues !== void 0 && Pi.encode(e24.numberValues, t.uint32(18).fork()).ldelim(), e24.boolValues !== void 0 && Ai.encode(e24.boolValues, t.uint32(26).fork()).ldelim(), e24.objectValues !== void 0 && Ni.encode(e24.objectValues, t.uint32(34).fork()).ldelim(), e24.dateValues !== void 0 && Vi.encode(e24.dateValues, t.uint32(42).fork()).ldelim(), e24.uuidValues !== void 0 && Oi.encode(e24.uuidValues, t.uint32(50).fork()).ldelim(), e24.intValues !== void 0 && Si.encode(e24.intValues, t.uint32(58).fork()).ldelim(), e24.textValues !== void 0 && Ri.encode(e24.textValues, t.uint32(66).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Jl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 2:
        if (n !== 18) break;
        i.numberValues = Pi.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.boolValues = Ai.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.objectValues = Ni.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.dateValues = Vi.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.uuidValues = Oi.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.intValues = Si.decode(r, r.uint32());
        continue;
      case 8:
        if (n !== 66) break;
        i.textValues = Ri.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { numberValues: $(e24.numberValues) ? Pi.fromJSON(e24.numberValues) : void 0, boolValues: $(e24.boolValues) ? Ai.fromJSON(e24.boolValues) : void 0, objectValues: $(e24.objectValues) ? Ni.fromJSON(e24.objectValues) : void 0, dateValues: $(e24.dateValues) ? Vi.fromJSON(e24.dateValues) : void 0, uuidValues: $(e24.uuidValues) ? Oi.fromJSON(e24.uuidValues) : void 0, intValues: $(e24.intValues) ? Si.fromJSON(e24.intValues) : void 0, textValues: $(e24.textValues) ? Ri.fromJSON(e24.textValues) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.numberValues !== void 0 && (t.numberValues = Pi.toJSON(e24.numberValues)), e24.boolValues !== void 0 && (t.boolValues = Ai.toJSON(e24.boolValues)), e24.objectValues !== void 0 && (t.objectValues = Ni.toJSON(e24.objectValues)), e24.dateValues !== void 0 && (t.dateValues = Vi.toJSON(e24.dateValues)), e24.uuidValues !== void 0 && (t.uuidValues = Oi.toJSON(e24.uuidValues)), e24.intValues !== void 0 && (t.intValues = Si.toJSON(e24.intValues)), e24.textValues !== void 0 && (t.textValues = Ri.toJSON(e24.textValues)), t;
}, create(e24) {
  return Ci.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Jl();
  return t.numberValues = e24.numberValues !== void 0 && e24.numberValues !== null ? Pi.fromPartial(e24.numberValues) : void 0, t.boolValues = e24.boolValues !== void 0 && e24.boolValues !== null ? Ai.fromPartial(e24.boolValues) : void 0, t.objectValues = e24.objectValues !== void 0 && e24.objectValues !== null ? Ni.fromPartial(e24.objectValues) : void 0, t.dateValues = e24.dateValues !== void 0 && e24.dateValues !== null ? Vi.fromPartial(e24.dateValues) : void 0, t.uuidValues = e24.uuidValues !== void 0 && e24.uuidValues !== null ? Oi.fromPartial(e24.uuidValues) : void 0, t.intValues = e24.intValues !== void 0 && e24.intValues !== null ? Si.fromPartial(e24.intValues) : void 0, t.textValues = e24.textValues !== void 0 && e24.textValues !== null ? Ri.fromPartial(e24.textValues) : void 0, t;
} };
function zl() {
  return { values: new Uint8Array(0) };
}
var Pi = { encode(e24, t = U.default.Writer.create()) {
  return e24.values.length !== 0 && t.uint32(10).bytes(e24.values), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = zl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values = r.bytes();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: $(e24.values) ? ef(e24.values) : new Uint8Array(0) };
}, toJSON(e24) {
  let t = {};
  return e24.values.length !== 0 && (t.values = tf(e24.values)), t;
}, create(e24) {
  return Pi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = zl();
  return t.values = e24.values ?? new Uint8Array(0), t;
} };
function $l() {
  return { values: [] };
}
var Ri = { encode(e24, t = U.default.Writer.create()) {
  for (let r of e24.values) t.uint32(10).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = $l();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return Ri.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = $l();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Hl() {
  return { values: [] };
}
var Ai = { encode(e24, t = U.default.Writer.create()) {
  t.uint32(10).fork();
  for (let r of e24.values) t.bool(r);
  return t.ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Hl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n === 8) {
          i.values.push(r.bool());
          continue;
        }
        if (n === 10) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.values.push(r.bool());
          continue;
        }
        break;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.Boolean(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return Ai.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Hl();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Ql() {
  return { values: [] };
}
var Ni = { encode(e24, t = U.default.Writer.create()) {
  for (let r of e24.values) ge.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ql();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(ge.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => ge.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values.map((r) => ge.toJSON(r))), t;
}, create(e24) {
  return Ni.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ql();
  return t.values = e24.values?.map((r) => ge.fromPartial(r)) || [], t;
} };
function Kl() {
  return { values: [] };
}
var Vi = { encode(e24, t = U.default.Writer.create()) {
  for (let r of e24.values) t.uint32(10).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Kl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return Vi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Kl();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Yl() {
  return { values: [] };
}
var Oi = { encode(e24, t = U.default.Writer.create()) {
  for (let r of e24.values) t.uint32(10).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Yl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: globalThis.Array.isArray(e24?.values) ? e24.values.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.values?.length && (t.values = e24.values), t;
}, create(e24) {
  return Oi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Yl();
  return t.values = e24.values?.map((r) => r) || [], t;
} };
function Zl() {
  return { values: new Uint8Array(0) };
}
var Si = { encode(e24, t = U.default.Writer.create()) {
  return e24.values.length !== 0 && t.uint32(10).bytes(e24.values), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Zl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.values = r.bytes();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { values: $(e24.values) ? ef(e24.values) : new Uint8Array(0) };
}, toJSON(e24) {
  let t = {};
  return e24.values.length !== 0 && (t.values = tf(e24.values)), t;
}, create(e24) {
  return Si.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Zl();
  return t.values = e24.values ?? new Uint8Array(0), t;
} };
function Xl() {
  return { longitude: 0, latitude: 0 };
}
var ki = { encode(e24, t = U.default.Writer.create()) {
  return e24.longitude !== 0 && t.uint32(13).float(e24.longitude), e24.latitude !== 0 && t.uint32(21).float(e24.latitude), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Xl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.longitude = r.float();
        continue;
      case 2:
        if (n !== 21) break;
        i.latitude = r.float();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { longitude: $(e24.longitude) ? globalThis.Number(e24.longitude) : 0, latitude: $(e24.latitude) ? globalThis.Number(e24.latitude) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.longitude !== 0 && (t.longitude = e24.longitude), e24.latitude !== 0 && (t.latitude = e24.latitude), t;
}, create(e24) {
  return ki.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Xl();
  return t.longitude = e24.longitude ?? 0, t.latitude = e24.latitude ?? 0, t;
} };
function jl() {
  return { countryCode: 0, defaultCountry: "", input: "", internationalFormatted: "", national: 0, nationalFormatted: "", valid: false };
}
var Ii = { encode(e24, t = U.default.Writer.create()) {
  return e24.countryCode !== 0 && t.uint32(8).uint64(e24.countryCode), e24.defaultCountry !== "" && t.uint32(18).string(e24.defaultCountry), e24.input !== "" && t.uint32(26).string(e24.input), e24.internationalFormatted !== "" && t.uint32(34).string(e24.internationalFormatted), e24.national !== 0 && t.uint32(40).uint64(e24.national), e24.nationalFormatted !== "" && t.uint32(50).string(e24.nationalFormatted), e24.valid !== false && t.uint32(56).bool(e24.valid), t;
}, decode(e24, t) {
  let r = e24 instanceof U.default.Reader ? e24 : U.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = jl();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.countryCode = hs(r.uint64());
        continue;
      case 2:
        if (n !== 18) break;
        i.defaultCountry = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.input = r.string();
        continue;
      case 4:
        if (n !== 34) break;
        i.internationalFormatted = r.string();
        continue;
      case 5:
        if (n !== 40) break;
        i.national = hs(r.uint64());
        continue;
      case 6:
        if (n !== 50) break;
        i.nationalFormatted = r.string();
        continue;
      case 7:
        if (n !== 56) break;
        i.valid = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { countryCode: $(e24.countryCode) ? globalThis.Number(e24.countryCode) : 0, defaultCountry: $(e24.defaultCountry) ? globalThis.String(e24.defaultCountry) : "", input: $(e24.input) ? globalThis.String(e24.input) : "", internationalFormatted: $(e24.internationalFormatted) ? globalThis.String(e24.internationalFormatted) : "", national: $(e24.national) ? globalThis.Number(e24.national) : 0, nationalFormatted: $(e24.nationalFormatted) ? globalThis.String(e24.nationalFormatted) : "", valid: $(e24.valid) ? globalThis.Boolean(e24.valid) : false };
}, toJSON(e24) {
  let t = {};
  return e24.countryCode !== 0 && (t.countryCode = Math.round(e24.countryCode)), e24.defaultCountry !== "" && (t.defaultCountry = e24.defaultCountry), e24.input !== "" && (t.input = e24.input), e24.internationalFormatted !== "" && (t.internationalFormatted = e24.internationalFormatted), e24.national !== 0 && (t.national = Math.round(e24.national)), e24.nationalFormatted !== "" && (t.nationalFormatted = e24.nationalFormatted), e24.valid !== false && (t.valid = e24.valid), t;
}, create(e24) {
  return Ii.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = jl();
  return t.countryCode = e24.countryCode ?? 0, t.defaultCountry = e24.defaultCountry ?? "", t.input = e24.input ?? "", t.internationalFormatted = e24.internationalFormatted ?? "", t.national = e24.national ?? 0, t.nationalFormatted = e24.nationalFormatted ?? "", t.valid = e24.valid ?? false, t;
} };
function ef(e24) {
  if (globalThis.Buffer) return Uint8Array.from(globalThis.Buffer.from(e24, "base64"));
  {
    let t = globalThis.atob(e24), r = new Uint8Array(t.length);
    for (let a = 0; a < t.length; ++a) r[a] = t.charCodeAt(a);
    return r;
  }
}
function tf(e24) {
  if (globalThis.Buffer) return globalThis.Buffer.from(e24).toString("base64");
  {
    let t = [];
    return e24.forEach((r) => {
      t.push(globalThis.String.fromCharCode(r));
    }), globalThis.btoa(t.join(""));
  }
}
function hs(e24) {
  if (e24.gt(globalThis.Number.MAX_SAFE_INTEGER)) throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  return e24.toNumber();
}
U.default.util.Long !== long_default && (U.default.util.Long = long_default, U.default.configure());
function Gm(e24) {
  return typeof e24 == "object" && e24 !== null;
}
function $(e24) {
  return e24 != null;
}
function nf() {
  return { collection: "", tenant: "", consistencyLevel: void 0, properties: void 0, metadata: void 0, groupBy: void 0, limit: 0, offset: 0, autocut: 0, after: "", sortBy: [], filters: void 0, hybridSearch: void 0, bm25Search: void 0, nearVector: void 0, nearObject: void 0, nearText: void 0, nearImage: void 0, nearAudio: void 0, nearVideo: void 0, nearDepth: void 0, nearThermal: void 0, nearImu: void 0, generative: void 0, rerank: void 0, uses123Api: false, uses125Api: false, uses127Api: false };
}
var he = { encode(e24, t = N.default.Writer.create()) {
  e24.collection !== "" && t.uint32(10).string(e24.collection), e24.tenant !== "" && t.uint32(82).string(e24.tenant), e24.consistencyLevel !== void 0 && t.uint32(88).int32(e24.consistencyLevel), e24.properties !== void 0 && gt.encode(e24.properties, t.uint32(162).fork()).ldelim(), e24.metadata !== void 0 && we.encode(e24.metadata, t.uint32(170).fork()).ldelim(), e24.groupBy !== void 0 && sr.encode(e24.groupBy, t.uint32(178).fork()).ldelim(), e24.limit !== 0 && t.uint32(240).uint32(e24.limit), e24.offset !== 0 && t.uint32(248).uint32(e24.offset), e24.autocut !== 0 && t.uint32(256).uint32(e24.autocut), e24.after !== "" && t.uint32(266).string(e24.after);
  for (let r of e24.sortBy) _i.encode(r, t.uint32(274).fork()).ldelim();
  return e24.filters !== void 0 && H.encode(e24.filters, t.uint32(322).fork()).ldelim(), e24.hybridSearch !== void 0 && ve.encode(e24.hybridSearch, t.uint32(330).fork()).ldelim(), e24.bm25Search !== void 0 && Ft.encode(e24.bm25Search, t.uint32(338).fork()).ldelim(), e24.nearVector !== void 0 && te.encode(e24.nearVector, t.uint32(346).fork()).ldelim(), e24.nearObject !== void 0 && be.encode(e24.nearObject, t.uint32(354).fork()).ldelim(), e24.nearText !== void 0 && ae.encode(e24.nearText, t.uint32(362).fork()).ldelim(), e24.nearImage !== void 0 && xe.encode(e24.nearImage, t.uint32(370).fork()).ldelim(), e24.nearAudio !== void 0 && Ce.encode(e24.nearAudio, t.uint32(378).fork()).ldelim(), e24.nearVideo !== void 0 && Pe.encode(e24.nearVideo, t.uint32(386).fork()).ldelim(), e24.nearDepth !== void 0 && Re.encode(e24.nearDepth, t.uint32(394).fork()).ldelim(), e24.nearThermal !== void 0 && Ae.encode(e24.nearThermal, t.uint32(402).fork()).ldelim(), e24.nearImu !== void 0 && Ne.encode(e24.nearImu, t.uint32(410).fork()).ldelim(), e24.generative !== void 0 && Vt.encode(e24.generative, t.uint32(482).fork()).ldelim(), e24.rerank !== void 0 && ur.encode(e24.rerank, t.uint32(490).fork()).ldelim(), e24.uses123Api !== false && t.uint32(800).bool(e24.uses123Api), e24.uses125Api !== false && t.uint32(808).bool(e24.uses125Api), e24.uses127Api !== false && t.uint32(816).bool(e24.uses127Api), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = nf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.collection = r.string();
        continue;
      case 10:
        if (n !== 82) break;
        i.tenant = r.string();
        continue;
      case 11:
        if (n !== 88) break;
        i.consistencyLevel = r.int32();
        continue;
      case 20:
        if (n !== 162) break;
        i.properties = gt.decode(r, r.uint32());
        continue;
      case 21:
        if (n !== 170) break;
        i.metadata = we.decode(r, r.uint32());
        continue;
      case 22:
        if (n !== 178) break;
        i.groupBy = sr.decode(r, r.uint32());
        continue;
      case 30:
        if (n !== 240) break;
        i.limit = r.uint32();
        continue;
      case 31:
        if (n !== 248) break;
        i.offset = r.uint32();
        continue;
      case 32:
        if (n !== 256) break;
        i.autocut = r.uint32();
        continue;
      case 33:
        if (n !== 266) break;
        i.after = r.string();
        continue;
      case 34:
        if (n !== 274) break;
        i.sortBy.push(_i.decode(r, r.uint32()));
        continue;
      case 40:
        if (n !== 322) break;
        i.filters = H.decode(r, r.uint32());
        continue;
      case 41:
        if (n !== 330) break;
        i.hybridSearch = ve.decode(r, r.uint32());
        continue;
      case 42:
        if (n !== 338) break;
        i.bm25Search = Ft.decode(r, r.uint32());
        continue;
      case 43:
        if (n !== 346) break;
        i.nearVector = te.decode(r, r.uint32());
        continue;
      case 44:
        if (n !== 354) break;
        i.nearObject = be.decode(r, r.uint32());
        continue;
      case 45:
        if (n !== 362) break;
        i.nearText = ae.decode(r, r.uint32());
        continue;
      case 46:
        if (n !== 370) break;
        i.nearImage = xe.decode(r, r.uint32());
        continue;
      case 47:
        if (n !== 378) break;
        i.nearAudio = Ce.decode(r, r.uint32());
        continue;
      case 48:
        if (n !== 386) break;
        i.nearVideo = Pe.decode(r, r.uint32());
        continue;
      case 49:
        if (n !== 394) break;
        i.nearDepth = Re.decode(r, r.uint32());
        continue;
      case 50:
        if (n !== 402) break;
        i.nearThermal = Ae.decode(r, r.uint32());
        continue;
      case 51:
        if (n !== 410) break;
        i.nearImu = Ne.decode(r, r.uint32());
        continue;
      case 60:
        if (n !== 482) break;
        i.generative = Vt.decode(r, r.uint32());
        continue;
      case 61:
        if (n !== 490) break;
        i.rerank = ur.decode(r, r.uint32());
        continue;
      case 100:
        if (n !== 800) break;
        i.uses123Api = r.bool();
        continue;
      case 101:
        if (n !== 808) break;
        i.uses125Api = r.bool();
        continue;
      case 102:
        if (n !== 816) break;
        i.uses127Api = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { collection: v(e24.collection) ? globalThis.String(e24.collection) : "", tenant: v(e24.tenant) ? globalThis.String(e24.tenant) : "", consistencyLevel: v(e24.consistencyLevel) ? tr(e24.consistencyLevel) : void 0, properties: v(e24.properties) ? gt.fromJSON(e24.properties) : void 0, metadata: v(e24.metadata) ? we.fromJSON(e24.metadata) : void 0, groupBy: v(e24.groupBy) ? sr.fromJSON(e24.groupBy) : void 0, limit: v(e24.limit) ? globalThis.Number(e24.limit) : 0, offset: v(e24.offset) ? globalThis.Number(e24.offset) : 0, autocut: v(e24.autocut) ? globalThis.Number(e24.autocut) : 0, after: v(e24.after) ? globalThis.String(e24.after) : "", sortBy: globalThis.Array.isArray(e24?.sortBy) ? e24.sortBy.map((t) => _i.fromJSON(t)) : [], filters: v(e24.filters) ? H.fromJSON(e24.filters) : void 0, hybridSearch: v(e24.hybridSearch) ? ve.fromJSON(e24.hybridSearch) : void 0, bm25Search: v(e24.bm25Search) ? Ft.fromJSON(e24.bm25Search) : void 0, nearVector: v(e24.nearVector) ? te.fromJSON(e24.nearVector) : void 0, nearObject: v(e24.nearObject) ? be.fromJSON(e24.nearObject) : void 0, nearText: v(e24.nearText) ? ae.fromJSON(e24.nearText) : void 0, nearImage: v(e24.nearImage) ? xe.fromJSON(e24.nearImage) : void 0, nearAudio: v(e24.nearAudio) ? Ce.fromJSON(e24.nearAudio) : void 0, nearVideo: v(e24.nearVideo) ? Pe.fromJSON(e24.nearVideo) : void 0, nearDepth: v(e24.nearDepth) ? Re.fromJSON(e24.nearDepth) : void 0, nearThermal: v(e24.nearThermal) ? Ae.fromJSON(e24.nearThermal) : void 0, nearImu: v(e24.nearImu) ? Ne.fromJSON(e24.nearImu) : void 0, generative: v(e24.generative) ? Vt.fromJSON(e24.generative) : void 0, rerank: v(e24.rerank) ? ur.fromJSON(e24.rerank) : void 0, uses123Api: v(e24.uses123Api) ? globalThis.Boolean(e24.uses123Api) : false, uses125Api: v(e24.uses125Api) ? globalThis.Boolean(e24.uses125Api) : false, uses127Api: v(e24.uses127Api) ? globalThis.Boolean(e24.uses127Api) : false };
}, toJSON(e24) {
  let t = {};
  return e24.collection !== "" && (t.collection = e24.collection), e24.tenant !== "" && (t.tenant = e24.tenant), e24.consistencyLevel !== void 0 && (t.consistencyLevel = rr(e24.consistencyLevel)), e24.properties !== void 0 && (t.properties = gt.toJSON(e24.properties)), e24.metadata !== void 0 && (t.metadata = we.toJSON(e24.metadata)), e24.groupBy !== void 0 && (t.groupBy = sr.toJSON(e24.groupBy)), e24.limit !== 0 && (t.limit = Math.round(e24.limit)), e24.offset !== 0 && (t.offset = Math.round(e24.offset)), e24.autocut !== 0 && (t.autocut = Math.round(e24.autocut)), e24.after !== "" && (t.after = e24.after), e24.sortBy?.length && (t.sortBy = e24.sortBy.map((r) => _i.toJSON(r))), e24.filters !== void 0 && (t.filters = H.toJSON(e24.filters)), e24.hybridSearch !== void 0 && (t.hybridSearch = ve.toJSON(e24.hybridSearch)), e24.bm25Search !== void 0 && (t.bm25Search = Ft.toJSON(e24.bm25Search)), e24.nearVector !== void 0 && (t.nearVector = te.toJSON(e24.nearVector)), e24.nearObject !== void 0 && (t.nearObject = be.toJSON(e24.nearObject)), e24.nearText !== void 0 && (t.nearText = ae.toJSON(e24.nearText)), e24.nearImage !== void 0 && (t.nearImage = xe.toJSON(e24.nearImage)), e24.nearAudio !== void 0 && (t.nearAudio = Ce.toJSON(e24.nearAudio)), e24.nearVideo !== void 0 && (t.nearVideo = Pe.toJSON(e24.nearVideo)), e24.nearDepth !== void 0 && (t.nearDepth = Re.toJSON(e24.nearDepth)), e24.nearThermal !== void 0 && (t.nearThermal = Ae.toJSON(e24.nearThermal)), e24.nearImu !== void 0 && (t.nearImu = Ne.toJSON(e24.nearImu)), e24.generative !== void 0 && (t.generative = Vt.toJSON(e24.generative)), e24.rerank !== void 0 && (t.rerank = ur.toJSON(e24.rerank)), e24.uses123Api !== false && (t.uses123Api = e24.uses123Api), e24.uses125Api !== false && (t.uses125Api = e24.uses125Api), e24.uses127Api !== false && (t.uses127Api = e24.uses127Api), t;
}, create(e24) {
  return he.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = nf();
  return t.collection = e24.collection ?? "", t.tenant = e24.tenant ?? "", t.consistencyLevel = e24.consistencyLevel ?? void 0, t.properties = e24.properties !== void 0 && e24.properties !== null ? gt.fromPartial(e24.properties) : void 0, t.metadata = e24.metadata !== void 0 && e24.metadata !== null ? we.fromPartial(e24.metadata) : void 0, t.groupBy = e24.groupBy !== void 0 && e24.groupBy !== null ? sr.fromPartial(e24.groupBy) : void 0, t.limit = e24.limit ?? 0, t.offset = e24.offset ?? 0, t.autocut = e24.autocut ?? 0, t.after = e24.after ?? "", t.sortBy = e24.sortBy?.map((r) => _i.fromPartial(r)) || [], t.filters = e24.filters !== void 0 && e24.filters !== null ? H.fromPartial(e24.filters) : void 0, t.hybridSearch = e24.hybridSearch !== void 0 && e24.hybridSearch !== null ? ve.fromPartial(e24.hybridSearch) : void 0, t.bm25Search = e24.bm25Search !== void 0 && e24.bm25Search !== null ? Ft.fromPartial(e24.bm25Search) : void 0, t.nearVector = e24.nearVector !== void 0 && e24.nearVector !== null ? te.fromPartial(e24.nearVector) : void 0, t.nearObject = e24.nearObject !== void 0 && e24.nearObject !== null ? be.fromPartial(e24.nearObject) : void 0, t.nearText = e24.nearText !== void 0 && e24.nearText !== null ? ae.fromPartial(e24.nearText) : void 0, t.nearImage = e24.nearImage !== void 0 && e24.nearImage !== null ? xe.fromPartial(e24.nearImage) : void 0, t.nearAudio = e24.nearAudio !== void 0 && e24.nearAudio !== null ? Ce.fromPartial(e24.nearAudio) : void 0, t.nearVideo = e24.nearVideo !== void 0 && e24.nearVideo !== null ? Pe.fromPartial(e24.nearVideo) : void 0, t.nearDepth = e24.nearDepth !== void 0 && e24.nearDepth !== null ? Re.fromPartial(e24.nearDepth) : void 0, t.nearThermal = e24.nearThermal !== void 0 && e24.nearThermal !== null ? Ae.fromPartial(e24.nearThermal) : void 0, t.nearImu = e24.nearImu !== void 0 && e24.nearImu !== null ? Ne.fromPartial(e24.nearImu) : void 0, t.generative = e24.generative !== void 0 && e24.generative !== null ? Vt.fromPartial(e24.generative) : void 0, t.rerank = e24.rerank !== void 0 && e24.rerank !== null ? ur.fromPartial(e24.rerank) : void 0, t.uses123Api = e24.uses123Api ?? false, t.uses125Api = e24.uses125Api ?? false, t.uses127Api = e24.uses127Api ?? false, t;
} };
function af() {
  return { path: [], numberOfGroups: 0, objectsPerGroup: 0 };
}
var sr = { encode(e24, t = N.default.Writer.create()) {
  for (let r of e24.path) t.uint32(10).string(r);
  return e24.numberOfGroups !== 0 && t.uint32(16).int32(e24.numberOfGroups), e24.objectsPerGroup !== 0 && t.uint32(24).int32(e24.objectsPerGroup), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = af();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.path.push(r.string());
        continue;
      case 2:
        if (n !== 16) break;
        i.numberOfGroups = r.int32();
        continue;
      case 3:
        if (n !== 24) break;
        i.objectsPerGroup = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { path: globalThis.Array.isArray(e24?.path) ? e24.path.map((t) => globalThis.String(t)) : [], numberOfGroups: v(e24.numberOfGroups) ? globalThis.Number(e24.numberOfGroups) : 0, objectsPerGroup: v(e24.objectsPerGroup) ? globalThis.Number(e24.objectsPerGroup) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.path?.length && (t.path = e24.path), e24.numberOfGroups !== 0 && (t.numberOfGroups = Math.round(e24.numberOfGroups)), e24.objectsPerGroup !== 0 && (t.objectsPerGroup = Math.round(e24.objectsPerGroup)), t;
}, create(e24) {
  return sr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = af();
  return t.path = e24.path?.map((r) => r) || [], t.numberOfGroups = e24.numberOfGroups ?? 0, t.objectsPerGroup = e24.objectsPerGroup ?? 0, t;
} };
function of() {
  return { ascending: false, path: [] };
}
var _i = { encode(e24, t = N.default.Writer.create()) {
  e24.ascending !== false && t.uint32(8).bool(e24.ascending);
  for (let r of e24.path) t.uint32(18).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = of();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.ascending = r.bool();
        continue;
      case 2:
        if (n !== 18) break;
        i.path.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { ascending: v(e24.ascending) ? globalThis.Boolean(e24.ascending) : false, path: globalThis.Array.isArray(e24?.path) ? e24.path.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.ascending !== false && (t.ascending = e24.ascending), e24.path?.length && (t.path = e24.path), t;
}, create(e24) {
  return _i.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = of();
  return t.ascending = e24.ascending ?? false, t.path = e24.path?.map((r) => r) || [], t;
} };
function sf() {
  return { uuid: false, vector: false, creationTimeUnix: false, lastUpdateTimeUnix: false, distance: false, certainty: false, score: false, explainScore: false, isConsistent: false, vectors: [], queryProfile: false };
}
var we = { encode(e24, t = N.default.Writer.create()) {
  e24.uuid !== false && t.uint32(8).bool(e24.uuid), e24.vector !== false && t.uint32(16).bool(e24.vector), e24.creationTimeUnix !== false && t.uint32(24).bool(e24.creationTimeUnix), e24.lastUpdateTimeUnix !== false && t.uint32(32).bool(e24.lastUpdateTimeUnix), e24.distance !== false && t.uint32(40).bool(e24.distance), e24.certainty !== false && t.uint32(48).bool(e24.certainty), e24.score !== false && t.uint32(56).bool(e24.score), e24.explainScore !== false && t.uint32(64).bool(e24.explainScore), e24.isConsistent !== false && t.uint32(72).bool(e24.isConsistent);
  for (let r of e24.vectors) t.uint32(82).string(r);
  return e24.queryProfile !== false && t.uint32(88).bool(e24.queryProfile), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = sf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.uuid = r.bool();
        continue;
      case 2:
        if (n !== 16) break;
        i.vector = r.bool();
        continue;
      case 3:
        if (n !== 24) break;
        i.creationTimeUnix = r.bool();
        continue;
      case 4:
        if (n !== 32) break;
        i.lastUpdateTimeUnix = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.distance = r.bool();
        continue;
      case 6:
        if (n !== 48) break;
        i.certainty = r.bool();
        continue;
      case 7:
        if (n !== 56) break;
        i.score = r.bool();
        continue;
      case 8:
        if (n !== 64) break;
        i.explainScore = r.bool();
        continue;
      case 9:
        if (n !== 72) break;
        i.isConsistent = r.bool();
        continue;
      case 10:
        if (n !== 82) break;
        i.vectors.push(r.string());
        continue;
      case 11:
        if (n !== 88) break;
        i.queryProfile = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuid: v(e24.uuid) ? globalThis.Boolean(e24.uuid) : false, vector: v(e24.vector) ? globalThis.Boolean(e24.vector) : false, creationTimeUnix: v(e24.creationTimeUnix) ? globalThis.Boolean(e24.creationTimeUnix) : false, lastUpdateTimeUnix: v(e24.lastUpdateTimeUnix) ? globalThis.Boolean(e24.lastUpdateTimeUnix) : false, distance: v(e24.distance) ? globalThis.Boolean(e24.distance) : false, certainty: v(e24.certainty) ? globalThis.Boolean(e24.certainty) : false, score: v(e24.score) ? globalThis.Boolean(e24.score) : false, explainScore: v(e24.explainScore) ? globalThis.Boolean(e24.explainScore) : false, isConsistent: v(e24.isConsistent) ? globalThis.Boolean(e24.isConsistent) : false, vectors: globalThis.Array.isArray(e24?.vectors) ? e24.vectors.map((t) => globalThis.String(t)) : [], queryProfile: v(e24.queryProfile) ? globalThis.Boolean(e24.queryProfile) : false };
}, toJSON(e24) {
  let t = {};
  return e24.uuid !== false && (t.uuid = e24.uuid), e24.vector !== false && (t.vector = e24.vector), e24.creationTimeUnix !== false && (t.creationTimeUnix = e24.creationTimeUnix), e24.lastUpdateTimeUnix !== false && (t.lastUpdateTimeUnix = e24.lastUpdateTimeUnix), e24.distance !== false && (t.distance = e24.distance), e24.certainty !== false && (t.certainty = e24.certainty), e24.score !== false && (t.score = e24.score), e24.explainScore !== false && (t.explainScore = e24.explainScore), e24.isConsistent !== false && (t.isConsistent = e24.isConsistent), e24.vectors?.length && (t.vectors = e24.vectors), e24.queryProfile !== false && (t.queryProfile = e24.queryProfile), t;
}, create(e24) {
  return we.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = sf();
  return t.uuid = e24.uuid ?? false, t.vector = e24.vector ?? false, t.creationTimeUnix = e24.creationTimeUnix ?? false, t.lastUpdateTimeUnix = e24.lastUpdateTimeUnix ?? false, t.distance = e24.distance ?? false, t.certainty = e24.certainty ?? false, t.score = e24.score ?? false, t.explainScore = e24.explainScore ?? false, t.isConsistent = e24.isConsistent ?? false, t.vectors = e24.vectors?.map((r) => r) || [], t.queryProfile = e24.queryProfile ?? false, t;
} };
function uf() {
  return { nonRefProperties: [], refProperties: [], objectProperties: [], returnAllNonrefProperties: false };
}
var gt = { encode(e24, t = N.default.Writer.create()) {
  for (let r of e24.nonRefProperties) t.uint32(10).string(r);
  for (let r of e24.refProperties) Bi.encode(r, t.uint32(18).fork()).ldelim();
  for (let r of e24.objectProperties) pt.encode(r, t.uint32(26).fork()).ldelim();
  return e24.returnAllNonrefProperties !== false && t.uint32(88).bool(e24.returnAllNonrefProperties), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = uf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.nonRefProperties.push(r.string());
        continue;
      case 2:
        if (n !== 18) break;
        i.refProperties.push(Bi.decode(r, r.uint32()));
        continue;
      case 3:
        if (n !== 26) break;
        i.objectProperties.push(pt.decode(r, r.uint32()));
        continue;
      case 11:
        if (n !== 88) break;
        i.returnAllNonrefProperties = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { nonRefProperties: globalThis.Array.isArray(e24?.nonRefProperties) ? e24.nonRefProperties.map((t) => globalThis.String(t)) : [], refProperties: globalThis.Array.isArray(e24?.refProperties) ? e24.refProperties.map((t) => Bi.fromJSON(t)) : [], objectProperties: globalThis.Array.isArray(e24?.objectProperties) ? e24.objectProperties.map((t) => pt.fromJSON(t)) : [], returnAllNonrefProperties: v(e24.returnAllNonrefProperties) ? globalThis.Boolean(e24.returnAllNonrefProperties) : false };
}, toJSON(e24) {
  let t = {};
  return e24.nonRefProperties?.length && (t.nonRefProperties = e24.nonRefProperties), e24.refProperties?.length && (t.refProperties = e24.refProperties.map((r) => Bi.toJSON(r))), e24.objectProperties?.length && (t.objectProperties = e24.objectProperties.map((r) => pt.toJSON(r))), e24.returnAllNonrefProperties !== false && (t.returnAllNonrefProperties = e24.returnAllNonrefProperties), t;
}, create(e24) {
  return gt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = uf();
  return t.nonRefProperties = e24.nonRefProperties?.map((r) => r) || [], t.refProperties = e24.refProperties?.map((r) => Bi.fromPartial(r)) || [], t.objectProperties = e24.objectProperties?.map((r) => pt.fromPartial(r)) || [], t.returnAllNonrefProperties = e24.returnAllNonrefProperties ?? false, t;
} };
function df() {
  return { propName: "", primitiveProperties: [], objectProperties: [] };
}
var pt = { encode(e24, t = N.default.Writer.create()) {
  e24.propName !== "" && t.uint32(10).string(e24.propName);
  for (let r of e24.primitiveProperties) t.uint32(18).string(r);
  for (let r of e24.objectProperties) pt.encode(r, t.uint32(26).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = df();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.propName = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.primitiveProperties.push(r.string());
        continue;
      case 3:
        if (n !== 26) break;
        i.objectProperties.push(pt.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { propName: v(e24.propName) ? globalThis.String(e24.propName) : "", primitiveProperties: globalThis.Array.isArray(e24?.primitiveProperties) ? e24.primitiveProperties.map((t) => globalThis.String(t)) : [], objectProperties: globalThis.Array.isArray(e24?.objectProperties) ? e24.objectProperties.map((t) => pt.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.propName !== "" && (t.propName = e24.propName), e24.primitiveProperties?.length && (t.primitiveProperties = e24.primitiveProperties), e24.objectProperties?.length && (t.objectProperties = e24.objectProperties.map((r) => pt.toJSON(r))), t;
}, create(e24) {
  return pt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = df();
  return t.propName = e24.propName ?? "", t.primitiveProperties = e24.primitiveProperties?.map((r) => r) || [], t.objectProperties = e24.objectProperties?.map((r) => pt.fromPartial(r)) || [], t;
} };
function cf() {
  return { referenceProperty: "", properties: void 0, metadata: void 0, targetCollection: "" };
}
var Bi = { encode(e24, t = N.default.Writer.create()) {
  return e24.referenceProperty !== "" && t.uint32(10).string(e24.referenceProperty), e24.properties !== void 0 && gt.encode(e24.properties, t.uint32(18).fork()).ldelim(), e24.metadata !== void 0 && we.encode(e24.metadata, t.uint32(26).fork()).ldelim(), e24.targetCollection !== "" && t.uint32(34).string(e24.targetCollection), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = cf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.referenceProperty = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.properties = gt.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.metadata = we.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.targetCollection = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { referenceProperty: v(e24.referenceProperty) ? globalThis.String(e24.referenceProperty) : "", properties: v(e24.properties) ? gt.fromJSON(e24.properties) : void 0, metadata: v(e24.metadata) ? we.fromJSON(e24.metadata) : void 0, targetCollection: v(e24.targetCollection) ? globalThis.String(e24.targetCollection) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.referenceProperty !== "" && (t.referenceProperty = e24.referenceProperty), e24.properties !== void 0 && (t.properties = gt.toJSON(e24.properties)), e24.metadata !== void 0 && (t.metadata = we.toJSON(e24.metadata)), e24.targetCollection !== "" && (t.targetCollection = e24.targetCollection), t;
}, create(e24) {
  return Bi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = cf();
  return t.referenceProperty = e24.referenceProperty ?? "", t.properties = e24.properties !== void 0 && e24.properties !== null ? gt.fromPartial(e24.properties) : void 0, t.metadata = e24.metadata !== void 0 && e24.metadata !== null ? we.fromPartial(e24.metadata) : void 0, t.targetCollection = e24.targetCollection ?? "", t;
} };
function lf() {
  return { property: "", query: void 0 };
}
var ur = { encode(e24, t = N.default.Writer.create()) {
  return e24.property !== "" && t.uint32(10).string(e24.property), e24.query !== void 0 && t.uint32(18).string(e24.query), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = lf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.property = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.query = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { property: v(e24.property) ? globalThis.String(e24.property) : "", query: v(e24.query) ? globalThis.String(e24.query) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.property !== "" && (t.property = e24.property), e24.query !== void 0 && (t.query = e24.query), t;
}, create(e24) {
  return ur.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = lf();
  return t.property = e24.property ?? "", t.query = e24.query ?? void 0, t;
} };
function ff() {
  return { took: 0, results: [], generativeGroupedResult: void 0, groupByResults: [], generativeGroupedResults: void 0, queryProfile: void 0 };
}
var bs = { encode(e24, t = N.default.Writer.create()) {
  e24.took !== 0 && t.uint32(13).float(e24.took);
  for (let r of e24.results) mt.encode(r, t.uint32(18).fork()).ldelim();
  e24.generativeGroupedResult !== void 0 && t.uint32(26).string(e24.generativeGroupedResult);
  for (let r of e24.groupByResults) Ei.encode(r, t.uint32(34).fork()).ldelim();
  return e24.generativeGroupedResults !== void 0 && pe.encode(e24.generativeGroupedResults, t.uint32(42).fork()).ldelim(), e24.queryProfile !== void 0 && Gi.encode(e24.queryProfile, t.uint32(50).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = ff();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.took = r.float();
        continue;
      case 2:
        if (n !== 18) break;
        i.results.push(mt.decode(r, r.uint32()));
        continue;
      case 3:
        if (n !== 26) break;
        i.generativeGroupedResult = r.string();
        continue;
      case 4:
        if (n !== 34) break;
        i.groupByResults.push(Ei.decode(r, r.uint32()));
        continue;
      case 5:
        if (n !== 42) break;
        i.generativeGroupedResults = pe.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.queryProfile = Gi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { took: v(e24.took) ? globalThis.Number(e24.took) : 0, results: globalThis.Array.isArray(e24?.results) ? e24.results.map((t) => mt.fromJSON(t)) : [], generativeGroupedResult: v(e24.generativeGroupedResult) ? globalThis.String(e24.generativeGroupedResult) : void 0, groupByResults: globalThis.Array.isArray(e24?.groupByResults) ? e24.groupByResults.map((t) => Ei.fromJSON(t)) : [], generativeGroupedResults: v(e24.generativeGroupedResults) ? pe.fromJSON(e24.generativeGroupedResults) : void 0, queryProfile: v(e24.queryProfile) ? Gi.fromJSON(e24.queryProfile) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.took !== 0 && (t.took = e24.took), e24.results?.length && (t.results = e24.results.map((r) => mt.toJSON(r))), e24.generativeGroupedResult !== void 0 && (t.generativeGroupedResult = e24.generativeGroupedResult), e24.groupByResults?.length && (t.groupByResults = e24.groupByResults.map((r) => Ei.toJSON(r))), e24.generativeGroupedResults !== void 0 && (t.generativeGroupedResults = pe.toJSON(e24.generativeGroupedResults)), e24.queryProfile !== void 0 && (t.queryProfile = Gi.toJSON(e24.queryProfile)), t;
}, create(e24) {
  return bs.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = ff();
  return t.took = e24.took ?? 0, t.results = e24.results?.map((r) => mt.fromPartial(r)) || [], t.generativeGroupedResult = e24.generativeGroupedResult ?? void 0, t.groupByResults = e24.groupByResults?.map((r) => Ei.fromPartial(r)) || [], t.generativeGroupedResults = e24.generativeGroupedResults !== void 0 && e24.generativeGroupedResults !== null ? pe.fromPartial(e24.generativeGroupedResults) : void 0, t.queryProfile = e24.queryProfile !== void 0 && e24.queryProfile !== null ? Gi.fromPartial(e24.queryProfile) : void 0, t;
} };
function pf() {
  return { shards: [] };
}
var Gi = { encode(e24, t = N.default.Writer.create()) {
  for (let r of e24.shards) wi.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = pf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.shards.push(wi.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { shards: globalThis.Array.isArray(e24?.shards) ? e24.shards.map((t) => wi.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.shards?.length && (t.shards = e24.shards.map((r) => wi.toJSON(r))), t;
}, create(e24) {
  return Gi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = pf();
  return t.shards = e24.shards?.map((r) => wi.fromPartial(r)) || [], t;
} };
function gf() {
  return { details: {} };
}
var qt = { encode(e24, t = N.default.Writer.create()) {
  return Object.entries(e24.details).forEach(([r, a]) => {
    ys.encode({ key: r, value: a }, t.uint32(10).fork()).ldelim();
  }), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = gf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        let o = ys.decode(r, r.uint32());
        o.value !== void 0 && (i.details[o.key] = o.value);
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { details: Nf(e24.details) ? Object.entries(e24.details).reduce((t, [r, a]) => (t[r] = String(a), t), {}) : {} };
}, toJSON(e24) {
  let t = {};
  if (e24.details) {
    let r = Object.entries(e24.details);
    r.length > 0 && (t.details = {}, r.forEach(([a, i]) => {
      t.details[a] = i;
    }));
  }
  return t;
}, create(e24) {
  return qt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = gf();
  return t.details = Object.entries(e24.details ?? {}).reduce((r, [a, i]) => (i !== void 0 && (r[a] = globalThis.String(i)), r), {}), t;
} };
function mf() {
  return { key: "", value: "" };
}
var ys = { encode(e24, t = N.default.Writer.create()) {
  return e24.key !== "" && t.uint32(10).string(e24.key), e24.value !== "" && t.uint32(18).string(e24.value), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = mf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.key = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.value = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { key: v(e24.key) ? globalThis.String(e24.key) : "", value: v(e24.value) ? globalThis.String(e24.value) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.key !== "" && (t.key = e24.key), e24.value !== "" && (t.value = e24.value), t;
}, create(e24) {
  return ys.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = mf();
  return t.key = e24.key ?? "", t.value = e24.value ?? "", t;
} };
function hf() {
  return { name: "", node: "", searches: {} };
}
var wi = { encode(e24, t = N.default.Writer.create()) {
  return e24.name !== "" && t.uint32(10).string(e24.name), e24.node !== "" && t.uint32(18).string(e24.node), Object.entries(e24.searches).forEach(([r, a]) => {
    Ts.encode({ key: r, value: a }, t.uint32(26).fork()).ldelim();
  }), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = hf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.name = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.node = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        let o = Ts.decode(r, r.uint32());
        o.value !== void 0 && (i.searches[o.key] = o.value);
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { name: v(e24.name) ? globalThis.String(e24.name) : "", node: v(e24.node) ? globalThis.String(e24.node) : "", searches: Nf(e24.searches) ? Object.entries(e24.searches).reduce((t, [r, a]) => (t[r] = qt.fromJSON(a), t), {}) : {} };
}, toJSON(e24) {
  let t = {};
  if (e24.name !== "" && (t.name = e24.name), e24.node !== "" && (t.node = e24.node), e24.searches) {
    let r = Object.entries(e24.searches);
    r.length > 0 && (t.searches = {}, r.forEach(([a, i]) => {
      t.searches[a] = qt.toJSON(i);
    }));
  }
  return t;
}, create(e24) {
  return wi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = hf();
  return t.name = e24.name ?? "", t.node = e24.node ?? "", t.searches = Object.entries(e24.searches ?? {}).reduce((r, [a, i]) => (i !== void 0 && (r[a] = qt.fromPartial(i)), r), {}), t;
} };
function yf() {
  return { key: "", value: void 0 };
}
var Ts = { encode(e24, t = N.default.Writer.create()) {
  return e24.key !== "" && t.uint32(10).string(e24.key), e24.value !== void 0 && qt.encode(e24.value, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = yf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.key = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.value = qt.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { key: v(e24.key) ? globalThis.String(e24.key) : "", value: v(e24.value) ? qt.fromJSON(e24.value) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.key !== "" && (t.key = e24.key), e24.value !== void 0 && (t.value = qt.toJSON(e24.value)), t;
}, create(e24) {
  return Ts.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = yf();
  return t.key = e24.key ?? "", t.value = e24.value !== void 0 && e24.value !== null ? qt.fromPartial(e24.value) : void 0, t;
} };
function Tf() {
  return { score: 0 };
}
var Mi = { encode(e24, t = N.default.Writer.create()) {
  return e24.score !== 0 && t.uint32(9).double(e24.score), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Tf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 9) break;
        i.score = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { score: v(e24.score) ? globalThis.Number(e24.score) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.score !== 0 && (t.score = e24.score), t;
}, create(e24) {
  return Mi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Tf();
  return t.score = e24.score ?? 0, t;
} };
function vf() {
  return { name: "", minDistance: 0, maxDistance: 0, numberOfObjects: 0, objects: [], rerank: void 0, generative: void 0, generativeResult: void 0 };
}
var Ei = { encode(e24, t = N.default.Writer.create()) {
  e24.name !== "" && t.uint32(10).string(e24.name), e24.minDistance !== 0 && t.uint32(21).float(e24.minDistance), e24.maxDistance !== 0 && t.uint32(29).float(e24.maxDistance), e24.numberOfObjects !== 0 && t.uint32(32).int64(e24.numberOfObjects);
  for (let r of e24.objects) mt.encode(r, t.uint32(42).fork()).ldelim();
  return e24.rerank !== void 0 && Mi.encode(e24.rerank, t.uint32(50).fork()).ldelim(), e24.generative !== void 0 && ot.encode(e24.generative, t.uint32(58).fork()).ldelim(), e24.generativeResult !== void 0 && pe.encode(e24.generativeResult, t.uint32(66).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = vf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.name = r.string();
        continue;
      case 2:
        if (n !== 21) break;
        i.minDistance = r.float();
        continue;
      case 3:
        if (n !== 29) break;
        i.maxDistance = r.float();
        continue;
      case 4:
        if (n !== 32) break;
        i.numberOfObjects = vs(r.int64());
        continue;
      case 5:
        if (n !== 42) break;
        i.objects.push(mt.decode(r, r.uint32()));
        continue;
      case 6:
        if (n !== 50) break;
        i.rerank = Mi.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.generative = ot.decode(r, r.uint32());
        continue;
      case 8:
        if (n !== 66) break;
        i.generativeResult = pe.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { name: v(e24.name) ? globalThis.String(e24.name) : "", minDistance: v(e24.minDistance) ? globalThis.Number(e24.minDistance) : 0, maxDistance: v(e24.maxDistance) ? globalThis.Number(e24.maxDistance) : 0, numberOfObjects: v(e24.numberOfObjects) ? globalThis.Number(e24.numberOfObjects) : 0, objects: globalThis.Array.isArray(e24?.objects) ? e24.objects.map((t) => mt.fromJSON(t)) : [], rerank: v(e24.rerank) ? Mi.fromJSON(e24.rerank) : void 0, generative: v(e24.generative) ? ot.fromJSON(e24.generative) : void 0, generativeResult: v(e24.generativeResult) ? pe.fromJSON(e24.generativeResult) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.name !== "" && (t.name = e24.name), e24.minDistance !== 0 && (t.minDistance = e24.minDistance), e24.maxDistance !== 0 && (t.maxDistance = e24.maxDistance), e24.numberOfObjects !== 0 && (t.numberOfObjects = Math.round(e24.numberOfObjects)), e24.objects?.length && (t.objects = e24.objects.map((r) => mt.toJSON(r))), e24.rerank !== void 0 && (t.rerank = Mi.toJSON(e24.rerank)), e24.generative !== void 0 && (t.generative = ot.toJSON(e24.generative)), e24.generativeResult !== void 0 && (t.generativeResult = pe.toJSON(e24.generativeResult)), t;
}, create(e24) {
  return Ei.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = vf();
  return t.name = e24.name ?? "", t.minDistance = e24.minDistance ?? 0, t.maxDistance = e24.maxDistance ?? 0, t.numberOfObjects = e24.numberOfObjects ?? 0, t.objects = e24.objects?.map((r) => mt.fromPartial(r)) || [], t.rerank = e24.rerank !== void 0 && e24.rerank !== null ? Mi.fromPartial(e24.rerank) : void 0, t.generative = e24.generative !== void 0 && e24.generative !== null ? ot.fromPartial(e24.generative) : void 0, t.generativeResult = e24.generativeResult !== void 0 && e24.generativeResult !== null ? pe.fromPartial(e24.generativeResult) : void 0, t;
} };
function bf() {
  return { properties: void 0, metadata: void 0, generative: void 0 };
}
var mt = { encode(e24, t = N.default.Writer.create()) {
  return e24.properties !== void 0 && yt.encode(e24.properties, t.uint32(10).fork()).ldelim(), e24.metadata !== void 0 && ht.encode(e24.metadata, t.uint32(18).fork()).ldelim(), e24.generative !== void 0 && pe.encode(e24.generative, t.uint32(26).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = bf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.properties = yt.decode(r, r.uint32());
        continue;
      case 2:
        if (n !== 18) break;
        i.metadata = ht.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.generative = pe.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { properties: v(e24.properties) ? yt.fromJSON(e24.properties) : void 0, metadata: v(e24.metadata) ? ht.fromJSON(e24.metadata) : void 0, generative: v(e24.generative) ? pe.fromJSON(e24.generative) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.properties !== void 0 && (t.properties = yt.toJSON(e24.properties)), e24.metadata !== void 0 && (t.metadata = ht.toJSON(e24.metadata)), e24.generative !== void 0 && (t.generative = pe.toJSON(e24.generative)), t;
}, create(e24) {
  return mt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = bf();
  return t.properties = e24.properties !== void 0 && e24.properties !== null ? yt.fromPartial(e24.properties) : void 0, t.metadata = e24.metadata !== void 0 && e24.metadata !== null ? ht.fromPartial(e24.metadata) : void 0, t.generative = e24.generative !== void 0 && e24.generative !== null ? pe.fromPartial(e24.generative) : void 0, t;
} };
function xf() {
  return { id: "", vector: [], creationTimeUnix: 0, creationTimeUnixPresent: false, lastUpdateTimeUnix: 0, lastUpdateTimeUnixPresent: false, distance: 0, distancePresent: false, certainty: 0, certaintyPresent: false, score: 0, scorePresent: false, explainScore: "", explainScorePresent: false, isConsistent: void 0, generative: "", generativePresent: false, isConsistentPresent: false, vectorBytes: new Uint8Array(0), idAsBytes: new Uint8Array(0), rerankScore: 0, rerankScorePresent: false, vectors: [] };
}
var ht = { encode(e24, t = N.default.Writer.create()) {
  e24.id !== "" && t.uint32(10).string(e24.id), t.uint32(18).fork();
  for (let r of e24.vector) t.float(r);
  t.ldelim(), e24.creationTimeUnix !== 0 && t.uint32(24).int64(e24.creationTimeUnix), e24.creationTimeUnixPresent !== false && t.uint32(32).bool(e24.creationTimeUnixPresent), e24.lastUpdateTimeUnix !== 0 && t.uint32(40).int64(e24.lastUpdateTimeUnix), e24.lastUpdateTimeUnixPresent !== false && t.uint32(48).bool(e24.lastUpdateTimeUnixPresent), e24.distance !== 0 && t.uint32(61).float(e24.distance), e24.distancePresent !== false && t.uint32(64).bool(e24.distancePresent), e24.certainty !== 0 && t.uint32(77).float(e24.certainty), e24.certaintyPresent !== false && t.uint32(80).bool(e24.certaintyPresent), e24.score !== 0 && t.uint32(93).float(e24.score), e24.scorePresent !== false && t.uint32(96).bool(e24.scorePresent), e24.explainScore !== "" && t.uint32(106).string(e24.explainScore), e24.explainScorePresent !== false && t.uint32(112).bool(e24.explainScorePresent), e24.isConsistent !== void 0 && t.uint32(120).bool(e24.isConsistent), e24.generative !== "" && t.uint32(130).string(e24.generative), e24.generativePresent !== false && t.uint32(136).bool(e24.generativePresent), e24.isConsistentPresent !== false && t.uint32(144).bool(e24.isConsistentPresent), e24.vectorBytes.length !== 0 && t.uint32(154).bytes(e24.vectorBytes), e24.idAsBytes.length !== 0 && t.uint32(162).bytes(e24.idAsBytes), e24.rerankScore !== 0 && t.uint32(169).double(e24.rerankScore), e24.rerankScorePresent !== false && t.uint32(176).bool(e24.rerankScorePresent);
  for (let r of e24.vectors) q.encode(r, t.uint32(186).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = xf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.id = r.string();
        continue;
      case 2:
        if (n === 21) {
          i.vector.push(r.float());
          continue;
        }
        if (n === 18) {
          let o = r.uint32() + r.pos;
          for (; r.pos < o; ) i.vector.push(r.float());
          continue;
        }
        break;
      case 3:
        if (n !== 24) break;
        i.creationTimeUnix = vs(r.int64());
        continue;
      case 4:
        if (n !== 32) break;
        i.creationTimeUnixPresent = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.lastUpdateTimeUnix = vs(r.int64());
        continue;
      case 6:
        if (n !== 48) break;
        i.lastUpdateTimeUnixPresent = r.bool();
        continue;
      case 7:
        if (n !== 61) break;
        i.distance = r.float();
        continue;
      case 8:
        if (n !== 64) break;
        i.distancePresent = r.bool();
        continue;
      case 9:
        if (n !== 77) break;
        i.certainty = r.float();
        continue;
      case 10:
        if (n !== 80) break;
        i.certaintyPresent = r.bool();
        continue;
      case 11:
        if (n !== 93) break;
        i.score = r.float();
        continue;
      case 12:
        if (n !== 96) break;
        i.scorePresent = r.bool();
        continue;
      case 13:
        if (n !== 106) break;
        i.explainScore = r.string();
        continue;
      case 14:
        if (n !== 112) break;
        i.explainScorePresent = r.bool();
        continue;
      case 15:
        if (n !== 120) break;
        i.isConsistent = r.bool();
        continue;
      case 16:
        if (n !== 130) break;
        i.generative = r.string();
        continue;
      case 17:
        if (n !== 136) break;
        i.generativePresent = r.bool();
        continue;
      case 18:
        if (n !== 144) break;
        i.isConsistentPresent = r.bool();
        continue;
      case 19:
        if (n !== 154) break;
        i.vectorBytes = r.bytes();
        continue;
      case 20:
        if (n !== 162) break;
        i.idAsBytes = r.bytes();
        continue;
      case 21:
        if (n !== 169) break;
        i.rerankScore = r.double();
        continue;
      case 22:
        if (n !== 176) break;
        i.rerankScorePresent = r.bool();
        continue;
      case 23:
        if (n !== 186) break;
        i.vectors.push(q.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { id: v(e24.id) ? globalThis.String(e24.id) : "", vector: globalThis.Array.isArray(e24?.vector) ? e24.vector.map((t) => globalThis.Number(t)) : [], creationTimeUnix: v(e24.creationTimeUnix) ? globalThis.Number(e24.creationTimeUnix) : 0, creationTimeUnixPresent: v(e24.creationTimeUnixPresent) ? globalThis.Boolean(e24.creationTimeUnixPresent) : false, lastUpdateTimeUnix: v(e24.lastUpdateTimeUnix) ? globalThis.Number(e24.lastUpdateTimeUnix) : 0, lastUpdateTimeUnixPresent: v(e24.lastUpdateTimeUnixPresent) ? globalThis.Boolean(e24.lastUpdateTimeUnixPresent) : false, distance: v(e24.distance) ? globalThis.Number(e24.distance) : 0, distancePresent: v(e24.distancePresent) ? globalThis.Boolean(e24.distancePresent) : false, certainty: v(e24.certainty) ? globalThis.Number(e24.certainty) : 0, certaintyPresent: v(e24.certaintyPresent) ? globalThis.Boolean(e24.certaintyPresent) : false, score: v(e24.score) ? globalThis.Number(e24.score) : 0, scorePresent: v(e24.scorePresent) ? globalThis.Boolean(e24.scorePresent) : false, explainScore: v(e24.explainScore) ? globalThis.String(e24.explainScore) : "", explainScorePresent: v(e24.explainScorePresent) ? globalThis.Boolean(e24.explainScorePresent) : false, isConsistent: v(e24.isConsistent) ? globalThis.Boolean(e24.isConsistent) : void 0, generative: v(e24.generative) ? globalThis.String(e24.generative) : "", generativePresent: v(e24.generativePresent) ? globalThis.Boolean(e24.generativePresent) : false, isConsistentPresent: v(e24.isConsistentPresent) ? globalThis.Boolean(e24.isConsistentPresent) : false, vectorBytes: v(e24.vectorBytes) ? Rf(e24.vectorBytes) : new Uint8Array(0), idAsBytes: v(e24.idAsBytes) ? Rf(e24.idAsBytes) : new Uint8Array(0), rerankScore: v(e24.rerankScore) ? globalThis.Number(e24.rerankScore) : 0, rerankScorePresent: v(e24.rerankScorePresent) ? globalThis.Boolean(e24.rerankScorePresent) : false, vectors: globalThis.Array.isArray(e24?.vectors) ? e24.vectors.map((t) => q.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.id !== "" && (t.id = e24.id), e24.vector?.length && (t.vector = e24.vector), e24.creationTimeUnix !== 0 && (t.creationTimeUnix = Math.round(e24.creationTimeUnix)), e24.creationTimeUnixPresent !== false && (t.creationTimeUnixPresent = e24.creationTimeUnixPresent), e24.lastUpdateTimeUnix !== 0 && (t.lastUpdateTimeUnix = Math.round(e24.lastUpdateTimeUnix)), e24.lastUpdateTimeUnixPresent !== false && (t.lastUpdateTimeUnixPresent = e24.lastUpdateTimeUnixPresent), e24.distance !== 0 && (t.distance = e24.distance), e24.distancePresent !== false && (t.distancePresent = e24.distancePresent), e24.certainty !== 0 && (t.certainty = e24.certainty), e24.certaintyPresent !== false && (t.certaintyPresent = e24.certaintyPresent), e24.score !== 0 && (t.score = e24.score), e24.scorePresent !== false && (t.scorePresent = e24.scorePresent), e24.explainScore !== "" && (t.explainScore = e24.explainScore), e24.explainScorePresent !== false && (t.explainScorePresent = e24.explainScorePresent), e24.isConsistent !== void 0 && (t.isConsistent = e24.isConsistent), e24.generative !== "" && (t.generative = e24.generative), e24.generativePresent !== false && (t.generativePresent = e24.generativePresent), e24.isConsistentPresent !== false && (t.isConsistentPresent = e24.isConsistentPresent), e24.vectorBytes.length !== 0 && (t.vectorBytes = Af(e24.vectorBytes)), e24.idAsBytes.length !== 0 && (t.idAsBytes = Af(e24.idAsBytes)), e24.rerankScore !== 0 && (t.rerankScore = e24.rerankScore), e24.rerankScorePresent !== false && (t.rerankScorePresent = e24.rerankScorePresent), e24.vectors?.length && (t.vectors = e24.vectors.map((r) => q.toJSON(r))), t;
}, create(e24) {
  return ht.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = xf();
  return t.id = e24.id ?? "", t.vector = e24.vector?.map((r) => r) || [], t.creationTimeUnix = e24.creationTimeUnix ?? 0, t.creationTimeUnixPresent = e24.creationTimeUnixPresent ?? false, t.lastUpdateTimeUnix = e24.lastUpdateTimeUnix ?? 0, t.lastUpdateTimeUnixPresent = e24.lastUpdateTimeUnixPresent ?? false, t.distance = e24.distance ?? 0, t.distancePresent = e24.distancePresent ?? false, t.certainty = e24.certainty ?? 0, t.certaintyPresent = e24.certaintyPresent ?? false, t.score = e24.score ?? 0, t.scorePresent = e24.scorePresent ?? false, t.explainScore = e24.explainScore ?? "", t.explainScorePresent = e24.explainScorePresent ?? false, t.isConsistent = e24.isConsistent ?? void 0, t.generative = e24.generative ?? "", t.generativePresent = e24.generativePresent ?? false, t.isConsistentPresent = e24.isConsistentPresent ?? false, t.vectorBytes = e24.vectorBytes ?? new Uint8Array(0), t.idAsBytes = e24.idAsBytes ?? new Uint8Array(0), t.rerankScore = e24.rerankScore ?? 0, t.rerankScorePresent = e24.rerankScorePresent ?? false, t.vectors = e24.vectors?.map((r) => q.fromPartial(r)) || [], t;
} };
function Cf() {
  return { refProps: [], targetCollection: "", metadata: void 0, nonRefProps: void 0, refPropsRequested: false };
}
var yt = { encode(e24, t = N.default.Writer.create()) {
  for (let r of e24.refProps) Ui.encode(r, t.uint32(18).fork()).ldelim();
  return e24.targetCollection !== "" && t.uint32(26).string(e24.targetCollection), e24.metadata !== void 0 && ht.encode(e24.metadata, t.uint32(34).fork()).ldelim(), e24.nonRefProps !== void 0 && ge.encode(e24.nonRefProps, t.uint32(90).fork()).ldelim(), e24.refPropsRequested !== false && t.uint32(96).bool(e24.refPropsRequested), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Cf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 2:
        if (n !== 18) break;
        i.refProps.push(Ui.decode(r, r.uint32()));
        continue;
      case 3:
        if (n !== 26) break;
        i.targetCollection = r.string();
        continue;
      case 4:
        if (n !== 34) break;
        i.metadata = ht.decode(r, r.uint32());
        continue;
      case 11:
        if (n !== 90) break;
        i.nonRefProps = ge.decode(r, r.uint32());
        continue;
      case 12:
        if (n !== 96) break;
        i.refPropsRequested = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { refProps: globalThis.Array.isArray(e24?.refProps) ? e24.refProps.map((t) => Ui.fromJSON(t)) : [], targetCollection: v(e24.targetCollection) ? globalThis.String(e24.targetCollection) : "", metadata: v(e24.metadata) ? ht.fromJSON(e24.metadata) : void 0, nonRefProps: v(e24.nonRefProps) ? ge.fromJSON(e24.nonRefProps) : void 0, refPropsRequested: v(e24.refPropsRequested) ? globalThis.Boolean(e24.refPropsRequested) : false };
}, toJSON(e24) {
  let t = {};
  return e24.refProps?.length && (t.refProps = e24.refProps.map((r) => Ui.toJSON(r))), e24.targetCollection !== "" && (t.targetCollection = e24.targetCollection), e24.metadata !== void 0 && (t.metadata = ht.toJSON(e24.metadata)), e24.nonRefProps !== void 0 && (t.nonRefProps = ge.toJSON(e24.nonRefProps)), e24.refPropsRequested !== false && (t.refPropsRequested = e24.refPropsRequested), t;
}, create(e24) {
  return yt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Cf();
  return t.refProps = e24.refProps?.map((r) => Ui.fromPartial(r)) || [], t.targetCollection = e24.targetCollection ?? "", t.metadata = e24.metadata !== void 0 && e24.metadata !== null ? ht.fromPartial(e24.metadata) : void 0, t.nonRefProps = e24.nonRefProps !== void 0 && e24.nonRefProps !== null ? ge.fromPartial(e24.nonRefProps) : void 0, t.refPropsRequested = e24.refPropsRequested ?? false, t;
} };
function Pf() {
  return { properties: [], propName: "" };
}
var Ui = { encode(e24, t = N.default.Writer.create()) {
  for (let r of e24.properties) yt.encode(r, t.uint32(10).fork()).ldelim();
  return e24.propName !== "" && t.uint32(18).string(e24.propName), t;
}, decode(e24, t) {
  let r = e24 instanceof N.default.Reader ? e24 : N.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Pf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.properties.push(yt.decode(r, r.uint32()));
        continue;
      case 2:
        if (n !== 18) break;
        i.propName = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { properties: globalThis.Array.isArray(e24?.properties) ? e24.properties.map((t) => yt.fromJSON(t)) : [], propName: v(e24.propName) ? globalThis.String(e24.propName) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.properties?.length && (t.properties = e24.properties.map((r) => yt.toJSON(r))), e24.propName !== "" && (t.propName = e24.propName), t;
}, create(e24) {
  return Ui.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Pf();
  return t.properties = e24.properties?.map((r) => yt.fromPartial(r)) || [], t.propName = e24.propName ?? "", t;
} };
function Rf(e24) {
  if (globalThis.Buffer) return Uint8Array.from(globalThis.Buffer.from(e24, "base64"));
  {
    let t = globalThis.atob(e24), r = new Uint8Array(t.length);
    for (let a = 0; a < t.length; ++a) r[a] = t.charCodeAt(a);
    return r;
  }
}
function Af(e24) {
  if (globalThis.Buffer) return globalThis.Buffer.from(e24).toString("base64");
  {
    let t = [];
    return e24.forEach((r) => {
      t.push(globalThis.String.fromCharCode(r));
    }), globalThis.btoa(t.join(""));
  }
}
function vs(e24) {
  if (e24.gt(globalThis.Number.MAX_SAFE_INTEGER)) throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  return e24.toNumber();
}
N.default.util.Long !== long_default && (N.default.util.Long = long_default, N.default.configure());
function Nf(e24) {
  return typeof e24 == "object" && e24 !== null;
}
function v(e24) {
  return e24 != null;
}
d();
var R = ze(Ke());
function Of() {
  return { collection: "", tenant: "", objectsCount: false, aggregations: [], objectLimit: void 0, groupBy: void 0, limit: void 0, filters: void 0, hybrid: void 0, nearVector: void 0, nearObject: void 0, nearText: void 0, nearImage: void 0, nearAudio: void 0, nearVideo: void 0, nearDepth: void 0, nearThermal: void 0, nearImu: void 0 };
}
var ke = { encode(e24, t = R.default.Writer.create()) {
  e24.collection !== "" && t.uint32(10).string(e24.collection), e24.tenant !== "" && t.uint32(82).string(e24.tenant), e24.objectsCount !== false && t.uint32(160).bool(e24.objectsCount);
  for (let r of e24.aggregations) dr.encode(r, t.uint32(170).fork()).ldelim();
  return e24.objectLimit !== void 0 && t.uint32(240).uint32(e24.objectLimit), e24.groupBy !== void 0 && mr.encode(e24.groupBy, t.uint32(250).fork()).ldelim(), e24.limit !== void 0 && t.uint32(256).uint32(e24.limit), e24.filters !== void 0 && H.encode(e24.filters, t.uint32(322).fork()).ldelim(), e24.hybrid !== void 0 && ve.encode(e24.hybrid, t.uint32(330).fork()).ldelim(), e24.nearVector !== void 0 && te.encode(e24.nearVector, t.uint32(338).fork()).ldelim(), e24.nearObject !== void 0 && be.encode(e24.nearObject, t.uint32(346).fork()).ldelim(), e24.nearText !== void 0 && ae.encode(e24.nearText, t.uint32(354).fork()).ldelim(), e24.nearImage !== void 0 && xe.encode(e24.nearImage, t.uint32(362).fork()).ldelim(), e24.nearAudio !== void 0 && Ce.encode(e24.nearAudio, t.uint32(370).fork()).ldelim(), e24.nearVideo !== void 0 && Pe.encode(e24.nearVideo, t.uint32(378).fork()).ldelim(), e24.nearDepth !== void 0 && Re.encode(e24.nearDepth, t.uint32(386).fork()).ldelim(), e24.nearThermal !== void 0 && Ae.encode(e24.nearThermal, t.uint32(394).fork()).ldelim(), e24.nearImu !== void 0 && Ne.encode(e24.nearImu, t.uint32(402).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Of();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.collection = r.string();
        continue;
      case 10:
        if (n !== 82) break;
        i.tenant = r.string();
        continue;
      case 20:
        if (n !== 160) break;
        i.objectsCount = r.bool();
        continue;
      case 21:
        if (n !== 170) break;
        i.aggregations.push(dr.decode(r, r.uint32()));
        continue;
      case 30:
        if (n !== 240) break;
        i.objectLimit = r.uint32();
        continue;
      case 31:
        if (n !== 250) break;
        i.groupBy = mr.decode(r, r.uint32());
        continue;
      case 32:
        if (n !== 256) break;
        i.limit = r.uint32();
        continue;
      case 40:
        if (n !== 322) break;
        i.filters = H.decode(r, r.uint32());
        continue;
      case 41:
        if (n !== 330) break;
        i.hybrid = ve.decode(r, r.uint32());
        continue;
      case 42:
        if (n !== 338) break;
        i.nearVector = te.decode(r, r.uint32());
        continue;
      case 43:
        if (n !== 346) break;
        i.nearObject = be.decode(r, r.uint32());
        continue;
      case 44:
        if (n !== 354) break;
        i.nearText = ae.decode(r, r.uint32());
        continue;
      case 45:
        if (n !== 362) break;
        i.nearImage = xe.decode(r, r.uint32());
        continue;
      case 46:
        if (n !== 370) break;
        i.nearAudio = Ce.decode(r, r.uint32());
        continue;
      case 47:
        if (n !== 378) break;
        i.nearVideo = Pe.decode(r, r.uint32());
        continue;
      case 48:
        if (n !== 386) break;
        i.nearDepth = Re.decode(r, r.uint32());
        continue;
      case 49:
        if (n !== 394) break;
        i.nearThermal = Ae.decode(r, r.uint32());
        continue;
      case 50:
        if (n !== 402) break;
        i.nearImu = Ne.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { collection: T(e24.collection) ? globalThis.String(e24.collection) : "", tenant: T(e24.tenant) ? globalThis.String(e24.tenant) : "", objectsCount: T(e24.objectsCount) ? globalThis.Boolean(e24.objectsCount) : false, aggregations: globalThis.Array.isArray(e24?.aggregations) ? e24.aggregations.map((t) => dr.fromJSON(t)) : [], objectLimit: T(e24.objectLimit) ? globalThis.Number(e24.objectLimit) : void 0, groupBy: T(e24.groupBy) ? mr.fromJSON(e24.groupBy) : void 0, limit: T(e24.limit) ? globalThis.Number(e24.limit) : void 0, filters: T(e24.filters) ? H.fromJSON(e24.filters) : void 0, hybrid: T(e24.hybrid) ? ve.fromJSON(e24.hybrid) : void 0, nearVector: T(e24.nearVector) ? te.fromJSON(e24.nearVector) : void 0, nearObject: T(e24.nearObject) ? be.fromJSON(e24.nearObject) : void 0, nearText: T(e24.nearText) ? ae.fromJSON(e24.nearText) : void 0, nearImage: T(e24.nearImage) ? xe.fromJSON(e24.nearImage) : void 0, nearAudio: T(e24.nearAudio) ? Ce.fromJSON(e24.nearAudio) : void 0, nearVideo: T(e24.nearVideo) ? Pe.fromJSON(e24.nearVideo) : void 0, nearDepth: T(e24.nearDepth) ? Re.fromJSON(e24.nearDepth) : void 0, nearThermal: T(e24.nearThermal) ? Ae.fromJSON(e24.nearThermal) : void 0, nearImu: T(e24.nearImu) ? Ne.fromJSON(e24.nearImu) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.collection !== "" && (t.collection = e24.collection), e24.tenant !== "" && (t.tenant = e24.tenant), e24.objectsCount !== false && (t.objectsCount = e24.objectsCount), e24.aggregations?.length && (t.aggregations = e24.aggregations.map((r) => dr.toJSON(r))), e24.objectLimit !== void 0 && (t.objectLimit = Math.round(e24.objectLimit)), e24.groupBy !== void 0 && (t.groupBy = mr.toJSON(e24.groupBy)), e24.limit !== void 0 && (t.limit = Math.round(e24.limit)), e24.filters !== void 0 && (t.filters = H.toJSON(e24.filters)), e24.hybrid !== void 0 && (t.hybrid = ve.toJSON(e24.hybrid)), e24.nearVector !== void 0 && (t.nearVector = te.toJSON(e24.nearVector)), e24.nearObject !== void 0 && (t.nearObject = be.toJSON(e24.nearObject)), e24.nearText !== void 0 && (t.nearText = ae.toJSON(e24.nearText)), e24.nearImage !== void 0 && (t.nearImage = xe.toJSON(e24.nearImage)), e24.nearAudio !== void 0 && (t.nearAudio = Ce.toJSON(e24.nearAudio)), e24.nearVideo !== void 0 && (t.nearVideo = Pe.toJSON(e24.nearVideo)), e24.nearDepth !== void 0 && (t.nearDepth = Re.toJSON(e24.nearDepth)), e24.nearThermal !== void 0 && (t.nearThermal = Ae.toJSON(e24.nearThermal)), e24.nearImu !== void 0 && (t.nearImu = Ne.toJSON(e24.nearImu)), t;
}, create(e24) {
  return ke.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Of();
  return t.collection = e24.collection ?? "", t.tenant = e24.tenant ?? "", t.objectsCount = e24.objectsCount ?? false, t.aggregations = e24.aggregations?.map((r) => dr.fromPartial(r)) || [], t.objectLimit = e24.objectLimit ?? void 0, t.groupBy = e24.groupBy !== void 0 && e24.groupBy !== null ? mr.fromPartial(e24.groupBy) : void 0, t.limit = e24.limit ?? void 0, t.filters = e24.filters !== void 0 && e24.filters !== null ? H.fromPartial(e24.filters) : void 0, t.hybrid = e24.hybrid !== void 0 && e24.hybrid !== null ? ve.fromPartial(e24.hybrid) : void 0, t.nearVector = e24.nearVector !== void 0 && e24.nearVector !== null ? te.fromPartial(e24.nearVector) : void 0, t.nearObject = e24.nearObject !== void 0 && e24.nearObject !== null ? be.fromPartial(e24.nearObject) : void 0, t.nearText = e24.nearText !== void 0 && e24.nearText !== null ? ae.fromPartial(e24.nearText) : void 0, t.nearImage = e24.nearImage !== void 0 && e24.nearImage !== null ? xe.fromPartial(e24.nearImage) : void 0, t.nearAudio = e24.nearAudio !== void 0 && e24.nearAudio !== null ? Ce.fromPartial(e24.nearAudio) : void 0, t.nearVideo = e24.nearVideo !== void 0 && e24.nearVideo !== null ? Pe.fromPartial(e24.nearVideo) : void 0, t.nearDepth = e24.nearDepth !== void 0 && e24.nearDepth !== null ? Re.fromPartial(e24.nearDepth) : void 0, t.nearThermal = e24.nearThermal !== void 0 && e24.nearThermal !== null ? Ae.fromPartial(e24.nearThermal) : void 0, t.nearImu = e24.nearImu !== void 0 && e24.nearImu !== null ? Ne.fromPartial(e24.nearImu) : void 0, t;
} };
function Sf() {
  return { property: "", int: void 0, number: void 0, text: void 0, boolean: void 0, date: void 0, reference: void 0 };
}
var dr = { encode(e24, t = R.default.Writer.create()) {
  return e24.property !== "" && t.uint32(10).string(e24.property), e24.int !== void 0 && cr.encode(e24.int, t.uint32(18).fork()).ldelim(), e24.number !== void 0 && lr.encode(e24.number, t.uint32(26).fork()).ldelim(), e24.text !== void 0 && fr.encode(e24.text, t.uint32(34).fork()).ldelim(), e24.boolean !== void 0 && pr.encode(e24.boolean, t.uint32(42).fork()).ldelim(), e24.date !== void 0 && gr.encode(e24.date, t.uint32(50).fork()).ldelim(), e24.reference !== void 0 && Di.encode(e24.reference, t.uint32(58).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Sf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.property = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.int = cr.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.number = lr.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.text = fr.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.boolean = pr.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.date = gr.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.reference = Di.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { property: T(e24.property) ? globalThis.String(e24.property) : "", int: T(e24.int) ? cr.fromJSON(e24.int) : void 0, number: T(e24.number) ? lr.fromJSON(e24.number) : void 0, text: T(e24.text) ? fr.fromJSON(e24.text) : void 0, boolean: T(e24.boolean) ? pr.fromJSON(e24.boolean) : void 0, date: T(e24.date) ? gr.fromJSON(e24.date) : void 0, reference: T(e24.reference) ? Di.fromJSON(e24.reference) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.property !== "" && (t.property = e24.property), e24.int !== void 0 && (t.int = cr.toJSON(e24.int)), e24.number !== void 0 && (t.number = lr.toJSON(e24.number)), e24.text !== void 0 && (t.text = fr.toJSON(e24.text)), e24.boolean !== void 0 && (t.boolean = pr.toJSON(e24.boolean)), e24.date !== void 0 && (t.date = gr.toJSON(e24.date)), e24.reference !== void 0 && (t.reference = Di.toJSON(e24.reference)), t;
}, create(e24) {
  return dr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Sf();
  return t.property = e24.property ?? "", t.int = e24.int !== void 0 && e24.int !== null ? cr.fromPartial(e24.int) : void 0, t.number = e24.number !== void 0 && e24.number !== null ? lr.fromPartial(e24.number) : void 0, t.text = e24.text !== void 0 && e24.text !== null ? fr.fromPartial(e24.text) : void 0, t.boolean = e24.boolean !== void 0 && e24.boolean !== null ? pr.fromPartial(e24.boolean) : void 0, t.date = e24.date !== void 0 && e24.date !== null ? gr.fromPartial(e24.date) : void 0, t.reference = e24.reference !== void 0 && e24.reference !== null ? Di.fromPartial(e24.reference) : void 0, t;
} };
function kf() {
  return { count: false, type: false, sum: false, mean: false, mode: false, median: false, maximum: false, minimum: false };
}
var cr = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== false && t.uint32(8).bool(e24.count), e24.type !== false && t.uint32(16).bool(e24.type), e24.sum !== false && t.uint32(24).bool(e24.sum), e24.mean !== false && t.uint32(32).bool(e24.mean), e24.mode !== false && t.uint32(40).bool(e24.mode), e24.median !== false && t.uint32(48).bool(e24.median), e24.maximum !== false && t.uint32(56).bool(e24.maximum), e24.minimum !== false && t.uint32(64).bool(e24.minimum), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = kf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = r.bool();
        continue;
      case 2:
        if (n !== 16) break;
        i.type = r.bool();
        continue;
      case 3:
        if (n !== 24) break;
        i.sum = r.bool();
        continue;
      case 4:
        if (n !== 32) break;
        i.mean = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.mode = r.bool();
        continue;
      case 6:
        if (n !== 48) break;
        i.median = r.bool();
        continue;
      case 7:
        if (n !== 56) break;
        i.maximum = r.bool();
        continue;
      case 8:
        if (n !== 64) break;
        i.minimum = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Boolean(e24.count) : false, type: T(e24.type) ? globalThis.Boolean(e24.type) : false, sum: T(e24.sum) ? globalThis.Boolean(e24.sum) : false, mean: T(e24.mean) ? globalThis.Boolean(e24.mean) : false, mode: T(e24.mode) ? globalThis.Boolean(e24.mode) : false, median: T(e24.median) ? globalThis.Boolean(e24.median) : false, maximum: T(e24.maximum) ? globalThis.Boolean(e24.maximum) : false, minimum: T(e24.minimum) ? globalThis.Boolean(e24.minimum) : false };
}, toJSON(e24) {
  let t = {};
  return e24.count !== false && (t.count = e24.count), e24.type !== false && (t.type = e24.type), e24.sum !== false && (t.sum = e24.sum), e24.mean !== false && (t.mean = e24.mean), e24.mode !== false && (t.mode = e24.mode), e24.median !== false && (t.median = e24.median), e24.maximum !== false && (t.maximum = e24.maximum), e24.minimum !== false && (t.minimum = e24.minimum), t;
}, create(e24) {
  return cr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = kf();
  return t.count = e24.count ?? false, t.type = e24.type ?? false, t.sum = e24.sum ?? false, t.mean = e24.mean ?? false, t.mode = e24.mode ?? false, t.median = e24.median ?? false, t.maximum = e24.maximum ?? false, t.minimum = e24.minimum ?? false, t;
} };
function If() {
  return { count: false, type: false, sum: false, mean: false, mode: false, median: false, maximum: false, minimum: false };
}
var lr = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== false && t.uint32(8).bool(e24.count), e24.type !== false && t.uint32(16).bool(e24.type), e24.sum !== false && t.uint32(24).bool(e24.sum), e24.mean !== false && t.uint32(32).bool(e24.mean), e24.mode !== false && t.uint32(40).bool(e24.mode), e24.median !== false && t.uint32(48).bool(e24.median), e24.maximum !== false && t.uint32(56).bool(e24.maximum), e24.minimum !== false && t.uint32(64).bool(e24.minimum), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = If();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = r.bool();
        continue;
      case 2:
        if (n !== 16) break;
        i.type = r.bool();
        continue;
      case 3:
        if (n !== 24) break;
        i.sum = r.bool();
        continue;
      case 4:
        if (n !== 32) break;
        i.mean = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.mode = r.bool();
        continue;
      case 6:
        if (n !== 48) break;
        i.median = r.bool();
        continue;
      case 7:
        if (n !== 56) break;
        i.maximum = r.bool();
        continue;
      case 8:
        if (n !== 64) break;
        i.minimum = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Boolean(e24.count) : false, type: T(e24.type) ? globalThis.Boolean(e24.type) : false, sum: T(e24.sum) ? globalThis.Boolean(e24.sum) : false, mean: T(e24.mean) ? globalThis.Boolean(e24.mean) : false, mode: T(e24.mode) ? globalThis.Boolean(e24.mode) : false, median: T(e24.median) ? globalThis.Boolean(e24.median) : false, maximum: T(e24.maximum) ? globalThis.Boolean(e24.maximum) : false, minimum: T(e24.minimum) ? globalThis.Boolean(e24.minimum) : false };
}, toJSON(e24) {
  let t = {};
  return e24.count !== false && (t.count = e24.count), e24.type !== false && (t.type = e24.type), e24.sum !== false && (t.sum = e24.sum), e24.mean !== false && (t.mean = e24.mean), e24.mode !== false && (t.mode = e24.mode), e24.median !== false && (t.median = e24.median), e24.maximum !== false && (t.maximum = e24.maximum), e24.minimum !== false && (t.minimum = e24.minimum), t;
}, create(e24) {
  return lr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = If();
  return t.count = e24.count ?? false, t.type = e24.type ?? false, t.sum = e24.sum ?? false, t.mean = e24.mean ?? false, t.mode = e24.mode ?? false, t.median = e24.median ?? false, t.maximum = e24.maximum ?? false, t.minimum = e24.minimum ?? false, t;
} };
function _f() {
  return { count: false, type: false, topOccurences: false, topOccurencesLimit: void 0 };
}
var fr = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== false && t.uint32(8).bool(e24.count), e24.type !== false && t.uint32(16).bool(e24.type), e24.topOccurences !== false && t.uint32(24).bool(e24.topOccurences), e24.topOccurencesLimit !== void 0 && t.uint32(32).uint32(e24.topOccurencesLimit), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = _f();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = r.bool();
        continue;
      case 2:
        if (n !== 16) break;
        i.type = r.bool();
        continue;
      case 3:
        if (n !== 24) break;
        i.topOccurences = r.bool();
        continue;
      case 4:
        if (n !== 32) break;
        i.topOccurencesLimit = r.uint32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Boolean(e24.count) : false, type: T(e24.type) ? globalThis.Boolean(e24.type) : false, topOccurences: T(e24.topOccurences) ? globalThis.Boolean(e24.topOccurences) : false, topOccurencesLimit: T(e24.topOccurencesLimit) ? globalThis.Number(e24.topOccurencesLimit) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.count !== false && (t.count = e24.count), e24.type !== false && (t.type = e24.type), e24.topOccurences !== false && (t.topOccurences = e24.topOccurences), e24.topOccurencesLimit !== void 0 && (t.topOccurencesLimit = Math.round(e24.topOccurencesLimit)), t;
}, create(e24) {
  return fr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = _f();
  return t.count = e24.count ?? false, t.type = e24.type ?? false, t.topOccurences = e24.topOccurences ?? false, t.topOccurencesLimit = e24.topOccurencesLimit ?? void 0, t;
} };
function Bf() {
  return { count: false, type: false, totalTrue: false, totalFalse: false, percentageTrue: false, percentageFalse: false };
}
var pr = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== false && t.uint32(8).bool(e24.count), e24.type !== false && t.uint32(16).bool(e24.type), e24.totalTrue !== false && t.uint32(24).bool(e24.totalTrue), e24.totalFalse !== false && t.uint32(32).bool(e24.totalFalse), e24.percentageTrue !== false && t.uint32(40).bool(e24.percentageTrue), e24.percentageFalse !== false && t.uint32(48).bool(e24.percentageFalse), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Bf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = r.bool();
        continue;
      case 2:
        if (n !== 16) break;
        i.type = r.bool();
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTrue = r.bool();
        continue;
      case 4:
        if (n !== 32) break;
        i.totalFalse = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.percentageTrue = r.bool();
        continue;
      case 6:
        if (n !== 48) break;
        i.percentageFalse = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Boolean(e24.count) : false, type: T(e24.type) ? globalThis.Boolean(e24.type) : false, totalTrue: T(e24.totalTrue) ? globalThis.Boolean(e24.totalTrue) : false, totalFalse: T(e24.totalFalse) ? globalThis.Boolean(e24.totalFalse) : false, percentageTrue: T(e24.percentageTrue) ? globalThis.Boolean(e24.percentageTrue) : false, percentageFalse: T(e24.percentageFalse) ? globalThis.Boolean(e24.percentageFalse) : false };
}, toJSON(e24) {
  let t = {};
  return e24.count !== false && (t.count = e24.count), e24.type !== false && (t.type = e24.type), e24.totalTrue !== false && (t.totalTrue = e24.totalTrue), e24.totalFalse !== false && (t.totalFalse = e24.totalFalse), e24.percentageTrue !== false && (t.percentageTrue = e24.percentageTrue), e24.percentageFalse !== false && (t.percentageFalse = e24.percentageFalse), t;
}, create(e24) {
  return pr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Bf();
  return t.count = e24.count ?? false, t.type = e24.type ?? false, t.totalTrue = e24.totalTrue ?? false, t.totalFalse = e24.totalFalse ?? false, t.percentageTrue = e24.percentageTrue ?? false, t.percentageFalse = e24.percentageFalse ?? false, t;
} };
function Gf() {
  return { count: false, type: false, median: false, mode: false, maximum: false, minimum: false };
}
var gr = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== false && t.uint32(8).bool(e24.count), e24.type !== false && t.uint32(16).bool(e24.type), e24.median !== false && t.uint32(24).bool(e24.median), e24.mode !== false && t.uint32(32).bool(e24.mode), e24.maximum !== false && t.uint32(40).bool(e24.maximum), e24.minimum !== false && t.uint32(48).bool(e24.minimum), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Gf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = r.bool();
        continue;
      case 2:
        if (n !== 16) break;
        i.type = r.bool();
        continue;
      case 3:
        if (n !== 24) break;
        i.median = r.bool();
        continue;
      case 4:
        if (n !== 32) break;
        i.mode = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.maximum = r.bool();
        continue;
      case 6:
        if (n !== 48) break;
        i.minimum = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Boolean(e24.count) : false, type: T(e24.type) ? globalThis.Boolean(e24.type) : false, median: T(e24.median) ? globalThis.Boolean(e24.median) : false, mode: T(e24.mode) ? globalThis.Boolean(e24.mode) : false, maximum: T(e24.maximum) ? globalThis.Boolean(e24.maximum) : false, minimum: T(e24.minimum) ? globalThis.Boolean(e24.minimum) : false };
}, toJSON(e24) {
  let t = {};
  return e24.count !== false && (t.count = e24.count), e24.type !== false && (t.type = e24.type), e24.median !== false && (t.median = e24.median), e24.mode !== false && (t.mode = e24.mode), e24.maximum !== false && (t.maximum = e24.maximum), e24.minimum !== false && (t.minimum = e24.minimum), t;
}, create(e24) {
  return gr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Gf();
  return t.count = e24.count ?? false, t.type = e24.type ?? false, t.median = e24.median ?? false, t.mode = e24.mode ?? false, t.maximum = e24.maximum ?? false, t.minimum = e24.minimum ?? false, t;
} };
function wf() {
  return { type: false, pointingTo: false };
}
var Di = { encode(e24, t = R.default.Writer.create()) {
  return e24.type !== false && t.uint32(8).bool(e24.type), e24.pointingTo !== false && t.uint32(16).bool(e24.pointingTo), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = wf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.type = r.bool();
        continue;
      case 2:
        if (n !== 16) break;
        i.pointingTo = r.bool();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { type: T(e24.type) ? globalThis.Boolean(e24.type) : false, pointingTo: T(e24.pointingTo) ? globalThis.Boolean(e24.pointingTo) : false };
}, toJSON(e24) {
  let t = {};
  return e24.type !== false && (t.type = e24.type), e24.pointingTo !== false && (t.pointingTo = e24.pointingTo), t;
}, create(e24) {
  return Di.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = wf();
  return t.type = e24.type ?? false, t.pointingTo = e24.pointingTo ?? false, t;
} };
function Mf() {
  return { collection: "", property: "" };
}
var mr = { encode(e24, t = R.default.Writer.create()) {
  return e24.collection !== "" && t.uint32(10).string(e24.collection), e24.property !== "" && t.uint32(18).string(e24.property), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Mf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.collection = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.property = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { collection: T(e24.collection) ? globalThis.String(e24.collection) : "", property: T(e24.property) ? globalThis.String(e24.property) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.collection !== "" && (t.collection = e24.collection), e24.property !== "" && (t.property = e24.property), t;
}, create(e24) {
  return mr.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Mf();
  return t.collection = e24.collection ?? "", t.property = e24.property ?? "", t;
} };
function Ef() {
  return { took: 0, singleResult: void 0, groupedResults: void 0 };
}
var xs = { encode(e24, t = R.default.Writer.create()) {
  return e24.took !== 0 && t.uint32(13).float(e24.took), e24.singleResult !== void 0 && Ki.encode(e24.singleResult, t.uint32(18).fork()).ldelim(), e24.groupedResults !== void 0 && Xi.encode(e24.groupedResults, t.uint32(26).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ef();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.took = r.float();
        continue;
      case 2:
        if (n !== 18) break;
        i.singleResult = Ki.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.groupedResults = Xi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { took: T(e24.took) ? globalThis.Number(e24.took) : 0, singleResult: T(e24.singleResult) ? Ki.fromJSON(e24.singleResult) : void 0, groupedResults: T(e24.groupedResults) ? Xi.fromJSON(e24.groupedResults) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.took !== 0 && (t.took = e24.took), e24.singleResult !== void 0 && (t.singleResult = Ki.toJSON(e24.singleResult)), e24.groupedResults !== void 0 && (t.groupedResults = Xi.toJSON(e24.groupedResults)), t;
}, create(e24) {
  return xs.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ef();
  return t.took = e24.took ?? 0, t.singleResult = e24.singleResult !== void 0 && e24.singleResult !== null ? Ki.fromPartial(e24.singleResult) : void 0, t.groupedResults = e24.groupedResults !== void 0 && e24.groupedResults !== null ? Xi.fromPartial(e24.groupedResults) : void 0, t;
} };
function Uf() {
  return { aggregations: [] };
}
var Tt = { encode(e24, t = R.default.Writer.create()) {
  for (let r of e24.aggregations) Fi.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Uf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.aggregations.push(Fi.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { aggregations: globalThis.Array.isArray(e24?.aggregations) ? e24.aggregations.map((t) => Fi.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.aggregations?.length && (t.aggregations = e24.aggregations.map((r) => Fi.toJSON(r))), t;
}, create(e24) {
  return Tt.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Uf();
  return t.aggregations = e24.aggregations?.map((r) => Fi.fromPartial(r)) || [], t;
} };
function Df() {
  return { property: "", int: void 0, number: void 0, text: void 0, boolean: void 0, date: void 0, reference: void 0 };
}
var Fi = { encode(e24, t = R.default.Writer.create()) {
  return e24.property !== "" && t.uint32(10).string(e24.property), e24.int !== void 0 && Wi.encode(e24.int, t.uint32(18).fork()).ldelim(), e24.number !== void 0 && qi.encode(e24.number, t.uint32(26).fork()).ldelim(), e24.text !== void 0 && Li.encode(e24.text, t.uint32(34).fork()).ldelim(), e24.boolean !== void 0 && $i.encode(e24.boolean, t.uint32(42).fork()).ldelim(), e24.date !== void 0 && Hi.encode(e24.date, t.uint32(50).fork()).ldelim(), e24.reference !== void 0 && Qi.encode(e24.reference, t.uint32(58).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Df();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.property = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.int = Wi.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.number = qi.decode(r, r.uint32());
        continue;
      case 4:
        if (n !== 34) break;
        i.text = Li.decode(r, r.uint32());
        continue;
      case 5:
        if (n !== 42) break;
        i.boolean = $i.decode(r, r.uint32());
        continue;
      case 6:
        if (n !== 50) break;
        i.date = Hi.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.reference = Qi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { property: T(e24.property) ? globalThis.String(e24.property) : "", int: T(e24.int) ? Wi.fromJSON(e24.int) : void 0, number: T(e24.number) ? qi.fromJSON(e24.number) : void 0, text: T(e24.text) ? Li.fromJSON(e24.text) : void 0, boolean: T(e24.boolean) ? $i.fromJSON(e24.boolean) : void 0, date: T(e24.date) ? Hi.fromJSON(e24.date) : void 0, reference: T(e24.reference) ? Qi.fromJSON(e24.reference) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.property !== "" && (t.property = e24.property), e24.int !== void 0 && (t.int = Wi.toJSON(e24.int)), e24.number !== void 0 && (t.number = qi.toJSON(e24.number)), e24.text !== void 0 && (t.text = Li.toJSON(e24.text)), e24.boolean !== void 0 && (t.boolean = $i.toJSON(e24.boolean)), e24.date !== void 0 && (t.date = Hi.toJSON(e24.date)), e24.reference !== void 0 && (t.reference = Qi.toJSON(e24.reference)), t;
}, create(e24) {
  return Fi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Df();
  return t.property = e24.property ?? "", t.int = e24.int !== void 0 && e24.int !== null ? Wi.fromPartial(e24.int) : void 0, t.number = e24.number !== void 0 && e24.number !== null ? qi.fromPartial(e24.number) : void 0, t.text = e24.text !== void 0 && e24.text !== null ? Li.fromPartial(e24.text) : void 0, t.boolean = e24.boolean !== void 0 && e24.boolean !== null ? $i.fromPartial(e24.boolean) : void 0, t.date = e24.date !== void 0 && e24.date !== null ? Hi.fromPartial(e24.date) : void 0, t.reference = e24.reference !== void 0 && e24.reference !== null ? Qi.fromPartial(e24.reference) : void 0, t;
} };
function Ff() {
  return { count: void 0, type: void 0, mean: void 0, median: void 0, mode: void 0, maximum: void 0, minimum: void 0, sum: void 0 };
}
var Wi = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== void 0 && t.uint32(8).int64(e24.count), e24.type !== void 0 && t.uint32(18).string(e24.type), e24.mean !== void 0 && t.uint32(25).double(e24.mean), e24.median !== void 0 && t.uint32(33).double(e24.median), e24.mode !== void 0 && t.uint32(40).int64(e24.mode), e24.maximum !== void 0 && t.uint32(48).int64(e24.maximum), e24.minimum !== void 0 && t.uint32(56).int64(e24.minimum), e24.sum !== void 0 && t.uint32(64).int64(e24.sum), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Ff();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = Se(r.int64());
        continue;
      case 2:
        if (n !== 18) break;
        i.type = r.string();
        continue;
      case 3:
        if (n !== 25) break;
        i.mean = r.double();
        continue;
      case 4:
        if (n !== 33) break;
        i.median = r.double();
        continue;
      case 5:
        if (n !== 40) break;
        i.mode = Se(r.int64());
        continue;
      case 6:
        if (n !== 48) break;
        i.maximum = Se(r.int64());
        continue;
      case 7:
        if (n !== 56) break;
        i.minimum = Se(r.int64());
        continue;
      case 8:
        if (n !== 64) break;
        i.sum = Se(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Number(e24.count) : void 0, type: T(e24.type) ? globalThis.String(e24.type) : void 0, mean: T(e24.mean) ? globalThis.Number(e24.mean) : void 0, median: T(e24.median) ? globalThis.Number(e24.median) : void 0, mode: T(e24.mode) ? globalThis.Number(e24.mode) : void 0, maximum: T(e24.maximum) ? globalThis.Number(e24.maximum) : void 0, minimum: T(e24.minimum) ? globalThis.Number(e24.minimum) : void 0, sum: T(e24.sum) ? globalThis.Number(e24.sum) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.count !== void 0 && (t.count = Math.round(e24.count)), e24.type !== void 0 && (t.type = e24.type), e24.mean !== void 0 && (t.mean = e24.mean), e24.median !== void 0 && (t.median = e24.median), e24.mode !== void 0 && (t.mode = Math.round(e24.mode)), e24.maximum !== void 0 && (t.maximum = Math.round(e24.maximum)), e24.minimum !== void 0 && (t.minimum = Math.round(e24.minimum)), e24.sum !== void 0 && (t.sum = Math.round(e24.sum)), t;
}, create(e24) {
  return Wi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Ff();
  return t.count = e24.count ?? void 0, t.type = e24.type ?? void 0, t.mean = e24.mean ?? void 0, t.median = e24.median ?? void 0, t.mode = e24.mode ?? void 0, t.maximum = e24.maximum ?? void 0, t.minimum = e24.minimum ?? void 0, t.sum = e24.sum ?? void 0, t;
} };
function Wf() {
  return { count: void 0, type: void 0, mean: void 0, median: void 0, mode: void 0, maximum: void 0, minimum: void 0, sum: void 0 };
}
var qi = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== void 0 && t.uint32(8).int64(e24.count), e24.type !== void 0 && t.uint32(18).string(e24.type), e24.mean !== void 0 && t.uint32(25).double(e24.mean), e24.median !== void 0 && t.uint32(33).double(e24.median), e24.mode !== void 0 && t.uint32(41).double(e24.mode), e24.maximum !== void 0 && t.uint32(49).double(e24.maximum), e24.minimum !== void 0 && t.uint32(57).double(e24.minimum), e24.sum !== void 0 && t.uint32(65).double(e24.sum), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Wf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = Se(r.int64());
        continue;
      case 2:
        if (n !== 18) break;
        i.type = r.string();
        continue;
      case 3:
        if (n !== 25) break;
        i.mean = r.double();
        continue;
      case 4:
        if (n !== 33) break;
        i.median = r.double();
        continue;
      case 5:
        if (n !== 41) break;
        i.mode = r.double();
        continue;
      case 6:
        if (n !== 49) break;
        i.maximum = r.double();
        continue;
      case 7:
        if (n !== 57) break;
        i.minimum = r.double();
        continue;
      case 8:
        if (n !== 65) break;
        i.sum = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Number(e24.count) : void 0, type: T(e24.type) ? globalThis.String(e24.type) : void 0, mean: T(e24.mean) ? globalThis.Number(e24.mean) : void 0, median: T(e24.median) ? globalThis.Number(e24.median) : void 0, mode: T(e24.mode) ? globalThis.Number(e24.mode) : void 0, maximum: T(e24.maximum) ? globalThis.Number(e24.maximum) : void 0, minimum: T(e24.minimum) ? globalThis.Number(e24.minimum) : void 0, sum: T(e24.sum) ? globalThis.Number(e24.sum) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.count !== void 0 && (t.count = Math.round(e24.count)), e24.type !== void 0 && (t.type = e24.type), e24.mean !== void 0 && (t.mean = e24.mean), e24.median !== void 0 && (t.median = e24.median), e24.mode !== void 0 && (t.mode = e24.mode), e24.maximum !== void 0 && (t.maximum = e24.maximum), e24.minimum !== void 0 && (t.minimum = e24.minimum), e24.sum !== void 0 && (t.sum = e24.sum), t;
}, create(e24) {
  return qi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Wf();
  return t.count = e24.count ?? void 0, t.type = e24.type ?? void 0, t.mean = e24.mean ?? void 0, t.median = e24.median ?? void 0, t.mode = e24.mode ?? void 0, t.maximum = e24.maximum ?? void 0, t.minimum = e24.minimum ?? void 0, t.sum = e24.sum ?? void 0, t;
} };
function qf() {
  return { count: void 0, type: void 0, topOccurences: void 0 };
}
var Li = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== void 0 && t.uint32(8).int64(e24.count), e24.type !== void 0 && t.uint32(18).string(e24.type), e24.topOccurences !== void 0 && Ji.encode(e24.topOccurences, t.uint32(26).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = qf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = Se(r.int64());
        continue;
      case 2:
        if (n !== 18) break;
        i.type = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.topOccurences = Ji.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Number(e24.count) : void 0, type: T(e24.type) ? globalThis.String(e24.type) : void 0, topOccurences: T(e24.topOccurences) ? Ji.fromJSON(e24.topOccurences) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.count !== void 0 && (t.count = Math.round(e24.count)), e24.type !== void 0 && (t.type = e24.type), e24.topOccurences !== void 0 && (t.topOccurences = Ji.toJSON(e24.topOccurences)), t;
}, create(e24) {
  return Li.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = qf();
  return t.count = e24.count ?? void 0, t.type = e24.type ?? void 0, t.topOccurences = e24.topOccurences !== void 0 && e24.topOccurences !== null ? Ji.fromPartial(e24.topOccurences) : void 0, t;
} };
function Lf() {
  return { items: [] };
}
var Ji = { encode(e24, t = R.default.Writer.create()) {
  for (let r of e24.items) zi.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Lf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.items.push(zi.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { items: globalThis.Array.isArray(e24?.items) ? e24.items.map((t) => zi.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.items?.length && (t.items = e24.items.map((r) => zi.toJSON(r))), t;
}, create(e24) {
  return Ji.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Lf();
  return t.items = e24.items?.map((r) => zi.fromPartial(r)) || [], t;
} };
function Jf() {
  return { value: "", occurs: 0 };
}
var zi = { encode(e24, t = R.default.Writer.create()) {
  return e24.value !== "" && t.uint32(10).string(e24.value), e24.occurs !== 0 && t.uint32(16).int64(e24.occurs), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Jf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.value = r.string();
        continue;
      case 2:
        if (n !== 16) break;
        i.occurs = Se(r.int64());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { value: T(e24.value) ? globalThis.String(e24.value) : "", occurs: T(e24.occurs) ? globalThis.Number(e24.occurs) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.value !== "" && (t.value = e24.value), e24.occurs !== 0 && (t.occurs = Math.round(e24.occurs)), t;
}, create(e24) {
  return zi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Jf();
  return t.value = e24.value ?? "", t.occurs = e24.occurs ?? 0, t;
} };
function zf() {
  return { count: void 0, type: void 0, totalTrue: void 0, totalFalse: void 0, percentageTrue: void 0, percentageFalse: void 0 };
}
var $i = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== void 0 && t.uint32(8).int64(e24.count), e24.type !== void 0 && t.uint32(18).string(e24.type), e24.totalTrue !== void 0 && t.uint32(24).int64(e24.totalTrue), e24.totalFalse !== void 0 && t.uint32(32).int64(e24.totalFalse), e24.percentageTrue !== void 0 && t.uint32(41).double(e24.percentageTrue), e24.percentageFalse !== void 0 && t.uint32(49).double(e24.percentageFalse), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = zf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = Se(r.int64());
        continue;
      case 2:
        if (n !== 18) break;
        i.type = r.string();
        continue;
      case 3:
        if (n !== 24) break;
        i.totalTrue = Se(r.int64());
        continue;
      case 4:
        if (n !== 32) break;
        i.totalFalse = Se(r.int64());
        continue;
      case 5:
        if (n !== 41) break;
        i.percentageTrue = r.double();
        continue;
      case 6:
        if (n !== 49) break;
        i.percentageFalse = r.double();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Number(e24.count) : void 0, type: T(e24.type) ? globalThis.String(e24.type) : void 0, totalTrue: T(e24.totalTrue) ? globalThis.Number(e24.totalTrue) : void 0, totalFalse: T(e24.totalFalse) ? globalThis.Number(e24.totalFalse) : void 0, percentageTrue: T(e24.percentageTrue) ? globalThis.Number(e24.percentageTrue) : void 0, percentageFalse: T(e24.percentageFalse) ? globalThis.Number(e24.percentageFalse) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.count !== void 0 && (t.count = Math.round(e24.count)), e24.type !== void 0 && (t.type = e24.type), e24.totalTrue !== void 0 && (t.totalTrue = Math.round(e24.totalTrue)), e24.totalFalse !== void 0 && (t.totalFalse = Math.round(e24.totalFalse)), e24.percentageTrue !== void 0 && (t.percentageTrue = e24.percentageTrue), e24.percentageFalse !== void 0 && (t.percentageFalse = e24.percentageFalse), t;
}, create(e24) {
  return $i.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = zf();
  return t.count = e24.count ?? void 0, t.type = e24.type ?? void 0, t.totalTrue = e24.totalTrue ?? void 0, t.totalFalse = e24.totalFalse ?? void 0, t.percentageTrue = e24.percentageTrue ?? void 0, t.percentageFalse = e24.percentageFalse ?? void 0, t;
} };
function $f() {
  return { count: void 0, type: void 0, median: void 0, mode: void 0, maximum: void 0, minimum: void 0 };
}
var Hi = { encode(e24, t = R.default.Writer.create()) {
  return e24.count !== void 0 && t.uint32(8).int64(e24.count), e24.type !== void 0 && t.uint32(18).string(e24.type), e24.median !== void 0 && t.uint32(26).string(e24.median), e24.mode !== void 0 && t.uint32(34).string(e24.mode), e24.maximum !== void 0 && t.uint32(42).string(e24.maximum), e24.minimum !== void 0 && t.uint32(50).string(e24.minimum), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = $f();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.count = Se(r.int64());
        continue;
      case 2:
        if (n !== 18) break;
        i.type = r.string();
        continue;
      case 3:
        if (n !== 26) break;
        i.median = r.string();
        continue;
      case 4:
        if (n !== 34) break;
        i.mode = r.string();
        continue;
      case 5:
        if (n !== 42) break;
        i.maximum = r.string();
        continue;
      case 6:
        if (n !== 50) break;
        i.minimum = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { count: T(e24.count) ? globalThis.Number(e24.count) : void 0, type: T(e24.type) ? globalThis.String(e24.type) : void 0, median: T(e24.median) ? globalThis.String(e24.median) : void 0, mode: T(e24.mode) ? globalThis.String(e24.mode) : void 0, maximum: T(e24.maximum) ? globalThis.String(e24.maximum) : void 0, minimum: T(e24.minimum) ? globalThis.String(e24.minimum) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.count !== void 0 && (t.count = Math.round(e24.count)), e24.type !== void 0 && (t.type = e24.type), e24.median !== void 0 && (t.median = e24.median), e24.mode !== void 0 && (t.mode = e24.mode), e24.maximum !== void 0 && (t.maximum = e24.maximum), e24.minimum !== void 0 && (t.minimum = e24.minimum), t;
}, create(e24) {
  return Hi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = $f();
  return t.count = e24.count ?? void 0, t.type = e24.type ?? void 0, t.median = e24.median ?? void 0, t.mode = e24.mode ?? void 0, t.maximum = e24.maximum ?? void 0, t.minimum = e24.minimum ?? void 0, t;
} };
function Hf() {
  return { type: void 0, pointingTo: [] };
}
var Qi = { encode(e24, t = R.default.Writer.create()) {
  e24.type !== void 0 && t.uint32(10).string(e24.type);
  for (let r of e24.pointingTo) t.uint32(18).string(r);
  return t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Hf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.type = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.pointingTo.push(r.string());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { type: T(e24.type) ? globalThis.String(e24.type) : void 0, pointingTo: globalThis.Array.isArray(e24?.pointingTo) ? e24.pointingTo.map((t) => globalThis.String(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.type !== void 0 && (t.type = e24.type), e24.pointingTo?.length && (t.pointingTo = e24.pointingTo), t;
}, create(e24) {
  return Qi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Hf();
  return t.type = e24.type ?? void 0, t.pointingTo = e24.pointingTo?.map((r) => r) || [], t;
} };
function Qf() {
  return { objectsCount: void 0, aggregations: void 0 };
}
var Ki = { encode(e24, t = R.default.Writer.create()) {
  return e24.objectsCount !== void 0 && t.uint32(8).int64(e24.objectsCount), e24.aggregations !== void 0 && Tt.encode(e24.aggregations, t.uint32(18).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Qf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.objectsCount = Se(r.int64());
        continue;
      case 2:
        if (n !== 18) break;
        i.aggregations = Tt.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { objectsCount: T(e24.objectsCount) ? globalThis.Number(e24.objectsCount) : void 0, aggregations: T(e24.aggregations) ? Tt.fromJSON(e24.aggregations) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.objectsCount !== void 0 && (t.objectsCount = Math.round(e24.objectsCount)), e24.aggregations !== void 0 && (t.aggregations = Tt.toJSON(e24.aggregations)), t;
}, create(e24) {
  return Ki.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Qf();
  return t.objectsCount = e24.objectsCount ?? void 0, t.aggregations = e24.aggregations !== void 0 && e24.aggregations !== null ? Tt.fromPartial(e24.aggregations) : void 0, t;
} };
function Kf() {
  return { objectsCount: void 0, aggregations: void 0, groupedBy: void 0 };
}
var Yi = { encode(e24, t = R.default.Writer.create()) {
  return e24.objectsCount !== void 0 && t.uint32(8).int64(e24.objectsCount), e24.aggregations !== void 0 && Tt.encode(e24.aggregations, t.uint32(18).fork()).ldelim(), e24.groupedBy !== void 0 && Zi.encode(e24.groupedBy, t.uint32(26).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Kf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.objectsCount = Se(r.int64());
        continue;
      case 2:
        if (n !== 18) break;
        i.aggregations = Tt.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 26) break;
        i.groupedBy = Zi.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { objectsCount: T(e24.objectsCount) ? globalThis.Number(e24.objectsCount) : void 0, aggregations: T(e24.aggregations) ? Tt.fromJSON(e24.aggregations) : void 0, groupedBy: T(e24.groupedBy) ? Zi.fromJSON(e24.groupedBy) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.objectsCount !== void 0 && (t.objectsCount = Math.round(e24.objectsCount)), e24.aggregations !== void 0 && (t.aggregations = Tt.toJSON(e24.aggregations)), e24.groupedBy !== void 0 && (t.groupedBy = Zi.toJSON(e24.groupedBy)), t;
}, create(e24) {
  return Yi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Kf();
  return t.objectsCount = e24.objectsCount ?? void 0, t.aggregations = e24.aggregations !== void 0 && e24.aggregations !== null ? Tt.fromPartial(e24.aggregations) : void 0, t.groupedBy = e24.groupedBy !== void 0 && e24.groupedBy !== null ? Zi.fromPartial(e24.groupedBy) : void 0, t;
} };
function Yf() {
  return { path: [], text: void 0, int: void 0, boolean: void 0, number: void 0, texts: void 0, ints: void 0, booleans: void 0, numbers: void 0, geo: void 0 };
}
var Zi = { encode(e24, t = R.default.Writer.create()) {
  for (let r of e24.path) t.uint32(10).string(r);
  return e24.text !== void 0 && t.uint32(18).string(e24.text), e24.int !== void 0 && t.uint32(24).int64(e24.int), e24.boolean !== void 0 && t.uint32(32).bool(e24.boolean), e24.number !== void 0 && t.uint32(41).double(e24.number), e24.texts !== void 0 && m.encode(e24.texts, t.uint32(50).fork()).ldelim(), e24.ints !== void 0 && rt.encode(e24.ints, t.uint32(58).fork()).ldelim(), e24.booleans !== void 0 && it.encode(e24.booleans, t.uint32(66).fork()).ldelim(), e24.numbers !== void 0 && nt.encode(e24.numbers, t.uint32(74).fork()).ldelim(), e24.geo !== void 0 && at.encode(e24.geo, t.uint32(82).fork()).ldelim(), t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Yf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.path.push(r.string());
        continue;
      case 2:
        if (n !== 18) break;
        i.text = r.string();
        continue;
      case 3:
        if (n !== 24) break;
        i.int = Se(r.int64());
        continue;
      case 4:
        if (n !== 32) break;
        i.boolean = r.bool();
        continue;
      case 5:
        if (n !== 41) break;
        i.number = r.double();
        continue;
      case 6:
        if (n !== 50) break;
        i.texts = m.decode(r, r.uint32());
        continue;
      case 7:
        if (n !== 58) break;
        i.ints = rt.decode(r, r.uint32());
        continue;
      case 8:
        if (n !== 66) break;
        i.booleans = it.decode(r, r.uint32());
        continue;
      case 9:
        if (n !== 74) break;
        i.numbers = nt.decode(r, r.uint32());
        continue;
      case 10:
        if (n !== 82) break;
        i.geo = at.decode(r, r.uint32());
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { path: globalThis.Array.isArray(e24?.path) ? e24.path.map((t) => globalThis.String(t)) : [], text: T(e24.text) ? globalThis.String(e24.text) : void 0, int: T(e24.int) ? globalThis.Number(e24.int) : void 0, boolean: T(e24.boolean) ? globalThis.Boolean(e24.boolean) : void 0, number: T(e24.number) ? globalThis.Number(e24.number) : void 0, texts: T(e24.texts) ? m.fromJSON(e24.texts) : void 0, ints: T(e24.ints) ? rt.fromJSON(e24.ints) : void 0, booleans: T(e24.booleans) ? it.fromJSON(e24.booleans) : void 0, numbers: T(e24.numbers) ? nt.fromJSON(e24.numbers) : void 0, geo: T(e24.geo) ? at.fromJSON(e24.geo) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.path?.length && (t.path = e24.path), e24.text !== void 0 && (t.text = e24.text), e24.int !== void 0 && (t.int = Math.round(e24.int)), e24.boolean !== void 0 && (t.boolean = e24.boolean), e24.number !== void 0 && (t.number = e24.number), e24.texts !== void 0 && (t.texts = m.toJSON(e24.texts)), e24.ints !== void 0 && (t.ints = rt.toJSON(e24.ints)), e24.booleans !== void 0 && (t.booleans = it.toJSON(e24.booleans)), e24.numbers !== void 0 && (t.numbers = nt.toJSON(e24.numbers)), e24.geo !== void 0 && (t.geo = at.toJSON(e24.geo)), t;
}, create(e24) {
  return Zi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Yf();
  return t.path = e24.path?.map((r) => r) || [], t.text = e24.text ?? void 0, t.int = e24.int ?? void 0, t.boolean = e24.boolean ?? void 0, t.number = e24.number ?? void 0, t.texts = e24.texts !== void 0 && e24.texts !== null ? m.fromPartial(e24.texts) : void 0, t.ints = e24.ints !== void 0 && e24.ints !== null ? rt.fromPartial(e24.ints) : void 0, t.booleans = e24.booleans !== void 0 && e24.booleans !== null ? it.fromPartial(e24.booleans) : void 0, t.numbers = e24.numbers !== void 0 && e24.numbers !== null ? nt.fromPartial(e24.numbers) : void 0, t.geo = e24.geo !== void 0 && e24.geo !== null ? at.fromPartial(e24.geo) : void 0, t;
} };
function Zf() {
  return { groups: [] };
}
var Xi = { encode(e24, t = R.default.Writer.create()) {
  for (let r of e24.groups) Yi.encode(r, t.uint32(10).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof R.default.Reader ? e24 : R.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Zf();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.groups.push(Yi.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { groups: globalThis.Array.isArray(e24?.groups) ? e24.groups.map((t) => Yi.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.groups?.length && (t.groups = e24.groups.map((r) => Yi.toJSON(r))), t;
}, create(e24) {
  return Xi.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Zf();
  return t.groups = e24.groups?.map((r) => Yi.fromPartial(r)) || [], t;
} };
function Se(e24) {
  if (e24.gt(globalThis.Number.MAX_SAFE_INTEGER)) throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  return e24.toNumber();
}
R.default.util.Long !== long_default && (R.default.util.Long = long_default, R.default.configure());
function T(e24) {
  return e24 != null;
}
var X = class {
  static isFilters = (t) => t instanceof ga;
  static isText = (t) => typeof t == "string";
  static isTextArray = (t) => t instanceof Array && t.every((r) => typeof r == "string");
  static isInt = (t) => typeof t == "number" && Number.isInteger(t);
  static isIntArray = (t) => t instanceof Array && t.every((r) => typeof r == "number" && Number.isInteger(r));
  static isFloat = (t) => typeof t == "number" && !Number.isInteger(t);
  static isFloatArray = (t) => t instanceof Array && t.every((r) => typeof r == "number" && !Number.isInteger(r));
  static isBoolean = (t) => typeof t == "boolean";
  static isBooleanArray = (t) => t instanceof Array && t.every((r) => typeof r == "boolean");
  static isDate = (t) => t instanceof Date;
  static isDateArray = (t) => t instanceof Array && t.every((r) => r instanceof Date);
  static isGeoRange = (t) => {
    if (t === void 0) return false;
    let r = t;
    return r.latitude !== void 0 && r.longitude !== void 0 && r.distance !== void 0;
  };
};
var oe = class e7 {
  static isText = (t) => typeof t == "string";
  static isTextArray = (t) => t instanceof Array && t.length > 0 && t.every(e7.isText);
  static isInt = (t) => typeof t == "number" && Number.isInteger(t) && !Number.isNaN(t) && Number.isFinite(t);
  static isIntArray = (t) => t instanceof Array && t.length > 0 && t.every(e7.isInt);
  static isFloat = (t) => typeof t == "number" && !Number.isInteger(t) && !Number.isNaN(t) && Number.isFinite(t);
  static isFloatArray = (t) => t instanceof Array && t.length > 0 && t.every(e7.isFloat);
  static isBoolean = (t) => typeof t == "boolean";
  static isBooleanArray = (t) => t instanceof Array && t.length > 0 && t.every(e7.isBoolean);
  static isDate = (t) => t instanceof Date;
  static isDateArray = (t) => t instanceof Array && t.length > 0 && t.every(e7.isDate);
  static isGeoCoordinate = (t) => t instanceof Object && t.latitude !== void 0 && t.longitude !== void 0 && Object.keys(t).length === 2;
  static isPhoneNumber = (t) => t instanceof Object && t.number !== void 0 && (Object.keys(t).length === 1 || Object.keys(t).length === 2 && t.defaultCountry !== void 0);
  static isNested = (t) => t instanceof Object && !(t instanceof Array) && !e7.isDate(t) && !e7.isGeoCoordinate(t) && !e7.isPhoneNumber(t);
  static isNestedArray = (t) => t instanceof Array && t.length > 0 && t.every(e7.isNested);
  static isEmptyArray = (t) => t instanceof Array && t.length === 0;
  static isDataObject = (t) => t.id !== void 0 || t.properties !== void 0 || t.references !== void 0 || t.vectors !== void 0;
};
var ji = class {
  static isKeys = (t) => t instanceof Array && t.length > 0;
  static isAll = (t) => t === "all" || t instanceof Array && t.length === 1 && t[0] === "all";
  static isAllAndQueryProfile = (t) => t instanceof Array && t.length === 2 && t.includes("all") && t.includes("queryProfile");
  static isUndefined = (t) => t === void 0;
};
var Cs = class e8 {
  static aggregations = (t) => t === void 0 ? [] : (Array.isArray(t) || (t = [t]), t.map((r) => dr.fromPartial({ property: r.propertyName, boolean: r.kind === "boolean" ? pr.fromPartial(r) : void 0, date: r.kind === "date" ? gr.fromPartial(r) : void 0, int: r.kind === "integer" ? cr.fromPartial(r) : void 0, number: r.kind === "number" ? lr.fromPartial(r) : void 0, text: r.kind === "text" ? fr.fromPartial({ count: r.count, topOccurencesLimit: r.minOccurrences, topOccurences: r.topOccurrences != null }) : void 0 })));
  static common = (t) => ({ filters: t?.filters ? x.filtersGRPC(t.filters) : void 0, aggregations: e8.aggregations(t?.returnMetrics) });
  static groupBy = (t) => mr.fromPartial({ property: t?.property });
  static hybrid = async (t, r) => ({ ...e8.common(r), objectLimit: r?.objectLimit, hybrid: await x.hybridSearch({ query: t, supportsVectors: true, ...r }) });
  static nearImage = (t, r) => ({ ...e8.common(r), objectLimit: r?.objectLimit, nearImage: x.nearImageSearch({ image: t, ...r }) });
  static nearObject = (t, r) => ({ ...e8.common(r), objectLimit: r?.objectLimit, nearObject: x.nearObjectSearch({ id: t, ...r }) });
  static nearText = (t, r) => ({ ...e8.common(r), objectLimit: r?.objectLimit, nearText: x.nearTextSearch({ query: t, ...r }) });
  static nearVector = async (t, r) => ({ ...e8.common(r), objectLimit: r?.objectLimit, nearVector: await x.nearVectorSearch({ vector: t, supportsVectors: true, ...r }) });
  static overAll = (t) => e8.common(t);
};
var Ps = class e9 {
  static queryProperties = (t, r) => {
    let a = t?.filter((s) => typeof s == "string"), i = r, n = t?.filter((s) => typeof s == "object"), o = (s) => {
      let u = s.properties.filter((c) => typeof c != "string");
      return { propName: s.name, primitiveProperties: s.properties.filter((c) => typeof c == "string"), objectProperties: u.map(o) };
    };
    return { nonRefProperties: a === void 0 ? [] : a, returnAllNonrefProperties: a === void 0, refProperties: i ? i.map((s) => ({ referenceProperty: s.linkOn, properties: e9.queryProperties(s.returnProperties), metadata: e9.metadata(s.includeVector, s.returnMetadata), targetCollection: s.targetCollection ? s.targetCollection : "" })) : [], objectProperties: n ? n.map((s) => {
      let u = s.properties.filter((c) => typeof c != "string");
      return { propName: s.name, primitiveProperties: s.properties.filter((c) => typeof c == "string"), objectProperties: u.map(o) };
    }) : [] };
  };
  static metadata = (t, r) => {
    let a = { uuid: true, vector: typeof t == "boolean" ? t : false, vectors: Array.isArray(t) ? t : [] };
    if (ji.isUndefined(r)) return we.fromPartial(a);
    let i = { creationTimeUnix: true, lastUpdateTimeUnix: true, distance: true, certainty: true, score: true, explainScore: true, isConsistent: true };
    if (ji.isAll(r)) return { ...a, ...i, queryProfile: false };
    if (ji.isAllAndQueryProfile(r)) return { ...a, ...i, queryProfile: true };
    if (!ji.isKeys(r)) throw new F(`Invalid returnMetadata argument: ${r}.`);
    return r?.forEach((n) => {
      let o;
      n === "creationTime" ? o = "creationTimeUnix" : n === "updateTime" ? o = "lastUpdateTimeUnix" : o = n, a[o] = true;
    }), we.fromPartial(a);
  };
  static sortBy = (t) => t.map((r) => ({ ascending: !!r.ascending, path: [r.property] }));
  static rerank = (t) => ur.fromPartial({ property: t.property, query: t.query });
  static groupBy = (t) => sr.fromPartial({ path: t?.property ? [t.property] : void 0, numberOfGroups: t?.numberOfGroups, objectsPerGroup: t?.objectsPerGroup });
  static isGroupBy = (t) => t === void 0 ? false : t.groupBy !== void 0;
  static common = (t) => {
    let r = { autocut: t?.autoLimit, limit: t?.limit, offset: t?.offset, filters: t?.filters ? x.filtersGRPC(t.filters) : void 0, properties: t?.returnProperties || t?.returnReferences ? e9.queryProperties(t.returnProperties, t.returnReferences) : void 0, metadata: e9.metadata(t?.includeVector, t?.returnMetadata) };
    return t?.rerank && (r.rerank = e9.rerank(t.rerank)), r;
  };
  static bm25 = (t, r) => ({ ...e9.common(r), bm25Search: x.bm25Search({ query: t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static fetchObjects = (t) => ({ ...e9.common(t), after: t?.after, sortBy: t?.sort ? e9.sortBy(t.sort.sorts) : void 0 });
  static fetchObjectById = (t) => e9.common({ filters: new Vr().equal(t.id), includeVector: t.includeVector, returnMetadata: ["creationTime", "updateTime", "isConsistent"], returnProperties: t.returnProperties, returnReferences: t.returnReferences });
  static hybrid = async (t, r) => ({ ...e9.common(r), hybridSearch: await x.hybridSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearAudio = (t, r) => ({ ...e9.common(r), nearAudio: x.nearAudioSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearDepth = (t, r) => ({ ...e9.common(r), nearDepth: x.nearDepthSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearImage = (t, r) => ({ ...e9.common(r), nearImage: x.nearImageSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearIMU = (t, r) => ({ ...e9.common(r), nearIMU: x.nearIMUSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearObject = (t, r) => ({ ...e9.common(r), nearObject: x.nearObjectSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearText = (t, r) => ({ ...e9.common(r), nearText: x.nearTextSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearThermal = (t, r) => ({ ...e9.common(r), nearThermal: x.nearThermalSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearVector = async (t, r) => ({ ...e9.common(r), nearVector: await x.nearVectorSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
  static nearVideo = (t, r) => ({ ...e9.common(r), nearVideo: x.nearVideoSearch({ ...t, ...r }), groupBy: e9.isGroupBy(r) ? e9.groupBy(r.groupBy) : void 0 });
};
var x = class e10 {
  static aggregate = Cs;
  static search = Ps;
  static isNamedVectors = (t) => Array.isArray(t?.includeVector) || t?.targetVector !== void 0;
  static isMultiTarget = (t) => t?.targetVector !== void 0 && !Mr.isSingle(t.targetVector);
  static isMultiWeightPerTarget = (t) => t?.targetVector !== void 0 && Mr.isMultiJoin(t.targetVector) && t.targetVector.weights !== void 0 && Object.values(t.targetVector.weights).some(Dt.is1DArray);
  static isMultiVector = (t) => t !== void 0 && !Array.isArray(t) && Object.values(t).some(Dt.is1DArray || Dt.is2DArray);
  static isMultiVectorPerTarget = (t) => t !== void 0 && !Array.isArray(t) && Object.values(t).some(Dt.is2DArray);
  static withImages = async (t, r, a) => r == null && a == null ? t : { ...t, images: m.fromPartial({ values: r ? await Promise.all(r.map(lt)) : void 0 }), imageProperties: m.fromPartial({ values: a }) };
  static generativeQuery = async (t, r) => {
    let a = qe.fromPartial({ returnMetadata: r?.metadata });
    switch (t.name) {
      case "generative-anthropic":
        a.anthropic = await e10.withImages(t.config || {}, r?.images, r?.imageProperties);
        break;
      case "generative-anyscale":
        a.anyscale = t.config || {};
        break;
      case "generative-aws":
        a.aws = await e10.withImages(t.config || {}, r?.images, r?.imageProperties);
        break;
      case "generative-cohere":
        a.cohere = await e10.withImages(t.config || {}, r?.images, r?.imageProperties);
        break;
      case "generative-databricks":
        a.databricks = t.config || {};
        break;
      case "generative-dummy":
        a.dummy = t.config || {};
        break;
      case "generative-friendliai":
        a.friendliai = t.config || {};
        break;
      case "generative-google":
        a.google = await e10.withImages(t.config || {}, r?.images, r?.imageProperties);
        break;
      case "generative-mistral":
        a.mistral = t.config || {};
        break;
      case "generative-nvidia":
        a.nvidia = t.config || {};
        break;
      case "generative-ollama":
        a.ollama = await e10.withImages(t.config || {}, r?.images, r?.imageProperties);
        break;
      case "generative-openai":
        a.openai = await e10.withImages(t.config || {}, r?.images, r?.imageProperties);
        break;
    }
    return a;
  };
  static generative = async (t, r) => {
    let a = e10.isSinglePrompt(r?.singlePrompt) ? r.singlePrompt.prompt : r?.singlePrompt, i = e10.isSinglePrompt(r?.singlePrompt) ? r.singlePrompt.debug : void 0, n = e10.isGroupedTask(r?.groupedTask) ? r.groupedTask.prompt : r?.groupedTask, o = e10.isGroupedTask(r?.groupedTask) ? r.groupedTask.nonBlobProperties : r?.groupedProperties, s = e10.isSinglePrompt(r?.singlePrompt) ? r.singlePrompt : void 0, u = e10.isGroupedTask(r?.groupedTask) ? r.groupedTask : void 0;
    return t.supportsSingleGrouped ? Vt.fromPartial({ single: r?.singlePrompt ? ar.fromPartial({ prompt: a, debug: i, queries: r.config ? [await e10.generativeQuery(r.config, s)] : void 0 }) : void 0, grouped: r?.groupedTask ? or2.fromPartial({ task: n, queries: r.config ? [await e10.generativeQuery(r.config, u)] : void 0, properties: o ? m.fromPartial({ values: o }) : void 0 }) : void 0 }) : Vt.fromPartial({ singleResponsePrompt: a, groupedResponseTask: n, groupedProperties: o });
  };
  static isSinglePrompt(t) {
    return typeof t != "string" && t !== void 0 && t.prompt !== void 0;
  }
  static isGroupedTask(t) {
    return typeof t != "string" && t !== void 0 && t.prompt !== void 0;
  }
  static bm25QueryProperties = (t) => t?.map((r) => typeof r == "string" ? r : `${r.name}^${r.weight}`);
  static bm25SearchOperator = (t) => {
    if (t) return We.fromPartial(t.operator === "And" ? { operator: 2 } : { operator: 1, minimumOrTokensMatch: t.minimumMatch });
  };
  static bm25Search = (t) => Ft.fromPartial({ query: t.query, properties: this.bm25QueryProperties(t.queryProperties), searchOperator: this.bm25SearchOperator(t.operator) });
  static isHybridVectorSearch = (t) => t !== void 0 && !e10.isHybridNearTextSearch(t) && !e10.isHybridNearVectorSearch(t);
  static isHybridNearTextSearch = (t) => t?.query !== void 0;
  static isHybridNearVectorSearch = (t) => t?.vector !== void 0;
  static hybridVector = async (t) => {
    let r = t.vector;
    if (e10.isHybridVectorSearch(r)) {
      let { targets: a, targetVectors: i, vectorBytes: n, vectorPerTarget: o, vectorForTargets: s, vectors: u } = await e10.vectors({ ...t, argumentName: "vector", vector: r });
      return n !== void 0 ? { vectorBytes: n, targetVectors: i, targets: a } : { targetVectors: i, targets: a, nearVector: s != null || o != null ? te.fromPartial({ vectorForTargets: s, vectorPerTarget: o }) : void 0, vectors: u };
    } else if (e10.isHybridNearTextSearch(r)) {
      let { targetVectors: a, targets: i } = e10.targetVector(t);
      return { targets: i, targetVectors: a, nearText: ae.fromPartial({ query: typeof r.query == "string" ? [r.query] : r.query, certainty: r.certainty, distance: r.distance, moveAway: r.moveAway ? me.fromPartial(r.moveAway) : void 0, moveTo: r.moveTo ? me.fromPartial(r.moveTo) : void 0 }) };
    } else if (e10.isHybridNearVectorSearch(r)) {
      let { targetVectors: a, targets: i, vectorBytes: n, vectorPerTarget: o, vectorForTargets: s, vectors: u } = await e10.vectors({ ...t, argumentName: "vector", vector: r.vector });
      return { targetVectors: a, targets: i, nearVector: te.fromPartial({ certainty: r.certainty, distance: r.distance, vectorBytes: n, vectorPerTarget: o, vectorForTargets: s, vectors: u }) };
    } else {
      let { targets: a, targetVectors: i } = e10.targetVector(t);
      return { targets: a, targetVectors: i };
    }
  };
  static hybridSearch = async (t) => {
    let r = (c) => {
      switch (c) {
        case "Ranked":
          return 1;
        case "RelativeScore":
          return 2;
        default:
          return 0;
      }
    }, { targets: a, targetVectors: i, vectorBytes: n, nearText: o, nearVector: s, vectors: u } = await e10.hybridVector(t);
    return ve.fromPartial({ query: t.query, alpha: t.alpha !== void 0 ? t.alpha : 0.5, properties: this.bm25QueryProperties(t.queryProperties), vectorBytes: n, vectorDistance: t.maxVectorDistance, fusionType: r(t.fusionType), bm25SearchOperator: this.bm25SearchOperator(t.bm25Operator), targetVectors: i, targets: a, nearText: o, nearVector: s, vectors: u });
  };
  static nearAudioSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return Ce.fromPartial({ audio: t.audio, certainty: t.certainty, distance: t.distance, targetVectors: a, targets: r });
  };
  static nearDepthSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return Re.fromPartial({ depth: t.depth, certainty: t.certainty, distance: t.distance, targetVectors: a, targets: r });
  };
  static nearImageSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return xe.fromPartial({ image: t.image, certainty: t.certainty, distance: t.distance, targetVectors: a, targets: r });
  };
  static nearIMUSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return Ne.fromPartial({ imu: t.imu, certainty: t.certainty, distance: t.distance, targetVectors: a, targets: r });
  };
  static nearObjectSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return be.fromPartial({ id: t.id, certainty: t.certainty, distance: t.distance, targetVectors: a, targets: r });
  };
  static nearTextSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return ae.fromPartial({ query: typeof t.query == "string" ? [t.query] : t.query, certainty: t.certainty, distance: t.distance, targets: r, targetVectors: a, moveAway: t.moveAway ? me.fromPartial({ concepts: t.moveAway.concepts, force: t.moveAway.force, uuids: t.moveAway.objects }) : void 0, moveTo: t.moveTo ? me.fromPartial({ concepts: t.moveTo.concepts, force: t.moveTo.force, uuids: t.moveTo.objects }) : void 0 });
  };
  static nearThermalSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return Ae.fromPartial({ thermal: t.thermal, certainty: t.certainty, distance: t.distance, targetVectors: a, targets: r });
  };
  static vectorToBuffer = (t) => new Float32Array(t).buffer;
  static vectorToBytes = (t) => {
    let a = new DataView(new ArrayBuffer(t.length * 4));
    return t.forEach((i, n) => a.setFloat32(n * 4, i, true)), new Uint8Array(a.buffer);
  };
  static vectorsToBytes = async (t) => {
    if (t.length === 0) return new Uint8Array();
    if (t[0].length === 0) return new Uint8Array();
    let r = 2, a = 4, i = t[0].length, n = new DataView(new ArrayBuffer(r + t.length * i * a));
    return n.setUint16(0, i, true), n.setUint16(r, t.length, true), await Promise.all(t.map((o, s) => uo().then(() => o.forEach((u, c) => n.setFloat32(r + s * i * a + c * a, u, true))))), new Uint8Array(n.buffer);
  };
  static nearVectorSearch = async (t) => te.fromPartial({ certainty: t.certainty, distance: t.distance, ...await e10.vectors({ ...t, argumentName: "nearVector" }) });
  static targetVector = (t) => t?.targetVector === void 0 ? {} : Mr.isSingle(t.targetVector) ? { targets: B.fromPartial({ targetVectors: [t.targetVector] }) } : Mr.isMulti(t.targetVector) ? { targets: B.fromPartial({ targetVectors: t.targetVector }) } : { targets: e10.targets(t.targetVector) };
  static vectors = async (t) => {
    let r = new F(`${t.argumentName} argument must be populated and:
            - an array of numbers (number[])
            - an object with target names as keys and 1D and/or 2D arrays of numbers (number[] or number[][]) as values
      received: ${t.vector} and ${t.targetVector}`);
    if (t.vector === void 0) return e10.targetVector(t);
    if (Te.isObject(t.vector)) {
      if (Object.keys(t.vector).length === 0) throw r;
      let a = [];
      for (let [i, n] of Object.entries(t.vector)) {
        if (!t.supportsVectors) {
          if (Te.isListOf2D(n)) throw new He("Lists of multi-vectors are not supported in Weaviate <1.29.0");
          if (Dt.is2DArray(n)) {
            n.forEach((s) => a.push({ name: i, vectorBytes: e10.vectorToBytes(s), vectors: [] }));
            continue;
          }
          if (Te.isListOf1D(n)) {
            n.vectors.forEach((s) => a.push({ name: i, vectorBytes: e10.vectorToBytes(s), vectors: [] }));
            continue;
          }
          a.push({ name: i, vectorBytes: e10.vectorToBytes(n), vectors: [] });
          continue;
        }
        let o = { name: i, vectorBytes: new Uint8Array(), vectors: [] };
        if (Te.isListOf1D(n)) o.vectors.push(q.fromPartial({ type: 1, vectorBytes: await e10.vectorsToBytes(n.vectors) }));
        else if (Te.isListOf2D(n)) for (let s of n.vectors) o.vectors.push(q.fromPartial({ type: 2, vectorBytes: await e10.vectorsToBytes(s) }));
        else Dt.is2DArray(n) ? o.vectors.push(q.fromPartial({ type: 2, vectorBytes: await e10.vectorsToBytes(n) })) : o.vectors.push(q.fromPartial({ type: 1, vectorBytes: e10.vectorToBytes(n) }));
        a.push(o);
      }
      return t.targetVector !== void 0 ? { ...e10.targetVector(t), vectorForTargets: a } : { targetVectors: void 0, targets: B.fromPartial({ targetVectors: a.map((i) => i.name) }), vectorForTargets: a };
    }
    if (t.vector.length === 0) throw r;
    if (Te.is1D(t.vector)) {
      let { targetVectors: a, targets: i } = e10.targetVector(t), n = e10.vectorToBytes(t.vector);
      return t.supportsVectors ? { targets: i, targetVectors: a, vectors: [q.fromPartial({ type: 1, vectorBytes: n })] } : { targets: i, targetVectors: a, vectorBytes: n };
    }
    if (Te.is2D(t.vector)) {
      if (!t.supportsVectors) throw new He("Multi-vectors are not supported in Weaviate <1.29.0");
      let { targetVectors: a, targets: i } = e10.targetVector(t), n = await e10.vectorsToBytes(t.vector);
      return { targets: i, targetVectors: a, vectors: [q.fromPartial({ type: 2, vectorBytes: n })] };
    }
    throw r;
  };
  static targets = (t) => {
    let r;
    switch (t.combination) {
      case "sum":
        r = 1;
        break;
      case "average":
        r = 3;
        break;
      case "minimum":
        r = 2;
        break;
      case "relative-score":
        r = 4;
        break;
      case "manual-weights":
        r = 5;
        break;
      default:
        throw new Error("Invalid combination method");
    }
    if (t.weights !== void 0) {
      let a = Object.entries(t.weights).map(([i, n]) => ({ target: i, weight: n })).reduce((i, { target: n, weight: o }) => Array.isArray(o) ? i.concat(o.map((s) => ({ target: n, weight: s }))) : i.concat([{ target: n, weight: o }]), []);
      return { combination: r, targetVectors: a.map((i) => i.target), weightsForTargets: a };
    } else return { combination: r, targetVectors: t.targetVectors, weightsForTargets: [] };
  };
  static nearVideoSearch = (t) => {
    let { targets: r, targetVectors: a } = e10.targetVector(t);
    return Pe.fromPartial({ video: t.video, certainty: t.certainty, distance: t.distance, targetVectors: a, targets: r });
  };
  static filtersGRPC = (t) => {
    let r = (i) => {
      let n = [];
      return i.filters?.forEach((o) => n.push(e10.filtersGRPC(o))), n;
    }, { value: a } = t;
    switch (t.operator) {
      case "And":
        return H.fromPartial({ operator: 7, filters: r(t) });
      case "Or":
        return H.fromPartial({ operator: 8, filters: r(t) });
      case "Not":
        return H.fromPartial({ operator: 15, filters: r(t) });
      default:
        return H.fromPartial({ operator: e10.operator(t.operator), target: t.target, valueText: this.filtersGRPCValueText(a), valueTextArray: this.filtersGRPCValueTextArray(a), valueInt: X.isInt(a) ? a : void 0, valueIntArray: X.isIntArray(a) ? { values: a } : void 0, valueNumber: X.isFloat(a) ? a : void 0, valueNumberArray: X.isFloatArray(a) ? { values: a } : void 0, valueBoolean: X.isBoolean(a) ? a : void 0, valueBooleanArray: X.isBooleanArray(a) ? { values: a } : void 0, valueGeo: X.isGeoRange(a) ? a : void 0 });
    }
  };
  static filtersGRPCValueText = (t) => X.isText(t) ? t : X.isDate(t) ? t.toISOString() : void 0;
  static filtersGRPCValueTextArray = (t) => X.isTextArray(t) ? { values: t } : X.isDateArray(t) ? { values: t.map((r) => r.toISOString()) } : void 0;
  static filterTargetToREST = (t) => {
    if (t.property) return [t.property];
    if (t.singleTarget) throw new Zr("Cannot use Filter.byRef() in the aggregate API currently. Instead use Filter.byRefMultiTarget() and specify the target collection explicitly.");
    if (t.multiTarget) {
      if (t.multiTarget.target === void 0) throw new Zr(`target of multiTarget filter was unexpectedly undefined: ${t}`);
      return [t.multiTarget.on, t.multiTarget.targetCollection, ...e10.filterTargetToREST(t.multiTarget.target)];
    } else return t.count ? [t.count.on] : [];
  };
  static filtersREST = (t) => {
    let { value: r } = t;
    if (t.operator === "And" || t.operator === "Or" || t.operator === "Not") return { operator: t.operator, operands: t.filters?.map(e10.filtersREST) };
    {
      if (t.target === void 0) throw new Zr(`target of filter was unexpectedly undefined: ${t}`);
      let a = { path: e10.filterTargetToREST(t.target), operator: t.operator };
      if (X.isText(r)) return { ...a, valueText: r };
      if (X.isTextArray(r)) return { ...a, valueTextArray: r };
      if (X.isInt(r)) return { ...a, valueInt: r };
      if (X.isIntArray(r)) return { ...a, valueIntArray: r };
      if (X.isBoolean(r)) return { ...a, valueBoolean: r };
      if (X.isBooleanArray(r)) return { ...a, valueBooleanArray: r };
      if (X.isFloat(r)) return { ...a, valueNumber: r };
      if (X.isFloatArray(r)) return { ...a, valueNumberArray: r };
      if (X.isDate(r)) return { ...a, valueDate: r.toISOString() };
      if (X.isDateArray(r)) return { ...a, valueDateArray: r.map((i) => i.toISOString()) };
      if (X.isGeoRange(r)) return { ...a, valueGeoRange: { geoCoordinates: { latitude: r.latitude, longitude: r.longitude }, distance: { max: r.distance } } };
      throw new F("Invalid filter value type");
    }
  };
  static operator = (t) => {
    switch (t) {
      case "Equal":
        return 1;
      case "NotEqual":
        return 2;
      case "ContainsAny":
        return 12;
      case "ContainsAll":
        return 13;
      case "ContainsNone":
        return 14;
      case "GreaterThan":
        return 3;
      case "GreaterThanEqual":
        return 4;
      case "LessThan":
        return 5;
      case "LessThanEqual":
        return 6;
      case "Like":
        return 10;
      case "WithinGeoRange":
        return 9;
      case "IsNull":
        return 11;
      default:
        return 0;
    }
  };
  static restProperties = (t, r) => {
    let a = {};
    if (Object.keys(t).forEach((i) => {
      let n = t[i];
      oe.isDate(n) ? a[i] = n.toISOString() : oe.isDateArray(n) ? a[i] = n.map((o) => o.toISOString()) : oe.isPhoneNumber(n) ? a[i] = { input: n.number, defaultCountry: n.defaultCountry } : oe.isNestedArray(n) ? a[i] = n.map((o) => e10.restProperties(o)) : oe.isNested(n) ? a[i] = e10.restProperties(n) : a[i] = n;
    }), !r) return a;
    for (let [i, n] of Object.entries(r)) if (n !== void 0) if (fe.isReferenceManager(n)) a[i] = n.toBeaconObjs();
    else if (fe.isUuid(n)) a[i] = [Fe(n)];
    else if (fe.isMultiTarget(n)) a[i] = typeof n.uuids == "string" ? [Fe(n.uuids, n.targetCollection)] : n.uuids.map((o) => Fe(o, n.targetCollection));
    else {
      let o = [];
      n.forEach((s) => {
        fe.isReferenceManager(s) ? o = o.concat(s.toBeaconObjs()) : fe.isUuid(s) ? o.push(Fe(s)) : o = o.concat((fe.isUuid(s.uuids) ? [s.uuids] : s.uuids).map((u) => Fe(u, s.targetCollection)));
      }), a[i] = o;
    }
    return a;
  };
  static batchProperties = (t, r) => {
    let a = [], i = [], n = {}, o = [], s = [], u = [], c = [], f2 = [], y = [], P = [], V = (D, S) => {
      if (oe.isEmptyArray(S)) o.push(D);
      else if (oe.isBooleanArray(S)) s.push({ propName: D, values: S });
      else if (oe.isDateArray(S)) u.push({ propName: D, values: S.map((kt) => kt.toISOString()) });
      else if (oe.isTextArray(S)) u.push({ propName: D, values: S });
      else if (oe.isIntArray(S)) c.push({ propName: D, values: S });
      else if (oe.isFloatArray(S)) f2.push({ propName: D, values: [], valuesBytes: new Uint8Array(new Float64Array(S).buffer) });
      else if (oe.isDate(S)) n[D] = S.toISOString();
      else if (oe.isPhoneNumber(S)) n[D] = { input: S.number, defaultCountry: S.defaultCountry };
      else if (oe.isGeoCoordinate(S)) n[D] = S;
      else if (oe.isNestedArray(S)) P.push({ propName: D, values: S.map((kt) => Be.fromPartial(e10.batchProperties(kt))) });
      else if (oe.isNested(S)) {
        let kt = e10.batchProperties(S);
        y.push({ propName: D, value: Be.fromPartial(kt) });
      } else n[D] = S;
    }, j = (D, S) => {
      fe.isReferenceManager(S) ? S.isMultiTarget() ? a.push({ propName: D, targetCollection: S.targetCollection, uuids: S.toBeaconStrings() }) : i.push({ propName: D, uuids: S.toBeaconStrings() }) : fe.isUuid(S) ? i.push({ propName: D, uuids: [S] }) : fe.isMultiTarget(S) ? a.push({ propName: D, targetCollection: S.targetCollection, uuids: typeof S.uuids == "string" ? [S.uuids] : S.uuids }) : S.forEach((kt) => j(D, kt));
    };
    return t && Object.entries(t).forEach(([D, S]) => V(D, S)), r && Object.entries(r).forEach(([D, S]) => j(D, S)), { nonRefProperties: n, multiTargetRefProps: a, singleTargetRefProps: i, textArrayProperties: u, intArrayProperties: c, numberArrayProperties: f2, booleanArrayProperties: s, objectProperties: y, objectArrayProperties: P, emptyListProps: o };
  };
  static batchObject = (t, r, a, i) => {
    let n = oe.isDataObject(r) ? r : { id: void 0, properties: r, references: void 0, vectors: void 0 }, o, s;
    n.vectors !== void 0 && !Array.isArray(n.vectors) ? s = Object.entries(n.vectors).flatMap(([c, f2]) => Te.is1D(f2) ? [q.fromPartial({ vectorBytes: e10.vectorToBytes(f2), name: c })] : f2.map((y) => q.fromPartial({ vectorBytes: e10.vectorToBytes(y), name: c }))) : Array.isArray(n.vectors) && a ? (s = [q.fromPartial({ vectorBytes: e10.vectorToBytes(n.vectors), name: "default" })], o = e10.vectorToBytes(n.vectors)) : n.vectors !== void 0 && (o = e10.vectorToBytes(n.vectors));
    let u = n.id ? n.id : v4_default();
    return { grpc: Ve.fromPartial({ collection: t, properties: e10.batchProperties(n.properties, n.references), tenant: i, uuid: u, vectorBytes: o, vectors: s }), object: { ...n, id: u, collection: t, tenant: i } };
  };
  static batchObjects = (t, r, a, i) => {
    let n = [], o = [], s = (c) => {
      if (c < r.length) setTimeout(() => s(c + 1));
      else return;
      let { grpc: f2, object: y } = e10.batchObject(t, r[c], a, i);
      n.push(f2), o.push(y);
    }, u = () => {
      let c = (f2) => {
        n.length < r.length ? setTimeout(() => c(f2), 500) : f2(null);
      };
      return new Promise(c);
    };
    return s(0), u().then(() => ({ batch: o, mapped: n }));
  };
  static batchReference = (t) => {
    let r = `weaviate://localhost/${t.fromObjectCollection}/${t.fromObjectUuid}/${t.fromPropertyName}`;
    return { grpc: Oe.fromPartial({ fromCollection: t.fromObjectCollection, fromUuid: t.fromObjectUuid, toCollection: t.toObjectCollection, toUuid: t.toObjectUuid, name: t.fromPropertyName, tenant: t.tenant }), beacon: r };
  };
  static tenants(t, r) {
    let a = [], i = Math.ceil(t.length / 100);
    for (let n = 0; n < i; n++) {
      let o = t.slice(n * 100, (n + 1) * 100);
      a.push(o.map(r));
    }
    return a;
  }
  static tenantCreate(t) {
    let r;
    switch (t.activityStatus) {
      case "ACTIVE":
        r = "HOT";
        break;
      case "INACTIVE":
        r = "COLD";
        break;
      case "HOT":
      case "COLD":
      case void 0:
        r = t.activityStatus;
        break;
      case "FROZEN":
        throw new F("Invalid activity status. Please provide one of the following: ACTIVE, INACTIVE, HOT, COLD.");
      default:
        throw new F("Invalid activity status. Please provide one of the following: ACTIVE, INACTIVE, HOT, COLD.");
    }
    return { name: t.name, activityStatus: r };
  }
  static tenantUpdate(t) {
    let r;
    switch (t.activityStatus) {
      case "ACTIVE":
        r = "HOT";
        break;
      case "INACTIVE":
        r = "COLD";
        break;
      case "OFFLOADED":
        r = "FROZEN";
        break;
      case "HOT":
      case "COLD":
      case "FROZEN":
        r = t.activityStatus;
        break;
      default:
        throw new F("Invalid activity status. Please provide one of the following: ACTIVE, INACTIVE, HOT, COLD, OFFLOADED.");
    }
    return { name: t.name, activityStatus: r };
  }
};
var Xf = () => ({ aggregate: (e24) => new Rs(e24) });
var Rs = class {
  propertyName;
  constructor(t) {
    this.propertyName = t;
  }
  map(t) {
    let r = {};
    return t.forEach((a) => {
      r[a] = true;
    }), r;
  }
  boolean(t) {
    return (t === void 0 || t.length === 0) && (t = ["count", "percentageFalse", "percentageTrue", "totalFalse", "totalTrue"]), { ...this.map(t), kind: "boolean", propertyName: this.propertyName };
  }
  date(t) {
    return (t === void 0 || t.length === 0) && (t = ["count", "maximum", "median", "minimum", "mode"]), { ...this.map(t), kind: "date", propertyName: this.propertyName };
  }
  integer(t) {
    return (t === void 0 || t.length === 0) && (t = ["count", "maximum", "mean", "median", "minimum", "mode", "sum"]), { ...this.map(t), kind: "integer", propertyName: this.propertyName };
  }
  number(t) {
    return (t === void 0 || t.length === 0) && (t = ["count", "maximum", "mean", "median", "minimum", "mode", "sum"]), { ...this.map(t), kind: "number", propertyName: this.propertyName };
  }
  text(t, r) {
    return (t === void 0 || t.length === 0) && (t = ["count", "topOccurrencesOccurs", "topOccurrencesValue"]), { count: t.includes("count"), topOccurrences: t.includes("topOccurrencesOccurs") || t.includes("topOccurrencesValue") ? { occurs: t.includes("topOccurrencesOccurs"), value: t.includes("topOccurrencesValue") } : void 0, minOccurrences: r, kind: "text", propertyName: this.propertyName };
  }
};
var As = class e11 {
  connection;
  groupBy;
  name;
  dbVersionSupport;
  consistencyLevel;
  tenant;
  grpcChecker;
  constructor(t, r, a, i, n) {
    this.connection = t, this.name = r, this.dbVersionSupport = a, this.consistencyLevel = i, this.tenant = n, this.grpcChecker = this.dbVersionSupport.supportsAggregateGRPC().then((o) => o.supports), this.groupBy = { hybrid: async (o, s) => {
      if (await this.grpcChecker) {
        let c = typeof s.groupBy == "string" ? { property: s.groupBy } : s.groupBy;
        return this.grpc().then(async (f2) => f2.withHybrid({ ...await x.aggregate.hybrid(o, s), groupBy: x.aggregate.groupBy(c), limit: c.limit })).then((f2) => Y.aggregateGroupBy(f2));
      }
      let u = this.base(s?.returnMetrics, s?.filters, s?.groupBy).withHybrid({ query: o, alpha: s?.alpha, maxVectorDistance: s?.maxVectorDistance, properties: s?.queryProperties, targetVectors: s?.targetVector ? [s.targetVector] : void 0, vector: s?.vector });
      return s?.objectLimit && (u = u.withObjectLimit(s.objectLimit)), this.doGroupBy(u);
    }, nearImage: async (o, s) => {
      let [u, c] = await Promise.all([await lt(o), await this.grpcChecker]);
      if (c) {
        let y = typeof s.groupBy == "string" ? { property: s.groupBy } : s.groupBy;
        return this.grpc().then((P) => P.withNearImage({ ...x.aggregate.nearImage(u, s), groupBy: x.aggregate.groupBy(y), limit: y.limit })).then((P) => Y.aggregateGroupBy(P));
      }
      let f2 = this.base(s?.returnMetrics, s?.filters, s?.groupBy).withNearImage({ image: u, certainty: s?.certainty, distance: s?.distance, targetVectors: s?.targetVector ? [s.targetVector] : void 0 });
      return s?.objectLimit && f2.withObjectLimit(s?.objectLimit), this.doGroupBy(f2);
    }, nearObject: async (o, s) => {
      if (await this.grpcChecker) {
        let c = typeof s.groupBy == "string" ? { property: s.groupBy } : s.groupBy;
        return this.grpc().then((f2) => f2.withNearObject({ ...x.aggregate.nearObject(o, s), groupBy: x.aggregate.groupBy(c), limit: c.limit })).then((f2) => Y.aggregateGroupBy(f2));
      }
      let u = this.base(s?.returnMetrics, s?.filters, s?.groupBy).withNearObject({ id: o, certainty: s?.certainty, distance: s?.distance, targetVectors: s?.targetVector ? [s.targetVector] : void 0 });
      return s?.objectLimit && u.withObjectLimit(s.objectLimit), this.doGroupBy(u);
    }, nearText: async (o, s) => {
      if (await this.grpcChecker) {
        let c = typeof s.groupBy == "string" ? { property: s.groupBy } : s.groupBy;
        return this.grpc().then((f2) => f2.withNearText({ ...x.aggregate.nearText(o, s), groupBy: x.aggregate.groupBy(c), limit: c.limit })).then((f2) => Y.aggregateGroupBy(f2));
      }
      let u = this.base(s?.returnMetrics, s?.filters, s?.groupBy).withNearText({ concepts: Array.isArray(o) ? o : [o], certainty: s?.certainty, distance: s?.distance, targetVectors: s?.targetVector ? [s.targetVector] : void 0 });
      return s?.objectLimit && u.withObjectLimit(s.objectLimit), this.doGroupBy(u);
    }, nearVector: async (o, s) => {
      if (await this.grpcChecker) {
        let c = typeof s.groupBy == "string" ? { property: s.groupBy } : s.groupBy;
        return this.grpc().then(async (f2) => f2.withNearVector({ ...await x.aggregate.nearVector(o, s), groupBy: x.aggregate.groupBy(c), limit: c.limit })).then((f2) => Y.aggregateGroupBy(f2));
      }
      let u = this.base(s?.returnMetrics, s?.filters, s?.groupBy).withNearVector({ vector: o, certainty: s?.certainty, distance: s?.distance, targetVectors: s?.targetVector ? [s.targetVector] : void 0 });
      return s?.objectLimit && u.withObjectLimit(s.objectLimit), this.doGroupBy(u);
    }, overAll: async (o) => {
      if (await this.grpcChecker) {
        let u = typeof o.groupBy == "string" ? { property: o.groupBy } : o.groupBy;
        return this.grpc().then((c) => c.withFetch({ ...x.aggregate.overAll(o), groupBy: x.aggregate.groupBy(u), limit: u.limit })).then((c) => Y.aggregateGroupBy(c));
      }
      let s = this.base(o?.returnMetrics, o?.filters, o?.groupBy);
      return this.doGroupBy(s);
    } };
  }
  grpc = () => this.connection.aggregate(this.name, this.consistencyLevel, this.tenant);
  gql() {
    return new _r(this.connection);
  }
  base(t, r, a) {
    let i = "meta { count }", n = this.gql().withClassName(this.name);
    return t && (Array.isArray(t) ? i += t.map((o) => this.metrics(o)).join(" ") : i += this.metrics(t)), a && (n = n.withGroupBy(typeof a == "string" ? [a] : [a.property]), i += "groupedBy { path value }", typeof a != "string" && a?.limit && (n = n.withLimit(a.limit))), i !== "" && (n = n.withFields(i)), r && (n = n.withWhere(x.filtersREST(r))), this.tenant && (n = n.withTenant(this.tenant)), n;
  }
  metrics(t) {
    let r = "", { kind: a, propertyName: i, ...n } = t;
    switch (a) {
      case "text": {
        let { minOccurrences: o, ...s } = n;
        r = Object.entries(s).map(([u, c]) => {
          if (c) return c instanceof Object ? `topOccurrences${o ? `(limit: ${o})` : ""} { ${c.occurs ? "occurs" : ""} ${c.value ? "value" : ""} }` : u;
        }).join(" ");
        break;
      }
      default:
        r = Object.entries(n).map(([o, s]) => s ? o : "").join(" ");
    }
    return `${i} { ${r} }`;
  }
  static use(t, r, a, i, n) {
    return new e11(t, r, a, i, n);
  }
  async hybrid(t, r) {
    if (await this.grpcChecker) return this.grpc().then(async (i) => i.withHybrid(await x.aggregate.hybrid(t, r))).then((i) => Y.aggregate(i));
    let a = this.base(r?.returnMetrics, r?.filters).withHybrid({ query: t, alpha: r?.alpha, maxVectorDistance: r?.maxVectorDistance, properties: r?.queryProperties, targetVectors: r?.targetVector ? [r.targetVector] : void 0, vector: r?.vector });
    return r?.objectLimit && (a = a.withObjectLimit(r.objectLimit)), this.do(a);
  }
  async nearImage(t, r) {
    let [a, i] = await Promise.all([await lt(t), await this.grpcChecker]);
    if (i) return this.grpc().then((o) => o.withNearImage(x.aggregate.nearImage(a, r))).then((o) => Y.aggregate(o));
    let n = this.base(r?.returnMetrics, r?.filters).withNearImage({ image: a, certainty: r?.certainty, distance: r?.distance, targetVectors: r?.targetVector ? [r.targetVector] : void 0 });
    return r?.objectLimit && n.withObjectLimit(r?.objectLimit), this.do(n);
  }
  async nearObject(t, r) {
    if (await this.grpcChecker) return this.grpc().then((i) => i.withNearObject(x.aggregate.nearObject(t, r))).then((i) => Y.aggregate(i));
    let a = this.base(r?.returnMetrics, r?.filters).withNearObject({ id: t, certainty: r?.certainty, distance: r?.distance, targetVectors: r?.targetVector ? [r.targetVector] : void 0 });
    return r?.objectLimit && a.withObjectLimit(r.objectLimit), this.do(a);
  }
  async nearText(t, r) {
    if (await this.grpcChecker) return this.grpc().then((i) => i.withNearText(x.aggregate.nearText(t, r))).then((i) => Y.aggregate(i));
    let a = this.base(r?.returnMetrics, r?.filters).withNearText({ concepts: Array.isArray(t) ? t : [t], certainty: r?.certainty, distance: r?.distance, targetVectors: r?.targetVector ? [r.targetVector] : void 0 });
    return r?.objectLimit && a.withObjectLimit(r.objectLimit), this.do(a);
  }
  async nearVector(t, r) {
    if (await this.grpcChecker) return this.grpc().then(async (i) => i.withNearVector(await x.aggregate.nearVector(t, r))).then((i) => Y.aggregate(i));
    if (!Te.is1D(t)) throw new F("Vector can only be a 1D array of numbers when using `nearVector` with <1.29 Weaviate versions.");
    let a = this.base(r?.returnMetrics, r?.filters).withNearVector({ vector: t, certainty: r?.certainty, distance: r?.distance, targetVectors: r?.targetVector ? [r.targetVector] : void 0 });
    return r?.objectLimit && a.withObjectLimit(r.objectLimit), this.do(a);
  }
  async overAll(t) {
    return await this.grpcChecker ? this.grpc().then((r) => r.withFetch(x.aggregate.overAll(t))).then((r) => Y.aggregate(r)) : this.do(this.base(t?.returnMetrics, t?.filters));
  }
  do = (t) => t.do().then(({ data: r }) => {
    let { meta: a, ...i } = r.Aggregate[this.name][0];
    return { properties: i, totalCount: a?.count };
  }).catch((r) => {
    throw new _t(r.message, "GraphQL");
  });
  doGroupBy = (t) => t.do().then(({ data: r }) => r.Aggregate[this.name].map((a) => {
    let { groupedBy: i, meta: n, ...o } = a;
    return { groupedBy: { prop: i.path[0], value: i.value }, properties: o, totalCount: n?.count };
  })).catch((r) => {
    throw new _t(r.message, "GraphQL");
  });
};
var jf = As.use;
d();
d();
d();
d();
d();
function co(e24) {
  if (Array.isArray(e24)) {
    let t = [];
    return e24.forEach((r) => {
      M(r) || t.push("string className invalid - set with .withIncludeClassNames(...classNames)");
    }), t;
  }
  return e24 != null ? ["strings classNames invalid - set with .withIncludeClassNames(...classNames)"] : [];
}
function lo(e24) {
  if (Array.isArray(e24)) {
    let t = [];
    return e24.forEach((r) => {
      M(r) || t.push("string className invalid - set with .withExcludeClassNames(...classNames)");
    }), t;
  }
  return e24 != null ? ["strings classNames invalid - set with .withExcludeClassNames(...classNames)"] : [];
}
function Ot(e24) {
  return M(e24) ? [] : ["string backend must set - set with .withBackend(backend)"];
}
function St(e24) {
  return M(e24) ? [] : ["string backupId must be set - set with .withBackupId(backupId)"];
}
var hr = class extends O {
  backend;
  backupId;
  constructor(t) {
    super(t);
  }
  withBackend(t) {
    return this.backend = t, this;
  }
  withBackupId(t) {
    return this.backupId = t, this;
  }
  validate = () => {
    this.addErrors([...Ot(this.backend), ...St(this.backupId)]);
  };
  do = () => (this.validate(), this.errors.length > 0 ? Promise.reject(new F("invalid usage: " + this.errors.join(", "))) : this.client.get(this._path()));
  _path = () => `/backups/${this.backend}/${this.backupId}`;
};
d();
var Mm = 1e3;
var Er = class extends O {
  backend;
  backupId;
  excludeClassNames;
  includeClassNames;
  statusGetter;
  waitForCompletion;
  config;
  constructor(t, r) {
    super(t), this.statusGetter = r;
  }
  withIncludeClassNames(...t) {
    let r = t;
    return t.length && Array.isArray(t[0]) && (r = t[0]), this.includeClassNames = r, this;
  }
  withExcludeClassNames(...t) {
    let r = t;
    return t.length && Array.isArray(t[0]) && (r = t[0]), this.excludeClassNames = r, this;
  }
  withBackend(t) {
    return this.backend = t, this;
  }
  withBackupId(t) {
    return this.backupId = t, this;
  }
  withWaitForCompletion(t) {
    return this.waitForCompletion = t, this;
  }
  withConfig(t) {
    return this.config = t, this;
  }
  validate = () => {
    this.addErrors([...co(this.includeClassNames), ...lo(this.excludeClassNames), ...Ot(this.backend), ...St(this.backupId)]);
  };
  do = () => {
    if (this.validate(), this.errors.length > 0) return Promise.reject(new F("invalid usage: " + this.errors.join(", ")));
    let t = { id: this.backupId, config: this.config, include: this.includeClassNames, exclude: this.excludeClassNames };
    return this.waitForCompletion ? this._createAndWaitForCompletion(t) : this._create(t);
  };
  _create = (t) => this.client.postReturn(this._path(), t);
  _createAndWaitForCompletion = (t) => new Promise((r, a) => {
    this._create(t).then((i) => {
      this.statusGetter.withBackend(this.backend).withBackupId(this.backupId);
      let n = () => {
        this.statusGetter.do().then((o) => {
          o.status == "SUCCESS" || o.status == "FAILED" || o.status == "CANCELED" ? r(this._merge(o, i)) : setTimeout(n, Mm);
        }).catch(a);
      };
      n();
    }).catch(a);
  });
  _path = () => `/backups/${this.backend}`;
  _merge = (t, r) => {
    let a = {};
    return "id" in t && (a.id = t.id), "path" in t && (a.path = t.path), "backend" in t && (a.backend = t.backend), "status" in t && (a.status = t.status), "error" in t && (a.error = t.error), "classes" in r && (a.classes = r.classes), a;
  };
};
d();
var yr = class extends O {
  backend;
  backupId;
  constructor(t) {
    super(t);
  }
  withBackend(t) {
    return this.backend = t, this;
  }
  withBackupId(t) {
    return this.backupId = t, this;
  }
  validate = () => {
    this.addErrors([...Ot(this.backend), ...St(this.backupId)]);
  };
  do = () => (this.validate(), this.errors.length > 0 ? Promise.reject(new F("invalid usage: " + this.errors.join(", "))) : this.client.get(this._path()));
  _path = () => `/backups/${this.backend}/${this.backupId}/restore`;
};
d();
var Em = 1e3;
var Ur = class extends O {
  backend;
  backupId;
  excludeClassNames;
  includeClassNames;
  statusGetter;
  waitForCompletion;
  config;
  overwriteAlias;
  constructor(t, r) {
    super(t), this.statusGetter = r;
  }
  withIncludeClassNames(...t) {
    let r = t;
    return t.length && Array.isArray(t[0]) && (r = t[0]), this.includeClassNames = r, this;
  }
  withExcludeClassNames(...t) {
    let r = t;
    return t.length && Array.isArray(t[0]) && (r = t[0]), this.excludeClassNames = r, this;
  }
  withBackend(t) {
    return this.backend = t, this;
  }
  withBackupId(t) {
    return this.backupId = t, this;
  }
  withWaitForCompletion(t) {
    return this.waitForCompletion = t, this;
  }
  withOverwriteAlias(t) {
    return this.overwriteAlias = t, this;
  }
  withConfig(t) {
    return this.config = t, this;
  }
  validate = () => {
    this.addErrors([...co(this.includeClassNames || []), ...lo(this.excludeClassNames || []), ...Ot(this.backend), ...St(this.backupId)]);
  };
  do = () => {
    if (this.validate(), this.errors.length > 0) return Promise.reject(new F("invalid usage: " + this.errors.join(", ")));
    let t = { config: this.config, include: this.includeClassNames, exclude: this.excludeClassNames, overwriteAlias: this.overwriteAlias };
    return this.waitForCompletion ? this._restoreAndWaitForCompletion(t) : this._restore(t);
  };
  _restore = (t) => this.client.postReturn(this._path(), t);
  _restoreAndWaitForCompletion = (t) => new Promise((r, a) => {
    this._restore(t).then((i) => {
      this.statusGetter.withBackend(this.backend).withBackupId(this.backupId);
      let n = () => {
        this.statusGetter.do().then((o) => {
          o.status == "SUCCESS" || o.status == "FAILED" || o.status == "CANCELED" ? r(this._merge(o, i)) : setTimeout(n, Em);
        }).catch(a);
      };
      n();
    }).catch(a);
  });
  _path = () => `/backups/${this.backend}/${this.backupId}/restore`;
  _merge = (t, r) => {
    let a = {};
    return "id" in t && (a.id = t.id), "path" in t && (a.path = t.path), "backend" in t && (a.backend = t.backend), "status" in t && (a.status = t.status), "error" in t && (a.error = t.error), "classes" in r && (a.classes = r.classes), a;
  };
};
var fo = (e24) => {
  let t = (n) => {
    if (n.id === void 0) throw new Pt("Backup ID is undefined in response");
    if (n.path === void 0) throw new Pt("Backup path is undefined in response");
    if (n.status === void 0) throw new Pt("Backup status is undefined in response");
    return { id: n.id, error: n.error, path: n.path, status: n.status };
  }, r = (n) => {
    if (n.id === void 0) throw new Pt("Backup ID is undefined in response");
    if (n.backend === void 0) throw new Pt("Backup backend is undefined in response");
    if (n.path === void 0) throw new Pt("Backup path is undefined in response");
    if (n.status === void 0) throw new Pt("Backup status is undefined in response");
    return { id: n.id, backend: n.backend, collections: n.classes ? n.classes : [], error: n.error, path: n.path, status: n.status };
  }, a = (n) => new hr(e24).withBackupId(n.backupId).withBackend(n.backend).do().then(t), i = (n) => new yr(e24).withBackupId(n.backupId).withBackend(n.backend).do().then(t);
  return { cancel: async (n) => {
    let o = [];
    if (o = o.concat(St(n.backupId)).concat(Ot(n.backend)), o.length > 0) throw new F(o.join(", "));
    let s = `/backups/${n.backend}/${n.backupId}`, u = n.operation === "restore" ? `${s}/restore` : s;
    try {
      await e24.delete(u, void 0, false);
    } catch (c) {
      if (c instanceof Ct) {
        if (c.code === 404) return false;
        throw new qa(c.message);
      }
    }
    return true;
  }, create: async (n) => {
    let o = new Er(e24, new hr(e24)).withBackupId(n.backupId).withBackend(n.backend);
    n.includeCollections && (o = o.withIncludeClassNames(...n.includeCollections)), n.excludeCollections && (o = o.withExcludeClassNames(...n.excludeCollections)), n.config && (o = o.withConfig({ CompressionLevel: n.config.compressionLevel, CPUPercentage: n.config.cpuPercentage }));
    let s;
    try {
      s = await o.do();
    } catch (c) {
      throw new Bt(`Backup creation failed: ${c}`, "creation");
    }
    if (s.status === "FAILED") throw new Bt(`Backup creation failed: ${s.error}`, "creation");
    let u;
    if (n.waitForCompletion) {
      let c = true;
      for (; c; ) {
        let f2 = await a(n);
        if (f2.status === "SUCCESS" && (c = false, u = f2), f2.status === "FAILED") throw new Bt(f2.error ? f2.error : "<unknown>", "creation");
        if (f2.status === "CANCELED") throw new sa("creation");
        await new Promise((y) => setTimeout(y, 1e3));
      }
    }
    return u ? { ...r(s), ...u } : r(s);
  }, getCreateStatus: a, getRestoreStatus: i, restore: async (n) => {
    let o = new Ur(e24, new yr(e24)).withBackupId(n.backupId).withBackend(n.backend);
    n.includeCollections && (o = o.withIncludeClassNames(...n.includeCollections)), n.excludeCollections && (o = o.withExcludeClassNames(...n.excludeCollections)), n.config?.overwriteAlias && (o = o.withOverwriteAlias(n.config?.overwriteAlias)), n.config && (o = o.withConfig({ CPUPercentage: n.config.cpuPercentage }));
    let s;
    try {
      s = await o.do();
    } catch (c) {
      throw new Bt(`Backup restoration failed: ${c}`, "restoration");
    }
    if (s.status === "FAILED") throw new Bt(`Backup restoration failed: ${s.error}`, "restoration");
    let u;
    if (n.waitForCompletion) {
      let c = true;
      for (; c; ) {
        let f2 = await i(n);
        if (f2.status === "SUCCESS" && (c = false, u = f2), f2.status === "FAILED") throw new Bt(f2.error ? f2.error : "<unknown>", "restoration");
        if (f2.status === "CANCELED") throw new sa("restoration");
        await new Promise((y) => setTimeout(y, 1e3));
      }
    }
    return u ? { ...r(s), ...u } : r(s);
  }, list: (n, o) => {
    let s = `/backups/${n}`;
    return o?.startedAtAsc && (s += "?order=asc"), e24.get(s);
  } };
};
var ep = (e24, t) => {
  let r = fo(e24);
  return { create: (a) => r.create({ ...a, includeCollections: [t] }), getCreateStatus: r.getCreateStatus, getRestoreStatus: r.getRestoreStatus, restore: (a) => r.restore({ ...a, includeCollections: [t] }) };
};
d();
d();
function tp(e24) {
  return Um("/batch/references", e24);
}
function Um(e24, t) {
  return t && t.toString() != "" && (e24 = `${e24}?${t.toString()}`), e24;
}
d();
d();
d();
function Ns(e24) {
  if (typeof e24 == "string") {
    let t = e24.split(".");
    if (t.length >= 2) {
      let r = parseInt(t[0], 10), a = parseInt(t[1], 10);
      return !(r <= 1 && a < 16);
    }
  }
  return true;
}
d();
var Dr = class extends O {
  className;
  consistencyLevel;
  id;
  tenant;
  objectsPath;
  constructor(t, r) {
    super(t), this.objectsPath = r;
  }
  withId = (t) => (this.id = t, this);
  withClassName = (t) => (this.className = t, this);
  withTenant = (t) => (this.tenant = t, this);
  withConsistencyLevel = (t) => (this.consistencyLevel = t, this);
  buildPath = () => this.objectsPath.buildCheck(this.id, this.className, this.consistencyLevel, this.tenant);
  validateIsSet = (t, r, a) => {
    (t == null || t == null || t.length == 0) && this.addError(`${r} must be set - set with ${a}`);
  };
  validateId = () => {
    this.validateIsSet(this.id, "id", ".withId(id)");
  };
  validate = () => {
    this.validateId();
  };
  do = () => this.errors.length > 0 ? Promise.reject(new Error("invalid usage: " + this.errors.join(", "))) : (this.validate(), this.buildPath().then((t) => this.client.head(t, void 0)));
};
d();
d();
d();
d();
d();
d();
var rp = "/objects";
var Sa = class {
  dbVersionSupport;
  constructor(t) {
    this.dbVersionSupport = t;
  }
  buildCreate(t) {
    return this.build({ consistencyLevel: t }, [this.addQueryParams]);
  }
  buildDelete(t, r, a, i) {
    return this.build({ id: t, className: r, consistencyLevel: a, tenant: i }, [this.addClassNameDeprecatedNotSupportedCheck, this.addId, this.addQueryParams]);
  }
  buildCheck(t, r, a, i) {
    return this.build({ id: t, className: r, consistencyLevel: a, tenant: i }, [this.addClassNameDeprecatedNotSupportedCheck, this.addId, this.addQueryParams]);
  }
  buildGetOne(t, r, a, i, n, o) {
    return this.build({ id: t, className: r, additional: a, consistencyLevel: i, nodeName: n, tenant: o }, [this.addClassNameDeprecatedNotSupportedCheck, this.addId, this.addQueryParams]);
  }
  buildGet(t, r, a, i, n) {
    return this.build({ className: t, limit: r, additional: a, after: i, tenant: n }, [this.addQueryParamsForGet]);
  }
  buildUpdate(t, r, a) {
    return this.build({ id: t, className: r, consistencyLevel: a }, [this.addClassNameDeprecatedCheck, this.addId, this.addQueryParams]);
  }
  buildMerge(t, r, a) {
    return this.build({ id: t, className: r, consistencyLevel: a }, [this.addClassNameDeprecatedCheck, this.addId, this.addQueryParams]);
  }
  build(t, r) {
    return this.dbVersionSupport.supportsClassNameNamespacedEndpointsPromise().then((a) => {
      let i = rp;
      return r.forEach((n) => {
        i = n(t, i, a);
      }), i;
    });
  }
  addClassNameDeprecatedNotSupportedCheck(t, r, a) {
    if (a.supports) {
      if (M(t.className)) return `${r}/${t.className}`;
      a.warns.deprecatedNonClassNameNamespacedEndpointsForObjects();
    } else a.warns.notSupportedClassNamespacedEndpointsForObjects();
    return r;
  }
  addClassNameDeprecatedCheck(t, r, a) {
    if (a.supports) {
      if (M(t.className)) return `${r}/${t.className}`;
      a.warns.deprecatedNonClassNameNamespacedEndpointsForObjects();
    }
    return r;
  }
  addId(t, r) {
    return M(t.id) ? `${r}/${t.id}` : r;
  }
  addQueryParams(t, r) {
    let a = [];
    return Array.isArray(t.additional) && t.additional.length > 0 && a.push(`include=${t.additional.join(",")}`), M(t.nodeName) && a.push(`node_name=${t.nodeName}`), M(t.consistencyLevel) && a.push(`consistency_level=${t.consistencyLevel}`), M(t.tenant) && a.push(`tenant=${t.tenant}`), a.length > 0 ? `${r}?${a.join("&")}` : r;
  }
  addQueryParamsForGet(t, r, a) {
    let i = [];
    return Array.isArray(t.additional) && t.additional.length > 0 && i.push(`include=${t.additional.join(",")}`), typeof t.limit == "number" && t.limit > 0 && i.push(`limit=${t.limit}`), M(t.className) && (a.supports ? i.push(`class=${t.className}`) : a.warns.notSupportedClassParameterInEndpointsForObjects()), M(t.after) && i.push(`after=${t.after}`), M(t.tenant) && i.push(`tenant=${t.tenant}`), i.length > 0 ? `${r}?${i.join("&")}` : r;
  }
};
var ka = class {
  dbVersionSupport;
  constructor(t) {
    this.dbVersionSupport = t;
  }
  build(t, r, a, i, n) {
    return this.dbVersionSupport.supportsClassNameNamespacedEndpointsPromise().then((o) => {
      let s = rp;
      o.supports ? M(r) ? s = `${s}/${r}` : o.warns.deprecatedNonClassNameNamespacedEndpointsForReferences() : o.warns.notSupportedClassNamespacedEndpointsForReferences(), o.version && (Ns(o.version) || o.warns.deprecatedWeaviateTooOld()), M(t) && (s = `${s}/${t}`), s = `${s}/references`, M(a) && (s = `${s}/${a}`);
      let u = [];
      return M(i) && u.push(`consistency_level=${i}`), M(n) && u.push(`tenant=${n}`), u.length > 0 && (s = `${s}?${u.join("&")}`), s;
    });
  }
};
d();
d();
d();
d();
d();
d();
d();
var Zm = 160 * 1e3;
var po = 10;
var Xm = 1e3;
var jm = 100;
var ip = 4;
var eh = (e24) => e24.type === "error";
var ap = (e24) => e24.collection !== void 0;
var op = (e24) => e24.fromObjectCollection !== void 0;
function go(e24, t) {
  return { stream: async (r) => {
    if (!e24.supportsStreaming()) throw new He("Streaming batch (batch.stream / data.ingest) is not supported over gRPC-Web. Use data.insertMany instead.");
    let { supports: a, message: i } = await t.supportsServerSideBatching();
    if (!a) throw new Error(i);
    let n = new Vs({ consistencyLevel: r, isWcdOnGcp: e24.isWcdOnGcp() }), o = null, s = n.start(e24).catch((c) => {
      o = c;
    }), u = () => {
      if (o) throw o;
      return n;
    };
    return { addObject: (c) => u().addObject(c), addReference: (c) => u().addReference(c), stop: () => (u().stop(), s), hasErrors: () => Object.keys(n.objErrors).length > 0 || Object.keys(n.refErrors).length > 0, uuids: () => n.uuids, beacons: () => n.beacons, objErrors: () => n.objErrors, refErrors: () => n.refErrors };
  } };
}
var Vs = class e12 {
  consistencyLevel;
  queue;
  inflightObjs = /* @__PURE__ */ new Set();
  inflightRefs = /* @__PURE__ */ new Set();
  batchSize = 1e3;
  objsCache = {};
  refsCache = {};
  pendingObjs = [];
  pendingRefs = [];
  isStarted = false;
  isShuttingDown = false;
  isOom = false;
  isStopped = false;
  isWcdOnGcp = false;
  isRenewingStream = false;
  oomWaitTime = 300;
  objErrors = {};
  refErrors = {};
  uuids = {};
  beacons = {};
  constructor(t) {
    this.consistencyLevel = t.consistencyLevel, this.queue = new Os(), this.isWcdOnGcp = t.isWcdOnGcp;
  }
  async acceptNext(t) {
    if (this.isStopped) throw new Error("Batching has been stopped, cannot add more objects");
    for (; t >= this.batchSize || this.isShuttingDown || this.isOom; ) await e12.sleep(po);
  }
  addObject = (t) => this.acceptNext(this.inflightObjs.size).then(() => (t.id === void 0 && (t.id = v4_default()), this.queue.push(t), t.id));
  addReference = (t) => this.acceptNext(this.inflightRefs.size).then(() => this.queue.push(t));
  static sleep(t) {
    return new Promise((r) => setTimeout(r, t));
  }
  async *generateStreamRequests(t) {
    for (; !this.isStarted; ) console.info("Waiting for server to start the batch ingestion..."), await e12.sleep(po);
    let r = Date.now(), a = Ge.create({ data: { objects: { values: this.pendingObjs }, references: { values: this.pendingRefs } } }), i = Ge.encode(a).finish().length, n = i, o = 0, s = 0;
    for (; ; ) {
      if (this.isShuttingDown) {
        console.warn("Server shutting down, closing the client-side of the stream"), this.pendingObjs = a.data?.objects?.values || [], this.pendingRefs = a.data?.references?.values || [];
        return;
      }
      if (this.isWcdOnGcp && Date.now() - r > Zm) {
        console.info("GCP connections have a maximum lifetime. Re-establishing the batch stream to avoid timeout errors."), this.isRenewingStream = true, yield Ge.create({ stop: {} });
        return;
      }
      let u = false, c = Date.now();
      for (; this.isOom; ) {
        if (u || (console.warn("Server out-of-memory, waiting for server to recover before resuming batch ingestion..."), this.pendingObjs = a.data?.objects?.values || [], this.pendingRefs = a.data?.references?.values || [], u = true), Date.now() - c > this.oomWaitTime * 1e3) throw new Error(`Batch stream was not re-established within ${this.oomWaitTime} seconds after an OOM message. Terminating batch.`);
        await e12.sleep(Xm);
        return;
      }
      let f2 = await this.queue.pull(jm);
      if (!(f2 === null && !this.isStopped)) {
        if (f2 === null && this.isStopped) {
          console.info("Batching stopped by user, closing the client-side of the stream"), (a.data?.objects?.values.length !== void 0 && a.data.objects.values.length > 0 || a.data?.references?.values.length !== void 0 && a.data.references.values.length > 0) && (yield a), yield Ge.create({ stop: {} });
          return;
        }
        if (ap(f2)) {
          let { grpc: y } = x.batchObject(f2.collection, f2, false, f2.tenant);
          this.objsCache[y.uuid] = { entry: f2, index: o };
          let P = Ve.encode(y).finish().length + ip;
          if (P + i >= t) throw new Error(`Object at index ${o} exceeds the gRPC max message size limit and cannot be sent.`);
          if (n + P >= t || a.data.objects.values.length >= this.batchSize) {
            for (; this.inflightObjs.size >= this.batchSize; ) await e12.sleep(po);
            this.inflightObjs = new Set(a.data?.objects?.values.map((V) => V.uuid)), yield a, a = Ge.create({ data: { objects: { values: [] }, references: { values: [] } } }), n = Ge.encode(a).finish().length;
          }
          a.data.objects.values.push(y), n += P, o++;
        }
        if (op(f2)) {
          let { grpc: y, beacon: P } = x.batchReference(f2);
          this.refsCache[P] = { entry: f2, index: s };
          let V = Oe.encode(y).finish().length + ip;
          if (n + V >= t || a.data.references.values.length >= this.batchSize) {
            for (; this.inflightRefs.size >= this.batchSize; ) await e12.sleep(po);
            this.inflightRefs = new Set(a.data?.references?.values.map((j) => `weaviate://localhost/${j.fromCollection}/${j.fromUuid}/${j.name}`)), yield a, a = Ge.create({ data: { objects: { values: [] }, references: { values: [] } } }), n = Ge.encode(a).finish().length;
          }
          a.data.references.values.push(y), n += V, s++;
        }
      }
    }
  }
  async start(t) {
    console.info("Starting batch ingestion");
    for await (let r of this.do(t)) if (eh(r)) {
      let { index: a, ...i } = r;
      ap(i.entry) && (this.objErrors[a] = { message: i.message, object: i.entry }), op(i.entry) && (this.refErrors[a] = { message: i.message, reference: i.entry });
    } else r.type === "success" && (r.uuid !== void 0 && (this.uuids[r.index] = r.uuid), r.beacon !== void 0 && (this.beacons[r.index] = r.beacon));
    if (this.isShuttingDown) return console.warn("Reconnecting after server shutdown..."), await this.reconnect(t), console.warn("Reconnected, resuming batch ingestion..."), this.restart(t);
    if (this.isRenewingStream) return console.info("Restarting batch recv after renewing stream..."), this.isRenewingStream = false, this.restart(t);
  }
  async reconnect(t, r = 0) {
    try {
      await t.reconnect();
    } catch {
      if (r >= 5) throw new Error("Failed to reconnect after server shutdown");
      return console.warn(`Reconnect attempt ${r + 1} failed, retrying...`), await e12.sleep(2 ** r * 1e3), this.reconnect(t, r + 1);
    }
  }
  restart(t) {
    return this.isStarted = false, this.start(t);
  }
  stop() {
    this.isStopped = true;
  }
  async *do(t) {
    let r = await t.batch("", this.consistencyLevel).then((a) => a.withStream(this.generateStreamRequests(t.grpcMaxMessageLength)));
    for await (let a of r) if (a.acks !== void 0 && (this.inflightObjs = this.inflightObjs.difference(new Set(a.acks.uuids)), this.inflightRefs = this.inflightRefs.difference(new Set(a.acks.beacons))), a.backoff !== void 0 && (this.batchSize = a.backoff.batchSize), a.outOfMemory !== void 0 && (this.isOom = true, this.oomWaitTime = a.outOfMemory.waitTime, a.outOfMemory.uuids.forEach((i) => this.queue.push(this.objsCache[i].entry)), a.outOfMemory.beacons.forEach((i) => this.queue.push(this.refsCache[i].entry)), this.inflightObjs = this.inflightObjs.difference(new Set(a.outOfMemory.uuids)), this.inflightRefs = this.inflightRefs.difference(new Set(a.outOfMemory.beacons))), a.shuttingDown !== void 0 && (console.warn("Received shutting down signal from server"), this.isShuttingDown = true, this.isOom = false), a.started !== void 0 && (this.isStarted = true), a.results !== void 0) {
      for (let i of a.results.errors) {
        if (i.uuid !== void 0) {
          let n = this.objsCache[i.uuid];
          if (n === void 0) continue;
          yield { index: n.index, message: i.error, entry: n.entry, type: "error" }, delete this.objsCache[i.uuid];
        }
        if (i.beacon !== void 0) {
          let n = this.refsCache[i.beacon];
          if (n === void 0) continue;
          yield { index: n.index, message: i.error, entry: n.entry, type: "error" }, delete this.refsCache[i.beacon];
        }
      }
      for (let i of a.results.successes) {
        if (i.uuid !== void 0) {
          let n = this.objsCache[i.uuid];
          if (n === void 0) continue;
          yield { index: n.index, uuid: i.uuid, type: "success" }, delete this.objsCache[i.uuid];
        }
        if (i.beacon !== void 0) {
          let n = this.refsCache[i.beacon];
          if (n === void 0) continue;
          yield { index: n.index, beacon: i.beacon, type: "success" }, delete this.refsCache[i.beacon];
        }
      }
    }
    console.info("Server closed its side of the stream");
  }
};
var Os = class {
  resolvers;
  promises;
  constructor() {
    this.resolvers = new import_deque.Deque(), this.promises = new import_deque.Deque();
  }
  _add() {
    this.promises.pushBack(new Promise((t) => this.resolvers.pushBack(t)));
  }
  _readd(t) {
    this.promises.pushFront(t);
  }
  push(t) {
    this.resolvers.size() || this._add(), this.resolvers.popFront()(t);
  }
  pull(t) {
    this.promises.size() || this._add();
    let r = this.promises.popFront();
    if (t === void 0) return r;
    let a, i = r.then((s) => (clearTimeout(o), s)), n = new Promise((s) => {
      a = s;
    }), o = setTimeout(() => {
      this._readd(r), a(null);
    }, t);
    return Promise.race([i, n]);
  }
  get length() {
    return this.promises.size() - this.resolvers.size();
  }
};
var th = (e24, t, r) => (t && (e24 = e24.withConsistencyLevel(t)), r && (e24 = e24.withTenant(r)), e24);
var rh = (e24, t, r, a, i) => {
  let n = new Sa(r), o = new ka(r), s = async (u) => {
    if (!u) return {};
    let c = { id: u.id, properties: u.properties ? x.restProperties(u.properties, u.references) : void 0 };
    return Array.isArray(u.vectors) ? (await r.requiresNamedVectorsInsertFix()).supports ? (c.vector = u.vectors, c.vectors = { default: u.vectors }) : c.vector = u.vectors : u.vectors && (c.vectors = u.vectors), c;
  };
  return { deleteById: (u) => n.buildDelete(u, t, a, i).then((c) => e24.delete(c, void 0, false)).then(() => true), deleteMany: (u, c) => e24.batch(t, a, i).then((f2) => f2.withDelete({ filters: x.filtersGRPC(u), dryRun: c?.dryRun, verbose: c?.verbose })).then((f2) => Y.deleteMany(f2, c?.verbose)), exists: (u) => th(new Dr(e24, n).withId(u).withClassName(t), a, i).do(), ingest: async (u) => {
    let c = [], f2 = await go(e24, r).stream(a), y = Date.now();
    for (let S of u) await f2.addObject({ collection: t, ...S, tenant: i });
    await f2.stop();
    let P = f2.objErrors(), V = f2.uuids();
    for (let S = 0; S < Object.keys(V).length + Object.keys(P).length; S++) V[S] ? c.push(V[S]) : P[S] && c.push(P[S]);
    let D = (Date.now() - y) / 1e3;
    return { allResponses: c, elapsedSeconds: D, errors: P, uuids: V, hasErrors: Object.keys(P).length > 0 };
  }, insert: (u) => Promise.all([n.buildCreate(a), s(u && (oe.isDataObject(u) ? u : { properties: u }))]).then(([c, f2]) => e24.postReturn(c, { class: t, tenant: i, ...f2 }).then((y) => y.id)), insertMany: (u) => e24.batch(t, a).then(async (c) => {
    let f2 = await r.requiresNamedVectorsInsertFix(), y = await x.batchObjects(t, u, f2.supports, i), P = Date.now(), V = await c.withObjects({ objects: y.mapped }), D = (Date.now() - P) / 1e3;
    return Y.batchObjects(V, y.batch, y.mapped, D);
  }), referenceAdd: (u) => o.build(u.fromUuid, t, u.fromProperty, a, i).then((c) => Promise.all(Aa(u.to).map((f2) => e24.postEmpty(c, f2)))).then(() => {
  }), referenceAddMany: (u) => {
    let c = tp(new URLSearchParams(a ? { consistency_level: a } : {})), f2 = [];
    u.forEach((P) => {
      Aa(P.to).forEach((V) => {
        f2.push({ from: `weaviate://localhost/${t}/${P.fromUuid}/${P.fromProperty}`, to: V.beacon, tenant: i });
      });
    });
    let y = Date.now();
    return e24.postReturn(c, f2).then((P) => {
      let V = Date.now(), j = {};
      return P.forEach((D, S) => {
        D.result?.status === "FAILED" && (j[S] = { message: D.result?.errors?.error?.[0].message ? D.result?.errors?.error?.[0].message : "unknown error", reference: f2[S] });
      }), { elapsedSeconds: (V - y) / 1e3, errors: j, hasErrors: Object.keys(j).length > 0 };
    });
  }, referenceDelete: (u) => o.build(u.fromUuid, t, u.fromProperty, a, i).then((c) => Promise.all(Aa(u.to).map((f2) => e24.delete(c, f2, false)))).then(() => {
  }), referenceReplace: (u) => o.build(u.fromUuid, t, u.fromProperty, a, i).then((c) => e24.put(c, Aa(u.to), false)), replace: (u) => Promise.all([n.buildUpdate(u.id, t, a), s(u)]).then(([c, f2]) => e24.put(c, { class: t, tenant: i, ...f2 })), update: (u) => Promise.all([n.buildUpdate(u.id, t, a), s(u)]).then(([c, f2]) => e24.patch(c, { class: t, tenant: i, ...f2 })) };
};
var sp = rh;
d();
d();
var ea = class {
  connection;
  name;
  dbVersionSupport;
  consistencyLevel;
  tenant;
  constructor(t, r, a, i, n) {
    this.connection = t, this.name = r, this.dbVersionSupport = a, this.consistencyLevel = i, this.tenant = n;
  }
  getSearcher = (t) => this.connection.search(this.name, this.consistencyLevel, this.tenant, t?.abortSignal);
  checkSupportForVectors = async (t) => t === void 0 || x.isHybridNearTextSearch(t) ? false : (await this.dbVersionSupport.supportsVectorsFieldInGRPC()).supports;
  supportForSingleGroupedGenerative = async () => {
    let t = await this.dbVersionSupport.supportsSingleGrouped();
    if (!t.supports) throw new He(t.message);
    return t.supports;
  };
  supportForGenerativeConfigRuntime = async (t) => {
    if (t === void 0) return true;
    let r = await this.dbVersionSupport.supportsGenerativeConfigRuntime();
    if (!r.supports) throw new He(r.message);
    return r.supports;
  };
  nearSearch = (t) => this.getSearcher(t).then((r) => ({ search: r }));
  nearVector = (t, r, a) => Promise.all([this.getSearcher(a), this.checkSupportForVectors(t)]).then(([i, n]) => ({ search: i, supportsVectors: n }));
  hybridSearch = (t, r) => Promise.all([this.getSearcher(r), this.checkSupportForVectors(t?.vector)]).then(([a, i]) => ({ search: a, supportsVectors: i }));
  fetchObjects = (t) => this.getSearcher(t).then((r) => ({ search: r }));
  fetchObjectById = (t) => this.getSearcher(t).then((r) => ({ search: r }));
  bm25 = (t) => this.getSearcher(t).then((r) => ({ search: r }));
};
d();
var nh = { anthropic(e24) {
  let { baseURL: t, stopSequences: r, ...a } = e24 || {};
  return { name: "generative-anthropic", config: e24 ? { ...a, baseUrl: t, stopSequences: m.fromPartial({ values: r }) } : void 0 };
}, anyscale(e24) {
  let { baseURL: t, ...r } = e24 || {};
  return { name: "generative-anyscale", config: e24 ? { ...r, baseUrl: t } : void 0 };
}, aws(e24) {
  return { name: "generative-aws", config: e24 };
}, azureOpenAI: (e24) => {
  let { baseURL: t, stop: r, ...a } = e24 || {};
  return { name: "generative-azure-openai", config: e24 ? { ...a, baseUrl: t, isAzure: true, stop: m.fromPartial({ values: r }) } : { isAzure: true } };
}, cohere: (e24) => {
  let { baseURL: t, stopSequences: r, ...a } = e24 || {};
  return { name: "generative-cohere", config: e24 ? { ...a, baseUrl: t, stopSequences: m.fromPartial({ values: r }) } : void 0 };
}, databricks: (e24) => {
  let { stop: t, ...r } = e24 || {};
  return { name: "generative-databricks", config: e24 ? { ...r, stop: m.fromPartial({ values: t }) } : void 0 };
}, friendliai(e24) {
  let { baseURL: t, ...r } = e24 || {};
  return { name: "generative-friendliai", config: e24 ? { ...r, baseUrl: t } : void 0 };
}, mistral(e24) {
  let { baseURL: t, ...r } = e24 || {};
  return { name: "generative-mistral", config: e24 ? { baseUrl: t, ...r } : void 0 };
}, nvidia(e24) {
  let { baseURL: t, ...r } = e24 || {};
  return { name: "generative-nvidia", config: e24 ? { ...r, baseUrl: t } : void 0 };
}, ollama(e24) {
  return { name: "generative-ollama", config: e24 };
}, openAI: (e24) => {
  let { baseURL: t, stop: r, ...a } = e24 || {};
  return { name: "generative-openai", config: e24 ? { ...a, baseUrl: t, isAzure: false, stop: m.fromPartial({ values: r }) } : { isAzure: false } };
}, google: (e24) => {
  let { stopSequences: t, ...r } = e24 || {};
  return { name: "generative-google", config: e24 ? { ...r, stopSequences: m.fromPartial({ values: t }) } : void 0 };
}, xai: (e24) => {
  let { baseURL: t, ...r } = e24 || {};
  return { name: "generative-xai", config: e24 ? { ...r, baseUrl: t } : void 0 };
}, contextualai(e24) {
  let { knowledge: t, ...r } = e24 || {};
  return { name: "generative-contextualai", config: e24 ? { ...r, knowledge: t ? m.fromPartial({ values: t }) : void 0 } : void 0 };
} };
d();
var Ss = class e13 {
  check;
  constructor(t) {
    this.check = t;
  }
  static use(t, r, a, i, n) {
    return new e13(new ea(t, r, a, i, n));
  }
  async parseReply(t) {
    return (await Y.use(this.check.dbVersionSupport)).generate(t);
  }
  async parseGroupByReply(t, r) {
    let a = await Y.use(this.check.dbVersionSupport);
    return x.search.isGroupBy(t) ? a.generateGroupBy(r) : a.generate(r);
  }
  fetchObjects(t, r, a) {
    return Promise.all([this.check.fetchObjects(a), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(t.config)]).then(async ([{ search: i }, n]) => ({ search: i, args: { ...x.search.fetchObjects(r), generative: await x.generative({ supportsSingleGrouped: n }, t) } })).then(({ search: i, args: n }) => i.withFetch(n)).then((i) => this.parseReply(i));
  }
  bm25(t, r, a, i) {
    return Promise.all([this.check.bm25(i), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(r.config)]).then(async ([{ search: n }, o]) => ({ search: n, args: { ...x.search.bm25(t, a), generative: await x.generative({ supportsSingleGrouped: o }, r) } })).then(({ search: n, args: o }) => n.withBm25(o)).then((n) => this.parseGroupByReply(a, n));
  }
  hybrid(t, r, a, i) {
    return Promise.all([this.check.hybridSearch(a, i), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(r.config)]).then(async ([{ search: n, supportsVectors: o }, s]) => ({ search: n, args: { ...await x.search.hybrid({ query: t, supportsVectors: o }, a), generative: await x.generative({ supportsSingleGrouped: s }, r) } })).then(({ search: n, args: o }) => n.withHybrid(o)).then((n) => this.parseGroupByReply(a, n));
  }
  nearImage(t, r, a, i) {
    return Promise.all([this.check.nearSearch(i), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(r.config)]).then(async ([{ search: n }, o]) => ({ search: n, args: { ...x.search.nearImage({ image: await lt(t) }, a), generative: await x.generative({ supportsSingleGrouped: o }, r) } })).then(({ search: n, args: o }) => n.withNearImage(o)).then((n) => this.parseGroupByReply(a, n));
  }
  nearObject(t, r, a, i) {
    return Promise.all([this.check.nearSearch(i), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(r.config)]).then(async ([{ search: n }, o]) => ({ search: n, args: { ...x.search.nearObject({ id: t }, a), generative: await x.generative({ supportsSingleGrouped: o }, r) } })).then(({ search: n, args: o }) => n.withNearObject(o)).then((n) => this.parseGroupByReply(a, n));
  }
  nearText(t, r, a, i) {
    return Promise.all([this.check.nearSearch(i), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(r.config)]).then(async ([{ search: n }, o]) => ({ search: n, args: { ...x.search.nearText({ query: t }, a), generative: await x.generative({ supportsSingleGrouped: o }, r) } })).then(({ search: n, args: o }) => n.withNearText(o)).then((n) => this.parseGroupByReply(a, n));
  }
  nearVector(t, r, a, i) {
    return Promise.all([this.check.nearVector(t, a, i), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(r.config)]).then(async ([{ search: n, supportsVectors: o }, s]) => ({ search: n, args: { ...await x.search.nearVector({ vector: t, supportsVectors: o }, a), generative: await x.generative({ supportsSingleGrouped: s }, r) } })).then(({ search: n, args: o }) => n.withNearVector(o)).then((n) => this.parseGroupByReply(a, n));
  }
  nearMedia(t, r, a, i, n) {
    return Promise.all([this.check.nearSearch(n), this.check.supportForSingleGroupedGenerative(), this.check.supportForGenerativeConfigRuntime(a.config)]).then(([{ search: o }, s]) => {
      let u;
      switch (r) {
        case "audio":
          u = (c, f2) => o.withNearAudio({ ...x.search.nearAudio({ audio: c }, i), generative: f2 });
          break;
        case "depth":
          u = (c, f2) => o.withNearDepth({ ...x.search.nearDepth({ depth: c }, i), generative: f2 });
          break;
        case "image":
          u = (c, f2) => o.withNearImage({ ...x.search.nearImage({ image: c }, i), generative: f2 });
          break;
        case "imu":
          u = (c, f2) => o.withNearIMU({ ...x.search.nearIMU({ imu: c }, i), generative: f2 });
          break;
        case "thermal":
          u = (c, f2) => o.withNearThermal({ ...x.search.nearThermal({ thermal: c }, i), generative: f2 });
          break;
        case "video":
          u = (c, f2) => o.withNearVideo({ ...x.search.nearVideo({ video: c }), generative: f2 });
          break;
        default:
          throw new F(`Invalid media type: ${r}`);
      }
      return Promise.all([lt(t), x.generative({ supportsSingleGrouped: s }, a)]).then(([c, f2]) => u(c, f2));
    }).then((o) => this.parseGroupByReply(i, o));
  }
};
var up = Ss.use;
d();
var ih = 100;
var mo = class {
  constructor(t) {
    this.query = t;
    this.query = t;
  }
  cache = [];
  last = void 0;
  [Symbol.asyncIterator]() {
    return { next: async () => {
      let t = await this.query(ih, this.last);
      if (this.cache = t, this.cache.length == 0) return { done: true, value: void 0 };
      let r = this.cache.shift();
      if (r === void 0) throw new b("Object iterator returned an object that is undefined");
      if (this.last = r?.uuid, this.last === void 0) throw new b("Object iterator returned an object without a UUID");
      return { done: false, value: r };
    } };
  }
};
d();
d();
var ah = { nearText: () => {
}, nearVector: () => {
} };
var oh = { listOfVectors: (...e24) => ({ kind: "listOfVectors", dimensionality: Te.is1D(e24[0]) ? "1D" : "2D", vectors: e24 }) };
var ks = { hybridVector: ah, nearVector: oh };
d();
var Is = class e14 {
  check;
  constructor(t) {
    this.check = t;
  }
  static use(t, r, a, i, n) {
    return new e14(new ea(t, r, a, i, n));
  }
  async parseReply(t) {
    return (await Y.use(this.check.dbVersionSupport)).query(t);
  }
  async parseGroupByReply(t, r) {
    let a = await Y.use(this.check.dbVersionSupport);
    return x.search.isGroupBy(t) ? a.queryGroupBy(r) : a.query(r);
  }
  fetchObjectById(t, r, a) {
    return this.check.fetchObjectById(a).then(({ search: i }) => i.withFetch(x.search.fetchObjectById({ id: t, ...r }))).then((i) => this.parseReply(i)).then((i) => i.objects.length === 1 ? i.objects[0] : null);
  }
  fetchObjects(t, r) {
    return this.check.fetchObjects(r).then(({ search: a }) => a.withFetch(x.search.fetchObjects(t))).then((a) => this.parseReply(a));
  }
  bm25(t, r, a) {
    return this.check.bm25(a).then(({ search: i }) => i.withBm25(x.search.bm25(t, r))).then((i) => this.parseGroupByReply(r, i));
  }
  hybrid(t, r, a) {
    return this.check.hybridSearch(r, a).then(async ({ search: i, supportsVectors: n }) => ({ search: i, args: await x.search.hybrid({ query: t, supportsVectors: n }, r) })).then(({ search: i, args: n }) => i.withHybrid(n)).then((i) => this.parseGroupByReply(r, i));
  }
  nearImage(t, r, a) {
    return this.check.nearSearch(a).then(({ search: i }) => lt(t).then((n) => ({ search: i, args: x.search.nearImage({ image: n }, r) }))).then(({ search: i, args: n }) => i.withNearImage(n)).then((i) => this.parseGroupByReply(r, i));
  }
  nearMedia(t, r, a, i) {
    return this.check.nearSearch(i).then(({ search: n }) => {
      let o;
      switch (r) {
        case "audio":
          o = (s) => n.withNearAudio(x.search.nearAudio({ audio: s }, a));
          break;
        case "depth":
          o = (s) => n.withNearDepth(x.search.nearDepth({ depth: s }, a));
          break;
        case "image":
          o = (s) => n.withNearImage(x.search.nearImage({ image: s }, a));
          break;
        case "imu":
          o = (s) => n.withNearIMU(x.search.nearIMU({ imu: s }, a));
          break;
        case "thermal":
          o = (s) => n.withNearThermal(x.search.nearThermal({ thermal: s }, a));
          break;
        case "video":
          o = (s) => n.withNearVideo(x.search.nearVideo({ video: s }));
          break;
        default:
          throw new F(`Invalid media type: ${r}`);
      }
      return lt(t).then(o);
    }).then((n) => this.parseGroupByReply(a, n));
  }
  nearObject(t, r, a) {
    return this.check.nearSearch(a).then(({ search: i }) => ({ search: i, args: x.search.nearObject({ id: t }, r) })).then(({ search: i, args: n }) => i.withNearObject(n)).then((i) => this.parseGroupByReply(r, i));
  }
  nearText(t, r, a) {
    return this.check.nearSearch(a).then(({ search: i }) => ({ search: i, args: x.search.nearText({ query: t }, r) })).then(({ search: i, args: n }) => i.withNearText(n)).then((i) => this.parseGroupByReply(r, i));
  }
  nearVector(t, r, a) {
    return this.check.nearVector(t, r, a).then(async ({ search: i, supportsVectors: n }) => ({ search: i, args: await x.search.nearVector({ vector: t, supportsVectors: n }, r) })).then(({ search: i, args: n }) => i.withNearVector(n)).then((i) => this.parseGroupByReply(r, i));
  }
};
var dp = Is.use;
d();
d();
var Fr = class {
  sorts;
  constructor() {
    this.sorts = [];
  }
  byProperty(t, r = true) {
    return this.sorts.push({ property: t, ascending: r }), this;
  }
  byId(t = true) {
    return this.sorts.push({ property: "_id", ascending: t }), this;
  }
  byCreationTime(t = true) {
    return this.sorts.push({ property: "_creationTimeUnix", ascending: t }), this;
  }
  byUpdateTime(t = true) {
    return this.sorts.push({ property: "_lastUpdateTimeUnix", ascending: t }), this;
  }
};
var sh = () => ({ byProperty(e24, t = true) {
  return new Fr().byProperty(e24, t);
}, byId(e24 = true) {
  return new Fr().byId(e24);
}, byCreationTime(e24 = true) {
  return new Fr().byCreationTime(e24);
}, byUpdateTime(e24 = true) {
  return new Fr().byUpdateTime(e24);
} });
var cp = sh;
d();
d();
var ta = (e24) => Array.isArray(e24) ? e24 : [e24];
var ra = (e24) => typeof e24 == "string" ? e24 : e24.name;
var _s = (e24) => ({ name: e24.name, activityStatus: Y.activityStatusREST(e24.activityStatus) });
var uh = (e24, t, r) => {
  let a = (n) => e24.tenants(t).then((o) => o.withGet({ names: n })).then(Y.tenantsGet), i = async (n) => {
    let o = [];
    for await (let s of x.tenants(ta(n), x.tenantUpdate).map((u) => new Rr(e24, t, u).do().then((c) => c.map(_s)))) o.push(...s);
    return o;
  };
  return { create: (n) => new Cr(e24, t, ta(n).map(x.tenantCreate)).do().then((o) => o.map(_s)), get: () => a(), getByNames: (n) => a(n.map(ra)), getByName: async (n) => {
    let o = ra(n);
    return await r.supportsTenantGetRESTMethod().then((s) => !s.supports) ? a([o]).then((s) => s[o] ?? null) : e24.get(`/schema/${t}/tenants/${o}`).then(_s).catch((s) => {
      if (s instanceof Ct && s.code === 404) return null;
      throw s;
    });
  }, remove: (n) => new Pr(e24, t, ta(n).map(ra)).do(), update: i, activate: (n) => i(ta(n).map((o) => ({ name: ra(o), activityStatus: "ACTIVE" }))), deactivate: (n) => i(ta(n).map((o) => ({ name: ra(o), activityStatus: "INACTIVE" }))), offload: (n) => i(ta(n).map((o) => ({ name: ra(o), activityStatus: "OFFLOADED" }))) };
};
var lp = uh;
d();
var fp = () => ({ sum: (e24) => ({ combination: "sum", targetVectors: e24 }), average: (e24) => ({ combination: "average", targetVectors: e24 }), minimum: (e24) => ({ combination: "minimum", targetVectors: e24 }), relativeScore: (e24) => ({ combination: "relative-score", targetVectors: Object.keys(e24), weights: e24 }), manualWeights: (e24) => ({ combination: "manual-weights", targetVectors: Object.keys(e24), weights: e24 }) });
var dh = (e24) => typeof e24 == "string";
var ch = (e24) => e24.charAt(0).toUpperCase() + e24.slice(1);
var Bs = (e24, t, r, a, i) => {
  if (!dh(t)) throw new F(`The collection name must be a string, got: ${typeof t}`);
  let n = ch(t), o = jf(e24, n, r, a, i), s = dp(e24, n, r, a, i);
  return { aggregate: o, backup: ep(e24, n), config: hu(e24, n, r, i), data: sp(e24, n, r, a, i), filter: ao(), generate: up(e24, n, r, a, i), metrics: Xf(), multiTargetVector: fp(), name: t, query: s, sort: cp(), tenants: lp(e24, n, r), exists: () => new Ht(e24).withClassName(n).do(), iterator: (u) => new mo((c, f2) => s.fetchObjects({ limit: c, after: f2, includeVector: u?.includeVector, returnMetadata: u?.returnMetadata, returnProperties: u?.returnProperties, returnReferences: u?.returnReferences }).then((y) => y.objects)), length: () => o.overAll().then(({ totalCount: u }) => u), withConsistency: (u) => Bs(e24, n, r, u, i), withTenant: (u) => Bs(e24, n, r, a, typeof u == "string" ? u : u.name) };
};
var na = Bs;
d();
d();
d();
var lh = (e24) => ({ nodes: (t) => {
  let r = new URLSearchParams(), a = "/nodes";
  return t?.collection && (a = a.concat(`/${t.collection}`)), r.append("output", t?.output ? t.output : "minimal"), e24.get(`${a}?${r.toString()}`).then((i) => i.nodes);
}, queryShardingState: (t, r) => {
  let a = new URLSearchParams();
  return a.append("collection", t), r?.shard && a.append("shard", r.shard), e24.get(`/replication/sharding-state?${a.toString()}`).then((i) => i);
}, replicate: (t) => e24.postReturn("/replication/replicate", (({ replicationType: r, ...a }) => ({ type: r, ...a }))(t)).then((r) => r.id), replications: { cancel: (t) => e24.postEmpty(`/replication/replicate/${t}/cancel`, {}), delete: (t) => e24.delete(`/replication/replicate/${t}`, {}, false), deleteAll: () => e24.delete("/replication/replicate", {}, false), get: (t, r) => e24.get(`/replication/replicate/${t}?includeHistory=${r?.includeHistory ? r?.includeHistory : "false"}`).then((a) => a || null), query: (t) => {
  let { collection: r, shard: a, targetNode: i, includeHistory: n } = t || {}, o = new URLSearchParams();
  return r && o.append("collection", r), a && o.append("shard", a), i && o.append("targetNode", i), n && o.append("includeHistory", n.toString()), e24.get(`/replication/replicate?${o.toString()}`);
} } });
var pp = lh;
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
d();
var fh = (e24, t) => {
  let r = () => new Qt(e24).do().then((i) => i.classes ? i.classes.map(da) : []), a = (i) => new $t(e24).withClassName(i).do();
  return { create: async function(i) {
    let { name: n, invertedIndex: o, multiTenancy: s, objectTTL: u, replication: c, sharding: f2, ...y } = i, P = {};
    if (i.generative) {
      let zr = i.generative.name === "generative-azure-openai" ? "generative-openai" : i.generative.name;
      P[zr] = i.generative.config ? i.generative.config : {};
    }
    i.reranker && (P[i.reranker.name] = i.reranker.config ? i.reranker.config : {});
    let V;
    u && (V = { enabled: u.enabled, deleteOn: u.deleteOn, defaultTtl: u.defaultTTLSeconds, filterExpiredObjects: u.filterExpiredObjects });
    let j = { ...y, class: n, invertedIndexConfig: o, moduleConfig: P, multiTenancyConfig: s, objectTtlConfig: V, replicationConfig: c, shardingConfig: f2 }, { vectorsConfig: D, vectorizers: S } = i.vectorizers ? Ya(i.vectorizers) : { vectorsConfig: void 0, vectorizers: [] }, { supports: kt } = await t.supportsServerSideDefaultVectorIndexType();
    if (!kt && D) for (let zr of Object.values(D)) zr.vectorIndexType || (zr.vectorIndexType = "hnsw");
    j.vectorConfig = D;
    let Fp = i.properties ? i.properties.map((zr) => Qa(zr, S)) : [], Wp = i.references ? i.references.map(Ka) : [];
    return j.properties = [...Fp, ...Wp], await new zt(e24).withClass(j).do(), na(e24, n, t);
  }, createFromSchema: async function(i) {
    let { class: n } = await new zt(e24).withClass(i).do();
    return na(e24, n, t);
  }, createFromJson: async (i) => {
    let { class: n } = await e24.postReturn("/schema", i);
    return na(e24, n, t);
  }, delete: a, deleteAll: () => r().then((i) => Promise.all(i?.map((n) => a(n.name)))), exists: (i) => new Ht(e24).withClassName(i).do(), export: (i) => new st(e24).withClassName(i).do().then(da), exportToJson: (i) => e24.get(`/schema/${i}`, true), listAll: r, get: (i) => na(e24, i, t), use: (i) => na(e24, i, t) };
};
var gp = fh;
d();
d();
var ph = (e24) => ({ create: (t) => e24.postReturn("/aliases/", { ...t, class: t.collection }), listAll: (t) => e24.get(`/aliases${t?.collection !== void 0 ? "/?class=" + t.collection : ""}`).then((r) => r.aliases !== void 0 ? r.aliases.map((a) => ({ alias: a.alias, collection: a.class })) : []), get: (t) => e24.get(`/aliases/${t}`).then((r) => ({ alias: r.alias, collection: r.class })), update: (t) => e24.put(`/aliases/${t.alias}`, { class: t.newTargetCollection }), delete: (t) => e24.delete(`/aliases/${t}`, null) });
var mp = ph;
d();
d();
var gh = "0001-01-01T00:00:00.000Z";
var Me = class e15 {
  static includes = (t, ...r) => r.filter((a) => Array.from(t.actions).includes(a)).length > 0;
  static isAlias = (t) => e15.includes(t, "create_aliases", "read_aliases", "update_aliases", "delete_aliases");
  static isBackups = (t) => e15.includes(t, "manage_backups");
  static isMcp = (t) => e15.includes(t, "create_mcp", "read_mcp", "update_mcp");
  static isCluster = (t) => e15.includes(t, "read_cluster");
  static isCollections = (t) => e15.includes(t, "create_collections", "delete_collections", "read_collections", "update_collections");
  static isData = (t) => e15.includes(t, "create_data", "delete_data", "read_data", "update_data");
  static isGroups = (t) => e15.includes(t, "read_groups", "assign_and_revoke_groups");
  static isNodes = (t) => e15.includes(t, "read_nodes");
  static isReplicate = (t) => e15.includes(t, "create_replicate", "read_replicate", "update_replicate", "delete_replicate");
  static isRoles = (t) => e15.includes(t, "create_roles", "read_roles", "update_roles", "delete_roles");
  static isTenants = (t) => e15.includes(t, "create_tenants", "delete_tenants", "read_tenants", "update_tenants");
  static isUsers = (t) => e15.includes(t, "read_users", "assign_and_revoke_users");
  static isPermission = (t) => !Array.isArray(t);
  static isPermissionArray = (t) => Array.isArray(t) && t.every(e15.isPermission);
  static isPermissionMatrix = (t) => Array.isArray(t) && t.every(e15.isPermissionArray);
  static isPermissionTuple = (t) => Array.isArray(t) && t.every((r) => e15.isPermission(r) || e15.isPermissionArray(r));
};
var ee = class e16 {
  static flattenPermissions = (t) => Array.isArray(t) ? t.flat(2) : [t];
  static permissionToWeaviate = (t) => {
    if (Me.isAlias(t)) return Array.from(t.actions).map((r) => ({ aliases: t, action: r }));
    if (Me.isBackups(t)) return Array.from(t.actions).map((r) => ({ backups: t, action: r }));
    if (Me.isMcp(t)) return Array.from(t.actions).map((r) => ({ action: r }));
    if (Me.isCluster(t)) return Array.from(t.actions).map((r) => ({ action: r }));
    if (Me.isCollections(t)) return Array.from(t.actions).map((r) => ({ collections: t, action: r }));
    if (Me.isData(t)) return Array.from(t.actions).map((r) => ({ data: t, action: r }));
    if (Me.isGroups(t)) return Array.from(t.actions).map((r) => ({ groups: { group: t.groupID, groupType: t.groupType }, action: r }));
    if (Me.isNodes(t)) return Array.from(t.actions).map((r) => ({ nodes: t, action: r }));
    if (Me.isReplicate(t)) return Array.from(t.actions).map((r) => ({ replicate: t, action: r }));
    if (Me.isRoles(t)) return Array.from(t.actions).map((r) => ({ roles: t, action: r }));
    if (Me.isTenants(t)) return Array.from(t.actions).map((r) => ({ tenants: t, action: r }));
    if (Me.isUsers(t)) return Array.from(t.actions).map((r) => ({ users: t, action: r }));
    throw new Error(`Unknown permission type: ${JSON.stringify(t, null, 2)}`);
  };
  static roleFromWeaviate = (t) => Gs.use(t).map();
  static roles = (t) => t.reduce((r, a) => ({ ...r, [a.name]: e16.roleFromWeaviate(a) }), {});
  static groupsAssignments = (t) => t.map((r) => ({ groupID: r.groupId || "", groupType: r.groupType }));
  static users = (t) => t.reduce((r, a) => ({ ...r, [a]: { id: a } }), {});
  static user = (t) => ({ id: t.username, roles: t.roles?.map(e16.roleFromWeaviate) });
  static dbUser = (t) => ({ userType: t.dbUserType, id: t.userId, roleNames: t.roles, active: t.active, createdAt: e16.unknownDate(t.createdAt), lastUsedAt: e16.unknownDate(t.lastUsedAt), apiKeyFirstLetters: t.apiKeyFirstLetters });
  static dbUsers = (t) => t.map(e16.dbUser);
  static assignedUsers = (t) => t.map((r) => ({ id: r.userId || "", userType: r.userType }));
  static unknownDate = (t) => t !== void 0 && typeof t == "string" && t !== gh ? new Date(t) : void 0;
};
var Gs = class e17 {
  mappings;
  role;
  constructor(t) {
    this.mappings = { aliases: {}, backups: {}, cluster: {}, collections: {}, data: {}, groups: {}, mcp: {}, nodes: {}, replicate: {}, roles: {}, tenants: {}, users: {} }, this.role = t;
  }
  static use = (t) => new e17(t);
  map = () => (this.role.permissions !== null && this.role.permissions.forEach(this.permissionFromWeaviate), { name: this.role.name, aliasPermissions: Object.values(this.mappings.aliases), backupsPermissions: Object.values(this.mappings.backups), clusterPermissions: Object.values(this.mappings.cluster), collectionsPermissions: Object.values(this.mappings.collections), dataPermissions: Object.values(this.mappings.data), groupsPermissions: Object.values(this.mappings.groups), mcpPermissions: Object.values(this.mappings.mcp), nodesPermissions: Object.values(this.mappings.nodes), replicatePermissions: Object.values(this.mappings.replicate), rolesPermissions: Object.values(this.mappings.roles), tenantsPermissions: Object.values(this.mappings.tenants), usersPermissions: Object.values(this.mappings.users) });
  aliases = (t) => {
    if (t.aliases !== void 0) {
      let { alias: r, collection: a } = t.aliases;
      if (r === void 0) throw new Error("Alias permission missing an alias");
      this.mappings.aliases[r] === void 0 && (this.mappings.aliases[r] = { alias: r, collection: a || "*", actions: [] }), this.mappings.aliases[r].actions.push(t.action);
    }
  };
  backups = (t) => {
    if (t.backups !== void 0) {
      let r = t.backups.collection;
      if (r === void 0) throw new Error("Backups permission missing collection");
      this.mappings.backups[r] === void 0 && (this.mappings.backups[r] = { collection: r, actions: [] }), this.mappings.backups[r].actions.push(t.action);
    }
  };
  mcp = (t) => {
    (t.action === "create_mcp" || t.action === "read_mcp" || t.action === "update_mcp") && (this.mappings.mcp[""] === void 0 && (this.mappings.mcp[""] = { actions: [] }), this.mappings.mcp[""].actions.push(t.action));
  };
  cluster = (t) => {
    t.action === "read_cluster" && (this.mappings.cluster[""] === void 0 && (this.mappings.cluster[""] = { actions: [] }), this.mappings.cluster[""].actions.push("read_cluster"));
  };
  collections = (t) => {
    if (t.collections !== void 0) {
      let r = t.collections.collection;
      if (r === void 0) throw new Error("Collections permission missing collection");
      this.mappings.collections[r] === void 0 && (this.mappings.collections[r] = { collection: r, actions: [] }), this.mappings.collections[r].actions.push(t.action);
    }
  };
  data = (t) => {
    if (t.data !== void 0) {
      let { collection: r, tenant: a } = t.data;
      if (r === void 0) throw new Error("Data permission missing collection");
      let i = a === void 0 ? r : `${r}#${a}`;
      this.mappings.data[i] === void 0 && (this.mappings.data[i] = { collection: r, tenant: a || "*", actions: [] }), this.mappings.data[i].actions.push(t.action);
    }
  };
  groups = (t) => {
    if (t.groups !== void 0) {
      let { group: r, groupType: a } = t.groups;
      if (r === void 0) throw new Error("Group permission missing groupID");
      if (a === void 0) throw new Error("Group permission missing groupType");
      let i = `${a}#${r}`;
      this.mappings.groups[i] === void 0 && (this.mappings.groups[i] = { groupType: a, groupID: r, actions: [] }), this.mappings.groups[i].actions.push(t.action);
    }
  };
  nodes = (t) => {
    if (t.nodes !== void 0) {
      let { collection: r } = t.nodes, { verbosity: a } = t.nodes;
      if (a === void 0) throw new Error("Nodes permission missing verbosity");
      if (a === "verbose") {
        if (r === void 0) throw new Error("Nodes permission missing collection");
      } else if (a === "minimal") r = "*";
      else throw new Error("Nodes permission missing verbosity");
      let i = `${r}#${a}`;
      this.mappings.nodes[i] === void 0 && (this.mappings.nodes[i] = { collection: r, verbosity: a, actions: [] }), this.mappings.nodes[i].actions.push(t.action);
    }
  };
  replicate = (t) => {
    if (t.replicate !== void 0) {
      let { collection: r, shard: a } = t.replicate;
      if (r === void 0) throw new Error("Replicate permission missing collection");
      if (a === void 0) throw new Error("Replicate permission missing shard");
      let i = `${r}#${a}`;
      this.mappings.replicate[i] === void 0 && (this.mappings.replicate[i] = { collection: r, shard: a, actions: [] }), this.mappings.replicate[i].actions.push(t.action);
    }
  };
  roles = (t) => {
    if (t.roles !== void 0) {
      let r = t.roles.role;
      if (r === void 0) throw new Error("Roles permission missing role");
      this.mappings.roles[r] === void 0 && (this.mappings.roles[r] = { role: r, actions: [] }), this.mappings.roles[r].actions.push(t.action);
    }
  };
  tenants = (t) => {
    if (t.tenants !== void 0) {
      let { collection: r, tenant: a } = t.tenants;
      if (r === void 0) throw new Error("Tenants permission missing collection");
      let i = a === void 0 ? r : `${r}#${a}`;
      this.mappings.tenants[i] === void 0 && (this.mappings.tenants[i] = { collection: r, tenant: a || "*", actions: [] }), this.mappings.tenants[i].actions.push(t.action);
    }
  };
  users = (t) => {
    if (t.users !== void 0) {
      let r = t.users.users;
      if (r === void 0) throw new Error("Users permission missing user");
      this.mappings.users[r] === void 0 && (this.mappings.users[r] = { users: r, actions: [] }), this.mappings.users[r].actions.push(t.action);
    }
  };
  permissionFromWeaviate = (t) => {
    this.aliases(t), this.backups(t), this.cluster(t), this.collections(t), this.data(t), this.groups(t), this.mcp(t), this.nodes(t), this.replicate(t), this.roles(t), this.tenants(t), this.users(t);
  };
};
var mh = (e24) => ({ oidc: { getAssignedRoles: (t, r) => e24.get(`/authz/groups/${encodeURIComponent(t)}/roles/oidc${r ? "?includeFullRoles=true" : ""}`).then(ee.roles), assignRoles: (t, r) => e24.postEmpty(`/authz/groups/${encodeURIComponent(t)}/assign`, { roles: Array.isArray(r) ? r : [r], groupType: "oidc" }), revokeRoles: (t, r) => e24.postEmpty(`/authz/groups/${encodeURIComponent(t)}/revoke`, { roles: Array.isArray(r) ? r : [r], groupType: "oidc" }), getKnownGroupNames: () => e24.get("/authz/groups/oidc") } });
var hp = mh;
d();
d();
var Wr = class extends O {
  dbVersionProvider;
  constructor(t, r) {
    super(t), this.dbVersionProvider = r;
  }
  validate() {
  }
  do = () => this.client.get("/.well-known/live", false).then(() => (setTimeout(() => this.dbVersionProvider.refresh()), Promise.resolve(true))).catch(() => Promise.resolve(false));
};
d();
var Lt = class extends O {
  constructor(t) {
    super(t);
  }
  validate() {
  }
  do = () => this.client.get("/meta", true);
};
d();
var qr = class extends O {
  dbVersionProvider;
  constructor(t, r) {
    super(t), this.dbVersionProvider = r;
  }
  validate() {
  }
  do = () => this.client.get("/.well-known/ready", false).then(() => (setTimeout(() => this.dbVersionProvider.refresh()), Promise.resolve(true))).catch(() => Promise.resolve(false));
};
d();
var hh = (e24) => ({ listAll: () => e24.get("/authz/roles").then(ee.roles), byName: (t) => e24.get(`/authz/roles/${t}`).then(ee.roleFromWeaviate), assignedUserIds: (t) => e24.get(`/authz/roles/${t}/users`), userAssignments: (t) => e24.get(`/authz/roles/${t}/user-assignments`, true).then(ee.assignedUsers), create: (t, r) => {
  let a = r ? ee.flattenPermissions(r).flatMap(ee.permissionToWeaviate) : void 0;
  return e24.postEmpty("/authz/roles", { name: t, permissions: a }).then(() => ee.roleFromWeaviate({ name: t, permissions: a || [] }));
}, delete: (t) => e24.delete(`/authz/roles/${t}`, null), exists: (t) => e24.get(`/authz/roles/${t}`).then(() => true).catch(() => false), addPermissions: (t, r) => e24.postEmpty(`/authz/roles/${t}/add-permissions`, { permissions: ee.flattenPermissions(r).flatMap(ee.permissionToWeaviate) }), removePermissions: (t, r) => e24.postEmpty(`/authz/roles/${t}/remove-permissions`, { permissions: ee.flattenPermissions(r).flatMap(ee.permissionToWeaviate) }), hasPermissions: (t, r) => Promise.all((Array.isArray(r) ? r : [r]).flatMap((a) => ee.permissionToWeaviate(a)).map((a) => e24.postReturn(`/authz/roles/${t}/has-permission`, a))).then((a) => a.every((i) => i)), getGroupAssignments: (t) => e24.get(`/authz/roles/${t}/group-assignments`).then(ee.groupsAssignments) });
var yp = { aliases: (e24) => {
  let t = Array.isArray(e24.alias) ? e24.alias : [e24.alias], r = Array.isArray(e24.collection) ? e24.collection : [e24.collection];
  return t.flatMap((i) => r.map((n) => ({ alias: i, collection: n }))).map(({ collection: i, alias: n }) => {
    let o = { alias: n, collection: i, actions: [] };
    return e24.create && o.actions.push("create_aliases"), e24.read && o.actions.push("read_aliases"), e24.update && o.actions.push("update_aliases"), e24.delete && o.actions.push("delete_aliases"), o;
  });
}, backup: (e24) => (Array.isArray(e24.collection) ? e24.collection : [e24.collection]).flatMap((r) => {
  let a = { collection: r, actions: [] };
  return e24.manage && a.actions.push("manage_backups"), a;
}), mcp: (e24) => {
  let t = { actions: [] };
  return e24.create && t.actions.push("create_mcp"), e24.read && t.actions.push("read_mcp"), e24.update && t.actions.push("update_mcp"), [t];
}, cluster: (e24) => {
  let t = { actions: [] };
  return e24.read && t.actions.push("read_cluster"), [t];
}, collections: (e24) => (Array.isArray(e24.collection) ? e24.collection : [e24.collection]).flatMap((r) => {
  let a = { collection: r, actions: [] };
  return e24.create_collection && a.actions.push("create_collections"), e24.read_config && a.actions.push("read_collections"), e24.update_config && a.actions.push("update_collections"), e24.delete_collection && a.actions.push("delete_collections"), a;
}), data: (e24) => {
  let t = Array.isArray(e24.collection) ? e24.collection : [e24.collection], r = Array.isArray(e24.tenant) ? e24.tenant : [e24.tenant ?? "*"];
  return t.flatMap((i) => r.map((n) => ({ collection: i, tenant: n }))).flatMap(({ collection: i, tenant: n }) => {
    let o = { collection: i, tenant: n, actions: [] };
    return e24.create && o.actions.push("create_data"), e24.read && o.actions.push("read_data"), e24.update && o.actions.push("update_data"), e24.delete && o.actions.push("delete_data"), o;
  });
}, groups: { oidc: (e24) => {
  let t = Array.isArray(e24.groupID) ? e24.groupID : [e24.groupID], r = [];
  return e24.read && r.push("read_groups"), e24.assignAndRevoke && r.push("assign_and_revoke_groups"), t.map((a) => ({ groupID: a, groupType: "oidc", actions: r }));
} }, nodes: { minimal: (e24) => {
  let t = { collection: "*", actions: [], verbosity: "minimal" };
  return e24.read && t.actions.push("read_nodes"), [t];
}, verbose: (e24) => (Array.isArray(e24.collection) ? e24.collection : [e24.collection]).flatMap((r) => {
  let a = { collection: r, actions: [], verbosity: "verbose" };
  return e24.read && a.actions.push("read_nodes"), a;
}) }, replicate: (e24) => {
  let t = Array.isArray(e24.collection) ? e24.collection : [e24.collection], r = Array.isArray(e24.shard) ? e24.shard : [e24.shard];
  return t.flatMap((i) => r.map((n) => ({ collection: i, shard: n }))).map(({ collection: i, shard: n }) => {
    let o = { collection: i, shard: n, actions: [] };
    return e24.create && o.actions.push("create_replicate"), e24.read && o.actions.push("read_replicate"), e24.update && o.actions.push("update_replicate"), e24.delete && o.actions.push("delete_replicate"), o;
  });
}, roles: (e24) => (Array.isArray(e24.role) ? e24.role : [e24.role]).flatMap((r) => {
  let a = { role: r, actions: [] };
  return e24.create && a.actions.push("create_roles"), e24.read && a.actions.push("read_roles"), e24.update && a.actions.push("update_roles"), e24.delete && a.actions.push("delete_roles"), a;
}), tenants: (e24) => {
  let t = Array.isArray(e24.collection) ? e24.collection : [e24.collection], r = Array.isArray(e24.tenant) ? e24.tenant : [e24.tenant ?? "*"];
  return t.flatMap((i) => r.map((n) => ({ collection: i, tenant: n }))).flatMap(({ collection: i, tenant: n }) => {
    let o = { collection: i, tenant: n, actions: [] };
    return e24.create && o.actions.push("create_tenants"), e24.read && o.actions.push("read_tenants"), e24.update && o.actions.push("update_tenants"), e24.delete && o.actions.push("delete_tenants"), o;
  });
}, users: (e24) => (Array.isArray(e24.user) ? e24.user : [e24.user]).flatMap((r) => {
  let a = { users: r, actions: [] };
  return e24.assignAndRevoke && a.actions.push("assign_and_revoke_users"), e24.read && a.actions.push("read_users"), a;
}) };
var Tp = hh;
d();
d();
var ws2 = (e24) => ({ indexed: e24.indexed || [], query: e24.query || [] });
var yh = (e24, t) => ({ text: (r, a, i) => {
  if (i?.stopwords !== void 0 && i?.stopwordPresets !== void 0) return Promise.reject(new F("stopwords and stopwordPresets are mutually exclusive; pass at most one"));
  let n = i?.stopwords !== void 0 || i?.stopwordPresets !== void 0;
  return t.supportsTokenize().then(({ supports: o, message: s }) => o ? Promise.resolve() : Promise.reject(new Error(s))).then(() => n ? t.supportsTokenizeStopwords().then(({ supports: o, message: s }) => o ? Promise.resolve() : Promise.reject(new Error(s))) : Promise.resolve()).then(() => e24.postReturn("/tokenize", { text: r, tokenization: a, analyzerConfig: Io(i?.analyzerConfig), stopwords: i?.stopwords, stopwordPresets: i?.stopwordPresets }).then(ws2));
}, forProperty: (r, a, i) => t.supportsTokenize().then(({ supports: n, message: o }) => n ? Promise.resolve() : Promise.reject(new Error(o))).then(() => e24.postReturn(`/schema/${r}/properties/${a}/tokenize`, { text: i })).then(ws2) });
var vp = yh;
d();
var Th = (e24) => {
  let t = xh(e24);
  return { getMyUser: () => e24.get("/users/own-info").then(ee.user), getAssignedRoles: (r) => e24.get(`/authz/users/${encodeURIComponent(r)}/roles`).then(ee.roles), assignRoles: (r, a) => t.assignRoles(r, a), revokeRoles: (r, a) => t.revokeRoles(r, a), db: vh(e24), oidc: bh(e24) };
};
var vh = (e24) => {
  let t = Ms(e24), r = (a) => (i) => {
    if (i instanceof Ct && i.code === a) return false;
    throw i;
  };
  return { getAssignedRoles: (a, i) => t.getAssignedRoles("db", a, i), assignRoles: (a, i) => t.assignRoles(a, i, { userType: "db" }), revokeRoles: (a, i) => t.revokeRoles(a, i, { userType: "db" }), create: (a) => e24.postReturn(`/users/db/${encodeURIComponent(a)}`, null).then((i) => i.apikey), delete: (a) => e24.delete(`/users/db/${encodeURIComponent(a)}`, null).then(() => true).catch(() => false), rotateKey: (a) => e24.postReturn(`/users/db/${encodeURIComponent(a)}/rotate-key`, null).then((i) => i.apikey), activate: (a) => e24.postEmpty(`/users/db/${encodeURIComponent(a)}/activate`, null).then(() => true).catch(r(409)), deactivate: (a, i) => e24.postEmpty(`/users/db/${encodeURIComponent(a)}/deactivate`, i || null).then(() => true).catch(r(409)), byName: (a, i) => e24.get(`/users/db/${encodeURIComponent(a)}?includeLastUsedTime=${i?.includeLastUsedTime || false}`, true).then(ee.dbUser), listAll: (a) => e24.get(`/users/db?includeLastUsedTime=${a?.includeLastUsedTime || false}`, true).then(ee.dbUsers) };
};
var bh = (e24) => {
  let t = Ms(e24);
  return { getAssignedRoles: (r, a) => t.getAssignedRoles("oidc", r, a), assignRoles: (r, a) => t.assignRoles(r, a, { userType: "oidc" }), revokeRoles: (r, a) => t.revokeRoles(r, a, { userType: "oidc" }) };
};
var xh = (e24) => {
  let t = Ms(e24);
  return { assignRoles: (r, a) => t.assignRoles(r, a), revokeRoles: (r, a) => t.revokeRoles(r, a) };
};
var Ms = (e24) => ({ getAssignedRoles: (t, r, a) => e24.get(`/authz/users/${encodeURIComponent(r)}/roles/${t}?includeFullRoles=${a?.includePermissions || false}`).then(ee.roles), assignRoles: (t, r, a) => e24.postEmpty(`/authz/users/${encodeURIComponent(r)}/assign`, { ...a, roles: Array.isArray(t) ? t : [t] }), revokeRoles: (t, r, a) => e24.postEmpty(`/authz/users/${encodeURIComponent(r)}/revoke`, { ...a, roles: Array.isArray(t) ? t : [t] }) });
var bp = Th;
d();
d();
var Lr = class extends cn {
  gql;
  constructor(t) {
    super(t), this.gql = Ph(t);
  }
  query = (t, r) => this.authEnabled ? this.login().then((a) => {
    let i = { Authorization: `Bearer ${a}` };
    return this.gql.query(t, r, i);
  }) : this.gql.query(t, r);
  close = () => this.http.close();
};
var Ph = (e24) => {
  let r = `${e24.host}/v1/graphql`, a = e24.headers;
  return { query: (i, n, o) => new GraphQLClient(r, { headers: { ...a, ...o } }).request(i, n, o).then((s) => ({ data: s })) };
};
d();
d();
var Jr = ze(Ke());
function Rh(e24) {
  switch (e24) {
    case 0:
    case "UNKNOWN":
      return 0;
    case 1:
    case "SERVING":
      return 1;
    case 2:
    case "NOT_SERVING":
      return 2;
    case 3:
    case "SERVICE_UNKNOWN":
      return 3;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1;
  }
}
function Ah(e24) {
  switch (e24) {
    case 0:
      return "UNKNOWN";
    case 1:
      return "SERVING";
    case 2:
      return "NOT_SERVING";
    case 3:
      return "SERVICE_UNKNOWN";
    case -1:
    default:
      return "UNRECOGNIZED";
  }
}
function xp() {
  return { service: "" };
}
var Es = { encode(e24, t = Jr.default.Writer.create()) {
  return e24.service !== "" && t.uint32(10).string(e24.service), t;
}, decode(e24, t) {
  let r = e24 instanceof Jr.default.Reader ? e24 : Jr.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = xp();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.service = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { service: Rp(e24.service) ? globalThis.String(e24.service) : "" };
}, toJSON(e24) {
  let t = {};
  return e24.service !== "" && (t.service = e24.service), t;
}, create(e24) {
  return Es.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = xp();
  return t.service = e24.service ?? "", t;
} };
function Cp() {
  return { status: 0 };
}
var Us = { encode(e24, t = Jr.default.Writer.create()) {
  return e24.status !== 0 && t.uint32(8).int32(e24.status), t;
}, decode(e24, t) {
  let r = e24 instanceof Jr.default.Reader ? e24 : Jr.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Cp();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 8) break;
        i.status = r.int32();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { status: Rp(e24.status) ? Rh(e24.status) : 0 };
}, toJSON(e24) {
  let t = {};
  return e24.status !== 0 && (t.status = Ah(e24.status)), t;
}, create(e24) {
  return Us.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Cp();
  return t.status = e24.status ?? 0, t;
} };
var Pp = { name: "Health", fullName: "grpc.health.v1.Health", methods: { check: { name: "Check", requestType: Es, requestStream: false, responseType: Us, responseStream: false, options: {} }, watch: { name: "Watch", requestType: Es, requestStream: false, responseType: Us, responseStream: true, options: {} } } };
function Rp(e24) {
  return e24 != null;
}
d();
d();
var Je = ze(Ke());
function Np() {
  return { collection: "", filters: void 0, verbose: false, dryRun: false, consistencyLevel: void 0, tenant: void 0 };
}
var Ia = { encode(e24, t = Je.default.Writer.create()) {
  return e24.collection !== "" && t.uint32(10).string(e24.collection), e24.filters !== void 0 && H.encode(e24.filters, t.uint32(18).fork()).ldelim(), e24.verbose !== false && t.uint32(24).bool(e24.verbose), e24.dryRun !== false && t.uint32(32).bool(e24.dryRun), e24.consistencyLevel !== void 0 && t.uint32(40).int32(e24.consistencyLevel), e24.tenant !== void 0 && t.uint32(50).string(e24.tenant), t;
}, decode(e24, t) {
  let r = e24 instanceof Je.default.Reader ? e24 : Je.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Np();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.collection = r.string();
        continue;
      case 2:
        if (n !== 18) break;
        i.filters = H.decode(r, r.uint32());
        continue;
      case 3:
        if (n !== 24) break;
        i.verbose = r.bool();
        continue;
      case 4:
        if (n !== 32) break;
        i.dryRun = r.bool();
        continue;
      case 5:
        if (n !== 40) break;
        i.consistencyLevel = r.int32();
        continue;
      case 6:
        if (n !== 50) break;
        i.tenant = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { collection: Le(e24.collection) ? globalThis.String(e24.collection) : "", filters: Le(e24.filters) ? H.fromJSON(e24.filters) : void 0, verbose: Le(e24.verbose) ? globalThis.Boolean(e24.verbose) : false, dryRun: Le(e24.dryRun) ? globalThis.Boolean(e24.dryRun) : false, consistencyLevel: Le(e24.consistencyLevel) ? tr(e24.consistencyLevel) : void 0, tenant: Le(e24.tenant) ? globalThis.String(e24.tenant) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.collection !== "" && (t.collection = e24.collection), e24.filters !== void 0 && (t.filters = H.toJSON(e24.filters)), e24.verbose !== false && (t.verbose = e24.verbose), e24.dryRun !== false && (t.dryRun = e24.dryRun), e24.consistencyLevel !== void 0 && (t.consistencyLevel = rr(e24.consistencyLevel)), e24.tenant !== void 0 && (t.tenant = e24.tenant), t;
}, create(e24) {
  return Ia.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Np();
  return t.collection = e24.collection ?? "", t.filters = e24.filters !== void 0 && e24.filters !== null ? H.fromPartial(e24.filters) : void 0, t.verbose = e24.verbose ?? false, t.dryRun = e24.dryRun ?? false, t.consistencyLevel = e24.consistencyLevel ?? void 0, t.tenant = e24.tenant ?? void 0, t;
} };
function Vp() {
  return { took: 0, failed: 0, matches: 0, successful: 0, objects: [] };
}
var Fs = { encode(e24, t = Je.default.Writer.create()) {
  e24.took !== 0 && t.uint32(13).float(e24.took), e24.failed !== 0 && t.uint32(16).int64(e24.failed), e24.matches !== 0 && t.uint32(24).int64(e24.matches), e24.successful !== 0 && t.uint32(32).int64(e24.successful);
  for (let r of e24.objects) ia.encode(r, t.uint32(42).fork()).ldelim();
  return t;
}, decode(e24, t) {
  let r = e24 instanceof Je.default.Reader ? e24 : Je.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Vp();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 13) break;
        i.took = r.float();
        continue;
      case 2:
        if (n !== 16) break;
        i.failed = Ds(r.int64());
        continue;
      case 3:
        if (n !== 24) break;
        i.matches = Ds(r.int64());
        continue;
      case 4:
        if (n !== 32) break;
        i.successful = Ds(r.int64());
        continue;
      case 5:
        if (n !== 42) break;
        i.objects.push(ia.decode(r, r.uint32()));
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { took: Le(e24.took) ? globalThis.Number(e24.took) : 0, failed: Le(e24.failed) ? globalThis.Number(e24.failed) : 0, matches: Le(e24.matches) ? globalThis.Number(e24.matches) : 0, successful: Le(e24.successful) ? globalThis.Number(e24.successful) : 0, objects: globalThis.Array.isArray(e24?.objects) ? e24.objects.map((t) => ia.fromJSON(t)) : [] };
}, toJSON(e24) {
  let t = {};
  return e24.took !== 0 && (t.took = e24.took), e24.failed !== 0 && (t.failed = Math.round(e24.failed)), e24.matches !== 0 && (t.matches = Math.round(e24.matches)), e24.successful !== 0 && (t.successful = Math.round(e24.successful)), e24.objects?.length && (t.objects = e24.objects.map((r) => ia.toJSON(r))), t;
}, create(e24) {
  return Fs.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Vp();
  return t.took = e24.took ?? 0, t.failed = e24.failed ?? 0, t.matches = e24.matches ?? 0, t.successful = e24.successful ?? 0, t.objects = e24.objects?.map((r) => ia.fromPartial(r)) || [], t;
} };
function Op() {
  return { uuid: new Uint8Array(0), successful: false, error: void 0 };
}
var ia = { encode(e24, t = Je.default.Writer.create()) {
  return e24.uuid.length !== 0 && t.uint32(10).bytes(e24.uuid), e24.successful !== false && t.uint32(16).bool(e24.successful), e24.error !== void 0 && t.uint32(26).string(e24.error), t;
}, decode(e24, t) {
  let r = e24 instanceof Je.default.Reader ? e24 : Je.default.Reader.create(e24), a = t === void 0 ? r.len : r.pos + t, i = Op();
  for (; r.pos < a; ) {
    let n = r.uint32();
    switch (n >>> 3) {
      case 1:
        if (n !== 10) break;
        i.uuid = r.bytes();
        continue;
      case 2:
        if (n !== 16) break;
        i.successful = r.bool();
        continue;
      case 3:
        if (n !== 26) break;
        i.error = r.string();
        continue;
    }
    if ((n & 7) === 4 || n === 0) break;
    r.skipType(n & 7);
  }
  return i;
}, fromJSON(e24) {
  return { uuid: Le(e24.uuid) ? Nh(e24.uuid) : new Uint8Array(0), successful: Le(e24.successful) ? globalThis.Boolean(e24.successful) : false, error: Le(e24.error) ? globalThis.String(e24.error) : void 0 };
}, toJSON(e24) {
  let t = {};
  return e24.uuid.length !== 0 && (t.uuid = Vh(e24.uuid)), e24.successful !== false && (t.successful = e24.successful), e24.error !== void 0 && (t.error = e24.error), t;
}, create(e24) {
  return ia.fromPartial(e24 ?? {});
}, fromPartial(e24) {
  let t = Op();
  return t.uuid = e24.uuid ?? new Uint8Array(0), t.successful = e24.successful ?? false, t.error = e24.error ?? void 0, t;
} };
function Nh(e24) {
  if (globalThis.Buffer) return Uint8Array.from(globalThis.Buffer.from(e24, "base64"));
  {
    let t = globalThis.atob(e24), r = new Uint8Array(t.length);
    for (let a = 0; a < t.length; ++a) r[a] = t.charCodeAt(a);
    return r;
  }
}
function Vh(e24) {
  if (globalThis.Buffer) return globalThis.Buffer.from(e24).toString("base64");
  {
    let t = [];
    return e24.forEach((r) => {
      t.push(globalThis.String.fromCharCode(r));
    }), globalThis.btoa(t.join(""));
  }
}
function Ds(e24) {
  if (e24.gt(globalThis.Number.MAX_SAFE_INTEGER)) throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  return e24.toNumber();
}
Je.default.util.Long !== long_default && (Je.default.util.Long = long_default, Je.default.configure());
function Le(e24) {
  return e24 != null;
}
d();
var vt = class {
  connection;
  collection;
  timeout;
  consistencyLevel;
  tenant;
  metadata;
  abortSignal;
  constructor(t, r, a, i, n, o, s) {
    this.connection = t, this.collection = r, this.metadata = a, this.timeout = i, this.consistencyLevel = this.mapConsistencyLevel(n), this.tenant = o, this.abortSignal = s;
  }
  mapConsistencyLevel(t) {
    switch (t) {
      case "ALL":
        return 3;
      case "QUORUM":
        return 2;
      case "ONE":
        return 1;
      default:
        return 0;
    }
  }
  sendWithTimeout = (t, r) => {
    let a = new AbortController(), i = this.abortSignal ? AbortSignal.any([a.signal, this.abortSignal]) : a.signal, n = setTimeout(() => a.abort(), this.timeout * 1e3);
    return t(i).catch((o) => {
      throw o instanceof import_nice_grpc_common.ServerError && o.code === import_nice_grpc_common.Status.PERMISSION_DENIED ? new jr(7, o.message) : (0, import_abort_controller_x.isAbortError)(o) && this.abortSignal === void 0 ? new Xr(`timed out after ${this.timeout * 1e3}ms`) : (0, import_abort_controller_x.isAbortError)(o) && this.abortSignal !== void 0 ? o : r(o);
    }).finally(() => clearTimeout(n));
  };
};
d();
var Tr = { retry: true, retryMaxAttempts: 5, retryableStatuses: [import_nice_grpc_common.Status.UNAVAILABLE], onRetryableError(e24, t, r) {
  console.warn(e24, `Attempt ${t} failed. Retrying in ${r}ms.`);
} };
var _a = class e18 extends vt {
  static use(t, r, a, i, n, o) {
    return new e18(t, r, a, i, n, o);
  }
  withStream = (t) => this.callStream(t);
  withDelete = (t) => this.callDelete(Ia.fromPartial(t));
  withObjects = (t) => this.callObjects(Oa.fromPartial(t));
  async *callStream(t) {
    let r = this.consistencyLevel;
    async function* a() {
      yield Ge.create({ start: { consistencyLevel: r } });
      for await (let i of t) yield i;
    }
    try {
      for await (let i of this.connection.batchStream(a(), { metadata: this.metadata })) yield i;
    } catch (i) {
      throw i instanceof import_nice_grpc_common.ClientError ? new Ja(i.message) : i;
    }
  }
  callDelete(t) {
    return this.sendWithTimeout((r) => this.connection.batchDelete({ ...t, collection: this.collection, consistencyLevel: this.consistencyLevel, tenant: this.tenant }, { metadata: this.metadata, signal: r }), (r) => new Da(r.message));
  }
  callObjects(t) {
    return this.sendWithTimeout((r) => this.connection.batchObjects({ ...t, consistencyLevel: this.consistencyLevel }, { metadata: this.metadata, signal: r, ...Tr }), (r) => new Wa(r.message));
  }
};
d();
var Ba = class e19 extends vt {
  static use(t, r, a, i, n, o, s) {
    return new e19(t, r, a, i, n, o, s);
  }
  withFetch = (t) => this.call(he.fromPartial(t));
  withBm25 = (t) => this.call(he.fromPartial(t));
  withHybrid = (t) => this.call(he.fromPartial(t));
  withNearAudio = (t) => this.call(he.fromPartial(t));
  withNearDepth = (t) => this.call(he.fromPartial(t));
  withNearImage = (t) => this.call(he.fromPartial(t));
  withNearIMU = (t) => this.call(he.fromPartial(t));
  withNearObject = (t) => this.call(he.fromPartial(t));
  withNearText = (t) => this.call(he.fromPartial(t));
  withNearThermal = (t) => this.call(he.fromPartial(t));
  withNearVector = (t) => this.call(he.fromPartial(t));
  withNearVideo = (t) => this.call(he.fromPartial(t));
  call = (t) => this.sendWithTimeout((r) => this.connection.search({ ...t, collection: this.collection, consistencyLevel: this.consistencyLevel, tenant: this.tenant, uses123Api: true, uses125Api: true, uses127Api: true }, { metadata: this.metadata, signal: r, ...Tr }), (r) => new _t(r.message, "gRPC"));
};
d();
var Ga = class e20 extends vt {
  static use(t, r, a, i) {
    return new e20(t, r, a, i);
  }
  withGet = (t) => this.call(Ra.fromPartial({ names: t.names ? { values: t.names } : void 0 }));
  call(t) {
    return this.sendWithTimeout((r) => this.connection.tenantsGet({ ...t, collection: this.collection }, { metadata: this.metadata, signal: r, ...Tr }), (r) => new Fa(r.message));
  }
};
d();
var ho = class {
  dbVersionProvider;
  constructor(t) {
    this.dbVersionProvider = t;
  }
  getVersion = () => this.dbVersionProvider.getVersion();
  supportsClassNameNamespacedEndpointsPromise() {
    return this.dbVersionProvider.getVersion().then((t) => t.show()).then((t) => ({ version: t, supports: this.supportsClassNameNamespacedEndpoints(t), warns: { deprecatedNonClassNameNamespacedEndpointsForObjects: () => console.warn(`Usage of objects paths without className is deprecated in Weaviate ${t}. Please provide className parameter`), deprecatedNonClassNameNamespacedEndpointsForReferences: () => console.warn(`Usage of references paths without className is deprecated in Weaviate ${t}. Please provide className parameter`), deprecatedNonClassNameNamespacedEndpointsForBeacons: () => console.warn(`Usage of beacons paths without className is deprecated in Weaviate ${t}. Please provide className parameter`), deprecatedWeaviateTooOld: () => console.warn(`Usage of weaviate ${t} is deprecated. Please consider upgrading to the latest version. See https://www.weaviate.io/developers/weaviate for details.`), notSupportedClassNamespacedEndpointsForObjects: () => console.warn(`Usage of objects paths with className is not supported in Weaviate ${t}. className parameter is ignored`), notSupportedClassNamespacedEndpointsForReferences: () => console.warn(`Usage of references paths with className is not supported in Weaviate ${t}. className parameter is ignored`), notSupportedClassNamespacedEndpointsForBeacons: () => console.warn(`Usage of beacons paths with className is not supported in Weaviate ${t}. className parameter is ignored`), notSupportedClassParameterInEndpointsForObjects: () => console.warn(`Usage of objects paths with class query parameter is not supported in Weaviate ${t}. class query parameter is ignored`) } }));
  }
  supportsClassNameNamespacedEndpoints(t) {
    if (typeof t == "string") {
      let r = t.split(".");
      if (r.length >= 2) {
        let a = parseInt(r[0], 10), i = parseInt(r[1], 10);
        return a == 1 && i >= 14 || a >= 2;
      }
    }
    return false;
  }
  errorMessage = (t, r, a) => `${t} is not supported with Weaviate version v${r}. Please use version v${a} or higher.`;
  supportsCompatibleGrpcService = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 27, 0), message: this.errorMessage("The gRPC API", t.show(), "1.27.0") }));
  requiresNamedVectorsInsertFix = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 24, 0) && t.isLowerThan(1, 24, 26) || t.isAtLeast(1, 25, 0) && t.isLowerThan(1, 25, 22) || t.isAtLeast(1, 26, 0) && t.isLowerThan(1, 26, 8) || t.isAtLeast(1, 27, 0) && t.isLowerThan(1, 27, 1), message: this.errorMessage("Named vectors insert fix", t.show(), "1.24.0 <= x < 1.24.26, 1.25.0 <= x < 1.25.22, 1.26.0 <= x < 1.26.8, 1.27.0 <= x < 1.27.1") }));
  supportsTenantGetRESTMethod = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 28, 0), message: this.errorMessage("Tenant get method over REST", t.show(), "1.28.0") }));
  supportsAggregateGRPC = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 29, 0), message: this.errorMessage("Aggregate gRPC method", t.show(), "1.29.0") }));
  supportsVectorsFieldInGRPC = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 29, 0), message: void 0 }));
  supportsSingleGrouped = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 27, 14) && t.isLowerThan(1, 28, 0) || t.isAtLeast(1, 28, 8) && t.isLowerThan(1, 29, 0) || t.isAtLeast(1, 29, 0) && t.isLowerThan(1, 30, 0) || t.isAtLeast(1, 30, 0), message: this.errorMessage("Single/Grouped fields in gRPC", t.show(), "1.30.0") }));
  supportsGenerativeConfigRuntime = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 30, 0), message: this.errorMessage("Generative config runtime", t.show(), "1.30.0") }));
  supportsServerSideBatching = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 36, 0), message: this.errorMessage("Server-side batching", t.show(), "1.36.0") }));
  supportsTokenize = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 37, 0), message: this.errorMessage("Tokenize endpoint", t.show(), "1.37.0") }));
  supportsTokenizeStopwords = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 37, 2), message: this.errorMessage("Tokenize endpoint stopwords / stopwordPresets", t.show(), "1.37.2") }));
  supportsServerSideDefaultVectorIndexType = () => this.dbVersionProvider.getVersion().then((t) => ({ version: t, supports: t.isAtLeast(1, 37, 5), message: void 0 }));
};
var _h = "";
var Ws = class {
  versionPromise;
  versionStringGetter;
  constructor(t) {
    this.versionStringGetter = t, this.versionPromise = void 0;
  }
  getVersionString() {
    return this.getVersion().then((t) => t.show());
  }
  getVersion() {
    return this.versionPromise ? this.versionPromise : this.versionStringGetter().then((t) => this.cache(t));
  }
  refresh(t = false) {
    return t || !this.versionPromise ? (this.versionPromise = void 0, this.versionStringGetter().then((r) => this.cache(r)).then(() => Promise.resolve(true))) : Promise.resolve(false);
  }
  cache(t) {
    return t === _h ? Promise.resolve(new yo(0, 0, 0)) : (this.versionPromise = Promise.resolve(yo.fromString(t)), this.versionPromise);
  }
};
function kp(e24) {
  let t = new Lt(e24), r = () => t.do().then((a) => a.version ? a.version : "");
  return new Ws(r);
}
var yo = class e21 {
  major;
  minor;
  patch;
  constructor(t, r, a) {
    this.major = t, this.minor = r, this.patch = a;
  }
  static fromString = (t) => {
    let r = t.replace(/\.(amd64|arm64|x86_64)$/, ""), a = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/, i = r.match(a);
    if (i) {
      let [n, o, s, u] = i;
      return new e21(parseInt(o, 10), parseInt(s, 10), parseInt(u, 10));
    }
    if (a = /^v?(\d+)\.(\d+)$/, i = r.match(a), i) {
      let [n, o, s] = i;
      return new e21(parseInt(o, 10), parseInt(s, 10));
    }
    throw new Error(`Invalid version string: ${t}`);
  };
  checkNumber = (t) => {
    if (!Number.isSafeInteger(t)) throw new Error(`Invalid number: ${t}`);
  };
  show = () => this.major === 0 && this.major === this.minor && this.minor === this.patch ? "" : `${this.major}.${this.minor}${this.patch !== void 0 ? `.${this.patch}` : ""}`;
  isAtLeast = (t, r, a) => (this.checkNumber(t), this.checkNumber(r), this.major > t ? true : this.major < t ? false : this.minor > r ? true : this.minor < r ? false : this.patch !== void 0 && a !== void 0 && this.patch >= a ? (this.checkNumber(a), true) : false);
  isLowerThan = (t, r, a) => !this.isAtLeast(t, r, a);
};
d();
var wa = class e22 extends vt {
  static use(t, r, a, i, n, o) {
    return new e22(t, r, a, i, n, o);
  }
  withFetch = (t) => this.call(ke.fromPartial(t));
  withHybrid = (t) => this.call(ke.fromPartial(t));
  withNearAudio = (t) => this.call(ke.fromPartial(t));
  withNearDepth = (t) => this.call(ke.fromPartial(t));
  withNearImage = (t) => this.call(ke.fromPartial(t));
  withNearIMU = (t) => this.call(ke.fromPartial(t));
  withNearObject = (t) => this.call(ke.fromPartial(t));
  withNearText = (t) => this.call(ke.fromPartial(t));
  withNearThermal = (t) => this.call(ke.fromPartial(t));
  withNearVector = (t) => this.call(ke.fromPartial(t));
  withNearVideo = (t) => this.call(ke.fromPartial(t));
  call = (t) => this.sendWithTimeout((r) => this.connection.aggregate({ ...t, collection: this.collection, tenant: this.tenant, objectsCount: true }, { metadata: this.metadata, signal: r, ...Tr }), (r) => new _t(r.message, "gRPC"));
};
var Ip = 104858e3;
var aa = class e23 extends Lr {
  grpc;
  grpcMaxMessageLength;
  params;
  constructor(t) {
    super(t), this.grpc = _p(t), this.grpcMaxMessageLength = t.grpcMaxMessageLength, this.params = t;
  }
  static use = (t) => {
    let r = new Lr(t), a = kp(r), i = new ho(a);
    return t.skipInitChecks ? { connection: new e23({ ...t, grpcMaxMessageLength: Ip }), dbVersionProvider: a, dbVersionSupport: i } : Promise.all([e23.connect(t, r.get("/meta", true).then((n) => n.grpcMaxMessageSize || Ip)), i.supportsCompatibleGrpcService().then((n) => {
      if (!n.supports) throw new He(`Checking for gRPC compatibility failed with message: ${n.message}`);
    })]).then(([n]) => ({ connection: n, dbVersionProvider: a, dbVersionSupport: i }));
  };
  async reconnect() {
    if (this.grpc.close(), this.grpc = _p(this.params), !await this.grpc.health()) throw new Yr(this.params.grpcAddress);
  }
  static async connect(t, r) {
    let a = await r.then((n) => new e23({ ...t, grpcMaxMessageLength: n }));
    if (!await a.grpc.health()) throw await a.close(), new Yr(t.grpcAddress);
    return a;
  }
  batch = (t, r, a) => this.authEnabled ? this.login().then((i) => this.grpc.batch(t, r, a, `Bearer ${i}`)) : new Promise((i) => i(this.grpc.batch(t, r, a)));
  aggregate = (t, r, a) => this.authEnabled ? this.login().then((i) => this.grpc.aggregate(t, r, a, `Bearer ${i}`)) : new Promise((i) => i(this.grpc.aggregate(t, r, a)));
  search = (t, r, a, i) => this.authEnabled ? this.login().then((n) => this.grpc.search(t, r, a, `Bearer ${n}`, i)) : new Promise((n) => n(this.grpc.search(t, r, a, void 0, i)));
  tenants = (t) => this.authEnabled ? this.login().then((r) => this.grpc.tenants(t, `Bearer ${r}`)) : new Promise((r) => r(this.grpc.tenants(t)));
  supportsStreaming = () => this.params.transport?.supportsStreaming ?? true;
  close = () => {
    this.grpc.close(), this.http.close();
  };
};
var _p = (e24) => {
  if (!e24.transport) throw new Error("grpcClient requires a transport to be configured");
  let { client: t, health: r, close: a } = e24.transport.create(e24);
  return { aggregate: (i, n, o, s) => wa.use(t, i, qs(e24, s), e24.timeout?.query || 30, n, o), batch: (i, n, o, s) => _a.use(t, i, qs(e24, s), e24.timeout?.insert || 90, n, o), close: () => a(), health: () => {
    let i = new AbortController(), n = setTimeout(() => i.abort(), (e24.timeout?.init || 2) * 1e3);
    return r.check({ service: "/grpc.health.v1.Health/Check" }, { signal: i.signal, retry: true, retryMaxAttempts: 1, retryableStatuses: [import_nice_grpc_common.Status.UNAVAILABLE], onRetryableError(o, s, u) {
      console.warn(o, `Healthcheck ${s} failed. Retrying in ${u}ms.`);
    } }).then((o) => o.status === 1).catch((o) => {
      throw (0, import_abort_controller_x.isAbortError)(o) ? new Yr(e24.grpcAddress) : o;
    }).finally(() => clearTimeout(n));
  }, search: (i, n, o, s, u) => Ba.use(t, i, qs(e24, s), e24.timeout?.query || 30, n, o, u), tenants: (i, n) => Ga.use(t, i, new import_nice_grpc_common.Metadata(n ? { ...e24.headers, authorization: n } : e24.headers), e24.timeout?.query || 30) };
};
var qs = (e24, t) => new import_nice_grpc_common.Metadata({ ...t ? { ...e24.headers, authorization: t, "X-Weaviate-Cluster-Url": e24.host } : e24.headers, ...Ut() });
var Gp = (e24, t) => e24.includes("http") ? (console.warn(`The ${t}.host parameter should not include the protocol. Please remove the http:// or https:// from the ${t}.host parameter.      To specify a secure connection, set the secure parameter to true. The protocol will be inferred from the secure parameter instead.`), e24.replace("http://", "").replace("https://", "")) : e24;
async function wp(e24, t, r) {
  let { host: a } = e24.connectionParams.http, { host: i } = e24.connectionParams.grpc, { port: n, secure: o, path: s } = e24.connectionParams.http, { port: u, secure: c, path: f2 } = e24.connectionParams.grpc;
  a = Gp(a, "rest"), i = Gp(i, "grpc"), e24.headers || (e24.headers = {});
  let y = o ? "https" : "http", P = r(o), { connection: V, dbVersionProvider: j, dbVersionSupport: D } = await aa.use({ host: `${y}://${a}:${n}${s || ""}`, scheme: y, headers: e24.headers, grpcAddress: `${i}:${u}${f2 || ""}`, grpcSecure: c, grpcProxyUrl: e24.proxies?.grpc, apiKey: is(e24.auth) ? $d(e24.auth) : void 0, authClientSecret: is(e24.auth) ? void 0 : e24.auth, agent: P, timeout: e24.timeout, skipInitChecks: e24.skipInitChecks, transport: t }), S = { alias: mp(V), backup: fo(V), batch: go(V, D), cluster: pp(V), collections: gp(V, D), groups: hp(V), roles: Tp(V), tokenize: vp(V, D), users: bp(V), close: () => Promise.resolve(V.close()), getMeta: () => new Lt(V).do(), getConnectionDetails: V.getDetails, getOpenIDConfig: () => new Et(V.http).do(), getWeaviateVersion: () => D.getVersion(), isLive: () => new Wr(V, j).do(), isReady: () => new qr(V, j).do() };
  return V.oidcAuth && (S.oidcAuth = V.oidcAuth), S;
}
d();
d();
var Mp = { name: "Weaviate", fullName: "weaviate.v1.Weaviate", methods: { search: { name: "Search", requestType: he, requestStream: false, responseType: bs, responseStream: false, options: {} }, batchObjects: { name: "BatchObjects", requestType: Oa, requestStream: false, responseType: ps, responseStream: false, options: {} }, batchReferences: { name: "BatchReferences", requestType: ls, requestStream: false, responseType: gs, responseStream: false, options: {} }, batchDelete: { name: "BatchDelete", requestType: Ia, requestStream: false, responseType: Fs, responseStream: false, options: {} }, tenantsGet: { name: "TenantsGet", requestType: Ra, requestStream: false, responseType: ss, responseStream: false, options: {} }, aggregate: { name: "Aggregate", requestType: ke, requestStream: false, responseType: xs, responseStream: false, options: {} }, batchStream: { name: "BatchStream", requestType: Ge, requestStream: true, responseType: fs, responseStream: true, options: {} } } };
var Ep = (0, import_nice_grpc_web.createClientFactory)().use(import_nice_grpc_client_middleware_retry.retryMiddleware);
var Up = { supportsStreaming: false, create: (e24) => {
  let t = /^https?:\/\//.test(e24.grpcAddress) ? e24.grpcAddress : `${e24.grpcSecure ? "https" : "http"}://${e24.grpcAddress}`, r = (0, import_nice_grpc_web.createChannel)(t, (0, import_nice_grpc_web.FetchTransport)()), a = Ep.create(Mp, r), i = Ep.create(Pp, r);
  return { client: a, health: i, close: () => {
  } };
} };
d();
d();
function D_(e24, t = "") {
  let r = e24.toString() + t.toString();
  return v5_default(r, v5_default.DNS).toString();
}
var Ls = "/grpc-web";
function To(e24) {
  return wp(e24, Up, () => {
  });
}
function Dh(e24, t) {
  if (!e24) throw new Error("Missing `clusterURL` parameter");
  e24.startsWith("http") || (e24 = `https://${e24}`);
  let r = new URL(e24), { authCredentials: a, headers: i, timeout: n, skipInitChecks: o, grpcWebPath: s } = t || {};
  return To({ connectionParams: { http: { secure: true, host: r.hostname, port: 443 }, grpc: { secure: true, host: r.hostname, port: 443, path: s ?? Ls } }, auth: a, headers: i, timeout: n, skipInitChecks: o });
}
function Fh(e24) {
  let { httpHost: t, httpPort: r, httpSecure: a, httpPath: i, grpcHost: n, grpcPort: o, grpcSecure: s, grpcPath: u, authCredentials: c, headers: f2, timeout: y, skipInitChecks: P } = e24 || {};
  return To({ connectionParams: { http: { secure: a || false, host: t || "localhost", port: r || 8080, path: i || "" }, grpc: { secure: s || false, host: n || "localhost", port: o ?? r ?? 8080, path: u ?? Ls } }, auth: c, headers: f2, timeout: y, skipInitChecks: P });
}
function Wh(e24) {
  let { host: t, port: r, grpcPort: a, grpcWebPath: i, authCredentials: n, headers: o, timeout: s, skipInitChecks: u } = e24 || {};
  return To({ connectionParams: { http: { secure: false, host: t || "localhost", port: r || 8080 }, grpc: { secure: false, host: t || "localhost", port: a || r || 8080, path: i || Ls } }, auth: n, headers: o, timeout: s, skipInitChecks: u });
}
var Z_ = { connectToCustom: Fh, connectToLocal: Wh, connectToWeaviateCloud: Dh, client: To, ApiKey: Br, AuthUserPasswordCredentials: xa, AuthAccessTokenCredentials: dn, AuthClientCredentials: Ca, configure: ja, configGuards: yu, filter: ao(), reconfigure: Pu, permissions: yp, query: ks };
export {
  Br as ApiKey,
  dn as AuthAccessTokenCredentials,
  Ca as AuthClientCredentials,
  xa as AuthUserPasswordCredentials,
  ds as Bm25Operator,
  ga as Filters,
  mo as Iterator,
  Rs as MetricsManager,
  Bo as Quantizer,
  us as Reference,
  ir as ReferenceManager,
  Fr as Sorting,
  _o as VectorIndex,
  sa as WeaviateBackupCanceled,
  qa as WeaviateBackupCancellationError,
  Bt as WeaviateBackupFailed,
  Wa as WeaviateBatchError,
  Ja as WeaviateBatchStreamError,
  Da as WeaviateDeleteManyError,
  b as WeaviateDeserializationError,
  Yr as WeaviateGRPCUnavailableError,
  jr as WeaviateInsufficientPermissionsError,
  F as WeaviateInvalidInputError,
  _t as WeaviateQueryError,
  Xr as WeaviateRequestTimeoutError,
  Zr as WeaviateSerializationError,
  fu as WeaviateStartUpError,
  Fa as WeaviateTenantsGetError,
  La as WeaviateUnauthenticatedError,
  Pt as WeaviateUnexpectedResponseError,
  Ct as WeaviateUnexpectedStatusCodeError,
  He as WeaviateUnsupportedFeatureError,
  yu as configGuards,
  ja as configure,
  Fh as connectToCustom,
  Wh as connectToLocal,
  Dh as connectToWeaviateCloud,
  wg as dataType,
  Z_ as default,
  lm as downloadImageFromURLAsBase64,
  D_ as generateUuid5,
  Tu as generative,
  nh as generativeParameters,
  Xf as metrics,
  Cu as multiVectors,
  ks as queryFactory,
  Pu as reconfigure,
  vu as reranker,
  lt as toBase64FromMedia,
  Mg as tokenization,
  Eg as vectorDistances,
  Rt as vectorIndex,
  bu as vectorizer,
  xu as vectors
};
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
/*! Bundled license information:

@datastructures-js/deque/src/deque.js:
  (**
   * @license MIT
   * @copyright 2022 Eyas Ranjous <eyas.ranjous@gmail.com>
   *
   * @class
   * double-ended queue
   *)

long/index.js:
  (**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
