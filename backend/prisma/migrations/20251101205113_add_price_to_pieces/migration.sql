/*
  Warnings:

  - Added the required column `price` to the `pieces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin_credentials` MODIFY `id` VARCHAR(50) NOT NULL DEFAULT 'admin_credentials';

-- AlterTable
ALTER TABLE `hero_settings` ADD COLUMN `background_image_url` VARCHAR(255) NULL,
    ADD COLUMN `cta_link` VARCHAR(255) NULL,
    ADD COLUMN `cta_text` VARCHAR(100) NULL,
    ADD COLUMN `interval_ms` INTEGER NOT NULL DEFAULT 5000,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `subtitle` VARCHAR(255) NULL,
    ADD COLUMN `title` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `pieces` ADD COLUMN `price` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `store_settings` ALTER COLUMN `id` DROP DEFAULT;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
