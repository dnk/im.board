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
  'IDP : upgrade-idp-backend': 'IDP : idp-upgrade',
  'IDP : idp-21': 'IDP : idp',
  'DISCOUNTMANAGER : upgrade-discountmanager': 'DISCOUNTMANAGER : discountmanager-upgrade'
}

function fix_url(url) {
  url = url.replace("https://jenkins.com.int.zone", "https://dashboard.cloud-blue.online/jenkins");
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

function jobName(name, url) {
  const group = url.split('/job/')[1].split('-')[0].toUpperCase();
  return `${group} : ${name}`;
}

function Tests() {
  const [tests, setTests] = useState({});

  function isFirstRender() {
    return Object.keys(tests).length === 0;
  }

  const fetchTests = async () => {
    const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
      const [dashboardId, views] = e;
      const viewPromises = views.map((viewUrl) => {
        let url = (viewUrl + "/api/json?tree=jobs[name,url,color]");
        return xhr(url).then((response) => {
          const jobs = response["jobs"] || [];
          const promises = jobs.map((job) => {
            let name = jobName(job.name, job.url);
            name = TEST_NAME_CORRECTIONS[name] || name;
            return [name, job.url];
          });
          return Promise.all(promises);
        })
      });

      const viewTests = (await Promise.all(viewPromises));

      const boardTests = viewTests.reduce((acc, value) => {
        acc = acc || {};
        value.forEach((item, i) => {
          const [name, url] = item;
          acc[name] = { "url": url};
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

    if (isFirstRender()) {
      setTests(dashboardTests);
    }
  };

  useEffect(() => {
    fetchTests();
  });

  const dashboards = Object.keys(DASHBOARDS);
  
  if (isFirstRender()) {
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
          <TableRow>
            <TableCell key="tests-name" />
            {dashboards.map((key) => {
              return <TableCell key={key}>{key}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody key="tests-body">
          {
            Object.entries(tests).map(([testName, boards]) => {
                return (
                  <TableRow key={testName}>
                    <TableCell key={testName + '-name'}>
                      {testName}
                    </TableCell>
                    {
                      Object.entries(boards).map(([dashboardId, data]) => {
                        const rowKeyTemplate = testName + '-' + dashboardId;
                        if (data) {
                          const boardData = {
                            buildUrl: data.url
                          }
                          return (
                            <TableCell key={rowKeyTemplate + "-cell"} >
                              <Status board={boardData} key={rowKeyTemplate + '-status'} /*updateStatus=*/ />
                            </TableCell>
                          );
                        } else {
                          return <TableCell/>;
                        }
                      })
                    }
                  </TableRow>
                );
            }
          )
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default Tests;
