import { Context, Job } from "../types";

const loggerJob: Job = {
  name: "logger.job",
  priority: "critical",

  onRegister(ctx: Context): void {
    console.log("boo");
  },

  perform(ctx: Context): Promise<void> {
    console.log(ctx);
    return Promise.resolve(undefined);
  },
};

export default loggerJob;
