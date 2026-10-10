# Contributing to DocuMind AI

Thank you for contributing to DocuMind AI!

## Development Guidelines
1. Ensure all code edits maintain full type safety (TypeScript on frontend, Pydantic/Type Hints on backend).
2. Run backend tests before committing:
   ```bash
   cd backend
   ..\venv\Scripts\python.exe -m pytest tests
   ```
3. Run frontend production build before committing:
   ```bash
   cd frontend
   npm run build
   ```
4. Do not commit credentials, `.env` files, or binary model weights.
