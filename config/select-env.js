// @ts-check
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const envFilePath = path.resolve(process.cwd(), 'config/flights/environment.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n================================================================================');
console.log('                 🌍 SELECT REWARD360 TEST ENVIRONMENT');
console.log('================================================================================');
console.log('  [1] UAT        -> https://ishop-qa.reward360.in');
console.log('  [2] Preprod    -> https://preprod.ishoprewards.com');
console.log('  [3] Production -> https://ishop.reward360.in');
console.log('================================================================================');

rl.question('👉 Select environment [1, 2, or 3]: ', (answer) => {
  let chosen = 'preprod';
  const trimmed = answer.trim();

  if (trimmed === '1' || trimmed.toLowerCase() === 'uat') {
    chosen = 'uat';
  } else if (trimmed === '2' || trimmed.toLowerCase() === 'preprod') {
    chosen = 'preprod';
  } else if (trimmed === '3' || trimmed.toLowerCase() === 'prod' || trimmed.toLowerCase() === 'production') {
    chosen = 'prod';
  } else {
    console.log(`⚠️ Invalid selection "${trimmed}". Defaulting to Preprod.`);
    chosen = 'preprod';
  }

  try {
    let content = fs.readFileSync(envFilePath, 'utf8');
    content = content.replace(
      /export const ACTIVE_ENV = .*;/,
      `export const ACTIVE_ENV = (process.env.ENV || '${chosen}').toLowerCase();`
    );
    fs.writeFileSync(envFilePath, content, 'utf8');

    // Also sync to other project directory if present
    const altPath = '/Users/nitinkumar.b/playwright-project/config/flights/environment.js';
    if (fs.existsSync(altPath)) {
      fs.writeFileSync(altPath, content, 'utf8');
    }

    console.log('\n--------------------------------------------------------------------------------');
    console.log(`  ✅ ACTIVE ENVIRONMENT SWITCHED TO: [${chosen.toUpperCase()}]`);
    console.log(`  Now when you run "npm run test:hotel" or "npm run test:flight",`);
    console.log(`  it will automatically run on ${chosen.toUpperCase()}!`);
    console.log('--------------------------------------------------------------------------------\n');
  } catch (err) {
    console.error('Error updating environment config:', err.message);
  }

  rl.close();
});
