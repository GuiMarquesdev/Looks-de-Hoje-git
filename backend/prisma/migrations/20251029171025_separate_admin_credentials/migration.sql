/*
  Warnings:

  - The primary key for the `store_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `admin_password` on the `store_settings` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `store_settings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - Made the column `store_name` on table `store_settings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `store_settings` DROP PRIMARY KEY,
    DROP COLUMN `admin_password`,
    MODIFY `id` VARCHAR(50) NOT NULL DEFAULT 'admin_config',
    MODIFY `store_name` VARCHAR(255) NOT NULL,
    MODIFY `instagram_url` VARCHAR(255) NULL,
    MODIFY `whatsapp_url` VARCHAR(255) NULL,
    MODIFY `email` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `admin_credentials` (
    `id` VARCHAR(50) NOT NULL DEFAULT 'admin_credentials',
    `admin_password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
