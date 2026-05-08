-- AlterTable
ALTER TABLE `ExchangeMessage` ADD COLUMN `replyToId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ExchangeMessageReaction` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ExchangeMessageReaction_messageId_idx`(`messageId`),
    INDEX `ExchangeMessageReaction_userId_idx`(`userId`),
    UNIQUE INDEX `ExchangeMessageReaction_messageId_userId_key`(`messageId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ExchangeMessage_replyToId_idx` ON `ExchangeMessage`(`replyToId`);

-- AddForeignKey
ALTER TABLE `ExchangeMessage` ADD CONSTRAINT `ExchangeMessage_replyToId_fkey` FOREIGN KEY (`replyToId`) REFERENCES `ExchangeMessage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExchangeMessageReaction` ADD CONSTRAINT `ExchangeMessageReaction_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `ExchangeMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExchangeMessageReaction` ADD CONSTRAINT `ExchangeMessageReaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
