const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(path.join(__dirname, 'list.txt'), 'utf-8');
const counts = new Map();

const sectionHeaders = /^(Monster|Spell|Trap|Extra|Side):\s*$/;

for (const line of input.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || sectionHeaders.test(trimmed)) continue;

  const match = trimmed.match(/^(\d+)x\s+(.+)$/);
  if (match) {
    const count = parseInt(match[1], 10);
    const name = match[2].trim();
    counts.set(name, (counts.get(name) ?? 0) + count);
  }
}

const output = [...counts.entries()]
  .map(([name, count]) => `${count}x ${name}`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, 'merged-list.txt'), output + '\n');
console.log('Merged list has been written to merged-list.txt');
console.log('Total card count:', [...counts.values()].reduce((a, b) => a + b, 0));