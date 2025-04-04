INSERT INTO
    Clients (ClientId, Name, RedirectUri)
VALUES
    (
        'dc7623b082f575e5d54e28b18f5426f66dfc3d53d06c17c34785d0b833aefed1',
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
