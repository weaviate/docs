#!/usr/bin/env python3
import os
import sys
import argparse

# Directories to check for asset files (relative to project root)
ASSET_DIRS = ['_includes', 'static', 'src']

# Directories to skip when scanning for references
SKIP_DIRS = {'.git', 'node_modules', 'build', 'out'}

# Global variable for allowed asset file extensions.
# If empty, then all asset files are considered.
ALLOWED_EXTENSIONS = []  # Example: [".png", ".jpg", ".md"]

def normalize_extensions(ext_list):
    """
    Given a list of extensions, ensure each one starts with a dot and is lowercased.
    """
    normalized = []
    for ext in ext_list:
        ext = ext.strip().lower()
        if ext and not ext.startswith('.'):
            ext = '.' + ext
        normalized.append(ext)
    return normalized

def list_asset_files():
    """
    Return a list of asset file paths (relative to project root) from the asset directories.
    If ALLOWED_EXTENSIONS is non-empty, only include asset files with one of those extensions.
    """
    asset_files = []
    for asset_dir in ASSET_DIRS:
        if os.path.isdir(asset_dir):
            for root, dirs, files in os.walk(asset_dir):
                # Skip hidden directories
                dirs[:] = [d for d in dirs if not d.startswith('.')]
                for f in files:
                    ext = os.path.splitext(f)[1].lower()
                    if ALLOWED_EXTENSIONS and ext not in ALLOWED_EXTENSIONS:
                        continue
                    rel_path = os.path.join(root, f)
                    asset_files.append(rel_path)
        else:
            print(f"Warning: {asset_dir} does not exist.", file=sys.stderr)
    return asset_files

def list_project_files():
    """
    Return a list of all file paths (relative to project root) to search for references.
    It skips asset directories and common skip directories.
    """
    project_files = []
    for root, dirs, files in os.walk('.'):
        # Skip directories we don't want to scan (SKIP_DIRS and asset directories)
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        for f in files:
            full_path = os.path.join(root, f)
            # Skip this script itself
            if os.path.abspath(full_path) == os.path.abspath(__file__):
                continue
            project_files.append(full_path)
    return project_files

def file_mentions_asset(asset, project_files):
    """
    Check if the asset (by its full relative path or its basename) is mentioned in any of the project_files.
    """
    asset_basename = os.path.basename(asset)
    for filepath in project_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if asset in content or asset_basename in content:
                return True
        except Exception:
            # Skip files that cannot be read as text
            continue
    return False

def delete_files(files):
    """Delete the provided list of file paths."""
    for f in files:
        try:
            os.remove(f)
            print(f"Deleted: {f}")
        except Exception as e:
            print(f"Error deleting {f}: {e}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(
        description="Find asset files (in _includes, static, src) not referenced anywhere else in the project."
    )
    parser.add_argument(
        '-d', '--delete',
        action='store_true',
        help="Delete the found unused asset files after confirmation."
    )
    parser.add_argument(
        '-e', '--extensions',
        nargs='*',
        default=[],
        help="List of allowed asset file extensions to consider (e.g., md html js). If omitted, all asset files are considered."
    )
    args = parser.parse_args()

    global ALLOWED_EXTENSIONS
    ALLOWED_EXTENSIONS = normalize_extensions(args.extensions)

    asset_files = list_asset_files()
    project_files = list_project_files()

    unused_assets = []
    for asset in asset_files:
        if not file_mentions_asset(asset, project_files):
            unused_assets.append(asset)

    if unused_assets:
        print("Unused asset files:")
        for f in unused_assets:
            print(f" - {f}")
    else:
        print("No unused asset files found.")
        return

    if args.delete:
        confirm = input("Are you sure you want to DELETE these files? (y/n): ").strip().lower()
        if confirm == 'y':
            delete_files(unused_assets)
        else:
            print("Deletion aborted.")

if __name__ == "__main__":
    main()
