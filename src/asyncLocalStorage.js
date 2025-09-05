async function setItemAsync(key, value) {
    await null;
    return localStorage.setItem(key, value);
};

async function getItemAsync(key) {
    await null;
    return localStorage.getItem(key);
};

async function removeItemAsync(key) {
    await null;
    return localStorage.removeItem(key);
};


export {
    getItemAsync,
    setItemAsync,
    removeItemAsync
}