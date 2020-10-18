// @ts-ignore
import { postMessage, onmessage } from "../worker/queue.worker";
jest.mock("../worker/queue.worker");

const tq = require("../index");
import { JobPriority } from "../types";

describe("enqueue", () => {
  const job = {
    name: "foo",
    priority: "critical" as JobPriority,
    perform: () => {
      return Promise.resolve();
    },
  };

  it("enqueues a job with the worker", () => {
    const resp = tq.enqueue(job.name, { foo: true });
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

    expect(resp).toEqual(true);
  });

  it("handles errors", () => {
    postMessage.mockImplementationOnce(() => {
      throw new Error();
    });

    const resp = tq.enqueue(job.name, { foo: true });
    expect(postMessage).toBeCalledWith({
      event: "enqueue",
      jobName: job.name,
      args: {
        foo: true,
      },
    });

    expect(onmessage).not.toBeCalledWith({
      data: {
        event: "enqueue",
        jobName: job.name,
        args: {
          foo: true,
        },
      },
    });

    expect(resp).toEqual(false);
  });
});

describe("register", () => {
  const job = {
    name: "foo",
    priority: "critical" as JobPriority,
    perform: () => {
      return Promise.resolve();
    },
  };
  it("registers a job with the worker", () => {
    const resp = tq.register(job);

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

    expect(resp).toEqual(true);
  });

  it("handles errors", () => {
    postMessage.mockImplementationOnce(() => {
      throw new Error();
    });

    const resp = tq.register(job);
    expect(postMessage).toBeCalledWith({
      event: "register",
      args: {
        ...job,
        perform: job.perform.toString(),
      },
    });

    expect(onmessage).not.toBeCalledWith({
      data: {
        event: "register",
        args: {
          ...job,
          perform: job.perform.toString(),
        },
      },
    });
    expect(resp).toEqual(false);
  });
});
