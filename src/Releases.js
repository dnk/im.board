import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Status from "./Status";
import { TableHead } from '@mui/material';

const STABLE_VERSION = "21.16";
const UNSTABLE_VERSION = "unstable"

const IDP_UNSTABLE_VERSION = "master";
const IDP_STABLE_VERSION = "release-4.0";

const UAM_UNSTABLE_VERSION = "master";
const UAM_STABLE_VERSION = "release-2.0";

const DM_UNSTABLE_VERSION = "master";
const DM_STABLE_VERSION = "release-1.4";


const COMPONENTS = {
    "OSS": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/oss/job/${UNSTABLE_VERSION}/job/validate-and-promote/`,
            "sonar": {
                badges: [
                    {
                        sonarProjectId: "com.parallels.poa.platform.bvt:platform-coverage"
                    }
                ]
            }
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/oss/job/${STABLE_VERSION}/job/validate-and-promote/`,
            "sonar": {
                badges: [
                    {
                        sonarProjectId: "com.parallels.poa.platform.bvt:platform-coverage"
                    }
                ]
            }
        }
    ],
    "BSS": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/bss/job/${UNSTABLE_VERSION}/job/validate-and-promote/`,
            "sonar": {
                badges: [
                    {
                        sonarProjectId: "commerce-bss"
                    },
                    // {
                    //     sonarProjectId: "commerce-bss-cpp"
                    // }
                ]
            }
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/bss/job/${STABLE_VERSION}/job/validate-and-promote/`,
            "sonar": {
                badges: [
                    {
                        sonarProjectId: "commerce-bss"
                    },
                    // {
                    //     sonarProjectId: "commerce-bss-cpp"
                    // }
                ]
            }
        }
    ],
    "Branding UI Cluster": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/branding-ui-cluster/job/${UNSTABLE_VERSION}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/branding-ui-cluster/job/${STABLE_VERSION}/job/validate-and-promote/`,
        }
    ],
    "IDP": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/idp-backend/job/${IDP_UNSTABLE_VERSION}/job/validate-and-promote/`,
            "sonar": {
                badges: [
                    {
                        sonarProjectId: "com.odin.idp:idp-backend"
                    }
                ]
            }
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/idp-backend/job/${IDP_STABLE_VERSION}/job/validate-and-promote/`,
            "sonar": {
                badges: [
                    {
                        sonarProjectId: "com.odin.idp:idp-backend"
                    }
                ]
            }
        }
    ],
    "Rating Engine": {
        "buildUrl": "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    sonarProjectId: "com.ingrammicro.bss:ratingengine-backend"
                }
            ]
        }
    },
    "Discount Manager": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/discountmanager/job/${DM_UNSTABLE_VERSION}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/discountmanager/job/${DM_STABLE_VERSION}/job/validate-and-promote/`
        }
    ],
    "UAM": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/uam/job/${UAM_UNSTABLE_VERSION}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/uam/job/${UAM_STABLE_VERSION}/job/validate-and-promote/`
        }
    ],
    "GDPR": {
        "buildUrl": "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    sonarProjectId: "com.odin.gdpr:gdpr-backend"
                }
            ]
        }
    },
    "E2E SDK": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/e2e-tests-v2/job/${UNSTABLE_VERSION}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/e2e-tests-v2/job/${STABLE_VERSION}/job/validate-and-promote/`
        }
    ],
};


function Releases() {

    return (
        <TableContainer component={Paper} >
            <Table sx={{
                [`& .${tableCellClasses.root}`]: {
                    border: "none"
                }
            }}>
                <TableHead>
                    <TableCell></TableCell>
                    <TableCell>unstable</TableCell>
                    <TableCell>release</TableCell>
                </TableHead>
                {
                    Object.entries(COMPONENTS).map(([name, components]) => {

                        let cells = (Array.isArray(components) ? components : [components])
                            .map((component, index) => {
                                const buildStatus = {
                                    "buildUrl": component.buildUrl,
                                    "imageUrl": component.buildUrl + 'badge/icon?&subject=${params.BUILD_NAME}'
                                };

                                // const sonarBadgesCells = ((component.sonar || {}).badges || [])
                                //     .map((badge) => {
                                //         const data = {
                                //             sonarProjectId: badge.sonarProjectId
                                //         }
                                //         return <TableCell>
                                //             <QualityGateStatus data={data} />
                                //         </TableCell>;
                                //     });

                                const key = `${name}-${index}`;

                                return <TableCell key={key}>
                                    <Status board={buildStatus} />
                                </TableCell>;
                            });

                        return (
                            <TableRow key={name}>
                                <TableCell>
                                    {name}
                                </TableCell>
                                {cells}
                            </TableRow>
                        )
                    })
                }
            </Table>
        </TableContainer>

    );
}
export default Releases;