export default class RTTY
{
     constructor(context) {
        if (!context) {
            context = this.getContext();
        }

        this.context = context;

        this.timePerBit = 1 / 45.45;
        this.spaceFreq = 2295;
        this.markFreq = 2125;

        this.letters = {
            "\0": '00000',
            ' ': '00100',
            'Q': '10111',
            'W': '10011',
            'E': '00001',
            'R': '01010',
            'T': '10000',
            'Y': '10101',
            'U': '00111',
            'I': '00110',
            'O': '11000',
            'P': '10110',
            'A': '00011',
            'S': '00101',
            'D': '01001',
            'F': '01101',
            'G': '11010',
            'H': '10100',
            'J': '01011',
            'K': '01111',
            'L': '10010',
            'Z': '10001',
            'X': '11101',
            'C': '01110',
            'V': '11110',
            'B': '11001',
            'N': '01100',
            'M': '11100',
            "\r": '01000',
            "\n": '00010'
        };

        this.figures = {
            "\0": '00000',
            ' ': '00100',
            '1': '10111',
            '2': '10011',
            '3': '00001',
            '4': '01010',
            '5': '10000',
            '6': '10101',
            '7': '00111',
            '8': '00110',
            '9': '11000',
            '0': '10110',
            '–': '00011',
            'Bell': '00101',
            '$': '01001',
            ' !': '01101',
            '&': '11010',
            '#': '10100',
            '\'': '01011',
            '(': '01111',
            ')': '10010',
            '"': '10001',
            '/': '11101',
            ' :': '01110',
            ' ;': '11110',
            ' ?': '11001',
            ',': '01100',
            '.': '11100',
            "\r": '01000',
            "\n": '00010'
        };
    }

    getContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            return new AudioContext();
        } catch (e) {
            alert('Sorry, you have no web audio support.');
        }
    }

    convertToBinary(chars) {
        let charCodes = [];
        chars = chars.toUpperCase();

        for (var i = 0; i < chars.length; i++) {
            if (this.letters[chars.charAt(i)]) {
                charCodes.push(this.letters[chars.charAt(i)].split('').reverse().join(""));
            }
        }

        return charCodes;
    };

    encode(chars) {
        let messageSamples = Math.floor(44100 / 45.45) * 8 * (chars.length + 4);

        let binary = this.convertToBinary(chars);
        let buffer = this.context.createBuffer(1, messageSamples, 44100);
        let data = buffer.getChannelData(0);
        let samplesPerSymbol = Math.floor(44100 / 45.45);

        let digits = '111111111111111' + binary.reduce(function(r, c) {
                return r + '0' + c + '11';
            }, '') + '111111111111111';

        let samplePosition = 0;
        let theta = 0.0;

        for (let char = 0; char < digits.length; char++) {
            let digit = digits[char];
            let frequency = digit === '1' ? this.markFreq : this.spaceFreq;
            let omega = frequency * 2 * Math.PI / 44100;

            let j = 0;
            for (j = 0; j < samplesPerSymbol; j++) {
                data[samplePosition + j] = Math.sin(theta);
                theta += omega;
            }

            samplePosition += j;
        }

        return buffer;
    }

    writeUTFBytes(view, offset, string) {
        var lng = string.length;
        for (var i = 0; i < lng; i++){
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeWav(buffer) {
        var sampleRate = 44100;
        var output = new ArrayBuffer(144 + buffer.length * 2);
        var view = new DataView(output);
        var data = buffer.getChannelData(0);

        this.writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + buffer.length, true);
        this.writeUTFBytes(view, 8, 'WAVE');
// FMT sub-chunk
        this.writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Length of format chunk
        view.setUint16(20, 1, true); // PCM format

        view.setUint16(22, 1, true); // Mono (1 channel)
        view.setUint32(24, sampleRate, true); // Sample rate
        view.setUint32(28, sampleRate * 2, true); // (Sample Rate * BitsPerSample * Channels) / 8; Bytes per second

        // (BitsPerSample * Channels) / 8. 1 - 8 bit mono; 2 - 8 bit stereo/16 bit mono; 4 - 16 bit stereo
        view.setUint16(32, 2, true); // Bytes per sample:

        view.setUint16(34, 16, true); // Bits per sample
// data sub-chunk
        this.writeUTFBytes(view, 36, 'data');
        view.setUint32(40, buffer.length, true); // Size of data section

// write the PCM samples
        var lng = buffer.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++){
            view.setInt16(index, data[i] * 0x7FFF, true);
            index += 2;
        }

// our final binary blob that we can hand off
        var blob = new Blob( [ view ], { type : 'audio/wav' } );
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        var link = window.document.createElement('a');
        link.href = url;
        link.download = 'output.wav';
        var click = document.createEvent("Event");
        click.initEvent("click", true, true);
        link.dispatchEvent(click);
    }
}
