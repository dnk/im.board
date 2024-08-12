import React, { useEffect, useRef, useState } from 'react'

function fix_url(url) {
    url = url.replace("https://jenkins.com.int.zone", "https://dashboard.cloud-blue.online/jenkins");
    return url;
}


function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value; //assign the value of ref to the argument
    }, [value]); //this code will run when the value of 'value' changes
    return ref; //in the end, return the current ref value.
}

function getStatus(svgText) {
    const running = svgText.includes(">running</text>");
    const stable = svgText.includes('fill="#44cc11"/>');
    return {"running": running, "stable": stable};
}

function Status({ board, updateStatus }) {

    let jobUrl = board.buildUrl
    const [imageUrl, setImageUrl] = useState(
        fix_url(board.imageUrl ||
            (board.buildUrl + `badge/icon?link=${board.buildUrl}/\${buildId}&build=last:\${params.BUILD_NAME=}`)
        )
    );

    const prevImageUrl = usePrevious("");
    const [svgText, setSvgText] = useState("");
    const [wasUnresolvedParamsHandled, setWasUnresolvedParamsHandled] = useState(false);

    useEffect(() => {
        if (prevImageUrl.current !== imageUrl) {
            prevImageUrl.current = imageUrl;
            fetch(imageUrl).then((data) => data.text()).then((svgText) => {
                setSvgText(svgText);
            });
        }
    }, [imageUrl, prevImageUrl, svgText]);

    if (svgText.includes(">not run</text>")) {
        const hasUnresolvedParams = svgText.includes('>params.');
        const newImageUrl = hasUnresolvedParams && !wasUnresolvedParamsHandled
            ? fix_url(board.buildUrl) + `badge/icon?link=${board.buildUrl}&subject=\${params.COMPONENT_NAME}-\${params.BUILD_NAME}`
            : fix_url(board.buildUrl) + `badge/icon?link=${board.buildUrl}`;
        if (!wasUnresolvedParamsHandled) {
            setWasUnresolvedParamsHandled(true)
        }
        if (imageUrl !== newImageUrl) {
            setImageUrl(newImageUrl);
        }
    }

    const svgTextParts = svgText.split("&quot;", 3);
    if (svgTextParts.length > 2) {
        jobUrl = svgTextParts[1];
    }

    if (prevImageUrl.current !== imageUrl) {
        return false;
    }

    if (updateStatus) {
        updateStatus(getStatus(svgText));
    }

    const encodedData = encodeURIComponent(svgText);
    const svgData = `data:image/svg+xml,${encodedData}`;

    return <a href={jobUrl} target='_blank' rel='nofollow noopener noreferrer'>
        <img src={svgData} alt='' debugUrl={imageUrl} />
    </a>
}

export default Status;
