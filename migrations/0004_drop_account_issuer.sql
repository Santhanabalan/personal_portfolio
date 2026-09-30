-- Better Auth 1.7.3+ no longer writes account.issuer; the NOT NULL column rejects every account insert.
drop index if exists "account_issuer_accountId_uidx";
alter table "account" drop column "issuer";
