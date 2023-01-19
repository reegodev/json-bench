const fs = require('fs');
const path = require('path');
const streamArray = require('stream-json/streamers/StreamArray');

const [,, numberOfEntries] = process.argv;

const filePath = path.join('data', `${numberOfEntries}.json`)

const { size } = fs.statSync(filePath);
const fileSize = (size / (1024 * 1024)).toFixed(2);

const stream = fs.createReadStream(filePath).pipe(streamArray.withParser());

const initialMemory = process.memoryUsage();
const initialTime = performance.now();

stream.on('data', (event) => {
  // event.value is { host: ..., transferred_bytes: ..., start_time: ..., end_time: ....  }
});
stream.on('end', () => {
  const finalTime = performance.now();
  const finalMemory = process.memoryUsage();

  const result = {
    entries: Number(numberOfEntries),
    fileSize,
    memory: finalMemory.rss - initialMemory.rss,
    time: finalTime - initialTime,
  }
  
  if (process.send) {
    process.send(result)
  } else {
    const Table = require('cli-table3');
    const table = new Table();
    table.push(
      ['Entries', result.entries.toLocaleString(undefined, { useGrouping: 'always' })],
      ['File size', `${result.fileSize}MB`,],
      ['Memory', `${(result.memory / (1024 * 1024)).toFixed(2)}MB`,],
      ['Time', `${result.time.toFixed(2)}ms`],
    )
    console.log('');
    console.log(table.toString());
    console.log('');
  }
});
