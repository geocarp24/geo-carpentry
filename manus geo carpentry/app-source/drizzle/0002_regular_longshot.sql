CREATE TABLE `media_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(180) NOT NULL,
	`requestedFiles` int NOT NULL DEFAULT 0,
	`uploadedFiles` int NOT NULL DEFAULT 0,
	`duplicateFiles` int NOT NULL DEFAULT 0,
	`failedFiles` int NOT NULL DEFAULT 0,
	`skippedFiles` int NOT NULL DEFAULT 0,
	`totalBytes` bigint NOT NULL DEFAULT 0,
	`status` enum('En progreso','Completada','Con incidencias') NOT NULL DEFAULT 'En progreso',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `media_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `importId` int;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `classificationSource` enum('initial','ai','manual');--> statement-breakpoint
ALTER TABLE `media_imports` ADD CONSTRAINT `media_imports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_importId_media_imports_id_fk` FOREIGN KEY (`importId`) REFERENCES `media_imports`(`id`) ON DELETE no action ON UPDATE no action;