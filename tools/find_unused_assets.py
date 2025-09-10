#!/usr/bin/env python3
import os
import sys
import argparse
import re
import fnmatch
from tqdm import tqdm  # For progress bar

# Directories to check for asset files (relative to project root)
DEFAULT_ASSET_DIRS = [
    "_includes",
    "static",
    "src",
    "public",
]  # Added 'public' as it's common in Docusaurus

# Directories to skip when scanning for references
SKIP_DIRS = {".git", "node_modules", "build", "out", ".docusaurus", ".cache"}

# Common asset file extensions in Docusaurus projects
DEFAULT_ASSET_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",  # Images
    ".css",
    ".scss",
    ".less",  # Styles
    ".js",
    ".jsx",
    ".ts",
    ".tsx",  # Scripts
    ".woff",
    ".woff2",
    ".eot",
    ".ttf",
    ".otf",  # Fonts
    ".json",
    ".yaml",
    ".yml",  # Data files
    ".md",
    ".mdx",  # Markdown
    ".mov",
    ".mp4",
    ".ogv",
    ".webm",
    ".pdf"
]

# Global variables
ALLOWED_EXTENSIONS = []
VERBOSE = False
ASSET_DIRS = []  # Will be set based on user input or defaults


def normalize_extensions(ext_list):
    """
    Given a list of extensions, ensure each one starts with a dot and is lowercased.
    """
    normalized = []
    for ext in ext_list:
        ext = ext.strip().lower()
        if ext and not ext.startswith("."):
            ext = "." + ext
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
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for f in files:
                    ext = os.path.splitext(f)[1].lower()
                    if ALLOWED_EXTENSIONS and ext not in ALLOWED_EXTENSIONS:
                        continue
                    rel_path = os.path.join(root, f)
                    # Normalize path format to use forward slashes
                    rel_path = rel_path.replace("\\", "/")
                    asset_files.append(rel_path)
        else:
            if VERBOSE:
                print(f"Warning: {asset_dir} does not exist.", file=sys.stderr)
    return asset_files


def list_project_files():
    """
    Return a list of all file paths (relative to project root) to search for references.
    It skips asset directories and common skip directories.
    """
    project_files = []
    for root, dirs, files in os.walk("."):
        # Skip directories we don't want to scan
        dirs[:] = [
            d
            for d in dirs
            if d not in SKIP_DIRS
            and not d.startswith(".")
            and not any(
                fnmatch.fnmatch(os.path.join(root, d), f"*/{ad}/*") for ad in ASSET_DIRS
            )
        ]

        for f in files:
            # Skip binary files and other non-text files
            ext = os.path.splitext(f)[1].lower()
            if ext in [
                ".pyc",
                ".exe",
                ".dll",
                ".so",
                ".zip",
                ".tar",
                ".gz",
                ".rar",
                ".7z",
            ]:
                continue

            full_path = os.path.join(root, f)
            # Skip this script itself
            if os.path.abspath(full_path) == os.path.abspath(__file__):
                continue
            project_files.append(full_path)
    return project_files


def generate_search_patterns(asset_path):
    """
    Generate various patterns that might be used to reference an asset in code or content.
    """
    basename = os.path.basename(asset_path)
    dirname = os.path.dirname(asset_path)

    # Normalize paths to use forward slashes
    asset_path = asset_path.replace("\\", "/")

    patterns = [
        # Exact path match
        re.escape(asset_path),
        # Basename match (for simple references)
        re.escape(basename),
        # Path without leading ./
        re.escape(asset_path.lstrip("./")),
        # Path with / prefix (absolute path within the project)
        re.escape("/" + asset_path.lstrip("./")),
        # Path reference in require or import statements
        r"(?:require|import).*[\'\"].*" + re.escape(basename) + r"[\'\"]\)",
        # URL style references
        r"(?:url|src|href)=[\'\"].*" + re.escape(basename) + r"[\'\"]",
        # Markdown style references
        r"\!\[.*\]\(.*" + re.escape(basename) + r"\)",
        r"\[.*\]\(.*" + re.escape(basename) + r"\)",
    ]

    # For assets in standard asset directories, add patterns without the directory
    for asset_dir in ASSET_DIRS:
        if asset_path.startswith(asset_dir + "/"):
            without_prefix = asset_path[len(asset_dir) + 1 :]
            patterns.append(re.escape(without_prefix))
            patterns.append(re.escape("/" + without_prefix))

    return patterns


