import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';

export default class VideoProcessor {
    async transcodeVideo(inputFilePath, outputFormat) {
        // Convert import.meta.url to file path
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const outputDir = join(__dirname, '..', '..', 'output');
        
        // Ensure the output directory exists
        await fs.mkdir(outputDir, { recursive: true });
        
        const outputFileName = `output-${randomUUID()}.${outputFormat}`;
        const outputPath = join(outputDir, outputFileName);

        const ffmpegArgs = [
            '-i', inputFilePath,
            '-f', outputFormat,
            outputPath
        ];

        return new Promise((resolve, reject) => {
            const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

            let stderr = '';

            ffmpegProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            ffmpegProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(outputPath);
                } else {
                    reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
                }
            });
        });
    }
}
