# DriftGuard AI

An agentic AI system for detecting Slowly Changing Dimension (SCD)
drift, analyzing business impact, retrieving relevant business rules
with RAG, generating grounded recommendations, validating them, and
producing an actionable report.

## Overview

DriftGuard AI compares two dataset snapshots:

-   `dataset-v1.json` --- previous dataset
-   `dataset-v2.json` --- current dataset

The system detects field-level changes, evaluates their business impact,
retrieves relevant rules from a local vector store, generates
recommendations using Groq, validates them, and returns a clean final
report through an Express API.

## Architecture

``` text
Client / Trigger
      |
      v
Express API
POST /api/drift/analyze
      |
      v
Dataset Service
      |
      +-------------------+
      |                   |
      v                   v
dataset-v1.json      dataset-v2.json
 Previous               Current
      |                   |
      +---------+---------+
                |
                v
        LangGraph Workflow
                |
                v
           Drift Node
                |
                v
           Impact Node
                |
          HIGH severity?
           /          \
         NO            YES
         |              |
        END             v
                  Retrieval / RAG
                        |
                        v
                Recommendation Agent
                        |
                 +------+------+
                 |             |
               Error         Success
                 |             |
              Retry x2         v
                 |         Validation
                 |             |
                 +---------> Report
                              |
                              v
                         finalReport
                              |
                              v
                         API Response
```

## Workflow

``` text
START
  |
  v
Drift
  |
  v
Impact
  |
  +-- severity != HIGH --> END
  |
  v
Retrieval
  |
  v
Recommendation
  |
  +-- success --> Validation --> Report --> END
  |
  +-- failure --> Retry (up to 2 attempts)
                    |
                    +-- still failing --> Error Analysis --> END
```

### Main nodes

  -----------------------------------------------------------------------
  Node                                Responsibility
  ----------------------------------- -----------------------------------
  `drift`                             Compare previous/current datasets
                                      and create drift events

  `impact`                            Determine severity, confidence,
                                      business impact and reasoning

  `retrieval`                         Retrieve relevant business rules

  `recommendation`                    Generate RAG-grounded
                                      recommendations

  `retryRecommendation`               Retry failed recommendation
                                      generation

  `analyzeError`                      Analyze unrecoverable failures

  `validation`                        Deterministically validate
                                      recommendation output

  `report`                            Build the final API response
  -----------------------------------------------------------------------

## SCD Drift Detection

SCD means **Slowly Changing Dimension**.

The system compares two customer-data snapshots and detects field-level
changes.

Example:

``` text
city:         Mumbai  -> Pune
status:       ACTIVE  -> BLOCKED
kyc:          VERIFIED -> EXPIRED
creditLimit:  50000   -> 10000
```

These changes become structured `driftEvents` and are passed to impact
analysis.

## Impact Analysis

The impact agent evaluates the business significance of detected drift.

Typical output:

``` json
{
  "severity": "HIGH",
  "confidence": 0.95,
  "summary": "...",
  "businessImpact": ["..."],
  "reasoning": ["..."]
}
```

Impact analysis answers:

> How serious is this change?

Recommendation generation answers:

> What should we do about it?

## RAG Pipeline

DriftGuard uses Retrieval-Augmented Generation to ground recommendations
in project-specific business rules.

``` text
Business Rules
      |
      v
Chunking
      |
      v
Text Embeddings
      |
      v
Local Vector Store
      |
      v
Semantic Retrieval
      |
      v
retrievedContext
      |
      v
Recommendation Agent
```

The knowledge base currently contains rules for:

-   `ACTIVE -> BLOCKED`
-   `VERIFIED -> EXPIRED`
-   Significant credit-limit reduction
-   Customer city changes
-   Combined high-risk changes

The embedding function operates on **text**. If the source is a PDF, the
PDF must first be parsed into text; that text can then be chunked and
embedded.

## Recommendation Agent

The recommendation agent uses Groq and receives:

``` text
Impact Analysis
      +
Retrieved Business Rules
      |
      v
Recommendation Agent
      |
      v
Structured JSON
```

The prompt instructs the agent to:

-   Return valid JSON
-   Use retrieved business rules as the primary source
-   Avoid inventing internal policies
-   Avoid contradicting retrieved rules
-   Combine relevant rules
-   Return P1, P2 or P3 priority
-   Provide practical actions

## Validation

Validation is performed outside the LLM as a deterministic guardrail.

Example:

``` json
{
  "valid": true,
  "errors": []
}
```

This prevents the final report from depending only on the LLM's
self-assessment.

## Retry and Error Handling

Recommendation failures follow this path:

``` text
Recommendation
      |
      +-- Success --> Validation
      |
      +-- Failure
             |
             v
       Retry Recommendation
             |
             +-- attempt < 2 --> Recommendation
             |
             +-- attempt >= 2 --> Error Analysis
```

## Final Report

The report node exposes only the information required by the API
consumer.

Example:

``` json
{
  "status": "ACTION_REQUIRED",
  "priority": "P1",
  "severity": "HIGH",
  "confidence": 0.95,
  "summary": "...",
  "recommendedActions": [
    "...",
    "..."
  ],
  "reason": "..."
}
```

Internal embeddings, vector data and intermediate graph state are not
returned by the API.

