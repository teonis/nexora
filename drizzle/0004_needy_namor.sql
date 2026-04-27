CREATE TABLE `patient_problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`status` enum('active','controlled','resolved','monitoring') NOT NULL DEFAULT 'active',
	`identifiedBySpecialty` varchar(128),
	`firstSeenConsultationId` int,
	`lastSeenConsultationId` int,
	`problemNumber` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patient_problems_id` PRIMARY KEY(`id`)
);
