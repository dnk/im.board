import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { buildSvgText, evaluateBuildData, Status } from "./Status";
import { TableBody } from "@mui/material";
import { useEffect, useState } from "react";

import { compareVersions } from 'compare-versions';
import { xhr } from "./request";

const AMOUNT_OF_DYNAMIC_RELEASES = 2;
const DYNAMIC_RELEASES = {
  OSS: ['https://jenkins.com.int.zone/job/oss', 'https://jenkins.com.int.zone/job/oss/job/release'],
  BSS: ['https://jenkins.com.int.zone/job/bss', 'https://jenkins.com.int.zone/job/bss/job/release'],
  "Branding UI": ['https://jenkins.com.int.zone/job/branding-ui-cluster', 'https://jenkins.com.int.zone/job/branding-ui-cluster/job/release'],
  IDP: ['https://jenkins.com.int.zone/job/idp-backend'],
  UAM: ['https://jenkins.com.int.zone/job/uam'],
  GDPR: ['https://jenkins.com.int.zone/job/gdpr-backend'],
  INHOUSE: ['https://jenkins.com.int.zone/job/inhouse-products'],
  E2E: ['https://jenkins.com.int.zone/job/e2e-tests-v2', 'https://jenkins.com.int.zone/job/e2e-tests-v2/job/release']
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

async function fetchDynamicReleases(setter) {

  const promises = Object.entries(DYNAMIC_RELEASES).map(async ([name, baseUrls]) => {
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

  Promise.all(promises).then((values) => {
    const components = values.reduce((acc, value) => {
      return { ...acc, ...value };
    }, {})

    const releases = Object.entries(components)
      .map(([name, component]) => {
        const latestReleaseName = getReleaseName(name);
        const latestVersionJob = component[latestReleaseName];
        delete component[LATEST_RELEASE_NAME];
        delete component[UNSTABLE_RELEASE_NAME];
        const jobs = Object.keys(component).sort(compareVersions).reverse().slice(0, AMOUNT_OF_DYNAMIC_RELEASES).map((key) => component[key]);
        const data = {}
        data[name] = [latestVersionJob, ...jobs].filter((job) => !!job && !!job.jobs).map((job) => {
          const validateAndPromoteJob = (job.jobs || []).find((job) => job.name === 'validate-and-promote') || {};

          const builds = validateAndPromoteJob["builds"] || [];
          const data = evaluateBuildData(builds, false);
          const svgText = buildSvgText(data)
          return {
            buildUrl: validateAndPromoteJob.url,
            svgText: svgText
          };
        });
        return data;
      })
      .reduce((acc, value) => {
        return { ...acc, ...value };
      }, {});
    setter(releases)
  });
}

function Releases() {

  const [dynamicReleases, setDynamicReleases] = useState({});

  useEffect(() => {
    if (Object.keys(dynamicReleases).length === 0) {
      fetchDynamicReleases(setDynamicReleases);
    }
  }, [dynamicReleases]);


  console.log(dynamicReleases);

  return (
    <TableContainer component={Paper} key="releases-table-container">
      <Table
        sx={{
          [`& .${tableCellClasses.root}`]: {
            border: "none",
          },
        }}
        size="small"
        key="releases-table"
      >
        <TableBody key="releases-body">
          {Object.entries({ ...dynamicReleases }).map(([name, components]) => {
            return (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                {(Array.isArray(components) ? components : [components]).map(
                  (component, index) => {

                    const buildStatus = {
                      buildUrl: component.buildUrl,
                      svgText: component.svgText
                    };

                    const key = `${name}-${index}`;

                    return (
                      <TableCell key={key}>
                        <Status board={buildStatus} key={key + "-status"} />
                      </TableCell>
                    );
                  },
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default Releases;
