const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');
const entrypoints = require('./entrypoints');

for (const numberOfEntries of entrypoints) {
  generateEntrypoint(numberOfEntries);
}

function generateEntrypoint (numberOfEntries) {
  const entrypoint = [];
  for (i=0; i<numberOfEntries; i++) {
    entrypoint.push({
      host: `https://${faker.word.adjective({ max: 10 })}-${faker.word.adjective({ max: 10 })}-${faker.word.adjective({ max: 10 })}.fra1.digitaloceanspaces.com`,
      transferred_bytes: faker.datatype.number({ min: 1_000, max: 100_000_000 }),
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
    })
  }

  const fileName = `${numberOfEntries}.json`
  const filePath = path.join(__dirname, 'data', fileName)
  fs.writeFileSync(filePath, JSON.stringify(entrypoint));

  const { size } = fs.statSync(filePath);
  const fileSize = (size / (1024 * 1024)).toFixed(2);
  console.log(`Written ${fileName} (${fileSize}MB)`)
}
