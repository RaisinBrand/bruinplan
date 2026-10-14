## Run the app

Run all commands below from the repository root.

### Frontend

Install the frontend packages:

```bash
npm run install:frontend
```

Start the frontend development server:

```bash
npm run start:frontend
```

The app is available at [http://localhost:3000](http://localhost:3000).

### Backend

Create a Python virtual environment from the repository root:

```bash
python -m venv venv
```

Activate it, then install the backend packages:

```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

```bash
# macOS / Linux
source venv/bin/activate
pip install -r backend/requirements.txt
```

With the virtual environment active, start the backend server (also from the repository root):

```bash
python backend/manage.py runserver
```
