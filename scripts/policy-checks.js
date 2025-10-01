#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RULES_DIR = path.join(ROOT, '.cursor', 'rules');

const MAX_RULE_LINES = 1000;
const FORBIDDEN = [/SECRET/i, /API_KEY/i, /PRIVATE_KEY/i];

function walk(dir) {
  return fs.readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) return walk(p);
    return [p];
  });
}

function checkRules() {
  if (!fs.existsSync(RULES_DIR)) return [];
  const files = walk(RULES_DIR).filter((f) => /\.(md|mdc)$/i.test(f));
  const problems = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/).length;
    if (lines > MAX_RULE_LINES) {
      problems.push(`Rule too long (${lines} lines): ${path.relative(ROOT, f)}`);
    }
    for (const re of FORBIDDEN) {
      if (re.test(content)) {
        problems.push(`Forbidden token ${re} in: ${path.relative(ROOT, f)}`);
      }
    }
  }
  return problems;
}

function main() {
  const problems = [
    ...checkRules(),
  ];
  if (problems.length) {
    console.error('Policy checks failed:\n' + problems.map((x) => ' - ' + x).join('\n'));
    process.exit(1);
  }
  console.log('Policy checks passed.');
}

main();