## Project Structure

``` text
driftguard-ai/
|
+-- .gitignore
+-- package.json
+-- package-lock.json
|
+-- src/
    |
    +-- agents/
    |   +-- impact.agent.js
    |   +-- recommendation.agent.js
    |
    +-- data/
    |   +-- dataset-v1.json
    |   +-- dataset-v2.json
    |   +-- vector-store.json
    |
    +-- graph/
    |   +-- workflow.js
    |   +-- nodes/
    |       +-- drift.node.js
    |       +-- impact.node.js
    |       +-- retrieval.node.js
    |       +-- recommendation.node.js
    |       +-- retryRecommendation.node.js
    |       +-- errorAnalysis.node.js
    |       +-- validation.node.js
    |       +-- report.node.js
    |
    +-- knowledge/
    |   +-- scd-business-rules.md
    |
    +-- llm/
    |   +-- client.js
    |
    +-- rag/
    |   +-- chunker.js
    |   +-- ingest.js
    |   +-- retriever.js
    |
    +-- routes/
    |
    +-- services/
    |   +-- data.loader.js
    |   +-- dataset.service.js
    |
    +-- app.js
    +-- server.js
    +-- test.js
```

## File Responsibilities

-   `data.loader.js` --- generic async JSON loader.
-   `dataset.service.js` --- maps dataset-v1 to previous data and
    dataset-v2 to current data.
-   `drift.node.js` --- detects field-level changes.
-   `impact.node.js` --- runs impact analysis.
-   `retrieval.node.js` --- retrieves relevant business rules.
-   `recommendation.node.js` --- calls the recommendation agent.
-   `retryRecommendation.node.js` --- handles retries.
-   `errorAnalysis.node.js` --- handles unrecoverable recommendation
    failures.
-   `validation.node.js` --- validates recommendation output.
-   `report.node.js` --- creates `finalReport`.
-   `workflow.js` --- LangGraph orchestration and routing.
-   `chunker.js` --- creates knowledge chunks.
-   `ingest.js` --- generates embeddings and stores vectors.
-   `retriever.js` --- performs semantic retrieval.
-   `impact.agent.js` --- LLM-based impact reasoning.
-   `recommendation.agent.js` --- LLM-based RAG-grounded recommendation.
-   `server.js` --- Express API entry point.

## API

### Analyze Drift

``` http
POST /api/drift/analyze
```

No request body is required.

The API internally loads:

``` text
dataset-v1.json
dataset-v2.json
```

and executes the complete LangGraph workflow.

Example:

``` bash
curl -X POST http://localhost:3000/api/drift/analyze
```

## Installation

``` bash
git clone https://github.com/vishwas-1702/driftguard-ai.git
cd driftguard-ai
npm install
```

Create `.env` locally:

``` env
GROQ_API_KEY=your_groq_api_key
```

Never commit `.env`.

## Run

``` bash
npm run dev
```

or:

``` bash
node src/server.js
```

The API runs on:

``` text
http://localhost:3000
```

## RAG Ingestion

When the knowledge base changes:

``` bash
node src/rag/ingest.js
```

This chunks the knowledge, generates embeddings and stores the vectors
locally.

## Current Status

-   Dataset loading --- Working
-   SCD drift detection --- Working
-   Impact analysis --- Working
-   LangGraph routing --- Working
-   RAG chunking --- Working
-   Local embeddings --- Working
-   Vector ingestion --- Working
-   Semantic retrieval --- Working
-   RAG-grounded recommendations --- Working
-   Retry/error path --- Implemented
-   Recommendation validation --- Working
-   Final report --- Working
-   Express API --- Working
-   Dynamic dataset loading --- Working

## Future Improvements

1.  Replace JSON datasets with the real database/event source.
2.  Add scheduled or event-driven execution.
3.  Persist drift events and reports.
4.  Add authentication and authorization.
5.  Add structured logging and observability.
6.  Improve retrieval ranking and metadata filtering.
7.  Add unit and integration tests.
8.  Add production timeouts, rate limits and monitoring.
9.  Add notification/escalation workflows for high-risk cases.

## Production Direction

``` text
Real Database / Event Source
          |
          v
Scheduler / Event Trigger
          |
          v
Dataset Service
          |
          v
      LangGraph
          |
          +-- Drift
          +-- Impact
          +-- RAG
          +-- Recommendation
          +-- Validation
          +-- Report
          |
          v
Persistence / Notification / API
```

The dataset service isolates data access from the workflow, so the JSON
source can later be replaced with PostgreSQL, MongoDB, an external API
or an event stream without changing the core LangGraph design.

## Security

Secrets are kept outside source control.

`.gitignore` contains:

``` gitignore
.env
node_modules/
```

The Groq key is loaded using:

``` javascript
process.env.GROQ_API_KEY
```

Do not commit API keys, tokens or other credentials.

## Summary

DriftGuard AI follows this decision pipeline:

``` text
Detect
  |
  v
Understand
  |
  v
Retrieve Knowledge
  |
  v
Recommend
  |
  v
Validate
  |
  v
Report
```

It combines backend engineering, LangGraph orchestration, RAG, vector
search and LLM-based decision support to turn raw dataset changes into
actionable business recommendations.
