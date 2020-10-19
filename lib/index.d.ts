/**
 * Context contains info about the job.
 */
export interface Context {
}

/**
 * JobPriority indicates which queue this job should execute one.
 */

export declare type JobPriority = "critical" | "normal" | "low";
/**
 * Perform is a function that can be defined to handle processing work.
 */
export declare type Perform = (ctx: Context, args: Record<string, unknown>) => Promise<void>;
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
 * Registers a job with the worker, allowing it to be called when it receives work.
 * @param job - The job to register.  After registration, the job's `onRegister` function will be called.
 */
export declare const register: (job: Job) => boolean;
/**
 * Enqueue will queue up some work for a specific job to execute.  If the job is not registered, the work will never execute.
 * @param jobName
 * @param args
 */
export declare const enqueue: (jobName: string, args: Record<string, unknown>) => boolean;
