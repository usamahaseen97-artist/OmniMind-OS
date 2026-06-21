-- OAuth + refresh tokens + nullable password for GitHub users
alter table users alter column password_hash drop not null;
alter table users add column if not exists display_name varchar(200);
alter table users add column if not exists avatar_url varchar(2048);

create table if not exists oauth_accounts (
  id varchar(36) primary key,
  user_id varchar(36) not null references users(id) on delete cascade,
  provider varchar(50) not null,
  provider_user_id varchar(255) not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  created_at timestamptz default now()
);

create unique index if not exists idx_oauth_provider_user
  on oauth_accounts(provider, provider_user_id);

create table if not exists refresh_tokens (
  id varchar(36) primary key,
  user_id varchar(36) not null references users(id) on delete cascade,
  token_hash varchar(128) unique not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_refresh_tokens_user on refresh_tokens(user_id);
