# Import
import weaviate
import requests, json

client = weaviate.connect_to_local()

print("=== DEBUG: Downloading data ===")
url = "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"

try:
    resp = requests.get(url, timeout=10)
    print(f"DEBUG: Status code: {resp.status_code}")
    print(f"DEBUG: Content length: {len(resp.content)} bytes")
    
    if resp.status_code != 200:
        print(f"DEBUG: HTTP Error - Response: {resp.text}")
        raise Exception(f"HTTP {resp.status_code}")
    
    if not resp.text.strip():
        print("DEBUG: ERROR - Response is empty!")
        raise Exception("Empty response")
    
    print(f"DEBUG: Response preview: {resp.text[:200]}...")
    
    data = json.loads(resp.text)
    print(f"DEBUG: ✓ JSON parsed successfully, {len(data)} items")
    
    if data and len(data) > 0:
        print(f"DEBUG: First item: {data[0]}")
        
except Exception as e:
    print(f"DEBUG: ✗ Download failed: {e}")
    print("DEBUG: Using fallback test data")
    data = [
        {"Answer": "DNA", "Question": "What carries genetic information?", "Category": "BIOLOGY"},
        {"Answer": "Photosynthesis", "Question": "Process plants use to make food?", "Category": "BIOLOGY"},
        {"Answer": "Mitochondria", "Question": "Powerhouse of the cell?", "Category": "BIOLOGY"}
    ]

print("=== DEBUG: Starting batch import ===")
questions = client.collections.get("Question")

if not data:
    print("DEBUG: ✗ No data to import")
    client.close()
    exit(1)

print(f"DEBUG: About to import {len(data)} objects")

# highlight-start
successful_imports = 0
failed_imports = 0

with questions.batch.fixed_size(batch_size=200) as batch:
    for i, item in enumerate(data):
        try:
            batch.add_object({
                "answer": item["Answer"],
                "question": item["Question"], 
                "category": item["Category"],
            })
            successful_imports += 1
            
            if (i + 1) % 10 == 0:
                print(f"DEBUG: Processed {i + 1}/{len(data)} items")
                
        except KeyError as ke:
            failed_imports += 1
            print(f"DEBUG: ✗ Item {i} missing key {ke}: {item}")
        except Exception as e:
            failed_imports += 1
            print(f"DEBUG: ✗ Error with item {i}: {e}")
        
        # highlight-end
        if batch.number_errors > 10:
            print(f"DEBUG: ✗ Too many batch errors: {batch.number_errors}")
            break

print(f"DEBUG: Import attempt completed - Success: {successful_imports}, Failed: {failed_imports}")

failed_objects = questions.batch.failed_objects
if failed_objects:
    print(f"DEBUG: ✗ Batch failed objects: {len(failed_objects)}")
    if len(failed_objects) > 0:
        print(f"DEBUG: First failed: {failed_objects[0]}")
else:
    print("DEBUG: ✓ No batch failures")

# Verify import
print("=== DEBUG: Verifying import ===")
try:
    aggregate_result = questions.aggregate.over_all(total_count=True)
    total_count = aggregate_result.total_count
    print(f"DEBUG: ✓ Total objects in collection: {total_count}")
    
    if total_count > 0:
        sample_objects = questions.query.fetch_objects(limit=2)
        print(f"DEBUG: Sample objects:")
        for obj in sample_objects.objects:
            print(f"  - {obj.properties}")
            
except Exception as e:
    print(f"DEBUG: ✗ Verification error: {e}")

client.close()
print("DEBUG: Import completed")
# END Import