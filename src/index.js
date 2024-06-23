import VideoProcessor from "./processor/video-processor.js";
import { access, constants, createReadStream, createWriteStream } from 'node:fs'
import path from 'node:path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const inputFilePath = path.resolve(__dirname, 'input.mkv')

access(inputFilePath, constants.F_OK, (err) => {
    if (err) {
        console.error('Input file does not exist')
        process.exit(1)
    }

    const videoProcessor = new VideoProcessor()

    const inputStream = createReadStream(inputFilePath)

    videoProcessor.process(inputStream)

    const outputFilePath = path.resolve(__dirname, 'output.mkv');
    const outputStream = createWriteStream(outputFilePath);

    videoProcessor.getOutput().pipe(outputStream)

    outputStream.on('finish', () => {
        console.log(`Output file is ready at ${outputFilePath}`)
    })
})