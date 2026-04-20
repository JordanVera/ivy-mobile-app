-- CreateTable
CREATE TABLE `FeedPostLike` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FeedPostLike_postId_userId_key`(`postId`, `userId`),
    INDEX `FeedPostLike_postId_idx`(`postId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `FeedPostLike_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `FeedPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FeedPostLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeedPostComment` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FeedPostComment_postId_idx`(`postId`),
    INDEX `FeedPostComment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `FeedPostComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `FeedPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FeedPostComment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
