/**
 * A promise representing an asynchronous task with a result of type T.
 * Tasks are queued and yielded as-is, requiring the consumer to await their resolution.
 */
export type Task<T> = Promise<T>;

/**
 * A queue for managing asynchronous tasks (Promises) with iterable access.
 * Tasks can be enqueued and later retrieved via iteration, allowing for lazy,
 * consumer-driven processing. The queue is reusable after iteration by adding
 * more tasks.
 *
 * @example
 * const queue = new AsyncQueue();
 * queue.enqueue(Promise.resolve("Task 1"));
 * for await (const task of queue) {
 *   console.log(await task); // "Task 1"
 * }
 */
export class AsyncQueue {
  /** @private Internal array storing the queued tasks */
  private queue: Array<Task<any>>;

  /**
   * Creates an empty AsyncQueue instance.
   */
  constructor() {
    this.queue = [];
  }

  /**
   * Adds a task to the end of the queue.
   *
   * @template T - The type of the task's resolved value
   * @param {Task<T>} task - The promise to enqueue
   * @returns {void}
   *
   * @example
   * queue.enqueue(new Promise(resolve => setTimeout(() => resolve(42), 1000)));
   */
  enqueue<T = any>(task: Task<T>): void {
    this.queue.push(task);
  }

  /**
   * Removes and returns the first task from the queue.
   *
   * @returns {Task<any> | undefined} The first task in the queue, or undefined if empty
   *
   * @example
   * const task = queue.dequeue();
   * if (task) {
   *   task.then(result => console.log(result));
   * }
   */
  dequeue(): Task<any> | undefined {
    return this.queue.shift();
  }

  /**
   * Returns the number of tasks currently in the queue.
   *
   * @returns {number} The current size of the queue
   *
   * @example
   * console.log(queue.size()); // 0
   * queue.enqueue(Promise.resolve("test"));
   * console.log(queue.size()); // 1
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Removes all tasks from the queue, resetting it to an empty state.
   *
   * @returns {void}
   *
   * @example
   * queue.enqueue(Promise.resolve("task"));
   * queue.clear();
   * console.log(queue.size()); // 0
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Returns an iterator that yields tasks from the queue in FIFO order.
   * Each yielded task is a Promise that the consumer can await to get its result.
   * The queue is emptied as tasks are yielded, but can be reused by enqueuing more tasks.
   *
   * @returns {Generator<Task<any>, void, unknown>} A generator yielding tasks
   *
   * @example
   * queue.enqueue(Promise.resolve("Task 1"));
   * queue.enqueue(Promise.resolve("Task 2"));
   * for await (const task of queue) {
   *   console.log(await task); // "Task 1", then "Task 2"
   * }
   */
  *[Symbol.iterator](): Generator<Task<any>, void, unknown> {
    while (this.queue.length > 0) {
      const task = this.dequeue();
      if (task) {
        yield task;
      }
    }
  }
}