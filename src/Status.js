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

async function fetchAndEvaluate(url, preferStableBuild) {
    const json = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    }).then((response) => response.json());

    const builds = json["builds"] || [];

    const stableBuildData = {
        componentName: null,
        buildName: null,
        running: null,
        jobUrl: null,
        result: null,
    }

    const versionBuildData = {
        componentName: null,
        buildName: null,
        running: null,
        jobUrl: null,
        result: null,
    }

    let result;

    let buildNameFound = false;

    for (const build of builds) {
        const actions = build["actions"] || [];
        const parameters = (actions.find((action) => action["_class"] === 'hudson.model.ParametersAction') || {})["parameters"];
        const params = {}
        for (const parameter of parameters) {
            params[parameter["name"]] = parameter["value"]
        }

        const buildName = params['BUILD_NAME'] || '';
        const componentName = params['COMPONENT_NAME'];
        const running = build.inProgress;
        const jobUrl = build.url;
        result = build.result;
        const previousBuildResult = (build.previousBuild || {}).result;

        if (buildName === '') {
            // stable build have no "BUILD_NAME" parameter
            if (stableBuildData.buildName === null) {
                // fill data for first stable build job
                stableBuildData.componentName = componentName;
                stableBuildData.buildName = buildName;
                stableBuildData.running = running;
                stableBuildData.jobUrl = jobUrl;
                stableBuildData.result = result || previousBuildResult;
                buildNameFound = preferStableBuild;
            }
        } else {
            if (versionBuildData.buildName === null) {
                versionBuildData.componentName = componentName;
                versionBuildData.buildName = buildName;
                versionBuildData.running = running;
                versionBuildData.jobUrl = jobUrl;
                versionBuildData.result = result || previousBuildResult;
                buildNameFound = !preferStableBuild;
            }
        }

        if (buildNameFound && !!result) {
            break;
        }
    }

    const chooseStableBuild = (preferStableBuild && !!stableBuildData.jobUrl) || !versionBuildData.buildName;
    const buildData = chooseStableBuild ? stableBuildData : versionBuildData;

    const status = buildData.result || result || 'NOT_RUN';
    const stable = 'SUCCESS' === status;

    const data = {
        componentName: buildData.componentName,
        buildName: buildData.buildName,
        running: buildData.running,
        stable: stable,
        status: status,
        jobUrl: buildData.jobUrl,
    }

    return data;
}

async function fetchStatusData(baseUrl, tag, preferStableBuild = false) {
    const url = fix_url(baseUrl + `/api/json?tag=${tag || "no-tag-" + Date.now()}&tree=builds[inProgress,result,url,actions[parameters[*]],previousBuild[result]]`);

    const key = localStorage.getItem(baseUrl);
    if (key === url) {
        const data = localStorage.getItem(url);
        return JSON.parse(data);
    }

    const data = await fetchAndEvaluate(url, preferStableBuild);
    localStorage.setItem(baseUrl, url);
    localStorage.setItem(url, JSON.stringify(data));

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

    const jobUrl = board.jobUrl || board.buildUrl;

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
