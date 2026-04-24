-- CreateTable
CREATE TABLE `HubEvent` (
    `id` VARCHAR(191) NOT NULL,
    `hubId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `format` ENUM('IN_PERSON', 'ONLINE') NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `location` TEXT NULL,
    `meetingUrl` VARCHAR(2048) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HubEvent_hubId_startsAt_idx`(`hubId`, `startsAt`),
    INDEX `HubEvent_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `HubEvent_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `Hub`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `HubEvent_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HubEventRsvp` (
    `id` VARCHAR(191) NOT NULL,
    `hubEventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `HubEventRsvp_hubEventId_userId_key`(`hubEventId`, `userId`),
    INDEX `HubEventRsvp_userId_idx`(`userId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `HubEventRsvp_hubEventId_fkey` FOREIGN KEY (`hubEventId`) REFERENCES `HubEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `HubEventRsvp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
