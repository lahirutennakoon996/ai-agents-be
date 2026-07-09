
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

## Not found user case
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What plan is customer 9999 on?"}'

# Multi-turn conversation test

Notice: first request omits sessionId, server creates one and returns it, second request sends it back.

### terminal — turn 1 (new session)
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "My name is Jack and I am a senior engineer."}' \
Response: { "reply": "Nice to meet you, Jack! ...", "sessionId": "abc-123" }

### terminal — turn 2 (same session, uses returned sessionId)
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What is my name?", "sessionId": "abc-123"}' \
Response: Agent remembers: "Your name is Jack."

### terminal — turn 3 (tool + memory together)
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "Look up customer 4521 and tell them the weather.", "sessionId": "abc-123"}' \
Response: Agent uses DB + weather tools AND knows it's talking to Jack

# Knowledge Base Search (RAG - retrieval augmented generation)
### Should hit the knowledge base, not hallucinate
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "How long do I have to request a refund?", "sessionId": "abc-123"}'

### Multi-tool: Knowledge Base + customer lookup in one turn
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "Look up customer 4521 and tell them our shipping times.", "sessionId": "abc-123"}'

### Should gracefully return "no info found"
curl -X POST http://localhost:3000/api/agent \
-H "Content-Type: application/json" \
-d '{"message": "What is our returns policy for digital products?", "sessionId": "abc-123"}'