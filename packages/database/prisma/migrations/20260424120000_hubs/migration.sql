-- CreateTable
CREATE TABLE `Hub` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Hub_slug_key`(`slug`),
    INDEX `Hub_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HubMembership` (
    `id` VARCHAR(191) NOT NULL,
    `hubId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `notificationsEnabled` BOOLEAN NOT NULL DEFAULT false,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `HubMembership_hubId_userId_key`(`hubId`, `userId`),
    INDEX `HubMembership_userId_idx`(`userId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `HubMembership_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `Hub`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `HubMembership_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HubMessage` (
    `id` VARCHAR(191) NOT NULL,
    `hubId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HubMessage_hubId_createdAt_idx`(`hubId`, `createdAt`),
    INDEX `HubMessage_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `HubMessage_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `Hub`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `HubMessage_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
