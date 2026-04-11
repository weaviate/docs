# TokenizeEndpointFreeform
import requests

# Ad-hoc tokenization with custom config
response = requests.post(
    "http://localhost:8080/v1/tokenize",
    json={
        "text": "The organic café crème blend",
        "tokenization": "word",
        "analyzerConfig": {
            "asciiFold": True,
            "stopwordPreset": "en",
        },
    },
)

print(response.json())
# END TokenizeEndpointFreeform

# TokenizeEndpointFreeformResult
"""
{
  "tokenization": "word",
  "indexed": ["the", "organic", "cafe", "creme", "blend"],
  "query":   ["organic", "cafe", "creme", "blend"]
}
"""
# END TokenizeEndpointFreeformResult

# TokenizeEndpointProperty
# Tokenize using an existing property's configuration
response = requests.post(
    "http://localhost:8080/v1/schema/StopwordsDemo/properties/name_fr/tokenize",
    json={
        "text": "La Tasse Bleue et le Bol",
    },
)

print(response.json())
# END TokenizeEndpointProperty

# TokenizeEndpointPropertyResult
"""
{
  "tokenization": "word",
  "indexed": ["la", "tasse", "bleue", "et", "le", "bol"],
  "query":   ["tasse", "bleue", "bol"]
}
"""
# END TokenizeEndpointPropertyResult
