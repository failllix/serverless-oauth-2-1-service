# Basic oAuth2 server based on Cloudflare workers and KV storage

After using various oAuth2 services, I was interested what it takes to implement one on my own.

> ⛔⛔⛔ **Important note:** This project is not intended to be used in a productive manner or to protect any kind of services nor personal data.

## Configuration

### Clients

Clients are stored in a seperate KV store, where the key is the corresponding `client_id`. I recommend using UUIDs as `client_ids` to avoid brute forcability of `client_ids`. The corresponding value must be in JSON format and requires the following fields:

| Fieldname     | Description                                               | Type          | Example                                                  |
| ------------- | --------------------------------------------------------- | ------------- | -------------------------------------------------------- |
| name          | Name of the client application                            | String        | "My fancy application"                                   |
| redirect_uris | Valid redirection URIs pointing to the client application | Array[String] | ["http://localhost:3000", "http://localhost:3000/admin"] |

```json
{
  "name": "My fancy application",
  "redirect_uris": ["http://localhost:3000", "http://localhost:3000/admin"]
}
```

### Users

Users are stored in a seperate KV store, where the key is the corresponding `username`. The corresponding value must be in JSON format and requires the following fields:

| Fieldname | Description                               | Type          | Example                                                                                                                            |
| --------- | ----------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| pwdToken  | Hashed password of the user using SHA512  | String        | "c5e882bb4479f705dc777785c9e752517688a0ef00fe9a3ac3475d631a66999507589fea66c788751c993e2b1e18c237722940cf8637e98b51827cc82f68f479" |
| salt      | Salt used during hashing of user password | String        | "3808fc54-fbe0-453f-a2b3-a2cdea0f8fe8"                                                                                             |
| scope     | Scopes the user is able to request        | Array[String] | ["API_TEST"]                                                                                                                       |

```json
{
  "pwdToken": "c5e882bb4479f705dc777785c9e752517688a0ef00fe9a3ac3475d631a66999507589fea66c788751c993e2b1e18c237722940cf8637e98b51827cc82f68f479",
  "salt": "3808fc54-fbe0-453f-a2b3-a2cdea0f8fe8",
  "scope": ["API_TEST"]
}
```

## Local development

### Installation

Make sure to install all dependencies by running:

```bash
npm ci
```

To sign and verify JWTs you will need a valid key pair. Use the following npm script to generate a key-pair in the expected configuration. Add the generated files to the `.dev.vars` file, that way they are used for local development.

```bash
npm run create:key-pair
```

The service requires values in the `CLIENTS` and `USERS` key-value stores to be functional.
To add your custom values, place files in the corresponding directories under `.wrangler/state/kv/<KV_NAME>`.

Adding a valid client is as simple as placing a file under `.wrangler/state/kv/CLIENTS/<YOUR_CLIENT_ID>`, where the filename resembles the client_id. For convenience you can use this npm script:

```bash
npm run create:local-client
```

To create a local user that you can use to obtain a token for local development purposes, place a file under `.wrangler/state/kv/USERS/<YOUR_USERNAME>`, where the filename resembles the username. For convenience you can use this npm script:

```bash
npm run create:local-user
```

### Deployment

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
```

### Testing

The app currently only features API tests.
To setup the local environment to execute the tests run:

```bash
npm run create:api-test-setup
```

To execute the tests run:

```bash
npm run test:api
```
