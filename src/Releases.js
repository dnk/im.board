import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Status from "./Status";
import { TableBody, TableHead } from "@mui/material";
import { useEffect, useState } from "react";

import { compareVersions } from 'compare-versions';

// const CB_VERSIONS = ["unstable", "21.20", "21.19"];
// const IDP_VERSIONS = ["master", "release-5.0", "release-4.2"];
// const UAM_VERSIONS = ["master", "release-3.0", "release-2.1"];
// const INHOUSE_VERSIONS = ["master", "3.2", "3.1"];

const COMPONENTS = {
  // OSS: CB_VERSIONS.map((version) => {
  //   return {
  //     buildUrl: `https://jenkins.com.int.zone/job/oss/job/${version}/job/validate-and-promote/`,
  //   };
  // }),
  // BSS: CB_VERSIONS.map((version) => {
  //   return {
  //     buildUrl: `https://jenkins.com.int.zone/job/bss/job/${version}/job/validate-and-promote/`,
  //   };
  // }),
  // "Branding UI Cluster": CB_VERSIONS.map((version) => {
  //   return {
  //     buildUrl: `https://jenkins.com.int.zone/job/branding-ui-cluster/job/${version}/job/validate-and-promote/`,
  //   };
  // }),
  // IDP: IDP_VERSIONS.map((version) => {
  //   return {
  //     buildUrl: `https://jenkins.com.int.zone/job/idp-backend/job/${version}/job/validate-and-promote/`,
  //   };
  // }),
  // UAM: UAM_VERSIONS.map((version) => {
  //   return {
  //     buildUrl: `https://jenkins.com.int.zone/job/uam/job/${version}/job/validate-and-promote/`,
  //   };
  // }),
  // GDPR: {
  //   buildUrl:
  //     "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/validate-and-promote/",
  // },
  // INHOUSE: INHOUSE_VERSIONS.map((version) => {
  //   return {
  //     buildUrl: `https://jenkins.com.int.zone/job/inhouse-products/job/${version}/job/validate-and-promote/`,
  //   };
  // }),
  // "E2E SDK": CB_VERSIONS.map((version) => {
  //   return {
  //     buildUrl: `https://jenkins.com.int.zone/job/e2e-tests-v2/job/${version}/job/validate-and-promote/`,
  //   };
  // }),
};

const DYNAMIC_RELEASES = {
  OSS: 'https://jenkins.com.int.zone/job/oss',
  BSS: 'https://jenkins.com.int.zone/job/bss',
  "Branding UI Cluster": 'https://jenkins.com.int.zone/job/branding-ui-cluster',
  IDP: 'https://jenkins.com.int.zone/job/idp-backend',
  UAM: 'https://jenkins.com.int.zone/job/uam',
  GDPR: 'https://jenkins.com.int.zone/job/gdpr-backend',
  INHOUSE: 'https://jenkins.com.int.zone/job/inhouse-products',
  E2E: 'https://jenkins.com.int.zone/job/e2e-tests-v2'
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

const LATEST_RELEASE_NAME = 'master';

async function fetchDynamicReleases(setter) {

  const promises = Object.entries(DYNAMIC_RELEASES).map(async ([name, baseUrl]) => {
    const url = `${baseUrl}/api/json`;
    return xhr(url).then((response) => {
      const jobs = (response["jobs"] || [])
        .filter((job) => job["_class"] === 'com.cloudbees.hudson.plugins.folder.Folder')
        .reduce((acc, job) => {
          if (job.name === 'master' || job.name === 'unstable') {
            delete acc[job.name];
            acc[LATEST_RELEASE_NAME] = job.url;
          } else {
            acc[`1.0.0-${job.name}`] = job.url;
          }

          return acc;
        }, {});

      const release = {};
      release[name] = jobs;
      return release;
    });
  });

  Promise.all(promises).then((values) => {
    const components = values.reduce((acc, value) => {
      return { ...acc, ...value };
    }, {})

    const releases = Object.entries(components).map(([name, component]) => {
      const latestVersionUrl = component[LATEST_RELEASE_NAME];
      delete component[LATEST_RELEASE_NAME];
      const urls = Object.keys(component).sort(compareVersions).reverse().slice(0, 2).map((key) => component[key]);
      const data = {}
      data[name] = [latestVersionUrl].concat(urls).map((url) => {
        return {
          buildUrl: `${url}/job/validate-and-promote/`,
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
          {Object.entries({ ...dynamicReleases, ...COMPONENTS }).map(([name, components]) => {
            return (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                {(Array.isArray(components) ? components : [components]).map(
                  (component, index) => {
                    const buildStatus = {
                      buildUrl: component.buildUrl,
                      imageUrl:
                        component.buildUrl +
                        `badge/icon?&subject=\${params.BUILD_NAME}`,
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
