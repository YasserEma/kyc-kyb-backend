curl -X 'GET' \
  'http://localhost:3001/api/v1/entities/e8382fdb-1638-40fb-9f19-6d8bf2dd218c/organization' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OTRiZmM3Ni1hNTRjLTRiYzMtYjYyNy05YjgwYjExM2QxMmEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwic3Vic2NyaWJlcklkIjoiM2EwZDM3ZjQtMWFkMi00MDEzLWI3MjEtNWQ4ZjNlNjc0ZWNlIiwiaWF0IjoxNzYzNTA2NjgyLCJleHAiOjE3NjM1MTAyODJ9._snWFWstuOZzo0NpxDLcydoH73KW4v2skL-s7IPYPgk'
Request URL
http://localhost:3001/api/v1/entities/e8382fdb-1638-40fb-9f19-6d8bf2dd218c/organization
Server response
Code	Details
200	
Response body
Download
{
  "id": "e2e42737-3bb6-4cee-a9af-63e9e0cdcb3c",
  "created_at": "2025-11-18T20:44:17.242Z",
  "updated_at": "2025-11-18T20:44:17.242Z",
  "deleted_at": null,
  "is_active": true,
  "entity_id": "e8382fdb-1638-40fb-9f19-6d8bf2dd218c",
  "legal_name": "Test Company",
  "trade_name": "TestCo",
  "country_of_incorporation": "Egypt",
  "date_of_incorporation": "2025-01-01",
  "organization_type": "LLC",
  "legal_structure": "Private",
  "tax_identification_number": "123456789",
  "commercial_registration_number": "987654321",
  "registered_address": "Cairo, Egypt",
  "operating_address": "Giza, Egypt",
  "contact_email": "info@testco.com",
  "contact_phone": "01234567890",
  "industry_sector": "Technology",
  "number_of_employees": 50,
  "annual_revenue": "1000000",
  "entity": {
    "id": "e8382fdb-1638-40fb-9f19-6d8bf2dd218c",
    "created_at": "2025-11-18T20:44:17.242Z",
    "updated_at": "2025-11-18T20:44:17.242Z",
    "deleted_at": null,
    "is_active": true,
    "subscriber_id": "3a0d37f4-1ad2-4013-b721-5d8f3e674ece",
    "entity_type": "organization",
    "name": "TestCo",
    "reference_number": "REF-6753ab1a-6c32-417d-90e6-40914f6b891a",
    "status": "PENDING",
    "created_by": "494bfc76-a54c-4bc3-b627-9b80b113d12a",
    "updated_by": null,
    "risk_level": null,
    "screening_status": null,
    "onboarding_completed": false,
    "onboarded_at": null,
    "last_screened_at": null,
    "last_risk_assessed_at": null,
    "subscriber": {
      "id": "3a0d37f4-1ad2-4013-b721-5d8f3e674ece",
      "created_at": "2025-11-18T20:42:17.831Z",
      "updated_at": "2025-11-18T20:42:17.831Z",
      "deleted_at": null,
      "is_active": true,
      "username": "Example Corp",
      "email": "admin@example.com",
      "password": "$2b$12$LE9Z0g.hLNUwm7fcC90sw.fkKrmrZqYMQCgLrVx9zGxXREDkNHNWa",
      "type": "FINTECH",
      "status": "active",
      "company_name": "Example Corp",
      "company_code": null,
      "contact_person_name": null,
      "contact_person_phone": "+1-222-333-4444",
      "subscription_tier": null,
      "subscription_valid_from": null,
      "subscription_valid_until": null,
      "jurisdiction": "US",
      "api_rate_limit": null,
      "last_login_at": null,
      "last_login_ip": null
    }
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:3000 
 connection: keep-alive 
 content-length: 1881 
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; 
 content-type: application/json; charset=utf-8 
 date: Tue,18 Nov 2025 22:59:47 GMT 
 etag: W/"759-Mt/bX7YYA6Wc/NrrKEthDy4+OuA" 
 keep-alive: timeout=5 
 permissions-policy: geolocation=(),microphone=(),camera=() 
 referrer-policy: strict-origin-when-cross-origin 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-powered-by: Express 
 x-xss-protection: 1; mode=block  ,,,curl -X 'GET' \
  'http://localhost:3001/api/v1/entities/c31db13e-bbf6-4af3-b6a4-88f45929c88a/individual' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OTRiZmM3Ni1hNTRjLTRiYzMtYjYyNy05YjgwYjExM2QxMmEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwic3Vic2NyaWJlcklkIjoiM2EwZDM3ZjQtMWFkMi00MDEzLWI3MjEtNWQ4ZjNlNjc0ZWNlIiwiaWF0IjoxNzYzNTA2NjgyLCJleHAiOjE3NjM1MTAyODJ9._snWFWstuOZzo0NpxDLcydoH73KW4v2skL-s7IPYPgk'
Request URL
http://localhost:3001/api/v1/entities/c31db13e-bbf6-4af3-b6a4-88f45929c88a/individual
Server response
Code	Details
200	
Response body
Download
{
  "id": "6787e14e-8ef8-4175-aabb-2efee70a9059",
  "created_at": "2025-11-18T20:43:37.148Z",
  "updated_at": "2025-11-18T20:43:37.148Z",
  "deleted_at": null,
  "is_active": true,
  "entity_id": "c31db13e-bbf6-4af3-b6a4-88f45929c88a",
  "date_of_birth": "1990-01-01",
  "nationality": [
    "US"
  ],
  "country_of_residence": [
    "US"
  ],
  "gender": "string",
  "address": "string",
  "occupation": "string",
  "source_of_income": "string",
  "is_pep": false,
  "has_criminal_record": false,
  "pep_details": "string",
  "criminal_record_details": "string",
  "entity": {
    "id": "c31db13e-bbf6-4af3-b6a4-88f45929c88a",
    "created_at": "2025-11-18T20:43:37.148Z",
    "updated_at": "2025-11-18T20:43:37.148Z",
    "deleted_at": null,
    "is_active": true,
    "subscriber_id": "3a0d37f4-1ad2-4013-b721-5d8f3e674ece",
    "entity_type": "individual",
    "name": "John Doe",
    "reference_number": "REF-c331859a-5bcf-4abd-92a9-26531fa6aeb6",
    "status": "PENDING",
    "created_by": "494bfc76-a54c-4bc3-b627-9b80b113d12a",
    "updated_by": null,
    "risk_level": null,
    "screening_status": null,
    "onboarding_completed": false,
    "onboarded_at": null,
    "last_screened_at": null,
    "last_risk_assessed_at": null,
    "subscriber": {
      "id": "3a0d37f4-1ad2-4013-b721-5d8f3e674ece",
      "created_at": "2025-11-18T20:42:17.831Z",
      "updated_at": "2025-11-18T20:42:17.831Z",
      "deleted_at": null,
      "is_active": true,
      "username": "Example Corp",
      "email": "admin@example.com",
      "password": "$2b$12$LE9Z0g.hLNUwm7fcC90sw.fkKrmrZqYMQCgLrVx9zGxXREDkNHNWa",
      "type": "FINTECH",
      "status": "active",
      "company_name": "Example Corp",
      "company_code": null,
      "contact_person_name": null,
      "contact_person_phone": "+1-222-333-4444",
      "subscription_tier": null,
      "subscription_valid_from": null,
      "subscription_valid_until": null,
      "jurisdiction": "US",
      "api_rate_limit": null,
      "last_login_at": null,
      "last_login_ip": null
    }
  }
}