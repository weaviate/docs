import os
import re
import argparse
from pathlib import Path

# Template for the new C# TabItem
CSHARP_TAB_TEMPLATE = """
<TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={{CSharpCode}}
      startMarker="{start_marker}"
      endMarker="{end_marker}"
      language="csharp"
    />
  </TabItem>"""


def process_imports(content):
    """
    Adds a CSharpCode import if a JavaV6Code import exists and the CSharpCode
    import does not.
    """
    # If C# import already exists, do nothing.
    if re.search(r"import\s+CSharpCode\s+from", content):
        return content

    # Find the Java V6 import to base the new import on.
    # It captures the full import statement and the file path part.
    java_import_match = re.search(
        r'(import\s+JavaV6Code\s+from\s+([\'"]).*?java-v6/(.*?)(\2;))',
        content,
        re.DOTALL,
    )
    if not java_import_match:
        return content

    full_import_statement = java_import_match.group(0)
    java_file_path = java_import_match.group(3)

    # Create the corresponding C# file path by replacing .java with .cs
    csharp_file_path = re.sub(r"\.java$", ".cs", java_file_path)

    # Create the new import statement for C#
    new_import_statement = (
        full_import_statement.replace("JavaV6Code", "CSharpCode")
        .replace("java-v6/", "csharp/")
        .replace(java_file_path, csharp_file_path)
    )

    # Insert the new import directly after the Java V6 one for consistency.
    return content.replace(
        full_import_statement, f"{full_import_statement}\n{new_import_statement}"
    )


def add_csharp_tab_to_block(tabs_block_match):
    """
    A replacer function for re.sub that processes a single <Tabs>...</Tabs> block.
    """
    tabs_block = tabs_block_match.group(0)

    # Condition 1: Don't add if a C# tab already exists.
    # Condition 2: Don't add if there's no Java v6 tab to use as a template.
    if 'value="csharp"' in tabs_block or 'value="java6"' not in tabs_block:
        return tabs_block

    # Find the Java v6 tab. We assume TabItems are not nested within each other.
    java6_tab_match = re.search(
        r'(<TabItem value="java6".*?>.*?</TabItem>)', tabs_block, re.DOTALL
    )
    if not java6_tab_match:
        return tabs_block

    java6_tab_text = java6_tab_match.group(1)

    # Extract start and end markers from within the Java v6 tab text.
    marker_match = re.search(
        r'startMarker="([^"]+)"[\s\S]*?endMarker="([^"]+)"', java6_tab_text, re.DOTALL
    )
    if not marker_match:
        # Cannot proceed if markers aren't found in the Java v6 tab.
        return tabs_block

    start_marker, end_marker = marker_match.groups()

    # Create the new C# tab from the template.
    csharp_tab_text = CSHARP_TAB_TEMPLATE.format(
        start_marker=start_marker, end_marker=end_marker
    ).strip()

    # Determine the correct insertion point.
    # We insert after the Java v6 tab, OR after the regular Java tab
    # if it immediately follows the Java v6 tab.

    end_of_java6_match = java6_tab_match.end()
    rest_of_block_after_java6 = tabs_block[end_of_java6_match:]

    # Check if the next element is a regular Java tab.
    if re.match(r'\s*<TabItem value="java"', rest_of_block_after_java6):
        # A Java tab exists. Find its full text to use as the replacement target.
        java_tab_match = re.search(
            r'(<TabItem value="java".*?>.*?</TabItem>)',
            rest_of_block_after_java6,
            re.DOTALL,
        )
        if java_tab_match:
            java_tab_text = java_tab_match.group(1)
            # Replace the Java tab with itself plus the new C# tab.
            return tabs_block.replace(
                java_tab_text, f"{java_tab_text}\n  {csharp_tab_text}"
            )

    # If no regular Java tab followed, insert after the Java v6 tab.
    # Replace the Java v6 tab with itself plus the new C# tab.
    return tabs_block.replace(java6_tab_text, f"{java6_tab_text}\n  {csharp_tab_text}")


def process_file_content(content):
    """
    Runs the import and tab processing on the entire file content.
    Returns the new content and a boolean indicating if changes were made.
    """
    original_content = content

    # Step 1: Add C# import statement if needed.
    content_with_imports = process_imports(original_content)

    # Step 2: Find all <Tabs> blocks and apply the replacer function to each.
    tabs_pattern = re.compile(r"<Tabs[^>]*>.*?</Tabs>", re.DOTALL)
    new_content = tabs_pattern.sub(add_csharp_tab_to_block, content_with_imports)

    return new_content, new_content != original_content


def process_directory(directory_path, file_extensions, dry_run=True):
    """
    Process all files with given extensions in a directory and its subdirectories.
    """
    directory = Path(directory_path)
    files_processed = 0
    files_modified = 0

    for ext in file_extensions:
        for file_path in directory.glob(f"**/*{ext}"):
            files_processed += 1

            # Read the file content
            with open(file_path, "r", encoding="utf-8") as file:
                try:
                    content = file.read()
                except UnicodeDecodeError:
                    print(f"Error reading {file_path}: UnicodeDecodeError")
                    continue

            # Process the content to add tabs and imports
            new_content, was_modified = process_file_content(content)

            # If content was modified
            if was_modified:
                files_modified += 1
                print(f"Modified: {file_path}")

                # Write the changes if not in dry-run mode
                if not dry_run:
                    with open(file_path, "w", encoding="utf-8") as file:
                        file.write(new_content)

    return files_processed, files_modified


def main():
    parser = argparse.ArgumentParser(
        description="Adds C# TabItem blocks after Java v6/Java tabs in documentation files."
    )
    parser.add_argument("directory", help="Directory to process")
    parser.add_argument(
        "--ext",
        nargs="+",
        default=[".md", ".mdx"],
        help="File extensions to process (default: .md .mdx)",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes (without this flag, runs in dry-run mode)",
    )

    args = parser.parse_args()

    print(f"Processing files in {args.directory}")
    print(f"File extensions: {', '.join(args.ext)}")
    print(
        f"Mode: {'Apply Changes' if args.apply else 'Dry Run (no changes will be made)'}"
    )

    files_processed, files_modified = process_directory(
        args.directory, args.ext, dry_run=not args.apply
    )

    print(f"\nSummary:")
    print(f"Files processed: {files_processed}")
    print(f"Files that would be/were modified: {files_modified}")

    if not args.apply and files_modified > 0:
        print("\nRun with --apply to make the changes.")


if __name__ == "__main__":
    main()
