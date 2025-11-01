-- AlterTable
ALTER TABLE `admin_credentials` MODIFY `id` VARCHAR(50) NOT NULL DEFAULT 'admin_credentials';

-- AlterTable
ALTER TABLE `store_settings` MODIFY `id` VARCHAR(50) NOT NULL DEFAULT 'admin_config';
