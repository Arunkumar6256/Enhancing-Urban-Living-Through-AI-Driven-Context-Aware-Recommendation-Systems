from app import app
print('--- REGISTERED ROUTES (from backend/print_routes.py) ---')
for r in app.routes:
    print(r.path, r.methods)
print('--- END ---')
