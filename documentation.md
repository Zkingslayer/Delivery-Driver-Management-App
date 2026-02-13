# **Delivery Driver Management App - Comprehensive Documentation**

## **1. Project Overview**

### **1.1 Purpose**
A mobile application for delivery drivers to track goods value during deliveries, manage customer debts, and maintain client information. The app functions primarily offline with cloud backup capabilities.

### **1.2 Target Users**
- Delivery drivers transporting goods from factories to retail shops
- Small business owners managing delivery operations
- Individuals needing debt tracking and customer management

### **1.3 Core Value Proposition**
- Real-time tracking of goods value on truck
- Efficient debt management for client transactions
- Offline-first operation with cloud synchronization
- Simple, intuitive interface for daily operations

## **2. Technology Stack**

### **2.1 Frontend**
- **Framework**: Svelte 5 (with runes) + javaScript
- **UI Components**: shadcn-svelte (Radix-based)
- **Styling**: Tailwind CSS
- **Icons**: Iconify
- **Routing**: SvelteKit client-side routing
- **State Management**: Svelte stores + custom stores

### **2.2 Mobile Layer**
- **Framework**: Capacitor 6
- **Platforms**: Android (primary), iOS (optional future)
- **Plugins**:
  - Camera
  - Filesystem
  - Network
  - Device
  - Preferences
  - Splash Screen
  - Status Bar

### **2.3 Backend & Data**
- **Local Database**: SQLite3 (via `sqlx` or `rusqlite`)
- **Local Backend**: Rust (Tokio runtime)
- **Cloud Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for backup images)

### **2.4 Communication**
- **Frontend-Backend**: Custom Capacitor plugin (bridge)
- **Sync Protocol**: Custom conflict resolution
- **REST Client**: Reqwest (Rust)
- **WebSocket**: For real-time sync notifications

## **3. Architecture Design**

### **3.1 High-Level Architecture**
```
┌─────────────────────────────────────────────────┐
│                 Capacitor App                    │
│  ┌─────────────┐  ┌─────────────┐              │
│  │   Svelte    │  │   Custom    │              │
│  │   Frontend  │◄─┤  Capacitor  │              │
│  │             │  │   Plugin    │              │
│  └─────────────┘  └─────────────┘              │
│          │                    │                 │
│    (JSON over bridge)    (Native calls)         │
└──────────┼────────────────────┼─────────────────┘
           │                    │
┌──────────┼────────────────────┼─────────────────┐
│          ▼                    ▼                 │
│  ┌─────────────┐  ┌──────────────────────┐     │
│  │   Rust      │  │   Device APIs        │     │
│  │   Backend   │  │   (Camera, FS, etc.) │     │
│  └─────────────┘  └──────────────────────┘     │
│          │                    │                 │
│      SQLite3               File System          │
└──────────┼────────────────────┼─────────────────┘
           │                    │
    (Periodic Sync)      (Local Storage)
           │
┌──────────┼─────────────────────────────────────┐
│          ▼                                     │
│  ┌─────────────────────────────────────────┐   │
│  │            Supabase Cloud               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │  Auth   │ │  DB     │ │ Storage │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────┘   │
│              (Internet Required)                │
└─────────────────────────────────────────────────┘
```

### **3.2 Data Flow**
1. **User Action** → Frontend → Capacitor Plugin → Rust Backend
2. **Rust Backend** → SQLite (immediate) → Queue for cloud sync
3. **Background Sync** → Check connectivity → Sync with Supabase
4. **Conflict Resolution** → Timestamp-based merging

### **3.3 Folder Structure**
```
delivery-driver-app/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── stores/         # Svelte stores
│   │   │   ├── utils/          # Helper functions
│   │   ├── routes/             # SvelteKit routes
│   │   │   ├── (auth)/
│   │   │   ├── (app)/
│   │   │   └── +layout.svelte
│   │   └── app.html
│   ├── capacitor.config.js
│   └── package.json
├── native/
│   ├── src/
│   │   ├── lib.rs              # Main Rust library
│   │   ├── database/
│   │   │   ├── models.rs       # Data structures
│   │   │   ├── schema.rs       # SQL definitions
│   │   │   └── operations.rs   # CRUD operations
│   │   ├── sync/
│   │   │   ├── manager.rs      # Sync orchestration
│   │   │   ├── supabase.rs     # Cloud operations
│   │   │   └── conflict.rs     # Conflict resolution
│   │   ├── api/
│   │   │   ├── mod.rs          # API endpoints
│   │   │   └── handlers/       # Request handlers
│   │   ├── auth/
│   │   │   └── verification.rs # License verification
│   │   └── utils/
│   │       └── encryption.rs   # UUID hashing
│   ├── Cargo.toml
│   └── build.rs
└── assets/
    └── icons/                  # App icons
```

## **4. Database Schema**

