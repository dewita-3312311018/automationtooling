CREATE TABLE `stock_locations` (
	`id` varchar(36) NOT NULL,
	`stock_id` varchar(36) NOT NULL,
	`location_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `stock_locations` ADD CONSTRAINT `stock_locations_stock_id_stocks_id_fk` FOREIGN KEY (`stock_id`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_locations` ADD CONSTRAINT `stock_locations_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE cascade ON UPDATE no action;