import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs, createReadStream, createWriteStream } from 'node:fs';

/**
 * Class representing a Video Processor.
 */
export default class VideoProcessor {
    /**
     * Transcodes a video file to the specified output format.
     * @param {string} inputFilePath - The path of the input video file.
     * @param {string} outputFormat - The desired output format.
     * @returns {Promise<string>} - The path of the transcoded video file.
     */
    async transcodeVideo(inputFilePath, outputFormat) {
        const outputDir = await this.ensureOutputDirectory();
        const outputPath = this.constructOutputPath(outputDir, outputFormat);

        const inputReadStream = createReadStream(inputFilePath);
        const outputWriteStream = createWriteStream(outputPath);

        await this.executeFfmpeg(inputReadStream, outputWriteStream, outputFormat);

        return outputPath;
    }

    /**
     * Ensures that the output directory exists. If it doesn't, it creates it.
     * @returns {Promise<string>} - The path of the output directory.
     */
    async ensureOutputDirectory() {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const outputDir = join(__dirname, '..', '..', 'output');
        await fs.mkdir(outputDir, { recursive: true });
        return outputDir;
    }

    /**
     * Constructs the output file path based on the output directory and format.
     * @param {string} outputDir - The path of the output directory.
     * @param {string} outputFormat - The desired output format.
     * @returns {string} - The constructed output file path.
     */
    constructOutputPath(outputDir, outputFormat) {
        const outputFileName = `output-${randomUUID()}.${outputFormat}`;
        return join(outputDir, outputFileName);
    }

    /**
     * Executes the ffmpeg command to transcode the video.
     * @param {ReadableStream} inputReadStream - The readable stream of the input video.
     * @param {WritableStream} outputWriteStream - The writable stream for the transcoded output.
     * @param {string} outputFormat - The desired output format.
     * @returns {Promise<void>} - A promise that resolves when the transcoding is complete.
     */
    executeFfmpeg(inputReadStream, outputWriteStream, outputFormat = 'mkv') {
        return new Promise((resolve, reject) => {
            const ffmpegProcess = spawn('ffmpeg', ['-i', 'pipe:0', '-f', outputFormat, 'pipe:1'], {
                stdio: ['pipe', 'pipe', 'inherit']
            });

            inputReadStream.pipe(ffmpegProcess.stdin);
            ffmpegProcess.stdout.pipe(outputWriteStream);

            ffmpegProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`ffmpeg exited with code ${code}`));
                }
            })

            inputReadStream.on('error', reject);
            outputWriteStream.on('error', reject);
        })
    }
}
