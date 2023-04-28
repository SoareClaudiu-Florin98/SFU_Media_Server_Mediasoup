import * as mediasoup from "mediasoup";
import { Router, Worker } from "mediasoup/node/lib/types";
import { config } from "../config";
import os from "os";

const workers: Array<{
  worker: Worker;
  router: Router;
}> = [];

let nextMediasoupWorkerIdx = 0;

const createWorker = async () => {
  // let {numWorkers} = config.mediasoup;
  for (let i = 0; i < Object.keys(os.cpus()).length; i++) {
    let worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.workerSettings.logLevel,
      logTags: config.mediasoup.workerSettings.logTags,
      rtcMinPort: config.mediasoup.workerSettings.rtcMinPort,
      rtcMaxPort: config.mediasoup.workerSettings.rtcMaxPort,
    });
    worker.on("died", () => {
      console.error("mediasoup worker died (this should never happen)");
      process.exit(1);
    });

    const mediaCodecs = config.mediasoup.routerOptions.mediaCodecs;
    const router = await worker.createRouter({ mediaCodecs });

    workers.push({ worker, router });
  }
  return workers;
};

const getMediasoupWorker = () => {
  const worker = workers[nextMediasoupWorkerIdx];

  if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0;

  return worker;
};

export { createWorker, getMediasoupWorker };
