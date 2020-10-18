// @ts-ignore
import { add } from "../db";
import { JobStatus } from "../../types";
jest.mock("../db");
const w = jest.requireActual("../queue.worker");
const { onMessageToWorker } = w;
const register = jest.spyOn(w, "register");
const enqueue = jest.spyOn(w, "enqueue");
const insertInQueue = jest.spyOn(w, "insertInQueue");

const job = {
  name: "test.job",
  priority: "low",
  perform: (() => {
    return Promise.resolve();
  }).toString(),
};

describe("queue.worker", () => {
  describe("onMessageToWorker - register", () => {
    it("does not process invalid messages", () => {
      // @ts-ignore
      onMessageToWorker({ data: "" });
      expect(register).not.toBeCalled();
    });

    it("does not process invalid args", () => {
      onMessageToWorker({ data: { event: "register", args: "foo" } });
      expect(register).not.toBeCalled();
    });

    it("registers a job", () => {
      onMessageToWorker({ data: { event: "register", args: job } });
      expect(register).toBeCalled();
    });
  });

  describe("onMessageToWorker - enqueue", () => {
    it("does not process invalid messages", () => {
      // @ts-ignore
      onMessageToWorker("foo");
      expect(enqueue).not.toBeCalled();
    });

    it("does not process invalid args", () => {
      onMessageToWorker({ data: { event: "enqueue", args: "foo" } });
      expect(enqueue).not.toBeCalled();
    });

    it("enqueues a job", () => {
      onMessageToWorker({
        data: { event: "enqueue", jobName: job.name, args: {} },
      });

      expect(enqueue).toBeCalled();
      expect(insertInQueue).toBeCalledWith(job, {});
      const args = add.mock.calls[0][0];
      expect(args.jobName).toEqual(job.name);
      expect(args.priority).toEqual(job.priority);
      expect(args.args).toEqual({});
      expect(args.status).toEqual("queued");
      expect(args.createdAt).toBeDefined();
      expect(insertInQueue).toReturn();
    });

    it("does not enqueue a job when indexeddb fails", () => {
      add.mockImplementationOnce(() => {
        throw new Error();
      });
      onMessageToWorker({
        data: { event: "enqueue", jobName: job.name, args: {} },
      });
      expect(enqueue).toBeCalled();
      expect(insertInQueue).toBeCalledWith(job, {});
      expect(add).toBeCalled();
      expect(insertInQueue).toReturn();
    });
  });

  describe("onMessageToWorker - unknown", () => {
    it("does not process invalid events for job registration", () => {
      onMessageToWorker({ data: { event: "lol", args: job } });
      expect(register).not.toBeCalled();
    });

    it("does not process invalid events for queueing work", () => {
      onMessageToWorker({
        data: { event: "lol", jobName: job.name, args: {} },
      });
      expect(enqueue).not.toBeCalled();
    });
  });

  describe("processWork", () => {});
});
