/*
  Warnings:

  - You are about to alter the column `type` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `profileImage` VARCHAR(191) NULL,
    MODIFY `provider` VARCHAR(191) NULL DEFAULT 'local',
    MODIFY `type` ENUM('USER', 'ADMIN') NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `Room` (
    `roomId` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `creatorId` INTEGER NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `nowHeadcount` INTEGER NOT NULL,
    `maxHeadcount` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `roomThumnail` VARCHAR(191) NOT NULL,
    `category` ENUM('STUDY', 'HOBBY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`roomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `History` (
    `historyId` INTEGER NOT NULL,
    `UserId` INTEGER NOT NULL,
    `RoomId` INTEGER NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `checkOut` DATETIME(3) NOT NULL,
    `totalHours` INTEGER NULL,
    `historyType` ENUM('STUDY', 'HOBBY') NOT NULL,

    PRIMARY KEY (`historyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `reportId` INTEGER NOT NULL,
    `reporterId` INTEGER NOT NULL,
    `offenderId` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `reportImage` VARCHAR(191) NOT NULL,
    `reportType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`reportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDetail` (
    `UserDeailId` INTEGER NOT NULL,
    `UserId` INTEGER NOT NULL,
    `studyGoalTime` INTEGER NOT NULL,
    `hobbyGoalTime` INTEGER NOT NULL,
    `mainCategory` ENUM('STUDY', 'HOBBY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserDetail_UserId_key`(`UserId`),
    PRIMARY KEY (`UserDeailId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoom` (
    `UserId` INTEGER NOT NULL,
    `RoomId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`UserId`, `RoomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follow` (
    `followId` INTEGER NOT NULL AUTO_INCREMENT,
    `followerId` INTEGER NOT NULL,
    `followingId` INTEGER NOT NULL,

    PRIMARY KEY (`followId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `History` ADD CONSTRAINT `History_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDetail` ADD CONSTRAINT `UserDetail_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoom` ADD CONSTRAINT `UserRoom_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoom` ADD CONSTRAINT `UserRoom_RoomId_fkey` FOREIGN KEY (`RoomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
