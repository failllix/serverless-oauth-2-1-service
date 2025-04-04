DROP TABLE IF EXISTS Codes;

DROP TABLE IF EXISTS Grants;

DROP TABLE IF EXISTS RefreshTokens;

DROP TABLE IF EXISTS Users;

DROP TABLE IF EXISTS Clients;

CREATE TABLE
    IF NOT EXISTS Clients (
        ClientId TEXT PRIMARY KEY,
        Name TEXT NOT NULL,
        RedirectUri TEXT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS Codes (
        AccessCode TEXT PRIMARY KEY,
        ClientId TEXT REFERENCES Clients (ClientId) ON DELETE CASCADE ON UPDATE CASCADE,
        Username TEXT REFERENCES Users (Username) ON DELETE CASCADE ON UPDATE CASCADE,
        GrantId TEXT REFERENCES Grants (GrantId) ON DELETE CASCADE ON UPDATE CASCADE,
        Scope TEXT NOT NULL,
        CodeChallengeMethod TEXT NOT NULL,
        CodeChallenge TEXT NOT NULL,
        ExpiresAt TIMESTAMP NOT NULL DEFAULT (datetime('now', '+00:00:30'))
    );

CREATE TABLE
    IF NOT EXISTS Grants (
        GrantId TEXT PRIMARY KEY,
        ClientId TEXT REFERENCES Clients (ClientId) ON DELETE CASCADE ON UPDATE CASCADE,
        Username TEXT REFERENCES Users (Username) ON DELETE CASCADE ON UPDATE CASCADE,
        Scope TEXT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS RefreshTokens (
        RefreshTokenId TEXT PRIMARY KEY,
        ClientId TEXT REFERENCES Clients (ClientId) ON DELETE CASCADE ON UPDATE CASCADE,
        GrantId TEXT REFERENCES Grants (GrantId) ON DELETE CASCADE ON UPDATE CASCADE,
        Username TEXT REFERENCES Users (Username) ON DELETE CASCADE ON UPDATE CASCADE,
        Scope TEXT NOT NULL,
        Active INTEGER DEFAULT 1
    );

CREATE TABLE
    IF NOT EXISTS Users (
        Username TEXT PRIMARY KEY,
        Fullname TEXT NOT NULL,
        Salt TEXT NOT NULL,
        PasswordHash TEXT NOT NULL,
        Scope TEXT NOT NULL
    );
