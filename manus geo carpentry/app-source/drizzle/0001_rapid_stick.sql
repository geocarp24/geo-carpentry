CREATE TABLE `cleanup_candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assetId` int NOT NULL,
	`reason` varchar(240) NOT NULL,
	`status` enum('Propuesto','Aprobado','Descartado') NOT NULL DEFAULT 'Propuesto',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `cleanup_candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `construction_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`location` varchar(220),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `construction_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assetId` int NOT NULL,
	`scheduledDate` varchar(16) NOT NULL,
	`format` enum('Feed','Stories') NOT NULL,
	`captionNote` text,
	`status` enum('Borrador','Aprobado') NOT NULL DEFAULT 'Borrador',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalFilename` varchar(500) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`mediaType` enum('image','video') NOT NULL,
	`sizeBytes` int NOT NULL,
	`checksumSha256` varchar(64) NOT NULL,
	`storageKey` text NOT NULL,
	`storageUrl` text NOT NULL,
	`backupVerified` boolean NOT NULL DEFAULT false,
	`category` enum('Trabajos de Geo Carpentry','Personal','Capturas de pantalla','Videos','Pendiente de revisar') NOT NULL DEFAULT 'Pendiente de revisar',
	`classificationConfidence` int,
	`classificationNote` text,
	`blurScore` int,
	`duplicateOfId` int,
	`projectId` int,
	`stage` enum('Antes','Durante','Después'),
	`reviewStatus` enum('Pendiente','Aprobado','Excluir') NOT NULL DEFAULT 'Pendiente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assetId` int NOT NULL,
	`preset` enum('Feed','Stories') NOT NULL,
	`width` int NOT NULL,
	`height` int NOT NULL,
	`storageKey` text NOT NULL,
	`storageUrl` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `cleanup_candidates` ADD CONSTRAINT `cleanup_candidates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cleanup_candidates` ADD CONSTRAINT `cleanup_candidates_assetId_media_assets_id_fk` FOREIGN KEY (`assetId`) REFERENCES `media_assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `construction_projects` ADD CONSTRAINT `construction_projects_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_slots` ADD CONSTRAINT `content_slots_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_slots` ADD CONSTRAINT `content_slots_assetId_media_assets_id_fk` FOREIGN KEY (`assetId`) REFERENCES `media_assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_exports` ADD CONSTRAINT `media_exports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_exports` ADD CONSTRAINT `media_exports_assetId_media_assets_id_fk` FOREIGN KEY (`assetId`) REFERENCES `media_assets`(`id`) ON DELETE no action ON UPDATE no action;