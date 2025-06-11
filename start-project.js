// start-project.js
const { spawn } = require("child_process");

const startFrontend = spawn("npm", ["start"], {
  cwd: "./frontend",
  shell: true,
  stdio: "inherit",
});

const startBackend = spawn("npm", ["run", "dev"], {
  cwd: "./backend",
  shell: true,
  stdio: "inherit",
});

startFrontend.on("close", code => {
  console.log(`Frontend finalizado com código ${code}`);
});

startBackend.on("close", code => {
  console.log(`Backend finalizado com código ${code}`);
});