import React, { useState, useEffect, useMemo } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

import {
  Stack,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  tableCellClasses,
} from "@mui/material";
import { buildSvgText, evaluateBuildData, Status } from "./Status";
import MaterialUISwitch from "./MaterialUISwitch";
import { xhr } from "./request";

const DASHBOARDS = {
  unstable: [
    //"https://jenkins.com.int.zone/view/Tests/view/master/view/abondarenko/",
    //"https://jenkins.com.int.zone/view/Tests/view/master/view/eoktyabrskiy/",
    //    "https://jenkins.com.int.zone/view/Tests/view/master/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/nnetesov/",
    //"https://jenkins.com.int.zone/view/Tests/view/master/view/vkopchenin/",

    "https://jenkins.com.int.zone/job/idp-backend/job/master/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-5.0/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-4.2/job/tests/job/master/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/uam/job/master/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-3.0/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-2.1/job/tests/job/master/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/tests/job/master/view/%20 All-launches",

    // "https://jenkins.com.int.zone/job/inhouse-products/job/master/job/tests/job/master/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/3.0/job/tests/job/master/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/2.4/job/tests/job/master/view/%20 All-launches",
  ],
  "cb-21": [
    "https://jenkins.com.int.zone/view/Tests/view/21/view/abondarenko/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/eoktyabrskiy/",
    //    "https://jenkins.com.int.zone/view/Tests/view/21/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/nnetesov/",
    //"https://jenkins.com.int.zone/view/Tests/view/21/view/vkopchenin/",

    "https://jenkins.com.int.zone/job/idp-backend/job/master/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-5.0/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-4.2/job/tests/job/21/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/uam/job/master/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-3.0/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-2.1/job/tests/job/21/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/tests/job/21/view/%20 All-launches",

    // "https://jenkins.com.int.zone/job/inhouse-products/job/master/job/tests/job/21/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/3.0/job/tests/job/21/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/2.4/job/tests/job/21/view/%20 All-launches",
  ],
};

const TEST_NAME_CORRECTIONS = {
  //'IDP : upgrade-idp-backend': 'IDP : idp-upgrade'
};

function comporator(field, order) {
  function nameComporator(a, b) {
    return a.testName.localeCompare(b.testName);
  }

  function weightComporator(a, b) {
    const aWeight = a.weightHolder.weight;
    const bWeight = b.weightHolder.weight;
    if (aWeight === bWeight) {
      return 0;
    } else {
      return aWeight > bWeight ? -1 : 1;
    }
  }

  const sign = order === "asc" ? 1 : -1;

  return (a, b) => {
    switch (field) {
      case "name": {
        const result = nameComporator(a, b);
        if (result === 0) {
          return weightComporator(a, b) * sign;
        }
        return result * sign;
      }

      case "weight":
      default: {
        const result = weightComporator(a, b);
        if (result === 0) {
          return nameComporator(a, b) * sign;
        }

        return result * sign;
      }
    }
  };
}

const CORE_COMPONENTS = ["OSS", "BSS", "BRANDING"];
function jobName(name, url) {
  const parts = url.split("/job/");
  const branch = parts[2];
  const branch_parts = branch.split("-");
  const version = branch_parts[branch_parts.length - 1];

  const group = parts[1].split("-")[0].toUpperCase();
  if (CORE_COMPONENTS.includes(group)) {
    return `${group} : ${name}`;
  } else {
    return `${group}/${version} : ${name}`;
  }
}

function toRows(tests) {
  const rows = Object.entries(tests).map(([testName, boards]) => {
    const weightHolder = {
      weight: -1,
    };

    const statuses = Object.entries(boards).map(([dashboardId, data]) => {
      const rowKeyTemplate = testName + "-" + dashboardId;

      if (data) {
        const weight = (!data.status.stable || data.status.running ? 10 : 0);
        weightHolder.weight = Math.max(weightHolder.weight, weight);
        const board = {
          buildUrl: data.baseUrl,
          svgText: data.svgText,
          jobUrl: data.jobUrl
        };
        return <Status key={rowKeyTemplate + "-status"} board={board} />;
      } else {
        return "";
      }
    });

    return {
      testName: testName,
      status: statuses,
      weightHolder: weightHolder,
    };
  });

  return rows;
}

