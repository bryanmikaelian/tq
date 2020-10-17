// @ts-ignore
import { postMessage, onmessage } from "../queue.worker";
jest.mock("../queue.worker");

import * as tq from "../index";
import { JobPriority } from "../types";

describe("enqueue", () => {
  it("enqueues a job with the worker", () => {
    const job = {
      name: "foo",
      priority: "critical" as JobPriority,
      perform: () => {
        return Promise.resolve();
      },
    };
    tq.enqueue(job.name, { foo: true });
    expect(postMessage).toBeCalledWith({
      event: "enqueue",
      jobName: job.name,
      args: {
        foo: true,
      },
    });
    expect(onmessage).toBeCalledWith({
      data: {
        event: "enqueue",
        jobName: job.name,
        args: {
          foo: true,
        },
      },
    });
  });
});

describe("register", () => {
  it("registers a job with the worker", () => {
    const job = {
      name: "foo",
      priority: "critical" as JobPriority,
      perform: () => {
        return Promise.resolve();
      },
    };
    tq.register(job);

    expect(postMessage).toBeCalledWith({
      event: "register",
      args: {
        ...job,
        perform: job.perform.toString(),
      },
    });

    expect(onmessage).toBeCalledWith({
      data: {
        event: "register",
        args: {
          ...job,
          perform: job.perform.toString(),
        },
      },
    });
  });
});
