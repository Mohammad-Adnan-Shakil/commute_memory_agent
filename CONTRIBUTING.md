# Contributing

Thank you for your interest in the Commute Memory Agent! We welcome contributions.

## How to Contribute

1. **Fork** the repository
2. **Clone** your fork:
   ```
   git clone https://github.com/your-username/commute_memory_agent.git
   ```
3. **Create a branch**:
   ```
   git checkout -b feat/your-feature-name
   ```
4. **Make your changes**
5. **Run tests**:
   ```
   pytest tests/
   ```
6. **Commit** with a descriptive message:
   ```
   git commit -m "feat: add your feature description"
   ```
7. **Push** and open a Pull Request

## Development Setup

```bash
git clone https://github.com/Mohammad-Adnan-Shakil/commute_memory_agent.git
cd commute_memory_agent
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

Create a `.env` file with:
```
OPENROUTER_API_KEY=your_key_here
GRAPHHOPPER_API_KEY=your_key_here
```

## Code Style

- Python: Follow PEP 8
- JavaScript/React: Follow ESLint rules in the frontend config
- Use meaningful variable and function names
- Add docstrings to new Python functions
- Keep functions small and single-purpose

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update tests if adding or changing functionality
- Update documentation (README, ARCHITECTURE) if the change affects the system
- Reference any related issues in the PR description

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Provide steps to reproduce for bugs
- Include relevant logs, screenshots, or error messages