function Tests() {
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState([]);
  const defaultSort = { field: "weight", order: "asc" };
  const [sort, setSort] = useState(defaultSort);
  const sortComporator = useMemo(
    () => comporator(sort.field, sort.order),
    [sort],
  );
  const [amountOfFailedOrRunningTests, setAmountOfFailedOrRunningTests] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(0);

  async function fetchTests() {
    const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
      const [dashboardId, views] = e;
      const preferStableBuild = dashboardId === "unstable";

      const viewPromises = views.map((viewUrl) => {
        const url = viewUrl + "/api/json?tree=jobs[name,url,inQueue,builds[timestamp,inProgress,result,url,actions[parameters[*]],previousBuild[result]]]";

        return xhr(url).then((response) => {
          const jobs = response["jobs"] || [];
          const promises = jobs.map(async (job) => {
            let name = jobName(job.name, job.url);
            name = TEST_NAME_CORRECTIONS[name] || name;

            const builds = job["builds"] || [];
            const data = evaluateBuildData(builds, preferStableBuild);
            const svgText = buildSvgText(data)

            const status = { running: data.running, stable: data.stable };

            const baseUrl = job.url;
            const jobUrl = data.jobUrl;
            return [name, url, baseUrl, jobUrl, svgText, status];
          });
          return Promise.all(promises);
        });
      });

      const viewTests = await Promise.all(viewPromises);

      const boardTests = viewTests.reduce((acc, value) => {
        acc = acc || {};
        value.forEach((item) => {
          const [name, url, baseUrl, jobUrl, svgText, status] = item;
          acc[name] = {
            url: url,
            jobUrl: jobUrl,
            baseUrl: baseUrl,
            svgText: svgText,
            status: status,
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
      }, acc);

      return acc;
    }, {});

    const amountOfFailedOrRunningTests = Object.entries(dashboardTests).reduce(
      (acc, [name, tests]) => {
        const amount = Object.entries(tests).reduce((acc, [_, data]) => {
          if (acc !== 0) {
            return acc;
          } else {
            const amount = (data.status.stable && !data.status.running) ? 0 : 1;
            return acc + amount;
          }
        }, 0);

        return acc + amount;
      },
      0,
    );

    setAmountOfFailedOrRunningTests(amountOfFailedOrRunningTests);
    const rows = toRows(dashboardTests);
    setRows(rows);
    setRowsPerPage(
      amountOfFailedOrRunningTests !== 0 ? amountOfFailedOrRunningTests : rows.length,
    );
  }

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      fetchTests();
    }
  }, [loaded]);

  const visibleRows = useMemo(
    () =>
      rows
        .toSorted(sortComporator)
        .map((row) => {
          return [row.testName, ...row.status];
        })
        .slice(0, rowsPerPage),
    [rows, rowsPerPage, sortComporator],
  );

  if (!loaded || rows.length === 0) {
    return false;
  }

  const dashboards = Object.keys(DASHBOARDS);

  return (
    <TableContainer component={Paper} key="tests-TableContainer">
      <Table
        size="small"
        sx={{
          [`& .${tableCellClasses.root}`]: {
            border: "none",
          },
        }}
        key="tests-Table"
      >
        <TableHead key="tests-head">
          <TableRow>
            <TableCell key="tests-name">
              <TableSortLabel
                active={sort.field === "name"}
                direction={sort.field === "name" ? sort.order : "asc"}
                onClick={() => {
                  const currentDirection = sort.field === "name" ? sort.order : "desc";
                  const order = currentDirection === "desc" ? "asc" : "desc";
                  setRowsPerPage(rows.length);
                  setSort({ field: "name", order: order });
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <MaterialUISwitch
                    size="small"
                    onChange={() => {
                      if (rowsPerPage === amountOfFailedOrRunningTests) {
                        setRowsPerPage(rows.length);
                      } else {
                        setSort(defaultSort);
                        setRowsPerPage(amountOfFailedOrRunningTests);
                      }
                    }}
                    disabled={amountOfFailedOrRunningTests === 0}
                    checked={rowsPerPage !== amountOfFailedOrRunningTests}
                  />
                </Stack>
              </TableSortLabel>
            </TableCell>
            {dashboards.map((key) => {
              return (
                <TableCell key={key}>
                  <TableSortLabel
                    active={sort.field === key}
                    direction={sort.field === key ? sort.order : "asc"}
                    onClick={() => {
                      const currentDirection = sort.field === key ? sort.order : "desc";
                      const order = currentDirection === "desc" ? "asc" : "desc";
                      setRowsPerPage(rows.length);
                      setSort({ field: key, order: order });
                    }}
                  >
                    {key}
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody key="tests-body">
          {visibleRows.map((row) => {
            return (
              <TableRow>
                {row.map((column) => {
                  return <TableCell>{column}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default Tests;
