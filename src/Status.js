import { makeBadge } from 'badge-maker';
import { useEffect, useState } from 'react'
import { xhr } from './request';
import { validateAndParse } from 'compare-versions/lib/esm/utils';
import { validate } from 'compare-versions';
import { getItemAsync, removeItemAsync, setItemAsync } from './asyncLocalStorage';

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

async function _evaluateVersions(url, componentName) {
    const json = await xhr(url + '/wfapi/describe');

    const inProgress = json['status'] === 'IN_PROGRESS';

    const stages = json["stages"] || [];

    const stageHrefs = stages
        .filter((stage) => ['deploy helm charts', 'upgrade stack'].includes(stage.name))
        .filter((stage) => 'SUCCESS' === stage["status"])
        .map((stage) => ((stage["_links"] || {})["self"] || {})["href"]);

    if (!stageHrefs) {
        return null;
    }


    const productFlowNodesPromises = stageHrefs
        .map(async (stageHref) => {
            const stageUrl = new URL(stageHref, url);
            const stageJson = await xhr(stageUrl);

            const stageFlowNodes = stageJson["stageFlowNodes"] || [];

            const productFlowNodes = stageFlowNodes
                .filter((stage) => {
                    const parameterDescription = (stage["parameterDescription"] || "");
                    return parameterDescription.includes("setup-product.sh") && parameterDescription.includes('--namespace');
                })
                .filter((state) => state["status"] === 'SUCCESS')

            if (!productFlowNodes) {
                return null;
            }

            return productFlowNodes;
        });

    const productFlowNodes = await Promise.all(productFlowNodesPromises);

    const versionPromises = productFlowNodes
        .filter((productFlowNode) => !!productFlowNode && productFlowNode.length !== 0)
        .map((productFlowNode) => productFlowNode[0])
        .map((productFlowNode) => {
            console.log(productFlowNode);
            const href = ((productFlowNode["_links"] || {})["log"] || {})["href"];
            return href;
        })
        .map(async (productFlowNodeLogHref) => {
            const setupProductStageLogUrl = new URL(productFlowNodeLogHref, url);

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
            //const repository = row[row.length - 2].split('/')[0];
            const version = row[row.length - 1].trim();
            return `${version}`;
        });

    const versions = (await Promise.all(versionPromises)).filter((value) => !!value);

    return {
        versions: versions,
        inProgress: inProgress,
    };
}

function getLastJobKey(url) {
    let position = url.lastIndexOf('/');
    if (position === url.length - 1) {
        position = url.lastIndexOf('/', position - 1);
    }
    return url.substring(0, position);
}

async function evaluateBuildName(url, componentName, isUpgrade = false) {
    if (!url) {
        return null;
    }

    const lastJobKey = getLastJobKey(url);

    if (!!lastJobKey) {
        const lastJobUrl = await getItemAsync(lastJobKey);

        if (lastJobUrl === url) {
            const storageValue = await getItemAsync(lastJobUrl);
            if (!!storageValue) {
                return storageValue;
            }
        } else {
            removeItemAsync(lastJobUrl);
        }
    }

    const versionsData = await _evaluateVersions(url, componentName);
    const versions = versionsData.versions;
    const inProgress = versionsData.inProgress;

    const putToCache = (!isUpgrade && versions.length > 0) || (isUpgrade && versions.length > 1) || !inProgress;

    const value = versions.join(' -> ');

    if (putToCache) {
        setItemAsync(lastJobKey, url);
        setItemAsync(url, value);
    } else {
        console.log(`not cached result for ${url}: ${value}`);
    }
    return value;
}

async function evaluateBuildData(builds) {

    const buildData = {
        componentName: null,
        buildName: null,
        running: null,
        jobUrl: null,
        result: null,
        isUpgrade: null,
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
        buildData.isUpgrade = params.hasOwnProperty("UPGRADE_COMPONENTS");

        break;
    }

    const status = buildData.result || 'NOT_RUN';
    const stable = ['SUCCESS', 'NOT_RUN'].includes(status);


    const stableBuildName = (status !== 'NOT_RUN' && !buildData.buildName) ? await evaluateBuildName(buildData.jobUrl, buildData.componentName, buildData.isUpgrade) : buildData.buildName;

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
