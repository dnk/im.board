import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Status from "./Status";
import { Container, TableHead } from '@mui/material';
import QualityGateStatus from './QualityGateStatus';

const COMPONENTS = {
    "OSS": {
        "buildUrl": "https://jenkins.com.int.zone/job/oss/job/unstable/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    sonarProjectId: "com.parallels.poa.platform.bvt:platform-coverage"
                }
            ]
        }
    },
    "BSS": {
        "buildUrl": "https://jenkins.com.int.zone/job/bss/job/unstable/job/validate-and-promote/",
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
    "Branding UI Cluster": {
        "buildUrl": "https://jenkins.com.int.zone/job/branding-ui-cluster/job/unstable/job/validate-and-promote/",
    },
    "IDP": {
        "buildUrl": "https://jenkins.com.int.zone/job/idp-backend/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    sonarProjectId: "com.odin.idp:idp-backend"
                }
            ]
        }
    },
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
    "Discount Manager": {
        "buildUrl": "https://jenkins.com.int.zone/job/discountmanager/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    sonarProjectId: "com.odin.marketing:discountmanager-backend"
                }
            ]
        }
    },
    "UAM": {
        "buildUrl": "https://jenkins.com.int.zone/job/uam/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    sonarProjectId: "com.cloudblue.uam:uam-backend:2.1"
                }
            ]
        }
    },
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
    "E2E SDK": {
        "buildUrl": "https://jenkins.com.int.zone/job/e2e-tests-v2/job/unstable/job/validate-and-promote/"
    },
};


function Releases() {

    return (
        <Container sx={{
            [`& .${tableCellClasses.root}`]: {
                border: "none",
            }
        }}>
            <TableContainer component={Paper} >
                <Table>
                    <TableHead>
                        <TableCell></TableCell>
                        <TableCell>Build</TableCell>
                        <TableCell>Quality Gate</TableCell>
                    </TableHead>
                    {
                        Object.entries(COMPONENTS).map(([name, component]) => {
                            const buildStatus = {
                                "buildUrl": component.buildUrl,
                                "imageUrl": component.buildUrl + 'badge/icon?&subject=${params.BUILD_NAME}'
                            }

                            const sonarBadgesCells = ((component.sonar || {}).badges || [])
                                .map((badge) => {
                                    const data = {
                                        sonarProjectId: badge.sonarProjectId
                                    }
                                    return <TableCell>
                                        <QualityGateStatus data={data} />
                                    </TableCell>;
                                });


                            return (
                                <TableRow key={name}>
                                    <TableCell>
                                        {name}
                                    </TableCell>
                                    <TableCell>
                                        <Status board={buildStatus} />
                                    </TableCell>
                                    {sonarBadgesCells}
                                </TableRow>
                            )
                        })
                    }
                </Table>
            </TableContainer>
        </Container>
    );
}
export default Releases;