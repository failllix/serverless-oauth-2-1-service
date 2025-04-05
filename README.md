# Serverless OAuth 2.1 Service

> ⛔⛔⛔ **Important note:** This project is not intended to be used in a productive manner.
> It was built for educational purposes and likely contains critical security oversights.
> It is not meant to protect any kind of service nor data.

After using various OAuth 2 services, I was interested what it takes to implement one on my own.
I took the [OAuth 2.1 RFC](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-12) as guidance while implementing this authorization server.

Additional information about the established OAuth 2.0 concepts can be found on oauth.net's [OAuth 2.0 overview page](https://oauth.net/2/).
A summary about the key differences of OAuth 2.1 are summarized in oauth.net's [OAuth 2.1 article](https://oauth.net/2.1/).

## Configuration

To use the oAuth server the following entities must be configured

1. [Clients](#clients)
1. [Users](#users)
1. APIs (tbd.)

[!TIP]

> Helper scripts exists to have a guided setup of entities where one must only enter corresponding values.

### Clients

Local clients can be generated using `npm run create:local-client`.

| Fieldname   | Description                                              | Type   | Example                                |
| ----------- | -------------------------------------------------------- | ------ | -------------------------------------- |
| Name        | Name of the client application                           | String | "My fancy application"                 |
| RedirectUri | Valid redirection URI pointing to the client application | String | "http://localhost:3000/app"            |
| ClientId    | Identifier of the client                                 | String | '664bddd3-efb2-4be2-842e-6b741c490b59' |

### Users

Local clients can be generated using `npm run create:local-user`.

| Fieldname    | Description                                                                                         | Type   | Example                                      |
| ------------ | --------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------- |
| Username     | Loginname                                                                                           | String | "test"                                       |
| Fullname     | Fullname of the user. Contained in access token and can e.g. be displayed in a frontend application | String | "Test User"                                  |
| PasswordHash | Hashed password of the user using SHA512                                                            | String | "NDYsMjQ1LDI0NCwzNSwzNiwyMjIsMTgwLDM2LDI..." |
| Salt         | Salt used during hashing of user password                                                           | String | "MjA4LDQwLDgsNDYsODc..."                     |
| Scope        | Scopes the user is able to request (comma-separated)                                                | String | "user_info,API_TEST,access"                  |

## Local development

### Installation

1. Make sure to install all dependencies:
   ```bash
   npm ci
   ```
1. Apply the database schema:
   ```bash
   npm run db:reset-schema
   ```
1. Apply the local default values (e.g. expected by the dummy application):
   ```bash
   npm run db:apply-local-values
   ```
1. Start development servers (in individual Terminal sessions):
   1. Start the local server:
      ```bash
      npm run start:server:local
      ```
   1. Start the local application + login page:
      ```bash
      npm run start:login:local
      ```

Additional clients and users can be created using the corresponding convenience scripts:

- `npm run create:local-client`
- `npm run create:local-user`

### Testing

Unit tests can be executed using:

```bash
npm run test:unit
```

Coverage can be checked using:

```bash
npm run test:unit:coverage
```

<!-- ## Deployment

To prepare deployment, copy the `wrangler.template.toml` file and rename it to `wrangler.toml`. Fill in the `id` properties concerning the key-value namespaces. To generate a new KV namespace, you can use:

```bash
wrangler kv:namespace create <NAMESPACE>
```

Proceed by generating a valid key-pair using:

```bash
npm run create:key-pair
```

After obtaining the private and public key, make sure to include the public key in your `wrangler.toml` file under `[env.production.vars]`.

You are now ready to deploy the service using:

```bash
npm run publish
```

To add the private (signing) key as a secret to your service run:

```
wrangler secret:bulk ./.temp/privateKey.json
``` -->
