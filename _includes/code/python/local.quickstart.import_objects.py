# Import
import weaviate
import requests, json

client = weaviate.connect_to_local()

print("=== DEBUG: Downloading data ===")
url = "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"

try:
    resp = requests.get(url, timeout=10)
    print(f"DEBUG: Status code: {resp.status_code}")
    print(f"DEBUG: Content type: {resp.headers.get('content-type', 'unknown')}")
    print(f"DEBUG: Content length: {len(resp.content)} bytes")
    print(f"DEBUG: Response headers: {dict(resp.headers)}")
    
    if resp.status_code != 200:
        print(f"DEBUG: HTTP Error - Status: {resp.status_code}")
        print(f"DEBUG: Response text: {resp.text}")
        raise Exception(f"HTTP {resp.status_code}: {resp.text}")
    
    # Check if response is empty
    if not resp.text.strip():
        print("DEBUG: ERROR - Response is empty!")
        raise Exception("Empty response from server")
    
    # Show first part of response
    preview = resp.text[:500] if len(resp.text) > 500 else resp.text
    print(f"DEBUG: Response preview (first 500 chars):")
    print(f"'{preview}'")
    
    # Try to parse JSON
    try:
        data = json.loads(resp.text)
        print(f"DEBUG: ✓ JSON parsed successfully, {len(data)} items")
        
        # Show structure of first item
        if data:
            print(f"DEBUG: First item structure: {data[0]}")
            print(f"DEBUG: First item keys: {list(data[0].keys())}")
        
    except json.JSONDecodeError as je:
        print(f"DEBUG: ✗ JSON decode failed: {je}")
        print(f"DEBUG: Error position: line {je.lineno}, column {je.colno}")
        print(f"DEBUG: Problematic text around error:")
        start = max(0, je.pos - 50)
        end = min(len(resp.text), je.pos + 50)
        print(f"'{resp.text[start:end]}'")
        raise
        
except requests.exceptions.RequestException as e:
    print(f"DEBUG: ✗ Request failed: {e}")
    
    # Fallback to test data
    print("DEBUG: Using fallback test data")
    data = [
        {"Answer": "DNA", "Question": "What carries genetic information?", "Category": "BIOLOGY"},
        {"Answer": "Photosynthesis", "Question": "Process plants use to make food?", "Category": "BIOLOGY"},
        {"Answer": "Mitochondria", "Question": "Powerhouse of the cell?", "Category": "BIOLOGY"},
        {"Answer": "Evolution", "Question": "Theory explaining species change?", "Category": "BIOLOGY"},
        {"Answer": "Ecosystem", "Question": "Community of living and non-living things?", "Category": "BIOLOGY"}
    ]
    print(f"DEBUG: Using {len(data)} fallback items")

except Exception as e:
    print(f"DEBUG: ✗ Unexpected error: {e}")
    raise

print("=== DEBUG: Starting batch import ===")

# highlight-start
questions = client.collections.get("Question")

print(f"DEBUG: About to import {len(data)} objects")

with questions.batch.fixed_size(batch_size=200) as batch:
    for i, d in enumerate(data):
        # Validate data structure
        required_keys = ["Answer", "Question", "Category"]
        missing_keys = [key for key in required_keys if key not in d]
        if missing_keys:
            print(f"DEBUG: ⚠ Item {i} missing keys: {missing_keys}")
            print(f"DEBUG: Item {i} has keys: {list(d.keys())}")
            continue
            
        batch.add_object(
            {
                "answer": d["Answer"],
                "question": d["Question"],
                "category": d["Category"],
            }
        )
        
        # Log progress every 50 items
        if (i + 1) % 50 == 0:
            print(f"DEBUG: Processed {i + 1}/{len(data)} items")
        
        # highlight-end
        if batch.number_errors > 10:
            print(f"DEBUG: ✗ Batch import stopped due to excessive errors: {batch.number_errors}")
            break

print("DEBUG: Batch import completed")

# Check for failed imports
failed_objects = questions.batch.failed_objects
if failed_objects:
    print(f"DEBUG: ✗ Number of failed imports: {len(failed_objects)}")
    print(f"DEBUG: First failed object: {failed_objects[0]}")
    
    # Show details of first few failures
    for i, failed in enumerate(failed_objects[:3]):
        print(f"DEBUG: Failed object {i+1}: {failed}")
else:
    print(f"DEBUG: ✓ All imports successful")

# Verify import worked
print("=== DEBUG: Verifying import ===")
try:
    aggregate_result = questions.aggregate.over_all(total_count=True)
    total_count = aggregate_result.total_count
    print(f"DEBUG: ✓ Total objects in collection: {total_count}")
    
    if total_count > 0:
        # Show a few sample objects
        sample_objects = questions.query.fetch_objects(limit=3)
        print(f"DEBUG: Sample imported objects:")
        for i, obj in enumerate(sample_objects.objects):
            print(f"  {i+1}: {obj.properties}")
    else:
        print("DEBUG: ⚠ No objects found in collection after import")
        
except Exception as e:
    print(f"DEBUG: ✗ Error verifying import: {e}")

client.close()  # Free up resources
print("DEBUG: Import process completed")
# END Import