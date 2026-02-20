-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DormBed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "floorNumber" INTEGER NOT NULL,
    "bedNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE'
);
INSERT INTO "new_DormBed" ("bedNumber", "floorNumber", "id", "status", "type") SELECT "bedNumber", "floorNumber", "id", "status", "type" FROM "DormBed";
DROP TABLE "DormBed";
ALTER TABLE "new_DormBed" RENAME TO "DormBed";
CREATE TABLE "new_FoodOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodOrder_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FoodOrder" ("createdAt", "guestId", "id", "items", "status") SELECT "createdAt", "guestId", "id", "items", "status" FROM "FoodOrder";
DROP TABLE "FoodOrder";
ALTER TABLE "new_FoodOrder" RENAME TO "FoodOrder";
CREATE TABLE "new_Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "checkInDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CHECKED_IN',
    "totalBill" REAL NOT NULL DEFAULT 0,
    "roomId" INTEGER,
    "dormBedId" INTEGER,
    CONSTRAINT "Guest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Guest_dormBedId_fkey" FOREIGN KEY ("dormBedId") REFERENCES "DormBed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Guest" ("checkInDate", "checkOutDate", "city", "dormBedId", "id", "mobile", "name", "paymentMode", "roomId", "status") SELECT "checkInDate", "checkOutDate", "city", "dormBedId", "id", "mobile", "name", "paymentMode", "roomId", "status" FROM "Guest";
DROP TABLE "Guest";
ALTER TABLE "new_Guest" RENAME TO "Guest";
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomNumber" TEXT NOT NULL,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE'
);
INSERT INTO "new_Room" ("hasBalcony", "id", "roomNumber", "status") SELECT "hasBalcony", "id", "roomNumber", "status" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_roomNumber_key" ON "Room"("roomNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
