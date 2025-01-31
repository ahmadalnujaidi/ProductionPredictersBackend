// server.js
const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const cors = require("cors"); // <-- Import cors

const app = express();
app.use(cors());
app.use(bodyParser.json());

const trainProcess = spawn("python", ["train.py"]);

trainProcess.stdout.on("data", (data) => {
  console.log(`Train stdout: ${data}`);
});

trainProcess.stderr.on("data", (data) => {
  console.error(`Train stderr: ${data}`);
});

trainProcess.on("close", (code) => {
  console.log(`Train process exited with code ${code}`);
});

app.post("/predict", (req, res) => {
  try {
    // Prepare the data from the request body
    const inputData = req.body;

    // Spawn a Python process to run "predict.py"
    const pythonProcess = spawn("python", ["predict.py"]);

    // Buffers for capturing output / errors from Python
    let pythonOutput = "";
    let pythonError = "";

    // Capture stdout from the Python script
    pythonProcess.stdout.on("data", (data) => {
      pythonOutput += data.toString();
    });

    // Capture stderr from the Python script
    pythonProcess.stderr.on("data", (data) => {
      pythonError += data.toString();
    });

    // When the process closes
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        // If there's an error code, respond with Python's error
        return res.status(400).json({ error: pythonError });
      }
      try {
        // Parse the JSON output from Python
        const result = JSON.parse(pythonOutput);
        return res.json(result);
      } catch (err) {
        // If JSON parsing fails
        return res
          .status(400)
          .json({ error: "Invalid JSON response from Python script" });
      }
    });

    // Write JSON to the Python script’s stdin
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
  } catch (err) {
    // Catch any synchronous error
    res.status(400).json({ error: err.toString() });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
