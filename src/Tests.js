import React, { useState, useEffect } from 'react'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import { TableCell, TableHead, TableRow, tableCellClasses } from '@mui/material';
import Status from './Status';

const DASHBOARDS = {
  "unstable": [
    "https://jenkins.com.int.zone/view/Tests/view/master/view/abondarenko/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/eoktyabrskiy/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/igarro/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/ivagulin/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/nnetesov/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/vkopchenin/",
  ],
  "cb-21": [
    "https://jenkins.com.int.zone/view/Tests/view/21/view/abondarenko/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/eoktyabrskiy/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/igarro/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/ivagulin/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/nnetesov/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/vkopchenin/",
  ],
};

const TEST_NAME_CORRECTIONS = {
  'IDP : upgrade-idp-backend': 'IDP : idp-upgrade',
  'IDP : idp-21': 'IDP : idp',
  'DISCOUNTMANAGER : upgrade-discountmanager': 'DISCOUNTMANAGER : discountmanager-upgrade'
}

function fix_url(url) {
  url = url.replace("https://jenkins.com.int.zone", "https://dashboard.cloud-blue.online/jenkins"); //"/jenkins");
  return url;
}

function redirect_url(url) {
  return "https://dashboard.cloud-blue.online/redirect?url=" + encodeURIComponent(url);
}

function xhr(url) {
  url = fix_url(url);
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.log(error);
      return {};
    });
}

function sortKeys(obj) {
  return Object.keys(obj).sort().reduce((acc, c) => { acc[c] = obj[c]; return acc }, {})
}

function jobName(name, url) {
  const group = url.split('/job/')[1].split('-')[0].toUpperCase();
  return `${group} : ${name}`;
}

function getParameter(response, name) {
  const actions = response.actions || [];
  const parametersAction = actions.find((action) => action._class === "hudson.model.ParametersAction") || {};
  const parameters = parametersAction.parameters || [];
  const parameter = parameters.find((parameter) => parameter.name === name) || {};
  return parameter.value;
}

function getJobData(promise, diveDeep = true) {
  return promise.then((jobResponse) => {
    if (jobResponse.color === "notbuilt" || !jobResponse.previousBuild || !jobResponse.previousBuild.url) {
      return { "url": null, "color": "notbuilt" };
    }

    const previousBuildUrl = jobResponse.previousBuild.url + "/api/json";

    const buildName = getParameter(jobResponse, "BUILD_NAME");
    if (buildName === "") {
      if (jobResponse.inProgress) {
        return getJobData(xhr(previousBuildUrl), false).then((data) => {
          return { "url": jobResponse.url, "color": data.color };
        });
      }
      const color = jobResponse.result === "SUCCESS" ? "blue" : "yellow";
      return { "url": jobResponse.url, "color": color };
    }

    if (diveDeep) {
      return getJobData(xhr(previousBuildUrl));
    } else {
      const color = jobResponse.result === "SUCCESS" ? "blue" : "yellow";
      return { "url": jobResponse.url, "color": color };
    }
  });
}


function getStableComponentJobPromise(url) {
  let promise = new Promise((resolve, reject) => {
    let jobJsonUrl = url + "/lastBuild/api/json";
    const promise = xhr(jobJsonUrl);

    getJobData(promise).then(
      (data) => {
        const jobUrl = data.url || url;
        const color = data.color;
        resolve({ "url": jobUrl, "color": color });
      },
      (data) => reject(data)
    );
  });

  return promise;
}

