# Room to Live database relationships

```mermaid
erDiagram
    PROPERTIES ||--o{ STATE_SCOPES : has
    PROPERTIES ||--o{ UNITS : contains
    STATE_SCOPES ||--o{ UNITS : stores
    STATE_SCOPES ||--o{ TENANTS : stores
    UNITS ||--o{ TENANTS : houses
    STATE_SCOPES ||--o{ RENT_PAYMENTS : stores
    TENANTS ||--o{ RENT_PAYMENTS : makes
    UNITS ||--o{ RENT_PAYMENTS : applies_to
    STATE_SCOPES ||--o{ UTILITY_BILLS : stores
    TENANTS ||--o{ UTILITY_BILLS : receives
    UNITS ||--o{ UTILITY_BILLS : billed_for
    UTILITY_BILLS ||--o{ UTILITY_BILL_ITEMS : contains
    UTILITY_TYPES ||--o{ UTILITY_BILL_ITEMS : categorizes
    PROPERTIES ||--o{ LEASES : offered_by
    UNITS ||--o{ LEASES : leased_in
    APP_USERS ||--o{ LEASES : rents

    PROPERTIES {
        varchar property_id PK
        varchar property_name
        varchar address
        json details_json
    }
    STATE_SCOPES {
        varchar scope_key PK
        varchar property_id FK
        json settings_json
    }
    UNITS {
        varchar scope_key PK,FK
        varchar unit_id PK
        varchar property_id FK
        varchar unit_number
        decimal monthly_rent
        varchar status
    }
    TENANTS {
        varchar scope_key PK,FK
        varchar tenant_id PK
        varchar property_id FK
        varchar unit_id FK
        varchar first_name
        varchar last_name
        varchar status
    }
    APP_USERS {
        varchar user_id PK
        varchar username
        varchar email
        varchar role
    }
    LEASES {
        varchar lease_id PK
        varchar scope_key FK
        varchar property_id FK
        varchar unit_id FK
        varchar renter_id FK
        decimal rent_amount
        varchar status
    }
    RENT_PAYMENTS {
        varchar scope_key PK,FK
        varchar payment_id PK
        varchar tenant_id FK
        varchar unit_id FK
        decimal amount
        varchar status
    }
    UTILITY_BILLS {
        varchar scope_key PK,FK
        varchar bill_id PK
        varchar tenant_id FK
        varchar unit_id FK
        varchar billing_period
        varchar status
    }
    UTILITY_TYPES {
        int utility_type_id PK
        varchar type_name
    }
    UTILITY_BILL_ITEMS {
        varchar bill_item_id PK
        varchar scope_key FK
        varchar bill_id FK
        int utility_type_id FK
        decimal amount
    }
```

`UTILITY_BILL_ITEMS` resolves the many-to-many relationship between utility bills and utility types: each bill can contain multiple charge types, and each charge type can appear on many bills.
