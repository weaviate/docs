import os
import re
import argparse
from pathlib import Path


def remove_py3_tab_items(file_content):
    """
    Remove TabItem blocks for Python Client v3 from the content.
    This uses a combination of regex and state tracking to properly handle nested tags.
    """
    # Pattern to detect the start of Python Client v3 TabItem
    start_pattern = re.compile(
        r'<TabItem\s+.*?value=([\'"])py3\1.*?label=([\'"])Python Client v3\2.*?>'
    )

    # We'll build the new content line by line
    result_lines = []
    skip_mode = False
    nesting_level = 0

    # Process the file line by line
    lines = file_content.split("\n")
    for line in lines:
        # Check if we're starting a Python Client v3 TabItem
        if not skip_mode and start_pattern.search(line):
            skip_mode = True
            nesting_level = 1
            # Check if there's a closing tag on the same line
            if "</TabItem>" in line:
                nesting_level -= 1
            if nesting_level == 0:
                skip_mode = False
            continue

        # If we're in skip mode, check for nested tags
        if skip_mode:
            # Count opening tags (handle nested TabItems)
            nesting_level += line.count("<TabItem")
            # Count closing tags
            nesting_level -= line.count("</TabItem>")

            # If nesting level is back to 0, we're done skipping
            if nesting_level <= 0:
                skip_mode = False
            continue

        # If we're not skipping, add the line to the result
        result_lines.append(line)

    return "\n".join(result_lines)


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

            # Process the content
            new_content = remove_py3_tab_items(content)

            # If content was modified
            if new_content != content:
                files_modified += 1
                print(f"Modified: {file_path}")

                # Write the changes if not in dry-run mode
                if not dry_run:
                    with open(file_path, "w", encoding="utf-8") as file:
                        file.write(new_content)

    return files_processed, files_modified


def main():
    parser = argparse.ArgumentParser(
        description="Remove Python Client v3 TabItem blocks from files."
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
    print(f"Files that would be modified: {files_modified}")

    if not args.apply and files_modified > 0:
        print("\nRun with --apply to make the changes.")


if __name__ == "__main__":
    main()
