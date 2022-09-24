const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const JSZip = require("jszip")
const client = new Client({
    authStrategy: new LocalAuth()
});
const qrcode = require('qrcode-terminal');
const { Rembg } = require("rembg-node");
const sharp = require("sharp");


client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    if (message.hasMedia) {
        const media = await message.downloadMedia()
        console.log(media.mimetype)

        const imgBuffer = Buffer.from(media.data, 'base64');
        const input = sharp(imgBuffer);
        const rembg = new Rembg({
            logging: true,
        });
        const output = await rembg.remove(input);
        const outputBuffer = await output.png().toBuffer()



        var zip = new JSZip();
        zip.file('background-removed-file.png', outputBuffer, { binary: true });
        const zippedBuffer = await zip.generateAsync({ type: "nodebuffer", compression: 'DEFLATE' })

        const newMedia = new MessageMedia('application/zip', zippedBuffer.toString('base64'), "background-removed-file.zip");
        message.reply(newMedia);
    }
});


client.initialize();

