import { compareVersions } from "compare-versions";
import { xhr } from "./request";

const AMOUNT_OF_DYNAMIC_RELEASES = 2;
const DYNAMIC_COMPONENTS = {
  IDP: ['https://jenkins.com.int.zone/job/idp-backend'],
  UAM: ['https://jenkins.com.int.zone/job/uam'],
  GDPR: ['https://jenkins.com.int.zone/job/gdpr-backend'],
  INHOUSE: ['https://jenkins.com.int.zone/job/inhouse-products']
};

const LATEST_RELEASE_NAME = 'master';
const UNSTABLE_RELEASE_NAME = 'unstable';
const UNSTABLE_JOB_NAMES = [LATEST_RELEASE_NAME, UNSTABLE_RELEASE_NAME];

function getReleaseName(componentName) {
  switch (componentName) {
    case 'OSS': case 'BSS': case 'Branding UI': case 'E2E': {
      return UNSTABLE_RELEASE_NAME;
    }

    default: {
      return LATEST_RELEASE_NAME;
    }
  }
}

async function fetchJobs(name, baseUrl) {
  const url = `${baseUrl}/api/json?tree=jobs[name,jobs[name,url,lastBuild[timestamp,inProgress,result],builds[inProgress,result,url,actions[parameters[*]],previousBuild[result]]]]`;

  return xhr(url).then((response) => {
    const jobs = (response["jobs"] || [])
      .filter((job) => {
        const isFolder = job["_class"] === 'com.cloudbees.hudson.plugins.folder.Folder';
        const isVersion = job.name.includes(".");
        const isUnableOrMaster = UNSTABLE_JOB_NAMES.includes(job.name);
        return isFolder && (isVersion || isUnableOrMaster)
      })
      .sort((a, b) => a.name.localeCompare(b.name)) // sort by name to enusre that "master" job comes before "unstable" job
      .reduce((acc, job) => {
        if (UNSTABLE_JOB_NAMES.includes(job.name)) {
          UNSTABLE_JOB_NAMES.forEach(value => {
            delete acc[value];
          });
          acc[job.name] = job;
        } else {
          acc[`1.0.0-${job.name}`] = job;
        }

        return acc;
      }, {});

    const release = {};
    release[name] = jobs;
    return release;
  });
}

//todo: optimize duplicate calls (releases and tests)
async function fetchComponentValidateAndPromodeJobs(components) {

  const promises = Object.entries(components).map(async ([name, baseUrls]) => {
    const promises = baseUrls.map((baseUrl) => {
      return fetchJobs(name, baseUrl);
    });

    return Promise.all(promises).then((values) => {
      return values.reduce((acc, value) => [...acc, ...Object.entries(value)], [])
        .reduce((acc, [key, value]) => {
          if (acc.hasOwnProperty(key)) {
            Object.assign(acc[key], value);
          } else {
            acc[key] = { ...value }
          }

          return acc;
        },
          {});
    })
  });

  const values = await Promise.all(promises);

  const x = values.reduce((acc, value) => {
    return { ...acc, ...value };
  }, {});

  const releases = Object.entries(x)
    .map(async ([name, component]) => {
      const latestReleaseName = getReleaseName(name);
      const latestVersionJob = component[latestReleaseName];
      delete component[LATEST_RELEASE_NAME];
      delete component[UNSTABLE_RELEASE_NAME];
      const jobs = Object.keys(component).sort(compareVersions).reverse().slice(0, AMOUNT_OF_DYNAMIC_RELEASES).map((key) => component[key]);

      const values = [latestVersionJob, ...jobs]
        .filter((job) => !!job && !!job.jobs)
        .map(async (job) => {
          const validateAndPromoteJob = (job.jobs || []).find((job) => job.name === 'validate-and-promote') || {};

          return validateAndPromoteJob;
        });

      const data = {};
      data[name] = await Promise.all(values);
      return data;
    })
    .reduce(async (acc, value) => {
      const revoledValues = await value;
      const resolvedAcc = await acc;
      return { ...resolvedAcc, ...revoledValues };
    }, {});

  return releases;
}

export {
  fetchComponentValidateAndPromodeJobs,
  getReleaseName,
  LATEST_RELEASE_NAME,
  UNSTABLE_RELEASE_NAME,
  AMOUNT_OF_DYNAMIC_RELEASES,
  DYNAMIC_COMPONENTS
}