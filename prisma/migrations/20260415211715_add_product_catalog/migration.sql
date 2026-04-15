-- CreateTable
CREATE TABLE "RefrigerantV5" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "safetyClass" TEXT NOT NULL,
    "toxicityClass" TEXT NOT NULL,
    "flammabilityClass" TEXT NOT NULL,
    "atelOdl" REAL,
    "lfl" REAL,
    "practicalLimit" REAL NOT NULL,
    "vapourDensity" REAL NOT NULL,
    "molecularMass" REAL NOT NULL,
    "boilingPoint" TEXT,
    "gwp" TEXT,
    "gasGroup" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GasCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "safetyClass" TEXT NOT NULL,
    "coverage" INTEGER NOT NULL DEFAULT 50,
    "density" TEXT NOT NULL,
    "specs" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labelFr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🏢',
    "descFr" TEXT NOT NULL DEFAULT '',
    "descEn" TEXT NOT NULL DEFAULT '',
    "accessCategory" TEXT NOT NULL DEFAULT 'b',
    "locationClass" TEXT NOT NULL DEFAULT 'II',
    "belowGround" BOOLEAN NOT NULL DEFAULT false,
    "isMachineryRoom" BOOLEAN NOT NULL DEFAULT false,
    "isOccupiedSpace" BOOLEAN NOT NULL DEFAULT false,
    "humanComfort" BOOLEAN NOT NULL DEFAULT false,
    "c3Applicable" BOOLEAN NOT NULL DEFAULT false,
    "mechVentilation" BOOLEAN NOT NULL DEFAULT false,
    "productFamilies" TEXT NOT NULL DEFAULT '[]',
    "defaultRanges" TEXT NOT NULL DEFAULT '{}',
    "suggestedGases" TEXT NOT NULL DEFAULT '[]',
    "applicableSpaceTypes" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "SpaceType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labelFr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🏢',
    "accessCategory" TEXT NOT NULL DEFAULT 'b',
    "locationClass" TEXT NOT NULL DEFAULT 'II',
    "belowGround" BOOLEAN NOT NULL DEFAULT false,
    "isMachineryRoom" BOOLEAN NOT NULL DEFAULT false,
    "isOccupiedSpace" BOOLEAN NOT NULL DEFAULT false,
    "humanComfort" BOOLEAN NOT NULL DEFAULT false,
    "c3Applicable" BOOLEAN NOT NULL DEFAULT false,
    "mechVentilation" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin'
);

-- CreateTable
CREATE TABLE "CalcSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ref" TEXT NOT NULL,
    "clientJson" TEXT NOT NULL DEFAULT '{}',
    "gasAppJson" TEXT NOT NULL DEFAULT '{}',
    "zonesJson" TEXT NOT NULL DEFAULT '[]',
    "resultJson" TEXT NOT NULL DEFAULT '{}',
    "regulation" TEXT NOT NULL DEFAULT 'en378',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'draft'
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "image" TEXT,
    "specs" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'standard',
    "productGroup" TEXT NOT NULL DEFAULT 'A',
    "gas" TEXT NOT NULL DEFAULT '[]',
    "refs" TEXT NOT NULL DEFAULT '[]',
    "apps" TEXT NOT NULL DEFAULT '[]',
    "range" TEXT,
    "sensorTech" TEXT,
    "sensorLife" TEXT,
    "power" REAL,
    "voltage" TEXT,
    "ip" TEXT,
    "tempMin" REAL,
    "tempMax" REAL,
    "relay" INTEGER NOT NULL DEFAULT 0,
    "analog" TEXT,
    "modbus" BOOLEAN NOT NULL DEFAULT false,
    "standalone" BOOLEAN NOT NULL DEFAULT true,
    "atex" BOOLEAN NOT NULL DEFAULT false,
    "mount" TEXT NOT NULL DEFAULT '[]',
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT,
    "connectTo" TEXT,
    "discontinued" BOOLEAN NOT NULL DEFAULT false,
    "channels" INTEGER,
    "maxPower" REAL,
    "powerDesc" TEXT,
    "relaySpec" TEXT,
    "analogType" TEXT,
    "modbusType" TEXT,
    "subCategory" TEXT,
    "compatibleFamilies" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "DiscountMatrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerGroup" TEXT NOT NULL,
    "productGroup" TEXT NOT NULL,
    "discountPct" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CalcSheet_ref_key" ON "CalcSheet"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
