import React, { useState, useEffect, useMemo } from 'react'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import { Stack, Switch, TableCell, TableHead, TableRow, styled, tableCellClasses } from '@mui/material';
import Status from './Status';

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

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
  const [amountOfFailedTests, setAmountOfFailedTests] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(0);

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

    const amountOfFailedTests = Object.entries(dashboardTests).reduce((acc, [name, tests]) => {
      const amount = Object.entries(tests).reduce((acc, [_, data]) => {
        if (acc !== 0) {
          return acc;
        } else {
          const amount = data.status.stable ? 0 : 1
          return acc + amount;
        }
      }, 0);

      return acc + amount;
    }, 0);

    setAmountOfFailedTests(amountOfFailedTests);
    setRowsPerPage(amountOfFailedTests);
    const rows = toRows(dashboardTests);
    setRows(rows);
  };

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      fetchTests();
    }
  }, [loaded]);

  const visibleRows = useMemo(
    () =>
      rows.slice(0, rowsPerPage),
    [rows, rowsPerPage]
  );


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
            <TableCell key="tests-name">
              <Stack direction="row" spacing={1} alignItems="center">
                <MaterialUISwitch size='small' onChange={() => {
                  if (rowsPerPage === amountOfFailedTests) {
                    setRowsPerPage(rows.length)
                  } else {
                    setRowsPerPage(amountOfFailedTests);
                  }
                }}/>
              </Stack>
            </TableCell>
            {dashboards.map((key) => {
              return <TableCell key={key}>{key}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody key="tests-body">
          {
            visibleRows.map((row) => {
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