### **4.1 Local SQLite Schema**

```sql
-- Enable UUID extension
SELECT uuid();

-- Drivers table (local user)
CREATE TABLE drivers (
    id TEXT PRIMARY KEY,               -- Hashed UUID (SHA-256)
    original_uuid TEXT NOT NULL UNIQUE, -- Original device UUID (encrypted)
    license_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id TEXT PRIMARY KEY,               -- UUID v4
    driver_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    photo_path TEXT,                   -- Local path to image
    photo_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- Deliveries table
CREATE TABLE deliveries (
    id TEXT PRIMARY KEY,               -- UUID v4
    driver_id TEXT NOT NULL,
    start_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) NOT NULL,
    end_value DECIMAL(10, 2),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,               -- UUID v4
    delivery_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,    -- Value of goods delivered
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK (status IN ('paid', 'partially_paid', 'unpaid')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Debts view (for easy querying)
CREATE VIEW debts_view AS
SELECT 
    t.id,
    t.client_id,
    c.name as client_name,
    t.amount as original_amount,
    (t.amount - t.paid_amount) as remaining_amount,
    t.transaction_date,
    t.status,
    t.last_updated
FROM transactions t
JOIN clients c ON t.client_id = c.id
WHERE t.status IN ('unpaid', 'partially_paid')
AND (t.amount - t.paid_amount) > 0;

-- Sync queue table
CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    data TEXT NOT NULL,                -- JSON representation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_synced BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_clients_driver_id ON clients(driver_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_transactions_delivery_id ON transactions(delivery_id);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_last_updated ON deliveries(last_updated);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_sync_queue ON sync_queue(is_synced, created_at);
```

### **4.2 Supabase Schema**
Matches local schema with additional columns:
- `supabase_id` (auto-generated by Supabase)
- `deleted_at` (for soft deletes)
- `sync_version` (for optimistic locking)

## **5. Application Workflow**

### **5.1 Initial Setup & Verification**
1. **First Launch** (Internet required):
   - Generate device UUID using Capacitor Device plugin
   - Hash UUID with SHA-256 in Rust backend
   - Send to Supabase for license verification
   - Create driver record in cloud and local DB
   - Download initial data if migrating from another device

2. **Subsequent Launches**:
   - Check internet connectivity
   - Verify UUID hash matches cloud record
   - Perform background sync
   - If offline, use local data only

### **5.2 Daily Workflow**
```
┌─────────────────┐
│   Start Day     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Main Screen    │
│  - Start Delivery │
│  - View Clients  │
│  - View Debts    │
└────────┬────────┘
         │ (Start Delivery)
         ▼
┌─────────────────┐
│ Enter Initial   │
│ Goods Value     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Client   │
│ from List       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Transaction│
│ - Enter amount   │
│ - Payment status │
│ - Partial payment│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Truck    │
│ Value & Return  │
│ to Client List  │
└────────┬────────┘
         │
    (Repeat for each delivery)
         │
         ▼
┌─────────────────┐
│ Finish Delivery │
│ - View Report   │
│ - End Day       │
└─────────────────┘
```

### **5.3 Debt Management Flow**
1. **From Debt List**:
   - View all outstanding debts
   - Filter by client or date
   - Select debt to view details
   - Mark as paid (creates payment transaction)
   - Debt moves to transaction history

2. **From Client Profile**:
   - View client-specific debts
   - Record partial payments
   - View payment history

## **6. User Interfaces (Detailed)**

### **6.1 Login/Verification Screen**
- **Elements**:
  - App logo and name
  - "Checking License" loading indicator
  - Retry button (if verification fails)
  - Offline mode warning
- **Behavior**:
  - Auto-check on app start
  - Store verification state locally
  - Allow limited offline use after first verification

### **6.2 Main Dashboard**
```svelte
Layout:
┌─────────────────────────────────────┐
│ [Logo] Delivery App    [Language] ▼ │
├─────────────────────────────────────┤
│                                    │
│    Welcome, [Driver Name]!         │
│                                    │
│    ┌─────────────────────────┐    │
│    │   Current Delivery:     │    │
│    │   $[remaining_value]    │    │
│    │   [Continue] [Finish]   │    │
│    └─────────────────────────┘    │
│                                    │
│    [Start New Delivery]            │
│                                    │
│    [View Clients List]             │
│                                    │
│    [View Debts List]               │
│                                    │
│    [Sync Status: Online/Offline]   │
│                                    │
└─────────────────────────────────────┘
```

### **6.3 Client List**
- **Search Bar**: Real-time filtering
- **Add Button**: Floating action button
- **Client Cards**:
  - Profile picture (thumbnail)
  - Name and phone number
  - Total debt indicator (if any)
  - Last transaction date
- **Empty State**: "No clients added" with CTA

