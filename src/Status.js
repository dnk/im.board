import { makeBadge } from 'badge-maker';
import { useEffect, useState } from 'react'
import { xhr } from './request';
import { validateAndParse } from 'compare-versions/lib/esm/utils';
import { validate } from 'compare-versions';

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
    const shortComponentName = componentName ? componentName.split("-")[0] : componentName;
    return componentName && buildName ? `${shortComponentName}-${buildName}` : `${buildName || `${shortComponentName || ""}/stable`}`;
}

async function fetchAndEvaluate(url) {
    const json = await xhr(url);

    const builds = json["builds"] || [];

    return evaluateBuildData(builds);
}

async function _evaluateBuildName(url, componentName) {
    const json = await xhr(url + '/wfapi/describe');

    const stages = json["stages"] || [];

    const deployStage = stages.find((stage) => "deploy helm charts" === stage.name);

    if (!deployStage) {
        return null;
    }

    const deployStageStatus = deployStage["status"];

    if (deployStageStatus !== 'SUCCESS') {
        return null;
    }

    const deployStageHref = ((deployStage["_links"] || {})["self"] || {})["href"];

    if (!deployStageHref) {
        return null;
    }

    const deployStageUrl = new URL(deployStageHref, url);

    const deployStageJson = await xhr(deployStageUrl);

    const deployStages = deployStageJson["stageFlowNodes"] || [];

    const setupProductStage = deployStages
        .filter((stage) => (stage["parameterDescription"] || "").includes("setup-product.sh"))
        .find((state) => state["status"] === 'SUCCESS')

    if (!setupProductStage) {
        return null;
    }

    const setupProductStageLogHref = ((setupProductStage["_links"] || {})["log"] || {})["href"];

    if (!setupProductStageLogHref) {
        return null;
    }

    const setupProductStageLogUrl = new URL(setupProductStageLogHref, url);

    const setupProductStageLogJson = await xhr(setupProductStageLogUrl);

    const log = setupProductStageLogJson["text"];

    if (!log) {
        return null;
    }

    const matches = log.match(`.*span> ${componentName}.*/.*`);

    if (!matches) {
        return null;
    }

    const rows = [...matches];
    const row = rows[0].split(' ').filter((item) => item !== '')
    const repository = row[row.length - 2].split('/')[0];
    const version = row[row.length - 1].trim();

    return `${version}/${repository}`;
}

function getLastJobKey(url) {
    let position = url.lastIndexOf('/');
    if (position == url.length - 1) {
        position = url.lastIndexOf('/', position - 1);
    }
    return url.substring(0, position);
}

async function evaluateBuildName(url, componentName) {
    if (!url) {
        return null;
    }

    const lastJobKey = getLastJobKey(url);

    if (!!lastJobKey) {
        const lastJobUrl = localStorage.getItem(lastJobKey);

        if (lastJobUrl === url) {
            const storageValue = localStorage.getItem(lastJobUrl);
            if (!!storageValue) {
                return storageValue;
            }
        } else {
            localStorage.removeItem(lastJobUrl);
        }
    }

    const value = await _evaluateBuildName(url, componentName);
    localStorage.setItem(lastJobKey, url);
    localStorage.setItem(url, value);
    return value;
}

async function evaluateBuildData(builds) {

    const buildData = {
        componentName: null,
        buildName: null,
        running: null,
        jobUrl: null,
        result: null,
    }

    for (const build of builds) {
        const actions = build["actions"] || [];
        const parameters = (actions.find((action) => action["_class"] === 'hudson.model.ParametersAction') || {})["parameters"];
        const params = {}
        for (const parameter of parameters) {
            params[parameter["name"]] = parameter["value"]
        }

        const buildName = params['BUILD_NAME'] || '';

        if (!!buildName && !validate(buildName)) {
            // skip incorrect semversions
            continue;
        }

        if (!!buildName) {
            const version = validateAndParse(buildName).filter((part) => !!part);
            if (version.length > 3) {
                continue;
            }
        }

        const componentName = params['COMPONENT_NAME'];
        const running = build.inProgress;
        const jobUrl = build.url;
        const currentBuildResult = build.result;
        const previousBuildResult = (build.previousBuild || {}).result;

        buildData.componentName = componentName;
        buildData.buildName = buildName;
        buildData.running = running;
        buildData.jobUrl = jobUrl;
        buildData.result = currentBuildResult || previousBuildResult;

        break;
    }

    const status = buildData.result || 'NOT_RUN';
    const stable = 'SUCCESS' === status;


    const stableBuildName = (status !== 'NOT_RUN' && !buildData.buildName) ? await evaluateBuildName(buildData.jobUrl, buildData.componentName) : buildData.buildName;

    const data = {
        componentName: buildData.componentName,
        buildName: stableBuildName,
        running: buildData.running,
        stable: stable,
        status: status,
        jobUrl: buildData.jobUrl,
    }

    return data;
}

async function fetchStatusData(baseUrl, tag) {
    const url = baseUrl + `/api/json?tag=${tag || "no-tag-" + Date.now()}&tree=builds[inProgress,result,url,actions[parameters[*]],previousBuild[result]]`;

    const data = await fetchAndEvaluate(url);
    return data;
}

function buildSvgText(data) {
    const realData = data;

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
        <img src={svgData} alt='' style={{ height: '100%', alignContent: 'center', display: 'flex' }} />
    </a>;
}

export {
    Status,
    evaluateBuildData,
    buildSvgText
};
