import sinon from "sinon";
import clientAuthenticator from "../../../src/authentication/client.js";

import { assert } from "chai";
import clientStorage from "../../../src/storage/client.js";

describe("User authentication", () => {
  describe("authenticateUser", () => {
    it("does not throw, if client was found and supplied redirect uri matches", async () => {
      const getClientStub = sinon.stub(clientStorage, "getClient");
      getClientStub.withArgs("someClient").resolves({
        redirectUri: "http://localhost/valid",
      });

      await clientAuthenticator.authenticateClient(
        "someClient",
        "http://localhost/valid"
      );
    });

    it("throw, if client was not found", async () => {
      const getClientStub = sinon.stub(clientStorage, "getClient");
      getClientStub.withArgs("dummyClient").resolves(null);

      try {
        await clientAuthenticator.authenticateClient(
          "dummyClient",
          "http://localhost/irrelevant"
        );
        return Promise.reject(
          "Test fails, because function under test never threw error"
        );
      } catch (error) {
        assert.equal(
          error.message,
          "Could not find client with id 'dummyClient'."
        );
      }
    });

    it("throw, if redirect uris do not match", async () => {
      const getClientStub = sinon.stub(clientStorage, "getClient");
      getClientStub.withArgs("dummyClient").resolves({
        redirectUri: "http://localhost/valid",
      });

      try {
        await clientAuthenticator.authenticateClient(
          "dummyClient",
          "http://localhost/invalid"
        );
        return Promise.reject(
          "Test fails, because function under test never threw error"
        );
      } catch (error) {
        assert.equal(
          error.message,
          "Redirect URI 'http://localhost/invalid' is not valid for client with id 'dummyClient'."
        );
      }
    });
  });
});
