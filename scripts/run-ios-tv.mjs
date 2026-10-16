// Runs `expo run:ios` on an Apple TV simulator, never on an iPhone or iPad.
// Picks a booted Apple TV simulator if there is one, otherwise the one with the newest tvOS runtime
// (4K models first). Extra arguments are passed to `expo run:ios`, e.g. `npm run ios -- --configuration Release`.
import { execFileSync, spawnSync } from 'node:child_process';

function listAppleTvSimulators() {
  let json;
  try {
    json = execFileSync('xcrun', ['simctl', 'list', 'devices', 'available', '--json'], { encoding: 'utf8' });
  } catch {
    console.error('Could not run `xcrun simctl`. Install Xcode and its command line tools.');
    process.exit(1);
  }

  const simulators = [];
  for (const [runtime, devices] of Object.entries(JSON.parse(json).devices)) {
    const match = runtime.match(/SimRuntime\.tvOS-(\d+)-(\d+)/);
    if (!match) continue;
    const version = Number(match[1]) * 100 + Number(match[2]);
    for (const device of devices) {
      simulators.push({ ...device, version });
    }
  }
  return simulators;
}

function rank(sim) {
  return (sim.state === 'Booted' ? 1_000_000 : 0) + sim.version * 10 + (sim.name.includes('4K') ? 1 : 0);
}

const simulators = listAppleTvSimulators().sort((a, b) => rank(b) - rank(a));
const target = simulators[0];

if (!target) {
  console.error(
    'No Apple TV simulator found. In Xcode, open Settings > Components to install a tvOS runtime, ' +
      'then create an Apple TV simulator in Window > Devices and Simulators.',
  );
  process.exit(1);
}

console.log(`Running on ${target.name} (tvOS, ${target.udid})`);

const result = spawnSync('npx', ['expo', 'run:ios', '--device', target.udid, ...process.argv.slice(2)], {
  stdio: 'inherit',
  // If ios/ has to be generated, generate it for tvOS.
  env: { ...process.env, EXPO_TV: '1' },
});
process.exit(result.status ?? 1);
