import React, { useState, useEffect, useMemo } from 'react'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import { Stack, Switch, TableCell, TableHead, TableRow, styled, tableCellClasses } from '@mui/material';
import Status from './Status';

const fireSvg='<?xml version="1.0" encoding="utf-8"?><svg width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M9.32 15.653a.812.812 0 0 1-.086-.855c.176-.342.245-.733.2-1.118a2.106 2.106 0 0 0-.267-.779 2.027 2.027 0 0 0-.541-.606 3.96 3.96 0 0 1-1.481-2.282c-1.708 2.239-1.053 3.51-.235 4.63a.748.748 0 0 1-.014.901.87.87 0 0 1-.394.283.838.838 0 0 1-.478.023c-1.105-.27-2.145-.784-2.85-1.603a4.686 4.686 0 0 1-.906-1.555 4.811 4.811 0 0 1-.263-1.797s-.133-2.463 2.837-4.876c0 0 3.51-2.978 2.292-5.18a.621.621 0 0 1 .112-.653.558.558 0 0 1 .623-.147l.146.058a7.63 7.63 0 0 1 2.96 3.5c.58 1.413.576 3.06.184 4.527.325-.292.596-.641.801-1.033l.029-.064c.198-.477.821-.325 1.055-.013.086.137 2.292 3.343 1.107 6.048a5.516 5.516 0 0 1-1.84 2.027 6.127 6.127 0 0 1-2.138.893.834.834 0 0 1-.472-.038.867.867 0 0 1-.381-.29zM7.554 7.892a.422.422 0 0 1 .55.146c.04.059.066.126.075.198l.045.349c.02.511.014 1.045.213 1.536.206.504.526.95.932 1.298a3.06 3.06 0 0 1 1.16 1.422c.22.564.25 1.19.084 1.773a4.123 4.123 0 0 0 1.39-.757l.103-.084c.336-.277.613-.623.813-1.017.201-.393.322-.825.354-1.269.065-1.025-.284-2.054-.827-2.972-.248.36-.59.639-.985.804-.247.105-.509.17-.776.19a.792.792 0 0 1-.439-.1.832.832 0 0 1-.321-.328.825.825 0 0 1-.035-.729c.412-.972.54-2.05.365-3.097a5.874 5.874 0 0 0-1.642-3.16c-.156 2.205-2.417 4.258-2.881 4.7a3.537 3.537 0 0 1-.224.194c-2.426 1.965-2.26 3.755-2.26 3.834a3.678 3.678 0 0 0 .459 2.043c.365.645.89 1.177 1.52 1.54C4.5 12.808 4.5 10.89 7.183 8.14l.372-.25z"/></svg>';
const failedTestsIcon=encodeURIComponent(fireSvg);

const cloudSubBoltSvg = '<?xml version="1.0" encoding="utf-8"?><svg width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M 36.0607 8.1763 C 36.9284 8.1763 37.6614 7.4242 37.6614 6.5757 L 37.6614 2.4103 C 37.6614 1.5233 36.9284 .8100 36.0607 .8100 C 35.1736 .8100 34.4408 1.5233 34.4408 2.4103 L 34.4408 6.5757 C 34.4408 7.4242 35.1736 8.1763 36.0607 8.1763 Z M 24.8568 11.8980 C 25.4931 12.5344 26.5538 12.5151 27.1515 11.8980 C 27.7301 11.2810 27.7493 10.2589 27.1515 9.6611 L 24.1626 6.6722 C 23.5455 6.0551 22.5427 6.0551 21.9256 6.6722 C 21.3086 7.2892 21.3086 8.3113 21.9256 8.9283 Z M 44.9696 11.8980 C 45.5675 12.5151 46.6089 12.5344 47.2452 11.8980 L 50.1763 8.9283 C 50.7936 8.3113 50.7936 7.2892 50.1763 6.6722 C 49.5595 6.0551 48.5563 6.0551 47.9394 6.6722 L 44.9696 9.6611 C 44.3527 10.2589 44.3720 11.2810 44.9696 11.8980 Z M 8.1763 39.7438 L 29.0413 39.7438 C 34.6143 39.7438 38.9338 35.5206 38.9338 30.1019 C 38.9338 30.0248 38.9338 29.9669 38.9338 29.9284 C 42.8294 28.6556 45.5868 25.0689 45.5868 20.8071 C 45.5868 15.5041 41.3445 11.2424 36.0607 11.2424 C 31.7604 11.2424 28.1736 14.0193 26.9587 17.8953 C 24.6447 15.2534 21.4050 13.7300 17.7411 13.7300 C 11.3581 13.7300 6.0165 18.6473 5.3802 24.9917 C 2.1598 25.9945 0 28.7713 0 32.2810 C 0 36.6198 3.2590 39.7438 8.1763 39.7438 Z M 36.0607 14.0771 C 39.8208 14.0771 42.7520 17.0082 42.7520 20.8071 C 42.7520 23.6804 41.0167 26.1102 38.4710 27.0936 C 37.2368 23.4105 33.7466 20.8264 29.3499 20.5564 C 29.4656 16.8925 32.3775 14.0771 36.0607 14.0771 Z M 8.0992 36.6584 C 4.8210 36.6584 3.0854 34.7686 3.0854 32.3581 C 3.0854 30.3140 4.2810 28.5206 7.1157 27.7493 C 8.0413 27.5179 8.3885 27.0936 8.4656 26.1102 C 8.9091 20.7107 12.9201 16.8154 17.7411 16.8154 C 21.4821 16.8154 24.3940 18.8788 26.1873 22.4848 C 26.5923 23.2947 27.0744 23.5840 28.0579 23.5840 C 33.0331 23.5840 35.8485 26.5923 35.8485 30.1790 C 35.8485 33.7658 32.9174 36.6584 29.0992 36.6584 Z M 50.2534 22.4077 L 54.4187 22.4077 C 55.2864 22.4077 56.0000 21.6942 56.0000 20.8071 C 56.0000 19.9201 55.2864 19.2066 54.4187 19.2066 L 50.2534 19.2066 C 49.3857 19.2066 48.6531 19.9201 48.6531 20.8071 C 48.6531 21.6942 49.3857 22.4077 50.2534 22.4077 Z M 47.9394 34.9614 C 48.5563 35.5785 49.5595 35.5592 50.1763 34.9421 C 50.7936 34.3251 50.7936 33.3030 50.1763 32.6859 L 47.2065 29.7355 C 46.5896 29.1377 45.5868 29.1184 44.9696 29.7355 C 44.3527 30.3526 44.3527 31.3746 44.9696 31.9917 Z M 24.0468 46.5703 L 20.2094 46.5703 L 21.9642 43.2149 C 22.1956 42.7906 22.0221 42.4821 21.5978 42.4821 L 17.5675 42.4821 C 17.0468 42.4821 16.8540 42.6942 16.6805 43.0606 L 14.2314 48.6722 C 14.0193 49.1350 14.2314 49.4242 14.7135 49.4242 L 17.9532 49.4242 L 15.4656 55.4022 C 15.3691 55.6529 15.4270 55.8650 15.6006 55.9229 C 15.7741 56 15.9863 55.9421 16.1791 55.7300 L 24.3361 47.4959 C 24.7218 47.0909 24.5868 46.5703 24.0468 46.5703 Z"/></svg>';
const allTestsIcon=encodeURIComponent(cloudSubBoltSvg);

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
        backgroundImage: `url('data:image/svg+xml;utf8,${allTestsIcon}')`,
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
      backgroundImage: `url('data:image/svg+xml,${failedTestsIcon}')`,
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
