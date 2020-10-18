import { Job, JobStatus, Message, Perform, Work } from "../types";
import DB from "./db";

const MAX_WORK = 10;
const ctx: Worker = globalThis as any;
const db = new DB();
const REGISTERED_JOBS: Record<string, Job> = {};

export const onMessageToWorker = (e: MessageEvent<Message>): Job => {
  console.log("message from worker received", e);
  if (typeof e.data !== "object") {
    return;
  }

  const { event, jobName, args } = e.data;

  if (!event || !args || typeof args !== "object") {
    return;
  }

  if (event === "register" && isJob(args)) {
    const job = args as Job;
    register(job);
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
export const register = (job: Job) => {
  REGISTERED_JOBS[job.name] = job;
};

/**
 * Queues a job, executing the work at a later date.
 * @param job
 * @param args
 *
 * @private
 */
export const enqueue = async (job: Job, args: Record<string, unknown>) => {
  await insertInQueue(job, args);
};

/**
 * Determines if a given object is a Job
 * @param args
 */
const isJob = (args: object): boolean => {
  return "name" in args && "priority" in args && "perform" in args;
};

/**
 * Insert work in to the queue
 * @param job
 * @param args
 *
 * @private
 */
export const insertInQueue = async (
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

const processWork = async () => {
  try {
    // Process all the critical work.  Critical work ignores max work restrictions
    await db.queue
      .where("priority")
      .equals("critical")
      .filter((x) => x.status === "queued")
      .modify({ status: "in-progress" });

    const criticalWork = await db.queue
      .where("priority")
      .equals("critical")
      .filter((x) => x.status === "in-progress")
      .toArray();

    const promises = criticalWork.map((w) => perform(w));
    await Promise.all(promises);

    // Normal + Low priority work processing is bounded by MAX_WORK

    // Process all the normal work if we have room in the buffer
    const pendingNormalWork = await db.queue
      .where("priority")
      .equals("normal")
      .filter((x) => x.status === "in-progress")
      .count();

    if (pendingNormalWork < MAX_WORK) {
      await db.queue
        .where("priority")
        .equals("normal")
        .filter((x) => x.status === "queued")
        .limit(MAX_WORK - pendingNormalWork)
        .modify({ status: "in-progress" });

      const normalWork = await db.queue
        .where("priority")
        .equals("normal")
        .filter((x) => x.status === "in-progress")
        .toArray();

      const promises = normalWork.map((w) => perform(w));
      await Promise.all(promises);

      if (normalWork.length < MAX_WORK) {
        // Process all the low priority work
        await db.queue
          .where("priority")
          .equals("low")
          .filter((x) => x.status === "queued")
          .limit(MAX_WORK - normalWork.length)
          .modify({ status: "in-progress" });

        const lowWork = await db.queue
          .where("priority")
          .equals("low")
          .filter((x) => x.status === "in-progress")
          .toArray();

        const promises = lowWork.map((w) => perform(w));
        await Promise.all(promises);
      }
    }
  } catch (e) {
    console.warn(e);
    return;
  }
};

/**
 * Perform attempts to execute a job's `perform` function with the provided arguments
 * @param work
 */
const perform = async (work: Work) => {
  const query = db.queue.where("id").equals(work["id"]);
  const job = REGISTERED_JOBS[work.jobName];
  let message: string = null;
  let record: Work = null;

  try {
    record = await query.first();
    if (job && typeof job.perform === "string") {
      const perform: Perform = new Function("return " + job.perform)();

      await perform({}, work.args);

      await query.modify({ status: "complete", ranAt: new Date() });
      return;
    }
  } catch (e) {
    if (job.retryOnError && record?.retriesLeft !== 0) {
      await query.modify({ status: "queued", retriesLeft: 0 });
      return;
    }

    message = e.message;
  }

  await query.modify({
    status: "failed",
    message: message ?? "unknown job",
    failedAt: new Date(),
  });
};

ctx.onmessage = onMessageToWorker;

setInterval(async () => {
  await processWork();
}, 10000);

// HACK: Only way TS Compiler can import a worker :shrug:
export default null as any;
