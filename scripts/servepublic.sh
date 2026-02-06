python_cmd=$(command -v python3 || command -v python) && if [ -n "$python_cmd" ]; then cd public && $python_cmd -m http.server 5000; else echo "Neither python nor python3 found"; fi

