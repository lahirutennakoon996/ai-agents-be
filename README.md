
Example Requests:
## Basic weather lookup
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What is the weather in Colombo right now?"}'

## Explicit Fahrenheit
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What is the weather in New York in Fahrenheit?"}'

## Multi-tool: weather + calculation in one message
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What is the weather in London, and what is 72 * 1.5?"}'

## Agent should say city not found gracefully
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What is the weather in Fakeville?"}'