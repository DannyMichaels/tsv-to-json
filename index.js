const fs = require('fs');
const readline = require('readline');
const { Transform } = require('stream');

function tsv2json(input_file, output_file) {
  const readStream = fs.createReadStream(input_file, 'utf8');
  const writeStream = fs.createWriteStream(output_file, 'utf8');

  const tsvToJson = new Transform({
    objectMode: true,
    transform: function (line, _, cb) {
      const data = line.split('\t').map((d) => d.trim());
      const obj = {};

      for (let i = 0; i < titles.length; i++) {
        const key = titles[i];
        const value = data[i];
        obj[key] = value;
      }
      const json = JSON.stringify(obj);
      cb(null, `${json}\n`);
    },
  });

  let titles;
  let isFirstLine = true;

  const lineReader = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  readStream.on('error', (error) => console.error(error));
  writeStream.on('error', (error) => console.error(error));

  lineReader.on('line', (line) => {
    if (isFirstLine) {
      titles = line.split('\t').map((t) => t.trim());
      isFirstLine = false;
    } else {
      tsvToJson.write(line);
    }
  });

  lineReader.on('close', () => {
    tsvToJson.end();
  });

  tsvToJson.pipe(writeStream);
}

const input = process.argv[2];
const output = process.argv[3];
tsv2json(input, output);

// example: node . recordings.tsv recordings.json
