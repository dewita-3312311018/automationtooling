ALTER TABLE `stocks` DROP FOREIGN KEY `stocks_location_id_locations_id_fk`;
--> statement-breakpoint
ALTER TABLE `requests` MODIFY COLUMN `stock_id` varchar(36);--> statement-breakpoint
ALTER TABLE `requests` ADD `requested_model_number` varchar(100);--> statement-breakpoint
ALTER TABLE `requests` ADD `requested_brand` varchar(100);--> statement-breakpoint
ALTER TABLE `requests` ADD `requested_description` text;--> statement-breakpoint
ALTER TABLE `stocks` DROP COLUMN `location_id`;