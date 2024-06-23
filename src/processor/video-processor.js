import { PassThrough } from 'node:stream'
import { spawn } from 'node:child_process'

export default class VideoProcessor {
    constructor() {
        this.outputVideo = new PassThrough()
    }

    process(inputStream) {
        const ffmpeg = spawn('ffmpeg', [
           '-i', 'pipe:0',
            '-vf', 'hue=s=0',
            '-f', 'matroska',
            'pipe:1' 
        ])

        inputStream.pipe(ffmpeg.stdin)
        ffmpeg.stdout.pipe(this.outputVideo)

        ffmpeg.stderr.on('data', (data) => console.error('ffmpeg error:', data.toString()))

        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                console.error('ffmpeg process exited with code', code)
            }

            this.outputVideo.end()
        })
    }

    getOutput() {
        return this.outputVideo
    }
}