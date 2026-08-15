import pandas as pd
import os

# Define the new services to add
# Format matches hyderabad_synthetic_20k.csv based on previous head check:
# id,name,name_en,amenity,categories,lat,lon,rating,review_count,city,state,address,combined_text

new_services = [
    {
        "business_id": "dundigal_police_1",
        "name": "Dundigal Police Station",
        "name_en": "Dundigal Police Station",
        "categories": "Police Station, Safety, Government",
        "latitude": 17.6534,
        "longitude": 78.3587,
        "rating": 4.5,
        "review_count": 50,
        "city": "Dundigal",
        "state": "Telangana",
        "attributes": "Emergency: Yes",
        "combined_text": "Dundigal Police Station | Police Station, Safety | Dundigal"
    },
    {
        "business_id": "hyd_central_uni",
        "name": "University of Hyderabad",
        "name_en": "University of Hyderabad",
        "categories": "Education, University, College",
        "latitude": 17.4602,
        "longitude": 78.3444,
        "rating": 4.8,
        "review_count": 1200,
        "city": "Hyderabad",
        "state": "Telangana",
        "attributes": "Type: Public",
        "combined_text": "University of Hyderabad | Education, University | Gachibowli"
    },
    {
        "business_id": "sec_rail_stn",
        "name": "Secunderabad Railway Station",
        "name_en": "Secunderabad Railway Station",
        "categories": "Transport, Train Station, Public Transport",
        "latitude": 17.4336,
        "longitude": 78.5015,
        "rating": 4.2,
        "review_count": 5000,
        "city": "Secunderabad",
        "state": "Telangana",
        "attributes": "Type: Transit",
        "combined_text": "Secunderabad Railway Station | Transport, Train Station | Secunderabad"
    },
    {
        "business_id": "mgbs_bus_stn",
        "name": "Mahatma Gandhi Bus Station (MGBS)",
        "name_en": "Mahatma Gandhi Bus Station (MGBS)",
        "categories": "Transport, Bus Station, Public Transport",
        "latitude": 17.3789,
        "longitude": 78.4816,
        "rating": 4.0,
        "review_count": 3000,
        "city": "Hyderabad",
        "state": "Telangana",
        "attributes": "Type: Transit",
        "combined_text": "Mahatma Gandhi Bus Station (MGBS) | Transport, Bus Station | Hyderabad"
    },
    {
        "business_id": "ghmc_ho",
        "name": "GHMC Head Office",
        "name_en": "GHMC Head Office",
        "categories": "Government, Civic Services, Office",
        "latitude": 17.4032,
        "longitude": 78.4735,
        "rating": 3.5,
        "review_count": 200,
        "city": "Hyderabad",
        "state": "Telangana",
        "attributes": "Type: Government",
        "combined_text": "GHMC Head Office | Government, Office | Tank Bund"
    },
    {
        "business_id": "jntuh_college",
        "name": "JNTU Hyderabad",
        "name_en": "JNTU Hyderabad",
        "categories": "Education, College, University",
        "latitude": 17.4934,
        "longitude": 78.3916,
        "rating": 4.6,
        "review_count": 1500,
        "city": "Hyderabad",
        "state": "Telangana",
        "attributes": "Type: Public",
        "combined_text": "JNTU Hyderabad | Education, College | Kukatpally"
    },
     {
        "business_id": "meeseva_dundigal",
        "name": "MeeSeva Center Dundigal",
        "name_en": "MeeSeva Center Dundigal",
        "categories": "Government, Public Services, Civic",
        "latitude": 17.6534,
        "longitude": 78.3587,
        "rating": 4.0,
        "review_count": 10,
        "city": "Dundigal",
        "state": "Telangana",
        "attributes": "Type: Service",
        "combined_text": "MeeSeva Center Dundigal | Government, Public Services | Dundigal"
    } 
]

csv_path = "hyderabad_synthetic_20k.csv"
if not os.path.exists(csv_path):
    print(f"Error: {csv_path} not found")
    exit(1)

print(f"Loading {csv_path}...")
df = pd.read_csv(csv_path)

print(f"Original shape: {df.shape}")

# Convert new services to DataFrame
new_df = pd.DataFrame(new_services)

# Append (concat)
df_augmented = pd.concat([df, new_df], ignore_index=True)

print(f"New shape: {df_augmented.shape}")

# Save back
df_augmented.to_csv(csv_path, index=False)
print("Successfully appended new services.")
