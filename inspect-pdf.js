// inspect-pdf.js
const fs = require('fs');
const pdf = require('pdf-parse').default || require('pdf-parse');

const FILE = process.argv[2] || 'test-fusion.pdf';
const data = fs.readFileSync(FILE);

pdf(data).then((doc) => {
  console.log('=== FILE:', FILE, '===');
  console.log('Pages:', doc.numpages);
  console.log('Total chars:', doc.text.length);
  console.log();

  // Split by form feed (page separator)
  const pages = doc.text.split('\f');
  pages.forEach((p, i) => {
    console.log(`\n========== PAGE ${i + 1} ==========`);
    const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
    console.log('Lines:', lines.length);
    console.log('--- First 5 lines ---');
    console.log(lines.slice(0, 5).join('\n'));
    console.log('--- Last 8 lines ---');
    console.log(lines.slice(-8).join('\n'));
  });
}).catch((e) => console.error('ERR:', e.message));