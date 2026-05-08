-- AlterTable: add replyToId and editedAt to HubMessage
ALTER TABLE `HubMessage` ADD COLUMN `replyToId` VARCHAR(191) NULL;
ALTER TABLE `HubMessage` ADD COLUMN `editedAt` DATETIME(3) NULL;

-- CreateTable: HubMessageReaction
CREATE TABLE `HubMessageReaction` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HubMessageReaction_messageId_idx`(`messageId`),
    INDEX `HubMessageReaction_userId_idx`(`userId`),
    UNIQUE INDEX `HubMessageReaction_messageId_userId_key`(`messageId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex: replyToId on HubMessage
CREATE INDEX `HubMessage_replyToId_idx` ON `HubMessage`(`replyToId`);

-- AddForeignKey: HubMessage self-relation (replies)
ALTER TABLE `HubMessage` ADD CONSTRAINT `HubMessage_replyToId_fkey` FOREIGN KEY (`replyToId`) REFERENCES `HubMessage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: HubMessageReaction -> HubMessage
ALTER TABLE `HubMessageReaction` ADD CONSTRAINT `HubMessageReaction_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `HubMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: HubMessageReaction -> User
ALTER TABLE `HubMessageReaction` ADD CONSTRAINT `HubMessageReaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
