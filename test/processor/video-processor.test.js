import {jest, describe, it, beforeEach} from '@jest/globals';
import { spawn } from 'node:child_process'
import VideoProcessor from '../../src/processor/video-processor.js'
import fs, { createReadStream } from 'node:fs'
import { promises } from 'node:dns';

jest.mock('node:child_process', () => ({
    spawn: jest.fn().mockImplementation(() => ({
        stdin: { pipe: jest.fn() },
        stdout: { pipe: jest.fn() },
        on: jest.fn((event, handler) => {
            if (event === 'close') handler(0)
        })
    }))
}))

jest.mock('node:crypto', () => ({
    randomUUID: jest.fn().mockReturnValue('random-uuid')
}))

jest.mock('node:fs', () => ({
    promises: {
        mkdir: jest.fn().mockReturnValue(undefined)
    },
    createReadStream: jest.fn().mockReturnValue({
        on: jest.fn((event, handler) => {
            if (event === 'error') handler(new Error('Stream error'))
        }),
        pipe: jest.fn()
    }),
    createWriteStream: jest.fn().mockReturnValue({
        on: jest.fn((event, handler) => {
            if (event === 'finish') handler()
        })
    })
}))

describe('VideoProcessor', () => {
    it('transcodes a video file successfully', async () => {
        const videoProcessor = new VideoProcessor();
        const outputPath = await videoProcessor.transcodeVideo('input.mp4', 'mkv')
        expect(outputPath).toBe('output-unique-id.mkv')
    })
})