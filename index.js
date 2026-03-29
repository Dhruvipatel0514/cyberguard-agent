const { GitClaw } = require('gitclaw');
const path = require('path');

async function main() {
  const agent = await GitClaw.load(path.resolve(__dirname));
  
  console.log('CyberGuard Agent Online');
  console.log(`Agent: ${agent.name} v${agent.version}`);
  console.log(`Skills: ${agent.skills.join(', ')}`);
  console.log('Type your security query below:\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', async (input) => {
    const response = await agent.run(input);
    console.log('\n[CyberGuard]:', response, '\n');
  });
}

main().catch(console.error);