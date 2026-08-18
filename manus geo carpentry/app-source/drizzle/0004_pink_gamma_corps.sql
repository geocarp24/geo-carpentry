CREATE TABLE `facebook_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pageId` varchar(80) NOT NULL,
	`pageName` varchar(240) NOT NULL,
	`accessTokenEncrypted` text NOT NULL,
	`scopes` text,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facebook_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `facebook_connections_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `content_slots` MODIFY COLUMN `format` enum('Feed','Stories','Reel') NOT NULL;--> statement-breakpoint
ALTER TABLE `content_slots` MODIFY COLUMN `status` enum('Borrador','Aprobado','Listo para publicar','Publicado','Error') NOT NULL DEFAULT 'Borrador';--> statement-breakpoint
ALTER TABLE `content_slots` ADD `facebookPostId` varchar(100);--> statement-breakpoint
ALTER TABLE `content_slots` ADD `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `content_slots` ADD `publishError` text;--> statement-breakpoint
ALTER TABLE `facebook_connections` ADD CONSTRAINT `facebook_connections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;