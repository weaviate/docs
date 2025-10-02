#!/usr/bin/env python3
import os
import re
import argparse
from pathlib import Path


def validate_tab_items(file_content, file_path):
    """
    Validates all <TabItem> blocks in a file's content.

    A TabItem is considered valid if it contains either:
    1. A markdown code block (```).
    2. A <FilteredTextBlock> component.

    Args:
        file_content (str): The content of the file to check.
        file_path (Path): The path to the file, used for error reporting.

    Returns:
        list: A list of error message strings. An empty list means no errors were found.
    """
    errors = []
    # This regex finds <TabItem ...>...</TabItem> blocks, handling multi-line content
    # It's non-greedy (.*?) to correctly handle multiple tabs in a file.
    # re.DOTALL makes '.' match newlines.
    tab_item_pattern = re.compile(r"<TabItem.*?>(.*?)</TabItem>", re.DOTALL)

    for match in tab_item_pattern.finditer(file_content):
        # The content is in the first capturing group
        tab_content = match.group(1)

        # The start position of the match is used to calculate the line number
        start_index = match.start()
        line_number = file_content.count("\n", 0, start_index) + 1

        # Check for the required elements
        has_markdown_code = "```" in tab_content
        has_filtered_text_block = "<FilteredTextBlock" in tab_content

        if not (has_markdown_code or has_filtered_text_block):
            # If neither is found, it's an error
            error_message = (
                f"  [Line {line_number}] Invalid TabItem found: Lacks a markdown code block (```) or <FilteredTextBlock>.\n"
                f"  Content: {tab_content.strip()[:100]}..."  # Show a snippet of the content
            )
            errors.append(error_message)

    return errors


def process_directory(directory_path, file_extensions):
    """
    Process all files with given extensions in a directory and its subdirectories.
    """
    directory = Path(directory_path)
    files_scanned = 0
    files_with_issues = 0
    total_issues = 0

    print("--- Starting Validation ---")

    for ext in file_extensions:
        for file_path in directory.glob(f"**/*{ext}"):
            files_scanned += 1

            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    content = file.read()
            except UnicodeDecodeError:
                print(f"⚠️  Could not read file (UnicodeDecodeError): {file_path}")
                continue
            except Exception as e:
                print(f"❌ Error opening file {file_path}: {e}")
                continue

            # Validate the file's content
            issues = validate_tab_items(content, file_path)

            if issues:
                files_with_issues += 1
                total_issues += len(issues)
                print(f"\n❌ Found issues in: {file_path}")
                for issue in issues:
                    print(issue)

    print("\n--- Validation Summary ---")
    print(f"🔍 Files scanned: {files_scanned}")
    print(f"📄 Files with issues: {files_with_issues}")
    print(f"❗️ Total issues found: {total_issues}")

    if files_with_issues == 0:
        print("\n✅ All scanned files are valid!")


def main():
    parser = argparse.ArgumentParser(
        description="Validate documentation files to ensure all TabItem blocks contain code snippets."
    )
    parser.add_argument("directory", help="Directory to process")
    parser.add_argument(
        "--ext",
        nargs="+",
        default=[".md", ".mdx"],
        help="File extensions to process (default: .md .mdx)",
    )

    args = parser.parse_args()

    print(f"Processing files in: {args.directory}")
    print(f"File extensions: {', '.join(args.ext)}")

    process_directory(args.directory, args.ext)


if __name__ == "__main__":
    main()
