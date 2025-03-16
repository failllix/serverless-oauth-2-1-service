async function getAllValuesForPrefix({ keyValueStorage, keyPrefix }) {
    const keys = [];

    let keyValueResponse;
    let cursor;
    do {
        keyValueResponse = await keyValueStorage.list({ prefix: keyPrefix, cursor });

        keys.push(...keyValueResponse.keys.map((key) => key.name));
        cursor = keyValueResponse.cursor;
    } while (!keyValueResponse.list_complete);

    const keyValueMap = {};
    for (const key of keys) {
        keyValueMap[key.split(`${keyPrefix}:`)[1]] = JSON.parse(await keyValueStorage.get(key));
    }
    return keyValueMap;
}

export default {
    getAllValuesForPrefix,
};
