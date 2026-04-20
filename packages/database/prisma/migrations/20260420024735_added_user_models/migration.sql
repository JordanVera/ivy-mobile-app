/*
  Warnings:

  - You are about to alter the column `imageUrl` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(2048)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `imageUrl` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
