import React, { useState, useEffect } from 'react'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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

  
function Tests() {
    const [tests, getTests] = useState([]);

    const fetchTests = async () => {
        const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
            const [dashboardId, views] = e;
            const viewPromises = views.map(async (viewUrl) => {
                const response = await xhr(viewUrl + "/api/json?tree=jobs[name,url]");
                return response["jobs"].map(job => [job.name, job.url]);
            });
    
            const viewValues = await Promise.all(viewPromises);
            const allValues = viewValues.reduce((acc, value) => {
                acc = acc || {};
                value.forEach((item, i) => {
                    const [name, url] = item;
                    acc[name] = url;
                });
    
                return acc;
            }, {});
    
            return [dashboardId, allValues];
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

        const dashboardIds = Object.keys(dashboards);

        const data = Object.entries(test2dashboard).map((e) => {
            const [testName, boards] = e;

            const boardsData = dashboardIds.map((dashboardId) => {
                if (boards.includes(dashboardId)) {
                    const buildUrl = dashboards[dashboardId][testName];
                    const imageUrl = buildUrl + "badge/icon";
                    return {"buildUrl": buildUrl, "imageUrl": imageUrl};
                }
                return null;
            });

            return {"name": testName, "boards": boardsData};
        });
        return getTests(data);
    };

    useEffect(() => {
        fetchTests();
    }, []);


    return (
        <TableContainer component={Paper}>
            <Table size={'small'}>
                <TableHead>
                <TableRow>
                    <TableCell></TableCell>
                    {Object.keys(DASHBOARDS).map((key) => {
                        return <TableCell key={key}>{key}</TableCell>
                    })}
                </TableRow>
                </TableHead>
                <TableBody>
                {tests.map((row) => {
                     return <TableRow
                     key={row.name}>
                        <TableCell scope="row">
                             {row.name}
                        </TableCell>
                        {
                        row.boards.map((board) => {
                             return (
                                <TableCell key={board.buildUrl}>
                                    <Status board={board}/>
                                </TableCell>
                             )
                            })
                        }
                    </TableRow>
                })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
export default Tests;