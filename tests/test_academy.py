import pytest
import utils


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/academy/py/starter_text_data/_snippets/101_connect.py",
        "./docs/academy/py/starter_text_data/_snippets/102_collection.py",
        "./docs/academy/py/starter_text_data/_snippets/103_searches.py",
        "./docs/academy/py/starter_text_data/_snippets/104_rag.py",
        "./docs/academy/py/starter_custom_vectors/_snippets/101_connect.py",
        "./docs/academy/py/starter_custom_vectors/_snippets/102_collection.py",
        "./docs/academy/py/starter_custom_vectors/_snippets/103_10_vector.py",
        "./docs/academy/py/starter_custom_vectors/_snippets/103_20_searches.py",
        "./docs/academy/py/starter_custom_vectors/_snippets/104_rag.py",
        "./docs/academy/py/starter_multimodal_data/_snippets/101_connect.py",
        "./docs/academy/py/starter_multimodal_data/_snippets/102_collection.py",
        "./docs/academy/py/starter_multimodal_data/_snippets/103_searches.py",
        "./docs/academy/py/starter_multimodal_data/_snippets/104_rag.py",
        "./docs/academy/py/named_vectors/_snippets/101_connect.py",
        "./docs/academy/py/named_vectors/_snippets/102_collection.py",
        "./docs/academy/py/named_vectors/_snippets/103_searches.py",
        "./docs/academy/py/named_vectors/_snippets/104_usecase.py",
        "./docs/academy/py/compression/_snippets/100_pq.py",
        "./docs/academy/py/compression/_snippets/200_bq.py",
        "./docs/academy/py/tokenization/_snippets/310_create_collection.py",
        "./docs/academy/py/tokenization/_snippets/315_add_objects.py",
        "./docs/academy/py/tokenization/_snippets/320_filters.py",
        "./docs/academy/py/tokenization/_snippets/400_searches.py",
        "./docs/academy/py/vector_index/_snippets/100_config.py",
    ],
)
def test_on_blank_instance_pyv4(empty_weaviates, script_loc):
    # proc_script = utils.load_and_prep_script(script_loc)
    # exec(proc_script)
    temp_proc_script_loc = utils.load_and_prep_temp_file(
        script_loc,
        lang="py",
        custom_replace_pairs=utils.edu_readonly_replacements
    )
    exec(temp_proc_script_loc.read_text())


# Deprecated tests for deprecated modules (pyv3; also directories have moved)
# @pytest.mark.pyv3
# @pytest.mark.parametrize(
#     "script_loc",
#     [
#         "./docs/academy/zero_to_mvp/_snippets/setup.py",
#         "./docs/academy/zero_to_mvp/103_schema_and_imports/_snippets/05_create_instance.py",
#         "./docs/academy/zero_to_mvp/103_schema_and_imports/_snippets/20_schema.py",
#         "./docs/academy/zero_to_mvp/103_schema_and_imports/_snippets/30_import.py",
#         "./docs/academy/zero_to_mvp/103_schema_and_imports/_snippets/40_import_example_1.py",
#     ],
# )
# def test_on_blank_instance(empty_weaviates, script_loc):
#     proc_script = utils.load_and_prep_script(script_loc)
#     exec(proc_script)


# @pytest.mark.pyv3
# @pytest.mark.parametrize(
#     "script_loc",
#     [
#         "./docs/academy/zero_to_mvp/104_queries_2/_snippets/10_bm25.py",
#         "./docs/academy/zero_to_mvp/104_queries_2/_snippets/20_hybrid.py",
#         "./docs/academy/zero_to_mvp/104_queries_2/_snippets/30_generative.py",
#         "./docs/academy/zero_to_mvp/104_queries_2/_snippets/40_qna.py",
#     ],
# )
# def test_against_edu_demo_pyv3(empty_weaviates, script_loc):
#     temp_proc_script_loc = utils.load_and_prep_temp_file(
#         script_loc,
#         lang="py",
#         custom_replace_pairs=utils.edu_readonly_replacements
#     )
#     exec(temp_proc_script_loc.read_text())
