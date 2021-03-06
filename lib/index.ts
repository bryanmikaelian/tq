import QueueWorker from "./worker/queue.worker";
import { Job } from "./types";

const worker = new QueueWorker();

/**
 * Registers a job with the worker, allowing it to be called when it receives work.
 * @param job - The job to register.  After registration, the job's `onRegister` function will be called.
 */
const register = (job: Job): boolean => {
  const args = {
    ...job,
    perform: job.perform.toString(),
  };
  try {
    worker.postMessage({
      event: "register",
      args,
    });

    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
};

/**
 * Enqueue will queue up some work for a specific job to execute.  If the job is not registered, the work will never execute.
 * @param jobName
 * @param args
 */
const enqueue = (jobName: string, args: Record<string, unknown>): boolean => {
  try {
    console.log("enqueuing", jobName);
    worker.postMessage({
      event: "enqueue",
      jobName,
      args,
    });

    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
};

export { register, enqueue };
