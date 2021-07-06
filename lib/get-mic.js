const mic = require('mic');
const { nonstandard: { RTCAudioSource }, MediaStream, MediaStreamTrack } = require('wrtc');

const sampleRate = 48000;
const sliceSize = sampleRate / 100; // gives us 10 ms chunks
const channels = 1;
const bitrate = 16;

/**
 * @async
 * @function getMic
 * @returns {Promise<MediaStream>}
 */
const getMic = async () => {
    var micInstance = mic({
        endian: 'little',
        encoding: 'signed-integer',
        rate: sampleRate,
        channels: channels,
        bitwidth: bitrate
    });

    const source = new RTCAudioSource();
    const track = source.createTrack();
    console.log(track, track instanceof MediaStreamTrack)

    let samples = new Int16Array(0);
    let micInputStream = micInstance.getAudioStream();
    console.log("mic starting");
    //every time we get data from the mic append it to the existing buffer
    micInputStream.on('data', (data) => {
        let newSamples = new Int16Array(data.buffer);
        let mergedSamples = new Int16Array(samples.length + newSamples.length);
        mergedSamples.set(samples);
        mergedSamples.set(newSamples, samples.length);
        samples = mergedSamples;
    });


    setInterval(() => {
        //if there's enough data to read slice off 10ms worth and pass it to the track
        if (samples.length >= sliceSize) {
            let sampleSlice = samples.slice(0, sliceSize);
            samples = samples.slice(sliceSize);
            source.onData({
                samples: sampleSlice,
                sampleRate: sampleRate,
                bitsPerSample: bitrate,
                channelCount: channels,
                numberOfFrames: sampleSlice.length
            });
        } else {
            // console.log('buffer underrun detected');
        }
    }, 10); //10 ms chunks

    micInstance.start();

    //not shown: code that actually adds the track to a stream, etc

    return new MediaStream([track]);
};
module.exports = getMic;