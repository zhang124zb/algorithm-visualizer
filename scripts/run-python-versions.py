import json
import sys

with open(sys.argv[1], encoding="utf-8") as stream:
    cases = json.load(stream)

for case in cases:
    namespace = {}
    try:
        exec(compile(case["code"], case["id"] + ".py", "exec"), namespace)
        exec(case["test"], namespace)
    except Exception as error:
        raise AssertionError("Python " + case["id"]) from error

print(f"Python: compiled and executed all {len(cases)} teaching snippets.")
