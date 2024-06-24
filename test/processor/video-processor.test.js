import {jest, describe, it, beforeEach} from '@jest/globals';
import { spawn } from 'node:child_process'
import VideoProcessor from '../../src/processor/video-processor.js'
import fs from 'node:fs'

jest.mock('node:fs', () => ({
    promises: {
        mkdir: jest.fn(),
    },
    createReadStream: jest.fn(),
    createWriteStream: jest.fn(),
}))

jest.mock('node:child_process', () => ({
    spawn: jest.fn(),
}))

describe('VideoProcessor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('should process video with streams', async () => {
        const inputFilePath = 'input.mp4';
        const outputFormat = 'webm';
        const outputPath = 'output.webm';

        const inputReadStream = { pipe: jest.fn() };
        const outputWriteStream = { on: jest.fn() };

        fs.createReadStream.mockReturnValue(inputReadStream);
        fs.createWriteStream.mockReturnValue(outputWriteStream);

        spawn.mockReturnValue({
            stdin: { on: jest.fn() },
            stdout: { pipe: jest.fn() },
            on: jest.fn(),
        });

        const videoProcessor = new VideoProcessor();
        const result = await videoProcessor.transcodeVideo(inputFilePath, outputFormat);
        
        expect(result).toBe(outputPath);

        expect(fs.createReadStream).toHaveBeenCalledWith(inputFilePath);

        expect(fs.createWriteStream).toHaveBeenCalledWith(outputPath);

        expect(spawn).toHaveBeenCalledWith('ffmpeg', ['-i', 'pipe:0', '-f', outputFormat, 'pipe:1'], {
            stdio: ['pipe', 'pipe', 'inherit']
        });
    })
})