### **6.4 Client Profile (3-Tab Layout)**
**Tab 1: Client Info**
- Editable fields (name, phone)
- Profile picture (view/edit)
- Statistics (total transactions, total spent)

**Tab 2: Transactions**
- Chronological list of all transactions
- Color-coded status (green=paid, yellow=partial, red=unpaid)
- Transaction details on tap
- Filter by date range

**Tab 3: Debts**
- Current outstanding debts
- "Mark as Paid" button for each
- Payment history for each debt
- Total debt amount summary

### **6.5 Debt List**
- **Sort Options**: Date (default), Amount, Client
- **Debt Cards**:
  - Client name and photo
  - Original amount vs remaining
  - Due date (transaction date + 30 days)
  - "Mark Paid" button
- **Batch Actions**: Select multiple to mark paid
- **Statistics**: Total outstanding debt

### **6.6 Start Delivery Flow**

**Screen 1: Enter Initial Value**
- Numeric keypad input
- Currency formatting
- Validation (must be > 0)
- "Start Delivery" button

**Screen 2: Select Client**
- Filterable client list
- "Add New Client" option (opens modal)
- "Scan QR" option (future feature)
- Client details preview on selection

**Screen 3: Create Transaction**
```
Layout:
┌─────────────────────────────────────┐
│ Client: [Name]              [Photo] │
│ Truck Value: $[current] → $[new]    │
├─────────────────────────────────────┤
│ Transaction Amount: $_____          │
│                                     │
│ Payment Status:                     │
│  ○ Fully Paid                       │
│  ○ Partially Paid                   │
│  ○ Fully Unpaid                     │
│                                     │
│ [If Partial]                        │
│ Amount Paid: $_____                 │
│                                     │
│ Notes: [__________________]         │
│                                     │
│ [Cancel]       [Complete Delivery]  │
└─────────────────────────────────────┘
```

### **6.7 Delivery Report**
- **Summary Cards**:
  - Starting value
  - Ending value (remaining)
  - Total deliveries made
  - Cash collected
  - Debt created
- **Client List**: All clients visited
- **Export Options**: PDF, Excel
- **Actions**: Save report, Finish delivery

## **7. Synchronization Strategy**

### **7.1 Conflict Resolution Rules**
1. **Last-Write-Wins with Versioning**:
   - Each record has `last_updated` timestamp
   - Compare timestamps on conflict
   - Always keep newer version
   - Log conflicts for manual review

2. **Deletion Handling**:
   - Soft deletes with `deleted_at` timestamp
   - Sync deletions after 30-day retention
   - Allow undo within retention period

### **7.2 Sync Process**
```rust
struct SyncManager {
    async fn sync_all() -> Result<SyncReport> {
        // 1. Check internet connectivity
        // 2. Verify driver license
        // 3. Process sync queue (local → cloud)
        // 4. Pull changes from cloud
        // 5. Resolve conflicts
        // 6. Update sync timestamps
        // 7. Send completion notification
    }
    
    async fn background_sync() {
        // Run every 15 minutes when:
        // - App is in foreground
        // - Network is available
        // - Battery > 20%
        // - Not on metered connection (configurable)
    }
}
```

### **7.3 Offline Support**
- **Queue System**: All mutations go to sync queue
- **Local First**: Immediate local DB update
- **Retry Logic**: Exponential backoff for failed syncs
- **Storage Management**: Clean old sync records after success

## **8. Security Implementation**

### **8.1 UUID Hashing**
```rust
use sha2::{Sha256, Digest};

fn hash_uuid(uuid: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(uuid.as_bytes());
    format!("{:x}", hasher.finalize())
}

// Store: hashed_uuid in cloud, encrypted_original locally
```

### **8.2 Data Encryption**
- **At Rest**: SQLCipher for SQLite encryption
- **In Transit**: HTTPS for all Supabase communication
- **Sensitive Data**: Encrypt original UUID with device-specific key

### **8.3 License Verification**
1. One-time purchase verification via Supabase
2. Device binding (hashed UUID)
3. License expiration check
4. Grace period for offline use

## **9. Background Services**

### **9.1 Sync Worker**
```javascript
// Capacitor Background Task
import { BackgroundRunner } from '@capacitor/background-runner';

class SyncWorker {
  async register() {
    await BackgroundRunner.register({
      events: ['appStateChange', 'networkChange'],
      callback: this.syncCallback
    });
  }
  
  async syncCallback(event: BackgroundEvent) {
    if (event.networkAvailable && event.appInForeground) {
      await nativePlugin.syncData();
    }
  }
}
```

### **9.2 Image Sync Service**
- Compress images before upload
- Store locally until synced
- Resume failed uploads
- Cache thumbnails for performance

## **10. Performance Optimization**

### **10.1 Database**
- Index on frequently queried columns
- Pagination for large lists (50 items per page)
- Query optimization with EXPLAIN
- Regular VACUUM operations

