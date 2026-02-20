-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "checkInDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CHECKED_IN',
    "roomId" INTEGER,
    "dormBedId" INTEGER,
    CONSTRAINT "Guest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Guest_dormBedId_fkey" FOREIGN KEY ("dormBedId") REFERENCES "DormBed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Guest" ("checkInDate", "checkOutDate", "dormBedId", "id", "name", "roomId", "status") SELECT "checkInDate", "checkOutDate", "dormBedId", "id", "name", "roomId", "status" FROM "Guest";
DROP TABLE "Guest";
ALTER TABLE "new_Guest" RENAME TO "Guest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
