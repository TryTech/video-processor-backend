import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs, createReadStream, createWriteStream } from 'node:fs';

export default class VideoProcessor {
    async transcodeVideo(inputFilePath, outputFormat) {
        const outputDir = await this.ensureOutputDirectory();
        const outputPath = this.constructOutputPath(outputDir, outputFormat);

        const inputReadStream = createReadStream(inputFilePath);
        const outputWriteStream = createWriteStream(outputPath);

        await this.executeFfmpeg(inputReadStream, outputWriteStream);

        return outputPath;
    }

    async ensureOutputDirectory() {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const outputDir = join(__dirname, '..', '..', 'output');
        await fs.mkdir(outputDir, { recursive: true });
        return outputDir;
    }

    constructOutputPath(outputDir, outputFormat) {
        const outputFileName = `output-${randomUUID()}.${outputFormat}`;
        return join(outputDir, outputFileName);
    }

    executeFfmpeg(inputReadStream, outputWriteStream) {
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
