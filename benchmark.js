const { spawn } = require("child_process");
const entrypoints = require('./entrypoints');
const Table = require('cli-table3');
const colors = require('@colors/colors');

const [,,parser] = process.argv;

const runs = 100;

const parseData = async (data) => {
  return new Promise((resolve, reject) => {
    let result;

    const childProcess = spawn('node', [`parsers/${parser}.js`, data], {
      stdio: [0, 1, 2, 'ipc'],
    });
    childProcess.on('message', data => result = data);
    childProcess.on('exit', () => resolve(result));
    childProcess.on('error', (err) => reject(err));
  })
}

const calculateSingleStats = (resultEntries, property) => {
  const values = resultEntries.map(result => result[property]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  return { min, max, mean }
}

const calculateAllStats = (results) => {
  const stats = {};
  Object.keys(results).forEach(entrypoint => {
    stats[entrypoint] = {
      fileSize: results[entrypoint][0].fileSize,
      memory: calculateSingleStats(results[entrypoint], 'memory'),
      time: calculateSingleStats(results[entrypoint], 'time'),
    }
  })

  return stats;
}

const run = async () => {
  const results = {};

  for (const entrypoint of entrypoints) {
    results[entrypoint] = [];
    for (i=0; i<runs; i++) {
      const result = await parseData(entrypoint);
      results[entrypoint].push(result);
      console.log(`${entrypoint}: run ${i+1} done`);
    }
  }

  const stats = calculateAllStats(results);

  const memoryTable = new Table();
  memoryTable.push(
    [{ colSpan: 4, content: colors.magenta('Memory') }],
    [colors.cyan('JSON file'), colors.cyan('Min'), colors.cyan('Max'), colors.cyan('Avg')]
  )

  Object.keys(stats).forEach((entrypoint) => {
    memoryTable.push(
      [`${entrypoint.toLocaleString(undefined, { useGrouping: 'always' })} entries, ${stats[entrypoint].fileSize}MB`,
        `${(stats[entrypoint].memory.min / (1024 * 1024)).toFixed(2)}MB`,
        `${(stats[entrypoint].memory.max / (1024 * 1024)).toFixed(2)}MB`,
        `${(stats[entrypoint].memory.mean / (1024 * 1024)).toFixed(2)}MB`
      ],
    )
  });

  const timeTable = new Table();
  timeTable.push(
    [{ colSpan: 4, content: colors.magenta('Time') }],
    [colors.cyan('JSON file'), colors.cyan('Min'), colors.cyan('Max'), colors.cyan('Avg')]
  );

  Object.keys(stats).forEach((entrypoint) => {
    timeTable.push(
      [`${entrypoint.toLocaleString(undefined, { useGrouping: 'always' })} entries, ${stats[entrypoint].fileSize}MB`,
        `${(stats[entrypoint].time.min).toFixed(2)}ms`,
        `${(stats[entrypoint].time.max).toFixed(2)}ms`,
        `${(stats[entrypoint].time.mean).toFixed(2)}ms`
      ],
    )
  });

  console.log('')
  console.log('')
  console.log(`${parser} parser, ${runs} runs `.brightGreen)
  console.log('')
  console.log('')
  console.log(memoryTable.toString());
  console.log('')
  console.log('')
  console.log(timeTable.toString());
  console.log('')
  console.log('')
}

run();
