import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 1. Define your tools
const tools = [
  {
    name: "get_weather",
    description: "Get the current weather for a city. Returns temperature, conditions, humidity and wind speed.",
    input_schema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The city name, e.g. Colombo",
        },
        units: {
          type: "string",
          enum: ["metric", "imperial"],
          description: "metric = Celsius, imperial = Fahrenheit. Default: metric",
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

// Real weather fetch using OpenWeatherMap
async function getWeather(city, units = "metric") {
  const key = process.env.OPENWEATHER_API_KEY;
  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?q=${encodeURIComponent(city)}&units=${units}&appid=${key}`;

  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) {
      return `City "${city}" not found.`;
    }

    return `Weather API error: ${res.status}`;
  }

  const data = await res.json();

  console.log('openweathermap response', data);

  const unitLabel = units === "imperial" ? "°F" : "°C";

  return (
    `${data.name}, ${data.sys.country}: ` +
    `${Math.round(data.main.temp)}${unitLabel}, ` +
    `${data.weather[0].description}, ` +
    `humidity ${data.main.humidity}%, ` +
    `wind ${data.wind.speed} m/s`
  );
}

// Implement the tool logic
async function executeTool(name, input) {
  if (name === "get_weather") {
    // Call weather API call
    return await getWeather(input.city, input.units);
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

// Agentic loop
export async function runAgent(userMessage) {
  // The first message that gets sent to Claude by the user
  const messages = [{ role: "user", content: userMessage }];

  let index=0;

  while (true) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      tools,
      messages,
    });

    // Response from Claude
    console.log('response from Claude: ', response);

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
      const toolResults = await Promise.all(
        response.content
          .filter((b) => b.type === "tool_use")
          .map(async (b) => ({
            type: "tool_result",
            tool_use_id: b.id,
            content: await executeTool(b.name, b.input),
          }))
      );

      console.log('toolResults: ', toolResults);

      // Send tool results back to Claude
      messages.push({ role: "user", content: toolResults });
      // Loop continues — Claude will now compose the final answer
    }
  }
}