import React, { useState, useEffect } from 'react'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import CollapsibleRow from './CollapsibleRow';
import { tableCellClasses } from '@mui/material';

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

const STADALONE_TESTS = {
  "master": [
    "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/tests/job/master/job/refund-policies-cancellation/",
    "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/tests/job/master/job/refund-policies-cancellation-with-renew/",
    "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/tests/job/master/job/refund-policies-downsizing/",
    "https://jenkins.com.int.zone/job/idp-backend/job/master/job/tests/job/master/job/idp/",
    //"https://ci.na.int.zone/jenkins/job/trunk/job/tests/job/perftests-ng/job/perftest-uam-cnc/",
    "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/tests/job/master/job/ratingengine-migration/",
    "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/tests/job/master/job/marketplace-anonymous-context/",
    "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/tests/job/master/job/refund-policies-downsizing-with-renew/",
  ]
};

function xhr(url) {
	url = url.replace("https://jenkins.com.int.zone", "https://jira.wicro.ru/jenkins"); //"/jenkins");
	return fetch(url).then(response => response.json());
}

function  sortKeys(obj) {
  return Object.keys(obj).sort().reduce((acc, c) => { acc[c] = obj[c]; return acc }, {})
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

          const standaloneTests = STADALONE_TESTS[dashboardId] || [];
          const standaloneTestsPromises = standaloneTests.map(async (standaloneTestUrl) => {
            const response = await xhr(standaloneTestUrl + "/api/json?tree=name,url,color");
            return [[response.name, response.url, response.color]];
          })

          const viewTests = await Promise.all([...viewPromises, ...standaloneTestsPromises]);


          const boardTests = viewTests.reduce((acc, value) => {
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
            const testColor = dashboards[dashboardId][testname].color;
            return !testColor.startsWith('blue') && testColor !== 'notbuilt';
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

        return getTests(sortKeys(data));
    };

    useEffect(() => {
        fetchTests();
    }, []);


    return (
        <TableContainer component={Paper}>
            <Table size={'small'} sx={{
                    [`& .${tableCellClasses.root}`]: {
                        border: "none"
                    }
                }}
            >
                <TableBody>
                {
                  Object.entries(tests).map((e) => {
                    const [isStableValue, data] = e;

                    const isStable = isStableValue !== "false";
                    // tests is an object
                    const isOpen = (isStable && Object.keys(tests).length === 1) || !isStable;

                    return (
                      <CollapsibleRow dashboards={Object.keys(DASHBOARDS)} tests={data} isStable={isStable} isOpen={isOpen} />
                    )
                  })
                }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
export default Tests;
