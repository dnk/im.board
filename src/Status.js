import React, { useEffect, useState } from 'react'

function fix_url(url) {
    url = url.replace("https://jenkins.com.int.zone", "https://dashboard.cloud-blue.online/jenkins");
    return url;
}

async function fetchSvgText(buildUrl, imageUrl, timestamp) {
    const ts = timestamp || Date.now();
    const url = fix_url(imageUrl || (buildUrl + `badge/icon?timestamp=${ts}&link=${buildUrl}/\${buildId}&build=last:\${params.BUILD_NAME=}`));
    const responseText = await fetch(url).then(response => response.text());

    return [url, responseText];
}

function Status({ board }) {

    const [imageUrl, setImageUrl] = useState(board.imageUrl);
    const [svgText, setSvgText] = useState(board.svgText || "");

    useEffect(() => {
        if (svgText !== "") {
            return;
        }

        fetchSvgText(board.buildUrl, board.imageUrl, board.timestamp).then(([imageUrl, svgText]) => {
            setImageUrl(imageUrl);
            setSvgText(svgText);
        });
    }, [board, svgText]);

    if (svgText === "") {
        return false;
    }

    const svgTextParts = svgText.split("&quot;", 3);
    const jobUrl = (svgTextParts.length > 2) ? svgTextParts[1] : board.buildUrl;

    const encodedData = encodeURIComponent(svgText);
    const svgData = `data:image/svg+xml,${encodedData}`;

    return <a href={jobUrl} target='_blank' rel='nofollow noopener noreferrer'>
        <img src={svgData} alt='' debugUrl={imageUrl} />
    </a>;
}

export default Status;