### **10.2 UI Performance**
- Virtual scrolling for long lists
- Lazy loading of images
- Debounced search inputs
- Optimized re-renders with Svelte reactivity

### **10.3 Memory Management**
- Clear image cache after sync
- Limit transaction history (configurable)
- Batch database operations

## **11. Error Handling & Logging**

### **11.1 Error Types**
1. **Network Errors**: Retry with exponential backoff
2. **Database Errors**: Rollback transactions, user notification
3. **Sync Conflicts**: Log, notify, manual resolution option
4. **Validation Errors**: Immediate user feedback

### **11.2 Logging System**
- Structured logging with levels (DEBUG, INFO, WARN, ERROR)
- Local log rotation (keep 7 days)
- Upload logs on sync for debugging
- User-visible error messages (translated)

## **12. Localization**

### **12.1 Supported Languages**
- English (primary)
- Arabic (RTL support)
- French
- Spanish

### **12.2 Implementation**
- JSON-based translation files
- RTL layout switching
- Currency and date formatting
- Pluralization support

## **13. Testing Strategy**

### **13.1 Test Levels**
1. **Unit Tests**: Rust backend functions
2. **Integration Tests**: Database operations
3. **E2E Tests**: Complete user flows
4. **Sync Tests**: Offline/online transitions

### **13.2 Test Scenarios**
- New driver setup
- Complete delivery cycle
- Debt management flow
- Sync conflict resolution
- Low storage/network conditions

## **14. Deployment & Distribution**

### **14.1 Build Process**
```bash
# Frontend build
npm run build

# Capacitor sync
npx cap sync android

# Rust build
cargo build --release --target aarch64-linux-android

# APK generation
./gradlew assembleRelease
```

### **14.2 Distribution**
- Google Play Store (primary)
- Direct APK download (for limited distribution)
- MDM deployment options

### **14.3 Update Strategy**
- Silent updates for Rust backend (if possible)
- Play Store updates for frontend
- Database migration scripts
- Backward compatibility (2 versions)

## **15. Monetization & Licensing**

### **15.1 Pricing Model**
- One-time purchase
- Perpetual license
- No subscriptions

### **15.2 License Management**
- Supabase license table
- Device limit (1 device per license)
- Transfer option (deactivate old device)
- License recovery via email

## **16. Future Enhancements**

### **16.1 Phase 2 Features**
- QR code scanning for clients
- Barcode scanning for goods
- Route optimization
- Expense tracking
- Multiple drivers per account

### **16.2 Phase 3 Features**
- Web dashboard for managers
- Analytics and reporting
- Inventory management
- Integration with accounting software
- API for third-party integrations

## **17. Maintenance & Support**

### **17.1 Monitoring**
- Supabase dashboard for usage metrics
- Error tracking (Sentry or similar)
- User feedback collection in-app

### **17.2 Backup & Recovery**
- Daily cloud backups (automatic)
- Manual backup/restore option
- Data export (CSV, JSON)
- Migration assistant for device changes

---

## **Appendix A: API Endpoints (Rust Backend)**

```rust
// Native plugin API
#[derive(Serialize, Deserialize)]
enum ApiRequest {
    // Client management
    CreateClient { name: String, phone: Option<String>, photo: Option<Vec<u8>> },
    ListClients { search: Option<String>, page: u32 },
    UpdateClient { id: String, name: Option<String>, phone: Option<String> },
    
    // Delivery management
    StartDelivery { initial_value: f64 },
    GetActiveDelivery,
    FinishDelivery,
    
    // Transaction management
    CreateTransaction {
        delivery_id: String,
        client_id: String,
        amount: f64,
        paid_amount: f64,
        notes: Option<String>
    },
    
    // Debt management
    ListDebts { client_id: Option<String>, status: Option<String> },
    MarkDebtPaid { transaction_id: String, paid_amount: f64 },
    
    // Sync operations
    ForceSync,
    GetSyncStatus,
    
    // Utility
    GetAppStats,
    ExportData { format: String },
}
```

## **Appendix B: Environment Variables**

```env
# Rust Backend
DATABASE_URL=sqlite://data/delivery.db
SYNC_INTERVAL=900 # 15 minutes in seconds
MAX_RETRY_ATTEMPTS=5
BACKOFF_MULTIPLIER=2

# Supabase
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_ROLE_KEY=[key] # For server-side operations

# App Configuration
ENCRYPTION_KEY=[device-specific-key]
MAX_IMAGE_SIZE=5242880 # 5MB
CACHE_DURATION=604800 # 7 days in seconds
```

## **Appendix C: Required Capacitor Permissions**

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

---

This documentation provides a comprehensive guide for developing the Delivery Driver Management App. Each section can be expanded with implementation details as development progresses. The architecture is designed to be scalable, maintainable, and robust for real-world delivery operations.