create table if not exists users (
  id varchar(36) primary key,
  email varchar(320) unique not null,
  password_hash varchar(255) not null,
  created_at timestamptz default now()
);

create table if not exists projects (
  id varchar(36) primary key,
  user_id varchar(36) not null references users(id) on delete cascade,
  name varchar(200) not null,
  description text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists project_files (
  id varchar(36) primary key,
  project_id varchar(36) not null references projects(id) on delete cascade,
  path varchar(1024) not null,
  content text default '',
  language varchar(50) default 'plaintext',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_project_files_project_path on project_files(project_id, path);

create table if not exists chat_messages (
  id varchar(36) primary key,
  project_id varchar(36) not null references projects(id) on delete cascade,
  role varchar(20) not null,
  content text not null,
  provider varchar(50) default 'none',
  created_at timestamptz default now()
);
