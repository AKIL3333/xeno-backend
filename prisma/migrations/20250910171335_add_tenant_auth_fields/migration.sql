/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Tenant` 
ADD COLUMN `email` VARCHAR(255) NULL,
ADD COLUMN `passwordHash` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Tenant_email_key` ON `Tenant`(`email`);
