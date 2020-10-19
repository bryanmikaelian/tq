# tq
Queue backed by Indexeddb.  Inspired by Resque.  tq === "the queue"

# About

tq helps you run background jobs in the browser. Jobs and the queue are backed by Indexed DB and Web Workers, so you can run intensive operations without blocking the main thread.

# Installing

```
npm i @iceblocktech/tq
```

or

```
yarn add @iceblocktech/tq`
```

You can then import the API as follows:

```javascript
import { register, enqueue } from '@iceblocktech/tq'
```


# Job Basics

At the core of `tq` is a `Job`.  A `Job` is a simple object you define in your code.  It looks like this:

```typescript
type JobPriority = "critical" | "normal" | "low";

type Perform = (
  ctx: Context,
  args: Record<string, unknown>
) => Promise<void>;

interface Job {
  name: string;
  priority: JobPriority;
  perform: Perform | string;
  retryOnError?: boolean;
}
```

Jobs execute in batches on a regular internal, roughly every 10 seconds.  A breakdown of a job's fields:

- `name` is a name you can give your job
- `priority` let's you set the priority of this job.  `tq` maintains a max queue size and will use the job's `priority` to determine when to execute the job.  If there is no room in the queue, the job will be deferred to the next execution cycle.
  - `critical` jobs will ignore the max queue size and always execute
  - `normal` jobs will only execute if there is room in the queue minus any critical jobs
  - `low` priority jobs will only execute if there is room in the queue minus any critical and normal jobs
- `perform` is a function that you define. This function will be called when the job executes. A `Context` object and the arguments to the function will also be passed in
- `retryOnError` is an optional flag that indicates if the job should retry when it fails.  As of now, `tq` will only retry jobs 1 additional time.  Retried jobs also respect the `priority` logic.
  

# API

The `tq` API exposes two methods for you to use.  Both of these methods will proxy a request to a Web Worker that will perform the actual work.

## `register(job: Job)`
Registers a job with `tq`.  If a job is not registred, `enqueue`'ing such a job is essentially a no-op.

## `enqueue(jobName: string, args: Record<string, unknown>)`
Enqueues a job, executing the job's `perform` function at a later time. Any arguments provided will be passed down to the `perform` function

# Examples

The `examples` directory contains some examples to get you started.  At a high level, you're work flow will be something like this:

```typescript

// Define a job
const analyticsJob: Job = {
  name: "analytics.job",
  priority: "critical",
  perform: (ctx: context, args: Record<string, unknown>): Promise<void> => {
    analytics.track('User Did Something', ...args)
    return Promise.resolve()
  },
  retryOnError: false
}

// Register the job with tq
const resp = register(tq)
console.log(resp) // => "true"

// Enqueue the job at some ppint
enqueue("analytics.job", { userId: 123 });
```


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/bryanmikaelian/tq/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.
