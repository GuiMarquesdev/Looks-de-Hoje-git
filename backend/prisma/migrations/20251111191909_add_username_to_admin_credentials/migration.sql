/*
  Warnings:

  - A unique constraint covering the columns `[sername]` on the table `admin_credentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sername` to the `admin_credentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin_credentials` ADD COLUMN `sername` VARCHAR(100) NOT NULL,
    MODIFY `id` VARCHAR(50) NOT NULL DEFAULT 'admin_credentials';

-- CreateIndex
CREATE UNIQUE INDEX `admin_credentials_sername_key` ON `admin_credentials`(`sername`);
