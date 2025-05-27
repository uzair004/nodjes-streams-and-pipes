const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const VIDEO_PATH = path.join(__dirname, 'sample-video.mp4');

app.get('/video', videoController)


async function videoController(req, res) {
    const stat = fs.statSync(VIDEO_PATH);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
        return res.status(400).send('Requires Range header');
    }

    const parts = range.replace(/bytes=/, '').split('-');

    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
        return;
    }

    const chunkSize = end - start + 1;

    const fileStream = fs.createReadStream(VIDEO_PATH, { start, end });

    res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
    });

    fileStream.pipe(res);


}

app.listen(8000, () => {
  console.log(`🚀 Video streaming server running at http://localhost:${8000}/video`);
});
