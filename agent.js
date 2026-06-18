import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 1. Define your tools
const tools = [
  {
    name: "get_weather",
    description: "Get the current weather for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The city name, e.g. Colombo",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "calculate",
    description: "Evaluate a math expression. E.g. '12 * 4 + 7'",
    input_schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "A valid JavaScript math expression",
        },
      },
      required: ["expression"],
    },
  },
];

// 2. Implement the tool logic
function executeTool(name, input) {
  if (name === "get_weather") {
    // Replace with a real weather API call (e.g. OpenWeatherMap)
    const mock = { Colombo: "31°C, sunny", London: "14°C, cloudy" };
    return mock[input.city] ?? "Weather data not available";
  }
  if (name === "calculate") {
    try {
      return String(eval(input.expression));
    } catch {
      return "Invalid expression";
    }
  }
  return "Unknown tool";
}

// 3. The agentic loop
export async function runAgent(userMessage) {
  const messages = [{ role: "user", content: userMessage }];

  let index=0;

  while (true) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      tools,
      messages,
    });

    console.log('response: ', response);

    // Add assistant response to history
    messages.push({ role: "assistant", content: response.content });

    // If Claude is done, return the text answer
    if (response.stop_reason === "end_turn") {
      return response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
    }

    // If Claude wants to use tools, execute them
    if (response.stop_reason === "tool_use") {
      const toolResults = response.content
        .filter((b) => b.type === "tool_use")
        .map((b) => ({
          type: "tool_result",
          tool_use_id: b.id,
          content: executeTool(b.name, b.input),
        }));

      console.log('toolResults: ', toolResults);

      // Send tool results back to Claude
      messages.push({ role: "user", content: toolResults });
      // Loop continues — Claude will now compose the final answer
    }
  }
}