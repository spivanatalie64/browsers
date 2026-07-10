.PHONY: build test lint clean

PYTHON := python3
SCRIPT := scripts/gen_index.py

build:
	@echo "Running gen_index.py..."
	@$(PYTHON) $(SCRIPT) || (echo "gen_index failed" && exit 1)
	@echo "Build complete."

test:
	@echo "Running unit tests..."
	@$(PYTHON) scripts/run_tests.py || (echo "unit tests failed" && exit 1)
	@echo "Running syntax checks (py_compile)..."
	@$(PYTHON) -m py_compile scripts/gen_index.py scripts/run_tests.py $(shell echo tests/*.py) || (echo "syntax check failed" && exit 1)
	@echo "Tests and syntax checks passed."

lint:
	@echo "Running lint (py_compile syntax checks)..."
	@$(PYTHON) -m py_compile scripts/gen_index.py scripts/run_tests.py $(shell echo tests/*.py) || (echo "lint failed: syntax errors" && exit 1)
	@echo "Lint passed."

.PHONY: clean

clean:
	@echo "Cleaning generated extension/agents..."
	@rm -rf agents/* || true
	@echo "Clean complete."

.PHONY: test

test: build
	@echo "Running tests..."
	@python3 scripts/run_tests.py || (echo "Tests failed" && exit 1)
	@echo "Running syntax checks..."
	@python3 -m py_compile scripts/gen_index.py scripts/run_tests.py || (echo "Syntax error in scripts" && exit 2)
	@python3 -m py_compile $(shell ls tests/*.py) || (echo "Syntax error in tests" && exit 3)
	@echo "All tests and syntax checks passed."

.PHONY: lint

lint:
	@echo "Running lint (py_compile checks)..."
	@python3 -m py_compile scripts/gen_index.py scripts/run_tests.py || (echo "Syntax error in scripts" && exit 2)
	@python3 -m py_compile $(shell ls tests/*.py) || (echo "Syntax error in tests" && exit 3)
	@echo "Lint checks passed."
