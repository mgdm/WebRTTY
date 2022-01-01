import RTTY from './rtty';

function go(window, document) {
    var context = new AudioContext();
    var rtty = new RTTY(context);

    document.getElementById('rttyEncode').addEventListener('click', function (e) {
        e.preventDefault();
        var elem = document.getElementById('rttyChars');
        var buffer = rtty.encode(elem.value);

        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start();
    }, true);

    document.getElementById('rttyDownload').addEventListener('click', function (e) {
        e.preventDefault();
        var elem = document.getElementById('rttyChars');
        var buffer = rtty.encode(elem.value);

        rtty.writeWav(buffer);
    }, true);

}

go(window, document);