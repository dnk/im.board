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
    //    "https://jenkins.com.int.zone/view/Tests/view/master/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/nnetesov/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/vkopchenin/",
  ],
  "cb-21": [
    "https://jenkins.com.int.zone/view/Tests/view/21/view/abondarenko/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/eoktyabrskiy/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/igarro/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/ivagulin/",
    //    "https://jenkins.com.int.zone/view/Tests/view/21/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/nnetesov/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/vkopchenin/",
  ],
};

const TEST_NAME_CORRECTIONS = {
  'IDP : upgrade-idp-backend': 'IDP : idp-upgrade'
}

function fix_url(url) {
  url = url.replace("https://jenkins.com.int.zone", "https://dashboard.cloud-blue.online/jenkins");
  return url;
}

function comporator(a, b) {
  const aWeight = a.weightHolder.weight;
  const bWeight = b.weightHolder.weight;
  if (aWeight === bWeight) {
    return a.testName.localeCompare(b.testName);
  } else {
    return aWeight > bWeight ? -1 : 1;
  }
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

async function fetchSvgText(buildUrl) {
  const url = fix_url(buildUrl + `badge/icon?link=${buildUrl}/\${buildId}&build=last:\${params.BUILD_NAME=}`);
  const responseText = await fetch(url).then(response => response.text());

  if (responseText.includes(">not run</text>")) {
    const url2 = fix_url(buildUrl + `badge/icon?link=${buildUrl}&subject=\${params.COMPONENT_NAME}-\${params.BUILD_NAME}`)
    const responseText2 = await fetch(url2).then(response => response.text());

    if (responseText2.includes('>params.')) {
      return [url, responseText];
    } else {
      return [url2, responseText2];
    }
  }
  return [url, responseText];
}

function getStatus(svgText) {
  const running = svgText.includes(">running</text>");
  const stable = svgText.includes('fill="#44cc11"/>');
  return { "running": running, "stable": stable };
}

function jobName(name, url) {
  const group = url.split('/job/')[1].split('-')[0].toUpperCase();
  return `${group} : ${name}`;
}

function toRows(tests) {
  return Object.entries(tests).map(([testName, boards]) => {
    const weightHolder = {
      weight: -1
    };

    const statuses = Object.entries(boards).map(([dashboardId, data]) => {
      const rowKeyTemplate = testName + '-' + dashboardId;

      if (data) {
        weightHolder.weight = Math.max(weightHolder.weight, (data.status.stable ? 0 : 10) + (data.status.running ? 5 : 0));
        const board = {
          "svgText": data.svgText,
          "imageUrl": data.url,
          "buildUrl": data.buildUrl,
        }
        return <Status key={rowKeyTemplate + '-status'} board={board} />;
      } else {
        return "";
      }
    });

    return {
      testName: testName,
      status: statuses,
      weightHolder: weightHolder
    };
  })
    .toSorted(comporator)
    .map((row) => {
      return [row.testName, ...row.status];
    });
}

function Tests() {
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState([]);

  async function fetchTests() {
    const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
      const [dashboardId, views] = e;
      const viewPromises = views.map((viewUrl) => {
        let url = (viewUrl + "/api/json?tree=jobs[name,url,color]");
        return xhr(url).then((response) => {
          const jobs = response["jobs"] || [];
          const promises = jobs.map(async (job) => {
            let name = jobName(job.name, job.url);
            name = TEST_NAME_CORRECTIONS[name] || name;

            const [url, svgText] = await fetchSvgText(job.url);
            const status = getStatus(svgText);

            return [name, url, job.url, svgText, status];
          });
          return Promise.all(promises);
        })
      });

      const viewTests = (await Promise.all(viewPromises));

      const boardTests = viewTests.reduce((acc, value) => {
        acc = acc || {};
        value.forEach((item) => {
          const [name, url, buildUrl, svgText, status] = item;
          acc[name] = {
            "url": url,
            "buildUrl": buildUrl,
            "svgText": svgText,
            "status": status
          };
        });

        return acc;
      }, {});

      return [dashboardId, boardTests];
    });

    const dashboardsValues = await Promise.all(dashboardsPromises);

    const dashboardTests = dashboardsValues.reduce((acc, value) => {
      const [dashboardId, tests] = value;
      Object.entries(tests).reduce((acc, e) => {
        const [testName, data] = e;
        let boards = acc[testName] || {};
        boards[dashboardId] = data;
        acc[testName] = boards;
        return acc;
      }, acc)

      return acc;
    }, {});

    const rows = toRows(dashboardTests);
    setRows(rows);
  };

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      fetchTests();
    }
  }, [loaded]);

  if (!loaded) {
    return false;
  }

  const dashboards = Object.keys(DASHBOARDS);

  return (
    <TableContainer component={Paper} key="tests-TableContainer">
      <Table size="small" sx={{
        [`& .${tableCellClasses.root}`]: {
          border: "none"
        }
      }} key="tests-Table">
        <TableHead key="tests-head">
          <TableRow>
            <TableCell key="tests-name" />
            {dashboards.map((key) => {
              return <TableCell key={key}>{key}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody key="tests-body">
          {
            rows.map((row) => {
              return (
                <TableRow>
                  {
                    row.map((column) => {
                      return <TableCell>{column}</TableCell>;
                    })
                  }
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default Tests;
