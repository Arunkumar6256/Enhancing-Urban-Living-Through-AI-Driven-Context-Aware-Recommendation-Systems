
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from backend.recommender import recommend, _ensure_loaded
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)

def test():
    print("Loading artifacts...")
    _ensure_loaded()

    # Test 1: Dundigal Police
    # Dundigal Coords: 17.6534, 78.3587
    print("\n--- Test 1: Dundigal Police (Proximity) ---")
    results = recommend(17.6534, 78.3587, "Police", k=5)
    found = False
    for r in results:
        print(f"- {r['name']} ({r['distance_km']} km)")
        if "Dundigal Police" in r['name']:
            found = True
    
    if found:
        print("✅ PASS: Dundigal Police Station found nearby.")
    else:
        print("❌ FAIL: Dundigal Police Station NOT found.")

    # Test 2: School (Category Check)
    print("\n--- Test 2: School (Category Check) ---")
    results = recommend(17.4934, 78.3916, "College", k=5) # Arrnd JNTU
    found_jntu = False
    for r in results:
        print(f"- {r['name']} ({r['distance_km']} km)")
        if "JNTU" in r['name']:
            found_jntu = True

    if found_jntu:
        print("✅ PASS: JNTU found.")
    else:
        print("❌ FAIL: JNTU NOT found.")

if __name__ == "__main__":
    test()
