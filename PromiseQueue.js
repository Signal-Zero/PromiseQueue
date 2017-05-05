import Promise from "bluebird";

function defer() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        resolve,
        reject,
        promise,
    };
}

class PromiseQueue {

    constructor() {
        this.queue = [];
        this.queueEmpty = defer();
    }

    count() {
        return this.queue.length;
    }

    add(task, delay) {
        if (Array.isArray(task)) return Promise.all(task.map(this.add));

        return new Promise((resolve, reject) => {
            this.queue.push(
                () => Promise.resolve(task())
                    .then(resolve, reject)
                    .delay(delay),
            );

            if (this.queue.length === 1) {
                this.run(this.queue[0]);
            }
        });
    }

    done() {
        if (this.queue.length === 0) return Promise.resolve();

        return this.queueEmpty.promise;
    }

    run(task) {
        return task().then(this.runNext.bind(this), this.runNext.bind(this));
    }

    runNext() {
        this.queue.shift();
        if (!this.queue.length) {
            this.queueEmpty.resolve();
            return Promise.resolve();
        }

        return this.run(this.queue[0]);
    }
}

export default PromiseQueue;
