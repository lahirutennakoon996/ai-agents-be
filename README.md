
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

## DB lookup
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What is the order status for customer 4521?"}'

## Multi-tool: DB + weather in one message
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "Look up customer 4522 and tell me the weather in Colombo"}'

# Not found user case
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What plan is customer 9999 on?"}'