-- CreateTable
CREATE TABLE `EpisodeComment` (
    `id` VARCHAR(191) NOT NULL,
    `youtubeVideoId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EpisodeComment_youtubeVideoId_createdAt_idx`(`youtubeVideoId`, `createdAt`),
    INDEX `EpisodeComment_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `EpisodeComment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
