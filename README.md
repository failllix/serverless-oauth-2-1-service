# Serverless OAuth 2.1 Service

> ⛔ **Important note:** This project is _**not**_ intended to be used in production.
> It was built for educational purposes and likely contains critical security oversights.
> It is _**not**_ meant to protect any kind of service nor data.

After using various OAuth 2 services, I was interested what it takes to implement one on my own.
I took the [OAuth 2.1 RFC](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-12) as guidance while implementing this authorization server.

Additional information about the established OAuth 2.0 concepts can be found on oauth.net's [OAuth 2.0 overview page](https://oauth.net/2/).
A summary about the key differences of OAuth 2.1 are summarized in oauth.net's [OAuth 2.1 article](https://oauth.net/2.1/).

## Configuration

To use the oAuth server the following entities must be configured

1. [APIs](#apis)
1. [Users](#users)
1. [Clients](#clients)

> [!TIP]
> Helper scripts exists to have a guided setup of entities where one must only enter corresponding values.
> The order in which entities are created matters, because clients, for example, can only reference existing APIs (audiences).

### APIs

Local clients can be generated using `npm run create:local-client`.

| Fieldname | Description                   | Type   | Example                           |
| --------- | ----------------------------- | ------ | --------------------------------- |
| Name      | Name of the API               | String | "Some resource"                   |
| Uri       | Valid URI pointing to the API | String | "http://localhost:3000/resources" |

### Users

Local clients can be generated using `npm run create:local-user`.

| Fieldname    | Description                                                                                         | Type   | Example                                      |
| ------------ | --------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------- |
| Username     | Loginname                                                                                           | String | "test"                                       |
| Fullname     | Fullname of the user. Contained in access token and can e.g. be displayed in a frontend application | String | "Test User"                                  |
| PasswordHash | Hashed password of the user using SHA512                                                            | String | "NDYsMjQ1LDI0NCwzNSwzNiwyMjIsMTgwLDM2LDI..." |
| Salt         | Salt used during hashing of user password                                                           | String | "MjA4LDQwLDgsNDYsODc..."                     |
| Scope        | Scopes the user is able to request (comma-separated)                                                | String | "user_info,API_TEST,access"                  |

> [!NOTE]
> When creating user entities the `userInfo` scope is added automatically to ensure all users are allowed to use the authorizations server user info endpoint.
> Whether a client is entitled to request tokens for the user info endpoint remains under the control of whoever sets up the client (i.e. whether the user info API audience is added to the client).

### Clients

Local clients can be generated using `npm run create:local-client`.

| Fieldname   | Description                                              | Type   | Example                                |
| ----------- | -------------------------------------------------------- | ------ | -------------------------------------- |
| Name        | Name of the client application                           | String | "My fancy application"                 |
| RedirectUri | Valid redirection URI pointing to the client application | String | "http://localhost:3000/app"            |
| ClientId    | Identifier of the client                                 | String | '664bddd3-efb2-4be2-842e-6b741c490b59' |

## Local development

### Setup

1. Make sure to install all dependencies:
   ```bash
   npm ci
   ```
1. Create `wrangler.toml` configuration file:
   1. Copy the `wrangler.template.toml` file and rename it to `wrangler.toml`
   1. Run `npm run create:key-pair` to get a new key pair for your local setup
   1. Paste the corresponding environment variables into your `wrangler.toml` file
1. Apply the database schema:
   ```bash
   npm run db:reset-schema
   ```
1. Apply the local default values (e.g. expected by the dummy application):
   ```bash
   npm run db:apply-local-values
   ```
1. Start development servers (in individual terminal sessions):
   1. Start the local server:
      ```bash
      npm run start:server:local
      ```
   1. Start the local dummy application:
      ```bash
      npm run start:app:local
      ```
   1. Start the local login page:
      ```bash
      npm run start:login:local
      ```
1. Access the local app at [http://localhost:8788/app](http://localhost:8788/app) and login using the user `test` with password `Test`.

Additional clients, users and APIs can be created using the corresponding convenience scripts:

- `npm run create:local-client`
- `npm run create:local-user`
- `npm run create:local-api`

### Testing

Unit tests can be executed using:

```bash
npm run test:unit
```

Unit test coverage can be checked using:

```bash
npm run test:unit:coverage
```
