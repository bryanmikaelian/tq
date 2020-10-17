import Dexie from "dexie";
import { JobPriority, Work } from "./types";

interface RegisteredJob {
  name: string;
  priority: JobPriority;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class TQ extends Dexie {
  jobs: Dexie.Table<RegisteredJob, number>;
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
