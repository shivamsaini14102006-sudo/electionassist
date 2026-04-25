# Monorepo Structure

## 1. Directory Layout
The project will be organized using a simple directory structure suitable for the MVP.

```text
election-assistant/
├── docs/                               # 12 engineering documents
│   ├── product-requirement.md
│   ├── system-architecture.md
│   └── ...
├── packages/
│   ├── backend/                        # Node.js backend
│   │   ├── src/
│   │   │   ├── controllers/            # Route handlers
│   │   │   ├── engine/                 # Decision engine logic
│   │   │   ├── services/               # Gemini API wrapper
│   │   │   └── data/                   # knowledge.json
│   │   ├── package.json
│   │   └── index.js                    # Server entry
│   └── frontend/                       # Vanilla Antigravity UI
│       ├── index.html
│       ├── css/
│       │   └── style.css               # Modern aesthetics styling
│       └── js/
│           └── app.js                  # Chat interaction & API calling logic
├── .env                                # Gemini API keys (not committed)
├── package.json                        # Root package (if using workspaces or simple run scripts)
└── README.md
```

## 2. Package Management
If using npm workspaces (optional but recommended for clean separation):
- Root `package.json` contains `"workspaces": ["packages/*"]`
- We will keep it even simpler for the MVP: two separate directories that can be run independently to avoid workspace context overhead.
