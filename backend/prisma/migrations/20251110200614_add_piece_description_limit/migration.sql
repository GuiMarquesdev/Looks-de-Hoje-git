-- AlterTable
ALTER TABLE `admin_credentials` MODIFY `id` VARCHAR(50) NOT NULL DEFAULT 'admin_credentials';

-- AlterTable
ALTER TABLE `pieces` MODIFY `description` VARCHAR(350) NULL;
