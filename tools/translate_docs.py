# This file is based on https://github.com/openai/openai-agents-python/blob/main/docs/scripts/translate_docs.py
# Copyright (c) OpenAI
# Licensed under the MIT License. See LICENSE file in the project root for full license information.

# ruff: noqa
import os
import sys
import litellm
import shutil
from typing import List
from concurrent.futures import ThreadPoolExecutor
from instructions.docs_translation_instructions import DocsTranslationInstructions

# import logging
# logging.basicConfig(level=logging.INFO)
# logging.getLogger("openai").setLevel(logging.DEBUG)

OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "openai/o3")

ENABLE_CODE_SNIPPET_EXCLUSION = True
# gpt-4.5 needed this for better quality
ENABLE_SMALL_CHUNK_TRANSLATION = True


# Define the source and target directories
source_dir = "docs"
target_dir_template = "i18n/{lang}/docusaurus-plugin-content-docs/current"
languages = {
    "ja": "Japanese",
    # Add more languages here, e.g., "fr": "French"
}


def built_instructions(target_language: str, lang_code: str) -> str:
    return DocsTranslationInstructions.build(target_language, lang_code)


def output_text(response: litellm.Response) -> str:
    texts: list[str] = []
    for output in response.output:
        if output.type == "message":
            for content in output.content:
                if content.type == "output_text":
                    texts.append(content.text)

    return "".join(texts)


# Function to translate and save files
def translate_file(file_path: str, target_path: str, lang_code: str) -> None:
    print(f"Translating {file_path} into a different language: {lang_code}")
    with open(file_path, encoding="utf-8") as f:
        content = f.read()

    # Split content into lines
    lines: list[str] = content.splitlines()
    chunks: list[str] = []
    current_chunk: list[str] = []

    # Split content into chunks of up to 120 lines, ensuring splits occur before section titles
    in_code_block = False
    code_blocks: list[str] = []
    code_block_chunks: list[str] = []
    for line in lines:
        if (
            ENABLE_CODE_SNIPPET_EXCLUSION is True
            and line.strip().startswith("import ")
            and not in_code_block
        ):
            code_blocks.append(line)
            current_chunk.append(f"CODE_BLOCK_{(len(code_blocks) - 1):02}")
            continue
        if (
            ENABLE_SMALL_CHUNK_TRANSLATION is True
            and len(current_chunk) >= 120  # required for gpt-4.5
            and not in_code_block
            and line.startswith("#")
        ):
            chunks.append("\n".join(current_chunk) + "\n")
            current_chunk = []
        if ENABLE_CODE_SNIPPET_EXCLUSION is True and line.strip().startswith("```"):
            code_block_chunks.append(line)
            if in_code_block is True:
                code_blocks.append("\n".join(code_block_chunks))
                current_chunk.append(f"CODE_BLOCK_{(len(code_blocks) - 1):02}")
                code_block_chunks.clear()
            in_code_block = not in_code_block
            continue
        if in_code_block is True:
            code_block_chunks.append(line)
        else:
            current_chunk.append(line)
    if current_chunk:
        chunks.append("\n".join(current_chunk) + "\n")

    # Translate each chunk separately and combine results
    translated_content: list[str] = []
    instructions = built_instructions(languages[lang_code], lang_code)
    for chunk in chunks:
        if OPENAI_MODEL.startswith("o"):
            response = litellm.responses(
                model=OPENAI_MODEL,
                instructions=instructions,
                input=chunk,
            )
            translated_content.append(output_text(response) + "\n")
        else:
            response = litellm.responses(
                model=OPENAI_MODEL,
                instructions=instructions,
                input=chunk,
                temperature=0.0,
            )
            translated_content.append(output_text(response) + "\n")

    translated_text = "\n".join(translated_content) + "\n"
    for idx, code_block in enumerate(code_blocks):
        translated_text = translated_text.replace(f"CODE_BLOCK_{idx:02}", code_block)

    translated_text = translated_text
    # Save the combined translated content
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(translated_text)


def translate_single_source_file(file_path: str) -> None:
    relative_path = os.path.relpath(file_path, source_dir)
    if not (file_path.endswith(".md") or file_path.endswith(".mdx")):
        print(f"Skipping {file_path} as it is not a markdown file.")
        return

    for lang_code in languages:
        target_dir = target_dir_template.format(lang=lang_code)
        target_path = os.path.join(target_dir, relative_path)

        # Ensure the target directory exists
        os.makedirs(os.path.dirname(target_path), exist_ok=True)

        # Translate and save the file
        translate_file(file_path, target_path, lang_code)


def translate_all():
    # Traverse the source directory
    for root, _, file_names in os.walk(source_dir):
        # Skip the target directories
        if any(lang in root for lang in languages):
            continue
        # Increasing this will make the translation faster; you can decide considering the model's capacity
        concurrency = 6
        with ThreadPoolExecutor(max_workers=concurrency) as executor:
            futures = []
            for file_name in file_names:
                filepath = os.path.join(root, file_name)
                futures.append(executor.submit(translate_single_source_file, filepath))
                if len(futures) >= concurrency:
                    for future in futures:
                        future.result()
                    futures.clear()

    print("Translation completed.")

def translate_lists(filelist: list[str]) -> None:
    for file_path in filelist:
        if file_path.startswith(source_dir):
            if not os.path.exists(file_path):
                relative_path = os.path.relpath(file_path, source_dir)
                for lang_code in languages:
                    target_dir = target_dir_template.format(lang=lang_code)
                    target_path = os.path.join(target_dir, relative_path)
                    if os.path.isfile(target_path):
                        os.remove(target_path)
                        print(f"Removed from target dir: {target_path}")
                    else:
                        print(f"Skipped (deleted or moved): {file_path}")
                continue
            else:
                relative_path = os.path.relpath(file_path, source_dir)
                if file_path.endswith(".md") or file_path.endswith(".mdx"):
                    translate_single_source_file(file_path)
                else:
                    for lang_code in languages:
                        target_dir = target_dir_template.format(lang=lang_code)
                        target_path = os.path.join(target_dir, relative_path)
                        os.makedirs(os.path.dirname(target_path), exist_ok=True)
                        shutil.copy(file_path, target_path)
                        print(f"Copied: {file_path} -> {target_path}")
    print("Translation and copy completed")


if __name__ == "__main__":
    #translate_all()
    files = sys.argv[1:]
    translate_lists(files)
    

