import Dexie from "dexie";
import { Ack, Job, JobPriority, JobStatus, Message } from "./types";
import DB from "./db";

const REGISTERED_JOBS: Record<string, Job> = {};
const ctx: Worker = self as any;
const db = new DB();

/**
 * Handler for receiving messages from the main thread.
 * @param e
 */
ctx.onmessage = (e: MessageEvent<Message<unknown>>) => {
  console.log("message received", e);
  if (typeof e.data !== "object") {
    return;
  }

  const { event, jobName, args } = e.data;

  if (!event || !args || typeof args !== "object") {
    return;
  }

  if (event === "register" && isJob(args)) {
    const job = args as Job;
    register(job).then(() => {});
    return;
  }

  if (event === "enqueue" && jobName) {
    const job = REGISTERED_JOBS[jobName];
    if (job) {
      enqueue(job, args as Record<string, unknown>).then(() => {});
    }
    return;
  }

  console.warn("Unknown event received");
};

/**
 * Registers a job with the worker.  If a job is registered, it will be able to perform work
 * @param job
 */
const register = async (job: Job) => {
  REGISTERED_JOBS[job.name] = job;

  // Also store the job in IndexedDB
  const success = await upsertJob(job);

  if (!success) {
    // De-register the job if we couldn't save to IndexedDB
    delete REGISTERED_JOBS[job.name];
  }

  // Notify the main thread that the job registration is complete
  const ack: Ack = {
    event: "register",
    success,
  };

  postMessage(ack);
};

/**
 * Queues a job, executing the work at a later date.
 * @param job
 */
const enqueue = async (job: Job, args: Record<string, unknown>) => {
  const success = await insertInQueue(job, args);

  // Notify the main thread that the job was queued
  const ack: Ack = {
    event: "enqueue",
    success,
  };

  postMessage(ack);
};

/**
 * Determines if a given object is a Job
 * @param args
 */
const isJob = (args: object): boolean => {
  return "name" in args && "priority" in args && "perform" in args;
};

/**
 * Upsert the job in IndexedDB
 * @param job
 */
const upsertJob = async (job: Job): Promise<boolean> => {
  const record = {
    name: job.name,
    priority: job.priority,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const query = db.jobs.where("name").equals(record.name);
    const existing = await query.first();

    if (!existing) {
      console.log("adding new job");
      await db.jobs.add(record);
      return true;
    }

    console.log("updating existing job");
    delete record.createdAt;
    await query.modify(record);

    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
};

/**
 * Insert work in to the queue
 * @param job
 * @param args
 */
const insertInQueue = async (
  job: Job,
  args: Record<string, unknown>
): Promise<boolean> => {
  try {
    const record = {
      jobName: job.name,
      priority: job.priority,
      args,
      status: "queued" as JobStatus,
      createdAt: new Date(),
    };

    await db.queue.add(record);

    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
};

// HACK: Only way TS Compiler can import a worker :shrug:
export default null as any;
