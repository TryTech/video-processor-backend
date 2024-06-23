import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import VideoProcessor from '../../src/processor/video-processor.js'

describe('VideoProcessor', () => {
    test('should process video', () => {
        const videoProcessor = new VideoProcessor()
        const inputStream = new PassThrough()
        const outputVideo = videoProcessor.getOutput()
        const outputChunks = []

        outputVideo.on('data', (chunk) => {
            outputChunks.push(chunk)
        })

        videoProcessor.process(inputStream)

        inputStream.write(Buffer.from([0x00, 0x01, 0x02]))
        inputStream.write(Buffer.from([0x03, 0x04, 0x05]))
        inputStream.end()

        assert.equal(outputChunks.length, 2)
        assert.deepEqual(outputChunks[0], Buffer.from([0x00, 0x01, 0x02]))
        assert.deepEqual(outputChunks[1], Buffer.from([0x03, 0x04, 0x05]))
    })
})