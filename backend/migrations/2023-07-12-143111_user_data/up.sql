-- This migration already ran on www.permaplant.net
-- So it cannot be edited, except of comments or formatting.
-- Please create a new migration instead.

CREATE TYPE salutation AS ENUM (
    'ms',
    'mrs',
    'mr',
    'mx'
);

CREATE TYPE experience AS ENUM (
    'beginner',
    'advanced',
    'expert'
);

CREATE TYPE membership AS ENUM (
    'supporting',
    'regular',
    'contributing'
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    salutation SALUTATION NOT NULL,
    title TEXT,
    country TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    organization TEXT,
    experience EXPERIENCE,
    membership MEMBERSHIP,
    member_years INTEGER ARRAY,
    member_since DATE,
    permacoins INTEGER ARRAY
);
