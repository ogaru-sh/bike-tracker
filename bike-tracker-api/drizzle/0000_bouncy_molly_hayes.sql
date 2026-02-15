CREATE TABLE `route_points` (
	`id` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`altitude` real,
	`speed` real,
	`heading` real,
	`accuracy` real,
	`recorded_at` text NOT NULL,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`started_at` text NOT NULL,
	`ended_at` text,
	`distance_m` real DEFAULT 0,
	`duration_s` integer DEFAULT 0,
	`avg_speed_kmh` real DEFAULT 0,
	`max_speed_kmh` real DEFAULT 0,
	`status` text DEFAULT 'recording' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`apple_id` text,
	`password_hash` text,
	`name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_apple_id_unique` ON `users` (`apple_id`);