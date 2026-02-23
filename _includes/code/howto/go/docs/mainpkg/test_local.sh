#!/bin/sh
export WEAVIATE_URL=localhost:8080
export WEAVIATE_API_KEY=aaaa
export OPENAI_API_KEY=aaaa
export WEAVIATE_SCHEME=http
go test .
