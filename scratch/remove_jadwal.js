const fs = require('fs');
const path = 'C:/Users/farre/AR_update/components/layout/HeaderBar.tsx';

let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Ranges to remove (1-indexed, inclusive). We will convert to 0-indexed.
const rangesToRemove = [
  [21, 27],
  [38, 41],
  [49, 210],
  [511, 609],
  [693, 718]
];

// Sort descending by start line so we can remove without affecting prior indices
rangesToRemove.sort((a, b) => b[0] - a[0]);

for (const [start, end] of rangesToRemove) {
  // Convert 1-indexed to 0-indexed
  const startIdx = start - 1;
  const count = end - start + 1;
  lines.splice(startIdx, count);
}

fs.writeFileSync(path, lines.join('\n'));
console.log('File updated successfully.');
