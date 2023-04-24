import React, { useState, useEffect } from 'react'

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import Status from "./Status";

const DASHBOARDS = {
	"master": [
			"https://jenkins.com.int.zone/view/Tests/view/master/view/abondarenko/",
			"https://jenkins.com.int.zone/view/components/job/bss/job/unstable/job/tests/job/master/view/abondarenko/",
			"https://jenkins.com.int.zone/view/components/job/oss/job/unstable/job/tests/job/master/view/abondarenko/",
			"https://jenkins.com.int.zone/view/components/job/uam/job/master/job/tests/job/master/",
			"https://jenkins.com.int.zone/job/discountmanager/job/master/job/tests/job/master/",
	],
	"21": [
			"https://jenkins.com.int.zone/view/Tests/view/21/view/abondarenko/",
	]
};

function xhr(url) {
	url = url.replace("https://jenkins.com.int.zone", "https://jira.wicro.ru/jenkins"); //"/jenkins");
	return fetch(url).then(response => response.json());
}
function CollapsibleRow({tests, isStable, isOpen}) {
    const [open, setOpen] = React.useState(isOpen);

    return (
      <React.Fragment>
        <TableRow>
          <TableCell sx={{border: 0}}>
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
            >{
              open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
            }
            </IconButton>
          </TableCell>
          <TableCell sx={{border: 0}}>
              { 
                isStable ? "stable": "unstable"
              }
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box>
                <Table size="small">
                  <TableCell sx={{border: 0}}></TableCell>
                    {Object.keys(DASHBOARDS).map((key) => {
                      return <TableCell key={key} sx={{border: 0}}>{key}</TableCell>
                    })}
                  {tests.map((test) => (
                    <TableRow key={test.name}>
                      <TableCell sx={{border: 0}}>
                        {test.name}
                      </TableCell>
                      {
                        test.boards.map((board) => {
                          return (
                            <TableCell key={board.buildUrl} sx={{border: 0}}>
                              <Status board={board}/>
                            </TableCell>
                          )
                        })
                      }
                  </TableRow>
                  ))}
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }


function Tests() {
    const [tests, getTests] = useState([]);

    const fetchTests = async () => {
        const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
            const [dashboardId, views] = e;
            const viewPromises = views.map(async (viewUrl) => {
                const response = await xhr(viewUrl + "/api/json?tree=jobs[name,url,color]");
                return response["jobs"].map(job => [job.name, job.url, job.color]);
            });

            const viewValues = await Promise.all(viewPromises);
            const boardTests = viewValues.reduce((acc, value) => {
                acc = acc || {};
                value.forEach((item, i) => {
                    const [name, url, color] = item;
                    acc[name] = {"url": url, "color": color};
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
            const [dashboardId, testsX] = e;
            Object.entries(testsX).forEach((e, i) => {
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
            const testColor = dashboards[dashboardId][testname].color;
            return !testColor.startsWith('blue');
          });

          const isStable = unstableTests.length === 0;
          const tests = [testname, ...acc[isStable] || []];
          acc[isStable] = tests;
          return acc;
        }, {});

        const dashboardIds = Object.keys(dashboards);

        const data = Object.entries(stability2tests).reduce((acc, e) => {
          const [isStable, tests] = e;

          const testsData = tests.map((testName) => {
            const boards = test2dashboard[testName];

            const boardsData = dashboardIds.map((dashboardId) => {
                if (boards.includes(dashboardId)) {
                    const buildUrl = dashboards[dashboardId][testName].url;
                    const imageUrl = buildUrl + "badge/icon";
                    const color = dashboards[dashboardId][testName].color;
                    return {"buildUrl": buildUrl, "imageUrl": imageUrl, "color": color};
                }
                return null;
            });

            return {"name": testName, "boards": boardsData};
          });

          acc[isStable] = testsData;
          return acc;
        }, {});
        return getTests(data);
    };

    useEffect(() => {
        fetchTests();
    }, []);


    return (
        <TableContainer component={Paper}>
            <Table size={'small'}>
                <TableBody>
                {
                  Object.entries(tests).map((e) => {
                    const [isStableValue, data] = e;

                    const isStable = isStableValue !== "false";
                    const isOpen = !isStable || tests.length === 1;

                    return (
                      <CollapsibleRow tests={data} isStable={isStable} isOpen={isOpen} />
                    )
                  })
                }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
export default Tests;