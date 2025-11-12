/*
  Warnings:

  - You are about to drop the column `sername` on the `admin_credentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `admin_credentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `admin_credentials` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `admin_credentials_sername_key` ON `admin_credentials`;

-- AlterTable
ALTER TABLE `admin_credentials` DROP COLUMN `sername`,
    ADD COLUMN `username` VARCHAR(100) NOT NULL,
    MODIFY `id` VARCHAR(50) NOT NULL DEFAULT 'admin_credentials';

-- CreateIndex
CREATE UNIQUE INDEX `admin_credentials_username_key` ON `admin_credentials`(`username`);
