/**
 * Context contains info about the job.
 */
export interface Context {}

/**
 * JobPriority indicates which queue this job should execute one.
 */
export type JobPriority = "critical" | "normal" | "low";

/**
 * JobStatus represents the current state of the job.
 */
export type JobStatus = "queued" | "in-progress" | "complete" | "failed";

/**
 * WorkerEvent is a type of event that the background worker can fire.
 */
type WorkerEvent = "register" | "enqueue";

/**
 * Perform is a function that can be defined to handle processing work.
 */
export type Perform = (
  ctx: Context,
  args: Record<string, unknown>
) => Promise<void>;

/**
 * Job represents a basic object that can perform some operation asynchronously.
 */
export interface Job {
  name: string;
  priority: JobPriority;
  perform: Perform | string;
  retryOnError?: boolean;
}

/**
 * Work represents an entity that gets stored in Indexeddb.  It is consumed by the background worker.
 */
export interface Work {
  jobName: string;
  priority: JobPriority;
  args: Record<string, unknown>;
  createdAt: Date;
  status: JobStatus;
  ranAt?: Date;
  failedAt?: Date;
  message?: string;
  retriesLeft?: number;
}

/**
 * Message represents a payload sent to the background worker.
 */
export interface Message {
  event?: WorkerEvent;
  jobName?: string;
  args?: Job | Record<string, unknown>;
}
