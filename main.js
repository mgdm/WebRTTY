import RTTY from './js/rtty';

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

        rtty.writeWav(buffer);
    }, true);

    /*
     var filter = c.createBiquadFilter();
     filter.type = "lowpass";
     filter.frequency.value = 4000;
     filter.connect(c.destination);
     */


}

go(window, document);