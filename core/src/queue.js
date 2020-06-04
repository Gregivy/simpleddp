export default class Queue {

    /*
    *   As the name implies, `consumer` is the (sole) consumer of the queue.
    *   It gets called with each element of the queue and its return value
    *   serves as a ack, determining whether the element is removed or not from
    *   the queue, allowing then subsequent elements to be processed.
    */

    constructor (consumer) {
        this.consumer = consumer;
        this.paused = false;
        this.queue = [];
    }

    pause () {
      this.paused = true;
    }

    continue () {
      this.paused = false;
      this.process();
    }

    push (element) {
        this.queue.push(element);
        this.process();
    }

    unshift (element) {
        this.queue.unshift(element);
        this.process();
    }

    process (opts) {
        if (!this.paused && this.queue.length !== 0) {
            const ack = this.consumer(this.queue[0]);
            if (ack) {
                this.queue.shift();
                if (!this.paused) this.process();
            }
        }
    }

    empty () {
        this.queue = [];
    }

}