function Tests() {
  const [tests, setTests] = useState({});

  const fetchTests = async () => {
    const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
      const [dashboardId, views] = e;
      const viewPromises = views.map((viewUrl) => {
        let url = (viewUrl + "/api/json?tree=jobs[name,url,color]");
        return xhr(url).then((response) => {
          const jobs = response["jobs"] || [];
          const promises = jobs.map((job) => {
            return getStableComponentJobPromise(job.url).then((stableJob) => {
              return [jobName(job.name, job.url), job.url, stableJob];
            });
          });
          return Promise.all(promises);
        })
      });

      const viewTests = (await Promise.all(viewPromises));

      const boardTests = viewTests.reduce((acc, value) => {
        acc = acc || {};
        value.forEach((item, i) => {
          const [name, url, stableComponentJob] = item;
          const corrected_name = TEST_NAME_CORRECTIONS[name] || name;
          acc[corrected_name] = { "url": url, "color": stableComponentJob.color, "stableComponentJobUrl": stableComponentJob.url };
        });

        return acc;
      }, {});

      return [dashboardId, boardTests];
    });

    const dashboardsValues = await Promise.all(dashboardsPromises);

    const dashboards = dashboardsValues.reduce((acc, value) => {
      const [dashboardId, testsX] = value;
      acc[dashboardId] = testsX;
      return acc;
    }, {});

    const test2dashboard = Object.entries(dashboards).reduce((acc, e) => {
      const [dashboardId, tests] = e;
      Object.entries(tests).forEach((e, i) => {
        const [name] = e;
        const ids = acc[name] || [];
        ids.push(dashboardId);
        acc[name] = ids;
      });

      return acc;
    }, {});

    const stability2tests = Object.entries(test2dashboard).reduce((acc, e) => {
      const [testname, dashboardIds] = e;
      const unstableTests = dashboardIds.filter((dashboardId) => {
        const testColor = dashboards[dashboardId][testname].color || "yellow";
        return !testColor.startsWith('blue') && testColor !== 'notbuilt';
      });

      const isStable = unstableTests.length === 0;
      const tests = [testname, ...acc[isStable] || []];
      acc[isStable] = tests;
      return acc;
    }, {});

    const data = Object.entries(stability2tests).reduce((acc, e) => {
      const [isStable, tests] = e;

      tests.sort();

      const testsData = tests.map((testName) => {
        const boards = test2dashboard[testName];

        const boardsData = Object.entries(dashboards).map(([dashboardId, dashboard]) => {
          if (boards.includes(dashboardId)) {
            const buildUrl = dashboard[testName].stableComponentJobUrl;
            const imageUrl = buildUrl + "badge/icon";
            const color = dashboard[testName].color;
            return { "buildUrl": redirect_url(buildUrl), "imageUrl": imageUrl, "color": color };
          }
          return null;
        });

        return { "name": testName, "boards": boardsData };
      });

      acc[isStable] = testsData;
      return acc;
    }, {});

    const newTests = sortKeys(data);
    //fixme use something better/smarter to not update state => trigger rerendering
    if (JSON.stringify(newTests) !== JSON.stringify(tests)) {
      setTests(newTests);
    }
  };

  useEffect(() => {
    fetchTests();
  });

  let dashboards = Object.keys(DASHBOARDS);
  let xtests = [...(tests[false] || []), ...(tests[true] || [])];

  console.log(`render tests: ${xtests.length}`);

  // first render: do not render without tests
  if (xtests.length === 0) {
    return false;
  }

  return (
    <TableContainer component={Paper} key="tests-TableContainer">
      <Table size="small" sx={{
        [`& .${tableCellClasses.root}`]: {
          border: "none"
        }
      }} key="tests-Table">
        <TableHead key="tests-head">
          <TableCell key="tests-name" />
          {dashboards.map((key) => {
            return <TableCell key={key}>{key}</TableCell>
          })}
        </TableHead>
        <TableBody key="tests-body">
          {xtests.map((test) => (
            <TableRow key={test.name}>
              <TableCell key={test.name + '-name'}>
                {test.name}
              </TableCell>
              {
                test.boards.map((board) => {
                  if (board) {
                    return (
                      <TableCell key={board.buildUrl} >
                        <Status board={board} key={board.buildUrl + '-status'} />
                      </TableCell>
                    );
                  } else {
                    return <TableCell/>;
                  }
                })
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default Tests;
