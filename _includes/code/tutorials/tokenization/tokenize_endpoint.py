# TokenizeEndpointFreeform
import weaviate
from weaviate.classes.config import Tokenization, Configure

client = weaviate.connect_to_local()

# Ad-hoc tokenization with custom config
result = client.tokenization.text(
    text="The organic café crème blend",
    tokenization=Tokenization.WORD,
    analyzer_config=Configure.text_analyzer(
        ascii_fold=True,
        stopword_preset="en",
    ),
)

print(f"indexed: {result.indexed}")
print(f"query:   {result.query}")
# END TokenizeEndpointFreeform

# Test: accent folding converts café→cafe, crème→creme
assert "cafe" in result.indexed, f"Expected 'cafe' in indexed: {result.indexed}"
assert "creme" in result.indexed, f"Expected 'creme' in indexed: {result.indexed}"
# Test: stopword "the" is in indexed but not in query
assert "the" in result.indexed, f"Expected 'the' in indexed: {result.indexed}"
assert "the" not in result.query, f"Expected 'the' removed from query: {result.query}"
# Test: non-stopwords are in both
assert "organic" in result.indexed and "organic" in result.query

# TokenizeEndpointFreeformResult
"""
indexed: ['the', 'organic', 'cafe', 'creme', 'blend']
query:   ['organic', 'cafe', 'creme', 'blend']
"""
# END TokenizeEndpointFreeformResult

# TokenizeEndpointCustomPreset
# Define a named "fr" preset and reference it from analyzer_config.
# stopword_presets is mutually exclusive with stopwords — pass at most one.
result = client.tokenization.text(
    text="La Tasse Bleue et le Bol",
    tokenization=Tokenization.WORD,
    analyzer_config=Configure.text_analyzer(stopword_preset="fr"),
    stopword_presets={
        "fr": ["le", "la", "les", "un", "une", "des", "du", "de", "et"],
    },
)

print(f"indexed: {result.indexed}")
print(f"query:   {result.query}")
# END TokenizeEndpointCustomPreset

# Test: French stopwords are indexed but removed from query
assert "la" in result.indexed and "et" in result.indexed and "le" in result.indexed
assert "la" not in result.query and "et" not in result.query and "le" not in result.query
assert "tasse" in result.query and "bleue" in result.query and "bol" in result.query

# TokenizeEndpointCustomPresetResult
"""
indexed: ['la', 'tasse', 'bleue', 'et', 'le', 'bol']
query:   ['tasse', 'bleue', 'bol']
"""
# END TokenizeEndpointCustomPresetResult

# Setup: create collection for property-based tokenization example
from weaviate.classes.config import Property, DataType

client.collections.delete("TokenizeDemo")
client.collections.create(
    name="TokenizeDemo",
    inverted_index_config=Configure.inverted_index(
        stopword_presets={
            "fr": ["le", "la", "les", "un", "une", "des", "du", "de", "et"],
        },
    ),
    properties=[
        Property(
            name="name_fr",
            data_type=DataType.TEXT,
            tokenization=Tokenization.WORD,
            text_analyzer=Configure.text_analyzer(stopword_preset="fr"),
        ),
    ],
    vector_config=Configure.Vectors.self_provided(),
)

# TokenizeEndpointProperty
# Tokenize using an existing property's configuration
result = client.tokenization.for_property(
    collection="TokenizeDemo",
    property_name="name_fr",
    text="La Tasse Bleue et le Bol",
)

print(f"indexed: {result.indexed}")
print(f"query:   {result.query}")
# END TokenizeEndpointProperty

# Test: all words are indexed (stopwords are still stored)
assert "la" in result.indexed and "et" in result.indexed and "le" in result.indexed
assert "tasse" in result.indexed and "bleue" in result.indexed and "bol" in result.indexed
# Test: French stopwords are removed from query tokens
assert "la" not in result.query and "et" not in result.query and "le" not in result.query
# Test: non-stopwords remain in query tokens
assert "tasse" in result.query and "bleue" in result.query and "bol" in result.query
assert len(result.indexed) == 6  # all 6 words indexed
assert len(result.query) == 3    # only 3 non-stopwords in query

client.collections.delete("TokenizeDemo")
client.close()

# TokenizeEndpointPropertyResult
"""
indexed: ['la', 'tasse', 'bleue', 'et', 'le', 'bol']
query:   ['tasse', 'bleue', 'bol']
"""
# END TokenizeEndpointPropertyResult
