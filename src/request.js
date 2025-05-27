function fix_url(url) {
    url = url.replace(
        "https://jenkins.com.int.zone",
        "https://dashboard.cloudblue.online/jenkins",
    );
    return url;
}

async function xhr(url) {
    url = fix_url(url);
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        return await response.json();
    } catch (error) {
        console.log(error);
        return {};
    }
}


export {
    xhr
}