CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consultationId` int NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinical_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consultationId` int NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`type` enum('evolution','prescription','exam_request','medical_certificate') NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text NOT NULL,
	`pdfStorageKey` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinical_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`status` enum('in_progress','completed','cancelled') NOT NULL DEFAULT 'in_progress',
	`chiefComplaint` text,
	`transcription` text,
	`audioProcessed` boolean NOT NULL DEFAULT false,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`consultationId` int,
	`fileName` varchar(256) NOT NULL,
	`fileType` varchar(64) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(1024) NOT NULL,
	`extractedContext` text,
	`analysisStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`fullName` varchar(256) NOT NULL,
	`dateOfBirth` varchar(16),
	`gender` enum('male','female','other'),
	`cpf` varchar(16),
	`phone` varchar(32),
	`email` varchar(320),
	`address` text,
	`bloodType` varchar(8),
	`allergies` text,
	`chronicConditions` text,
	`currentMedications` text,
	`familyHistory` text,
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soap_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consultationId` int NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`subjective` text,
	`objective` text,
	`assessment` text,
	`plan` text,
	`fullNote` text,
	`isEdited` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `soap_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `soap_notes_consultationId_unique` UNIQUE(`consultationId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `specialty` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `crm` varchar(32);