INSERT INTO
    Clients (ClientId, Name, RedirectUri)
VALUES
    (
        '664bddd3-efb2-4be2-842e-6b741c490b59',
        'Test',
        'http://localhost:8788/app'
    );

-- Password: "Test"
INSERT INTO
    Users (Username, Fullname, Salt, PasswordHash, Scope)
VALUES
    (
        'test',
        'Test User',
        'MjA4LDQwLDgsNDYsODcsNDEsMjAwLDM0LDYsMjE1LDE0LDEwOSw3LDI0LDE1NiwxNTc=',
        'NDYsMjQ1LDI0NCwzNSwzNiwyMjIsMTgwLDM2LDIzMSwxMDIsMTA5LDIzMCwxNzMsMjAsMjIyLDIzMCwxOCwzMiwxMDUsMTI3LDI1LDI1MywxMzgsNjksMTU3LDEwMCwxNSwyNSwyMzEsMTY1LDI0OCwxMTcsMjE1LDM0LDIzOSw2NCwxMjEsNzQsMjIxLDE4NCw3NiwxNDAsMTkzLDIwNCw3OSwyMiwxMjIsODAsODMsNDEsODcsMTg5LDk2LDE4NiwxMTEsMTUzLDE1NiwxODEsMTEsNiwxNzgsMTY5LDM4LDE1Ng==',
        'userInfo,access,foo'
    );

INSERT INTO
    Apis (Uri, Name)
VALUES
    ("http://localhost:8787/me", "User info"),
    (
        "http://localhost:8789/resources",
        "Dummy application"
    );

INSERT INTO
    ClientApiAccess (ClientId, Uri)
VALUES
    (
        '664bddd3-efb2-4be2-842e-6b741c490b59',
        'http://localhost:8787/me'
    ),
    (
        '664bddd3-efb2-4be2-842e-6b741c490b59',
        'http://localhost:8789/resources'
    )
