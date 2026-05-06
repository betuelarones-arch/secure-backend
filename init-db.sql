CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR');
-- Tabla Stores
CREATE TABLE "Store" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "address" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
-- Tabla Roles
CREATE TABLE "Role" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" "RoleName" UNIQUE NOT NULL,
  "description" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
-- Tabla Users
CREATE TABLE "User" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  "storeId" VARCHAR(255),
  "mfaSecret" VARCHAR(255),
  "mfaEnabled" BOOLEAN DEFAULT FALSE NOT NULL,
  "isBlocked" BOOLEAN DEFAULT FALSE NOT NULL,
  "failedAttempts" INTEGER DEFAULT 0 NOT NULL,
  "lastAttempt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_user_store FOREIGN KEY ("storeId") REFERENCES "Store"(id) ON DELETE SET NULL
);
-- Tabla UserRole (relación muchos a muchos)
CREATE TABLE "UserRole" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" VARCHAR(255) NOT NULL,
  "roleId" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_userrole_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_userrole_role FOREIGN KEY ("roleId") REFERENCES "Role"(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_role UNIQUE ("userId", "roleId")
);
-- Tabla Products
CREATE TABLE "Product" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" VARCHAR(255) NOT NULL,
  "description" VARCHAR(255),
  "price" DECIMAL(10,2) NOT NULL,
  "stock" INTEGER DEFAULT 0 NOT NULL,
  "category" VARCHAR(255) NOT NULL,
  "storeId" VARCHAR(255) NOT NULL,
  "isPremium" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdById" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_product_store FOREIGN KEY ("storeId") REFERENCES "Store"(id) ON DELETE RESTRICT,
  CONSTRAINT fk_product_creator FOREIGN KEY ("createdById") REFERENCES "User"(id) ON DELETE RESTRICT
);
-- Tabla AuditLog
CREATE TABLE "AuditLog" (
  "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" VARCHAR(255),
  "action" VARCHAR(255) NOT NULL,
  "resource" VARCHAR(255) NOT NULL,
  "resourceId" VARCHAR(255),
  "details" TEXT,
  "ipAddress" VARCHAR(255),
  "userAgent" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT fk_auditlog_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL
);
-- Índices para mejorar rendimiento
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_store ON "User"("storeId");
CREATE INDEX idx_product_store ON "Product"("storeId");
CREATE INDEX idx_product_category ON "Product"(category);
CREATE INDEX idx_auditlog_user ON "AuditLog"("userId");
CREATE INDEX idx_auditlog_created ON "AuditLog"("createdAt");