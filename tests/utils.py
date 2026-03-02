import os
import re
import subprocess
import tempfile
import runpy
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def load_script(script_path: str) -> str:
    with open(script_path, "r") as f:
        code_block = f.read()
    return code_block


def populate_inference_api_keys(codeblock_in: str) -> str:

    codeblock_out = codeblock_in
    for pattern, my_env_var, repl_pattern in [
        (r'(["\'])X-Cohere-Api-Key\1: \1(.+?)\1', "COHERE_API_KEY", r'\1X-Cohere-Api-Key\1: \1'),
        (r'(["\'])X-OpenAI-Api-Key\1: \1(.+?)\1', "OPENAI_API_KEY", r'\1X-OpenAI-Api-Key\1: \1'),
        (r'(["\'])X-HuggingFace-Api-Key\1: \1(.+?)\1', "HUGGINGFACE_API_KEY", r'\1X-HuggingFace-Api-Key\1: \1')
    ]:
        if re.search(pattern, codeblock_out) is not None:
            my_api_key = os.environ[my_env_var]
            # Replace key
            codeblock_out = re.sub(
                pattern, repl_pattern + my_api_key + r'\1', codeblock_out
            )
    return codeblock_out


def preprocess_codeblock(raw_codeblock: str, lang: str="py", custom_replace_pairs: list=[]) -> str:
    """
    Replaces placeholder text such as the URL and API keys with testable equivalents.

    Args:
        raw_codeblock (str): The raw code block from the markdown file.

    Returns:
        str: The preprocessed code block with placeholders replaced.
    """
    # Replace URL
    proc_codeblock = raw_codeblock

    common_replace_pairs = [
        ["http://localhost:8080", "http://localhost:8099"],  # Specify different port from usual to avoid confusion

        # For examples with auth
        ["https://WEAVIATE_INSTANCE_URL", "http://localhost:8099"],
        ["WEAVIATE_INSTANCE_URL", "localhost:8099"],
        ["YOUR-WEAVIATE-API-KEY", "secr3tk3y"],

        # For anonoymous examples
        ["https://anon-endpoint.weaviate.network", "http://localhost:8080"],
        ["anon-endpoint.weaviate.network", "localhost:8080"],
    ]

    if lang == "js" or lang == "ts":
        pattern = r"\s*  scheme: 'https',\n?\s*  host: 'WEAVIATE_INSTANCE_URL',"

        replacement = '''
        scheme: 'http',
        host: 'localhost:8099',  // Replace with your Weaviate endpoint
        '''

        proc_codeblock = re.sub(pattern, replacement, proc_codeblock, flags=re.DOTALL)

    for replace_pair in custom_replace_pairs:
        proc_codeblock = proc_codeblock.replace(*replace_pair)

    for replace_pair in common_replace_pairs:
        proc_codeblock = proc_codeblock.replace(*replace_pair)

    proc_codeblock = populate_inference_api_keys(proc_codeblock)

    return proc_codeblock


def load_and_prep_script(script_path: str):
    with open(script_path, "r") as f:
        code_block = f.read()
    return preprocess_codeblock(code_block)


def load_and_prep_temp_file(script_path: str, lang: str = "js", custom_replace_pairs: list = []):
    if lang == "js":
        outpath: Path = Path("./tests/temp.js")
    elif lang == "ts":
        outpath: Path = Path("./tests/temp.ts")
    elif lang == "py":
        outpath: Path = Path("./tests/temp.py")
    else:
        raise ValueError(f"Language {lang} not understood.")

    with open(script_path, "r") as f:
        code_block = f.read()
    new_codeblock = preprocess_codeblock(code_block, lang=lang, custom_replace_pairs=custom_replace_pairs)
    outpath.write_text(new_codeblock)
    return outpath.absolute()


edu_readonly_replacements = [
    ("WEAVIATE_INSTANCE_URL", "edu-demo.weaviate.network"),
    ("YOUR-WEAVIATE-API-KEY", "learn-weaviate")
]


def execute_py_script_as_module(script_content: str, script_name: str = "temp_script") -> None:
    """
    Execute a script string as a proper Python module.

    This avoids scoping issues that can occur with exec() by writing
    the script to a temporary file and running it with runpy.

    Args:
        script_content: The Python script content to execute
        script_name: Optional name for the temporary script (for debugging)
    """
    with tempfile.NamedTemporaryFile(
        mode='w',
        suffix='.py',
        prefix=f"{script_name}_",
        delete=False
    ) as f:
        f.write(script_content)
        temp_path = f.name

    try:
        runpy.run_path(temp_path)
    finally:
        Path(temp_path).unlink()

def run_script(command: list, script_path: str) -> None:
    """
    Run a script command and provide detailed error output on failure.
    """
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )
        if result.stdout.strip():
            print(f"\n--- Output from {script_path} ---")
            print(result.stdout)
            
    except subprocess.CalledProcessError as error:
        error_details = [
            f"\nScript execution failed: {script_path}",
            f"Exit code: {error.returncode}",
            f"Command: {' '.join(str(c) for c in command)}",  # Convert all to str
        ]
        
        if error.stderr:
            error_details.extend([
                "\n--- STDERR ---",
                error.stderr
            ])
        
        if error.stdout:
            error_details.extend([
                "\n--- STDOUT ---", 
                error.stdout
            ])
            
        raise Exception("\n".join(error_details))