def file_mentions_asset(asset, project_files):
    """
    Check if the asset is referenced in any of the project_files using various matching patterns.
    """
    search_patterns = generate_search_patterns(asset)

    for filepath in project_files:
        try:
            # Read file line by line instead of loading entire file into memory
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                for line_num, line in enumerate(f, 1):
                    for pattern in search_patterns:
                        if re.search(pattern, line):
                            if VERBOSE:
                                print(
                                    f"Found reference to {asset} in {filepath}:{line_num}"
                                )
                            return True
        except UnicodeDecodeError:
            # Skip binary files that couldn't be decoded
            if VERBOSE:
                print(f"Skipping binary file: {filepath}")
            continue
        except Exception as e:
            if VERBOSE:
                print(f"Error reading {filepath}: {e}", file=sys.stderr)
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
        description="Find asset files in Docusaurus project not referenced anywhere else."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Specific paths to check for unused assets (e.g., static). If omitted, all default asset directories are checked.",
    )
    parser.add_argument(
        "-d",
        "--delete",
        action="store_true",
        help="Delete the found unused asset files after confirmation.",
    )
    parser.add_argument(
        "-e",
        "--extensions",
        nargs="*",
        default=[],
        help="List of allowed asset file extensions to consider (e.g., md html js). If omitted, common Docusaurus asset extensions are used.",
    )
    parser.add_argument(
        "-a",
        "--all-extensions",
        action="store_true",
        help="Consider all asset files regardless of extension.",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose output for debugging.",
    )
    parser.add_argument("-o", "--output", help="Write results to the specified file.")
    args = parser.parse_args()

    global ALLOWED_EXTENSIONS, VERBOSE, ASSET_DIRS
    VERBOSE = args.verbose

    # Set the asset directories to scan based on user input
    if args.paths:
        ASSET_DIRS = [
            path.rstrip("/\\") for path in args.paths
        ]  # Remove trailing slashes
    else:
        ASSET_DIRS = DEFAULT_ASSET_DIRS

    # Set extensions to search for
    if args.all_extensions:
        ALLOWED_EXTENSIONS = []  # Empty list means all extensions
    elif args.extensions:
        ALLOWED_EXTENSIONS = normalize_extensions(args.extensions)
    else:
        ALLOWED_EXTENSIONS = DEFAULT_ASSET_EXTENSIONS

    if VERBOSE:
        if ALLOWED_EXTENSIONS:
            print(
                f"Looking for asset files with extensions: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        else:
            print("Looking for all asset files regardless of extension")

    # Get list of asset files and project files
    print(f"Scanning for asset files in: {', '.join(ASSET_DIRS)}...")
    asset_files = list_asset_files()
    print(f"Found {len(asset_files)} asset files to check.")

    print("Scanning for project files to search for references...")
    project_files = list_project_files()
    print(f"Found {len(project_files)} project files to search through.")

    # Find unused assets with progress bar
    print("Checking for unused assets...")
    unused_assets = []
    for asset in tqdm(asset_files, desc="Checking assets", unit="file"):
        if not file_mentions_asset(asset, project_files):
            unused_assets.append(asset)

    # Display results
    if unused_assets:
        print(f"\nFound {len(unused_assets)} unused asset files:")
        for f in unused_assets:
            print(f" - {f}")

        # Write to output file if specified
        if args.output:
            try:
                with open(args.output, "w", encoding="utf-8") as f:
                    f.write(
                        f"# Unused assets found in project ({len(unused_assets)} files)\n\n"
                    )
                    for asset in unused_assets:
                        f.write(f"- {asset}\n")
                print(f"\nResults written to {args.output}")
            except Exception as e:
                print(f"Error writing to output file: {e}", file=sys.stderr)
    else:
        print("\nNo unused asset files found.")
        return

    # Delete if requested
    if args.delete and unused_assets:
        confirm = (
            input(
                f"\nAre you sure you want to DELETE these {len(unused_assets)} files? (y/n): "
            )
            .strip()
            .lower()
        )
        if confirm == "y":
            delete_files(unused_assets)
        else:
            print("Deletion aborted.")


if __name__ == "__main__":
    main()
