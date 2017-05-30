"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function defer() {
    var resolve = void 0;
    var reject = void 0;
    var promise = new _bluebird2.default(function (res, rej) {
        resolve = res;
        reject = rej;
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
}

var PromiseQueue = function () {
    function PromiseQueue() {
        _classCallCheck(this, PromiseQueue);

        this.queue = [];
        this.queueEmpty = defer();
    }

    _createClass(PromiseQueue, [{
        key: "count",
        value: function count() {
            return this.queue.length;
        }
    }, {
        key: "add",
        value: function add(task, delay) {
            var _this = this;

            if (Array.isArray(task)) return _bluebird2.default.all(task.map(this.add));

            return new _bluebird2.default(function (resolve, reject) {
                _this.queue.push(function () {
                    return _bluebird2.default.resolve(task()).then(resolve, reject).delay(delay);
                });

                if (_this.queue.length === 1) {
                    _this.run(_this.queue[0]);
                }
            });
        }
    }, {
        key: "done",
        value: function done() {
            if (this.queue.length === 0) return _bluebird2.default.resolve();

            return this.queueEmpty.promise;
        }
    }, {
        key: "run",
        value: function run(task) {
            return task().then(this.runNext.bind(this), this.runNext.bind(this));
        }
    }, {
        key: "runNext",
        value: function runNext() {
            this.queue.shift();
            if (!this.queue.length) {
                this.queueEmpty.resolve();
                return _bluebird2.default.resolve();
            }

            return this.run(this.queue[0]);
        }
    }]);

    return PromiseQueue;
}();

exports.default = PromiseQueue;