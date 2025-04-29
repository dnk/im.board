import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Status from "./Status";
import { TableBody, TableHead } from "@mui/material";
import { useEffect, useState } from "react";

import { compareVersions } from 'compare-versions';

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

function fix_url(url) {
  url = url.replace(
    "https://jenkins.com.int.zone",
    "https://dashboard.cloud-blue.online/jenkins",
  );
  return url;
}

async function xhr(url) {
  url = fix_url(url);

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.log(error);
    return {};
  }
}

const UNSTABLE_JOB_NAMES = ["master", "unstable"];

const LATEST_RELEASE_NAME = 'master';

async function fetchJobs(name, baseUrl) {
  const url = `${baseUrl}/api/json?tree=jobs[name,jobs[name,url,lastBuild[timestamp,inProgress]]]`;
  return xhr(url).then((response) => {
    const jobs = (response["jobs"] || [])
      .filter((job) => job["_class"] === 'com.cloudbees.hudson.plugins.folder.Folder' && (job.name.includes(".") || UNSTABLE_JOB_NAMES.includes(job.name)))
      .sort((a, b) => a.name.localeCompare(b.name)) // sort by name to enusre that "master" job comes before "unstable" job
      .reduce((acc, job) => {
        if (UNSTABLE_JOB_NAMES.includes(job.name)) {
          delete acc[job.name];
          acc[LATEST_RELEASE_NAME] = job;
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
        const latestVersionJob = component[LATEST_RELEASE_NAME];
        delete component[LATEST_RELEASE_NAME];
        const jobs = Object.keys(component).sort(compareVersions).reverse().slice(0, AMOUNT_OF_DYNAMIC_RELEASES).map((key) => component[key]);
        const data = {}
        data[name] = [latestVersionJob, ...jobs].filter((job) => !!job && !!job.jobs).map((job) => {
          const validateAndPromoteJob = (job.jobs || []).find((job) => job.name === 'validate-and-promote');
          const timestamp = (validateAndPromoteJob.lastBuild || {}).timestamp || Date.now();
          const inProgress = (validateAndPromoteJob.lastBuild || {}).inProgress;
          const tag = `${timestamp}-${inProgress ? 1 : 0}`;
          return {
            buildUrl: validateAndPromoteJob.url,
            tag: tag
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
        <TableHead key="releases-head">
          <TableRow>
            <TableCell key="releases-head-name"></TableCell>
            <TableCell key="releases-head-unstable">Unstable</TableCell>
            <TableCell key="releases-head-realeases">Releases</TableCell>
          </TableRow>
        </TableHead>
        <TableBody key="releases-body">
          {Object.entries({ ...dynamicReleases }).map(([name, components]) => {
            return (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                {(Array.isArray(components) ? components : [components]).map(
                  (component, index) => {

                    const buildStatus = {
                      buildUrl: component.buildUrl,
                      tag: component.tag,
                      imageUrl: `${component.buildUrl}/badge/icon?tag=${component.tag}&subject=\${params.BUILD_NAME}`,
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
