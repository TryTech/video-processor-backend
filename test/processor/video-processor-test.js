import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import VideoProcessor from '../../src/processor/video-processor.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('VideoProcessor', () => {
    let videoProcessor;

    before(() => {
        videoProcessor = new VideoProcessor();
    });

    test('#transcodeVideo should transcode the video to the specified format', async () => {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const inputFilePath = path.join(__dirname, '..','mocks', 'input.mp4');
        const outputFormat = 'webm';
        const outputPath = await videoProcessor.transcodeVideo(inputFilePath, outputFormat);

        const readStream = createReadStream(outputPath);
        const passThrough = new PassThrough();
        readStream.pipe(passThrough);

        let data = '';
        passThrough.on('data', (chunk) => {
            data += chunk;
        });

        return new Promise((resolve, reject) => {
            passThrough.on('end', () => {
                assert.ok(data.length > 0, 'Transcoded file should not be empty');
                resolve();
            });

            passThrough.on('error', (error) => {
                reject(error);
            });
        });
    });
});
