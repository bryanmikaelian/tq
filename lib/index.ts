import QueueWorker from "./queue.worker";
import { Ack, Job } from "./types";
import DB from "./db";

const worker = new QueueWorker();

/**
 * Registers a job with the worker, allowing it to be called when it receives work.
 * @param job - The job to register.  After registration, the job's `onRegister` function will be called.
 */
export const register = (job: Job): void => {
  const args = {
    ...job,
    perform: job.perform.toString(),
    onRegister: "",
  };
  console.log("registering", job.name);
  worker.postMessage({
    event: "register",
    args,
  });
};

/**
 * Enqueue will queue up some work for a specific job to execute.  If the job is not registered, the work will never execute.
 * @param jobName
 * @param args
 */
export const enqueue = (
  jobName: string,
  args: Record<string, unknown>
): boolean => {
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

worker.onmessage = (e: MessageEvent<unknown>) => {
  console.log("message from worker received", e);
  if (typeof e.data !== "object") {
    return;
  }

  if (!isAck(e.data)) {
    return;
  }

  const { event } = e.data as Ack;

  console.log("ack:", event);
};

const isAck = (message: object) => {
  return "event" in message && "success" in message;
};

import loggerJob from "./jobs/logger";

register(loggerJob);
enqueue(loggerJob.name, { color: "red" });
