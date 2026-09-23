import fs from 'fs';
import path from 'path';

const filesToPatch = [
  'node_modules/html2canvas/dist/html2canvas.js',
  'node_modules/html2canvas/dist/html2canvas.esm.js',
  'node_modules/html2canvas/dist/html2canvas.min.js'
];

for (const relPath of filesToPatch) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace throwing unsupported color function with safe default
  const throwRegex = /throw new Error\(\s*["']Attempting to parse an unsupported color function ["']\s*\+\s*value\.name\s*\+\s*["']["']\s*\);?/g;
  if (throwRegex.test(content)) {
    content = content.replace(throwRegex, 'return 0x0f172aff;');
    console.log(`[patch-html2canvas] Patched unsupported color error in ${relPath}`);
  }

  // Also support oklch in SUPPORTED_COLOR_FUNCTIONS if present
  if (content.includes('SUPPORTED_COLOR_FUNCTIONS = {') && !content.includes('oklch:')) {
    content = content.replace(
      'SUPPORTED_COLOR_FUNCTIONS = {',
      'SUPPORTED_COLOR_FUNCTIONS = {\n    oklch: function() { return 0x0f172aff; },\n    color: function() { return 0x0f172aff; },\n    lab: function() { return 0x0f172aff; },\n    "color-mix": function() { return 0x0f172aff; },'
    );
    console.log(`[patch-html2canvas] Added oklch/color support to ${relPath}`);
  }

  fs.writeFileSync(fullPath, content, 'utf8');
}
