create table "adminAuditLog" (
	"id" text not null primary key,
	"actorUserId" text not null,
	"targetUserId" text not null,
	"action" text not null,
	"reason" text,
	"status" text not null default 'pending',
	"createdAt" integer not null
);

create index "adminAuditLog_actorUserId_idx" on "adminAuditLog" ("actorUserId");
create index "adminAuditLog_targetUserId_idx" on "adminAuditLog" ("targetUserId");
create index "adminAuditLog_createdAt_idx" on "adminAuditLog" ("createdAt" desc);