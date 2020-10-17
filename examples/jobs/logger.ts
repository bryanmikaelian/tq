import { Context, Job } from "../../lib/types";

const loggerJob: Job = {
  name: "logger.job",
  priority: "critical",
  retryOnError: false,

  perform(ctx: Context, args: Record<string, unknown>): Promise<void> {
    console.log(args);
    return Promise.resolve();
  },
};

export default loggerJob;
