#!/bin/bash
export PYTHONPATH=$(pwd)
uvicorn backend.main:app --host 0.0.0.0 --port 10000
