function fix_url(url) {
    const fixedUrl = url.replace(
        "https://jenkins.com.int.zone",
        "https://dashboard.aks.int.zone/jenkins",
    );
    return fixedUrl;
}

async function xhr(url) {
    const fixedUrl = fix_url(url.toString());
    try {
        const response = await fetch(fixedUrl, {
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
