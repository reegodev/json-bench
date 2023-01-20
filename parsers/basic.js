const fs = require('fs');
const path = require('path');

const [,, numberOfEntries] = process.argv

const filePath = path.join('data', `${numberOfEntries}.json`)

const { size } = fs.statSync(filePath);
const fileSize = (size / (1024 * 1024)).toFixed(2);

const initialMemory = process.memoryUsage();
const initialTime = performance.now();

const fileHandle = fs.readFileSync(filePath, 'utf-8')
const entries = JSON.parse(fileHandle);
for (const entry of entries) {
  // Loop through the array to simulate
  // a scenario closer to the goal
}

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

