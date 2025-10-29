import { useState, useEffect, useMemo } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

import { styled } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";

import { TreeItem } from '@mui/x-tree-view/TreeItem';

import {
  Stack,
  TableHead,
  TableRow,
  TableSortLabel,
  tableCellClasses,
} from "@mui/material";
import { buildSvgText, evaluateBuildData, Status } from "./Status";
import MaterialUISwitch from "./MaterialUISwitch";
import { xhr } from "./request";
import { DYNAMIC_COMPONENTS, fetchComponentValidateAndPromodeJobs } from "./dynamicComponents";
import { SimpleTreeView } from "@mui/x-tree-view";

const DASHBOARDS = {
  unstable: [
    "https://jenkins.com.int.zone/view/Tests/view/master/view/nnetesov/",
  ],
  "cb-21": [
    "https://jenkins.com.int.zone/view/Tests/view/21/view/nnetesov/",
  ],
};

const TEST_NAME_CORRECTIONS = {
  'UAM/master : upgrade-uam': 'UAM/master : upgrade-uam-customers-onboarding'
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

    const status = Object.entries(boards)
      .map(([dashboardId, data]) => {
        const rowKeyTemplate = testName + "-" + dashboardId;

        if (data) {
          const weight = (!data.status.stable || data.status.running ? 10 : 0);
          weightHolder.weight = Math.max(weightHolder.weight, weight);
          const board = {
            buildUrl: data.baseUrl,
            svgText: data.svgText,
            jobUrl: data.jobUrl
          };
          return [dashboardId, <Status key={rowKeyTemplate + "-status"} board={board} />];
        } else {
          return [dashboardId, ""];
        }
      })
      .reduce((acc, [dashboardId, status]) => {
        acc[dashboardId] = status;
        return acc;
      }, {})

    return {
      testName: testName,
      status: status,
      weightHolder: weightHolder,
    };
  });

  return rows;
}

const TestNameCell = styled(TableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  maxWidth: '15em',
  width: "40%"
}));

const TestStatusCell = styled(TableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  width: "30%"
}));


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

    const componentValidateAndPromodeJobs = await fetchComponentValidateAndPromodeJobs(DYNAMIC_COMPONENTS);

    Object.entries(componentValidateAndPromodeJobs)
      .forEach(([_, validateAndPromodeJobs]) => {
        validateAndPromodeJobs.forEach((validateAndPromodeJob) => {
          const cb21TestsViewUrl = validateAndPromodeJob.url.replace('validate-and-promote', 'tests/job/21/view/%20%20All-launches');
          const cbUnstableTestsViewUrl = validateAndPromodeJob.url.replace('validate-and-promote', 'tests/job/master/view/%20%20All-launches');
          if (!DASHBOARDS['cb-21'].includes(cb21TestsViewUrl)) {
            DASHBOARDS['cb-21'].push(cb21TestsViewUrl);
          }
          if (!DASHBOARDS['unstable'].includes(cbUnstableTestsViewUrl)) {
            DASHBOARDS['unstable'].push(cbUnstableTestsViewUrl);
          }
        })
      });

    const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
      const [dashboardId, views] = e;

      const viewPromises = views.map((viewUrl) => {
        const url = viewUrl + "/api/json?tree=jobs[name,url,inQueue,builds[timestamp,inProgress,result,url,actions[parameters[*]],previousBuild[result]]]";

        return xhr(url).then((response) => {
          const jobs = response["jobs"] || [];
          const promises = jobs.map(async (job) => {
            let name = jobName(job.name, job.url);
            name = TEST_NAME_CORRECTIONS[name] || name;

            const builds = job["builds"] || [];
            const data = await evaluateBuildData(builds);
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
        .slice(0, rowsPerPage),
    [rows, rowsPerPage, sortComporator],
  );

  if (!loaded || rows.length === 0) {
    return false;
  }

  const dashboards = Object.keys(DASHBOARDS);

  const grouppedRows = visibleRows.reduce((acc, row) => {
    const testGroup = row.testName.split(":")[0].trim();
    const testName = row.testName.split(":")[1].trim();
    if (acc[testGroup]) {
      acc[testGroup].push({ name: testName, row: row });
    } else {
      acc[testGroup] = [{ name: testName, row: row }];
    }
    return acc;
  }, {});

  return (
    <div>
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
            <TestNameCell key="tests-name">
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Failed Tests Only</span>
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
                <span>All Tests</span>
              </Stack>
            </TestNameCell>
            {dashboards.map((dashboardId) => {
              return (
                <TestStatusCell key={dashboardId}>
                  <TableSortLabel key={`${dashboardId}-sort-label`}
                    active={sort.field === dashboardId}
                    direction={sort.field === dashboardId ? sort.order : "asc"}
                    onClick={() => {
                      const currentDirection = sort.field === dashboardId ? sort.order : "desc";
                      const order = currentDirection === "desc" ? "asc" : "desc";
                      setRowsPerPage(rows.length);
                      setSort({ field: dashboardId, order: order });
                    }}
                  >
                    {dashboardId}
                  </TableSortLabel>
                </TestStatusCell>
              );
            })}
          </TableRow>
        </TableHead>
      </Table>


      <SimpleTreeView disableSelection="true" defaultExpandedItems={Object.keys(grouppedRows)}>
        {
          Object.entries(grouppedRows).map(([groupName, tests]) => {

            function CustomLabel() {
              return (
                <Table
                  size="small"
                  sx={{
                    [`& .${tableCellClasses.root}`]: {
                      border: "none",
                    },
                  }}
                >
                  <TableHead>
                    <TestNameCell>{groupName}</TestNameCell>
                    {
                      dashboards.map((dashboardId) => {
                        return <TableCell>
                          {/* <LinearProgress value={100*1/2} variant="determinate"  color="warning" /> */}
                        </TableCell>;
                      })
                    }
                  </TableHead>
                </Table>
              );
            }

            return (
              <TreeItem itemId={groupName} slots={{ label: CustomLabel }}>
                <Table
                  size="small"
                  sx={{
                    tableLayout: "fixed",
                    maxWidth: '62.5em', // = 25em /.4
                    [`& .${tableCellClasses.root}`]: {
                      border: "none"
                    },
                  }}
                >
                  <TableBody>
                    {
                      tests.map((test) => {
                        const testName = test.name;
                        const row = test.row;
                        return (
                          <TableRow key={`${groupName}-${testName}-row`}>
                            <TestNameCell key={`${groupName}-${testName}-testname`}>{testName}</TestNameCell>
                            {
                              dashboards.map((dashboardId) => {
                                const status = row.status[dashboardId] || "";
                                return <TestStatusCell key={`${groupName}-${testName}-${dashboardId}-status`}>{status}</TestStatusCell>;
                              })
                            }
                          </TableRow>
                        );
                      })
                    }
                  </TableBody>
                </Table>
              </TreeItem>
            );
          })
        }
      </SimpleTreeView>
    </div>
  );
}
export default Tests;
