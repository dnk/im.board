import { makeBadge } from 'badge-maker';
import React, { useEffect, useState } from 'react'

function fix_url(url) {
    url = url.replace("https://jenkins.com.int.zone", "https://dashboard.cloud-blue.online/jenkins");
    return url;
}

const INACTIVE_COLOR = "inactive";

const defaultStatus = {
    color: INACTIVE_COLOR,
    message: "not run"
};

const statusMap = {
    "SUCCESS": {
        color: "brightgreen",
        message: "passing"
    },
    "UNSTABLE": {
        color: "yellow",
        message: "unstable"
    },
    "FAILURE": {
        color: "red",
        message: "failed"
    },
    "ABORTED": {
        color: INACTIVE_COLOR,
        message: "aborted"
    }
}

async function fetchSvgText(buildUrl, tag) {
    const json = fetchStatusData(buildUrl, tag)

    return buildSvgText(json);
}

function buildLabel(componentName, buildName) {
    return componentName && buildName ? `${componentName}-${buildName}` : `${buildName || 'stable'}`;
}

async function fetchStatusData(baseUrl, tag, preferStableBuild = false) {
    const url = fix_url(baseUrl + `/api/json?tag=${tag || "no-tag-" + Date.now()}&tree=builds[inProgress,result,url,actions[parameters[*]]]`);
    const json = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    }).then((response) => response.json());

    const builds = json["builds"] || [];

    let buildName = null;
    let componentName;
    let running;
    let result;

    for (const build of builds) {
        const actions = build["actions"] || [];
        const parameters = (actions.find((action) => action["_class"] === 'hudson.model.ParametersAction') || {})["parameters"];
        const params = {}
        for (const parameter of parameters) {
            params[parameter["name"]] = parameter["value"]
        }

        if (buildName === null || !preferStableBuild) {
            buildName = params['BUILD_NAME'];
            componentName = params['COMPONENT_NAME'];
            running = build.inProgress;
        }

        result = build.result;

        if (!!buildName && !!result) {
            break;
        }
    }

    const status = result || 'NOT_RUN';
    const stable = 'SUCCESS' === status;

    const data = {
        componentName: componentName,
        buildName: buildName,
        running: running,
        stable: stable,
        status: status
    }

    return data;
}

async function buildSvgText(data) {
    const realData = await data;

    const label = buildLabel(realData.componentName, realData.buildName);

    const status = statusMap[realData.status] || defaultStatus;

    const format = {
        label: label,
        message: status.message,
        color: status.color,
        style: 'flat',
        animationDuration: realData.running ? '2s' : ''
    }

    return makeBadge(format)
}

function Status({ board }) {
    const [svgText, setSvgText] = useState(board.svgText || "");

    useEffect(() => {
        if (svgText !== "") {
            return;
        }

        fetchSvgText(board.buildUrl, board.tag).then((svgText) => {
            setSvgText(svgText);
        });
    }, [board, svgText]);

    if (svgText === "") {
        return false;
    }

    const jobUrl = board.buildUrl;  //fixme link to job url

    const encodedData = encodeURIComponent(svgText);
    const svgData = `data:image/svg+xml,${encodedData}`;

    return <a href={jobUrl} target='_blank' rel='nofollow noopener noreferrer'>
        <img src={svgData} alt='' />
    </a>;
}

export {
    Status,
    fetchStatusData,
    buildSvgText
};
