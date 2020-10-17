import Dexie from "dexie";
import { JobPriority, JobStatus } from "./types";

interface Jobs {
  name: string;
  priority: JobPriority;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

class TQ extends Dexie {
  jobs: Dexie.Table<Jobs, number>;
  queue: Dexie.Table<Work, number>;
  constructor() {
    super("tq.database");

    this.version(1).stores({
      "tq.jobs": "++id, &name, enabled",
      "tq.queue": "++id, jobName, *priority, status",
    });

    this.jobs = this.table("tq.jobs");
    this.queue = this.table("tq.queue");
  }
}

export default TQ;
