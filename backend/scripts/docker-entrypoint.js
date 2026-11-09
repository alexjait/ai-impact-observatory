const { Client } = require('pg');
const { spawn } = require('child_process');

const databaseUrl = process.env.DATABASE_URL;
const command = process.argv.slice(2);

if (!databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

if (command.length === 0) {
  console.error('A start command is required.');
  process.exit(1);
}

async function waitForDatabase(maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const client = new Client({ connectionString: databaseUrl });

    try {
      await client.connect();
      await client.end();
      console.log(`Database is reachable after ${attempt} attempt(s).`);
      return;
    } catch (error) {
      console.log(`Waiting for database (${attempt}/${maxAttempts})...`);
      await client.end().catch(() => undefined);

      if (attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function runCommand(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      stdio: 'inherit',
      shell: false,
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${bin} ${args.join(' ')} exited with code ${code ?? 'null'}`));
    });

    child.on('error', reject);
  });
}

async function main() {
  await waitForDatabase();
  await runCommand('npx', ['prisma', 'migrate', 'deploy']);

  const child = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGINT', forwardSignal);
  process.on('SIGTERM', forwardSignal);

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
