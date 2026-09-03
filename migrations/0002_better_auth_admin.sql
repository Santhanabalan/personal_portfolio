alter table "user" add column "role" text default 'user';
alter table "user" add column "banned" integer default 0;
alter table "user" add column "banReason" text;
alter table "user" add column "banExpires" date;
alter table "session" add column "impersonatedBy" text;

update "user" set "role" = 'user' where "role" is null;
update "user" set "banned" = 0 where "banned" is null;