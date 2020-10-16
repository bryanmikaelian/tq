/**
 * Context contains info about the job.  Set at queue time.
 */
export interface Context {
  queudAt: Date;
}
/**
 * JobPriority indicates which queue this job should execute one.
 */
export type JobPriority = "critical" | "normal" | "low";

export type JobStatus = "queued" | "in-progress" | "complete" | "failed";

type WorkerEvent = "register" | "enqueue";

/**
 * Job represents a basic object that can perform some operation asynchronously.
 */
export interface Job<T = Record<string, unknown>> {
  name: string;
  priority: JobPriority;
  perform: (ctx: Context, args: T) => Promise<void>;
  onRegister?: (ctx: Context) => void;
  retryOnError?: boolean;
}

/**
 * Message represents a payload sent to the background worker
 */
export interface Message<T = Record<string, unknown>> {
  event?: WorkerEvent;
  jobName?: string;
  args?: T;
}

/**
 * Ack is a message the worker will send when it receives a request.
 */
export interface Ack {
  event?: WorkerEvent;
  success: boolean;
}
