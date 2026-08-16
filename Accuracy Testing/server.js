import { createServer } from "node:http";
import { modelPipeline } from "./model_pipeline.js";

createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");

  try {
    let body = "";
    for await (const chunk of request) body += chunk;
    const { messages, model } = JSON.parse(body);
    response.end(JSON.stringify(await modelPipeline(messages, model)));
  } catch (error) {
    response.statusCode = 500;
    response.end(JSON.stringify({ error: error.message }));
  }
}).listen(3030, () => {
  console.log("Model pipeline: http://127.0.0.1:3030");
});
