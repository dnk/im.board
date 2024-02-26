import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Status from "./Status";
import { Container } from '@mui/material';

const COMPONENTS = {
    "OSS": {
        "buildUrl": "https://jenkins.com.int.zone/job/oss/job/unstable/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    url: "https://sonarqube.int.zone/dashboard?id=com.parallels.poa.platform.bvt%3Aplatform-coverage",
                    image: "https://sonarqube.int.zone/api/project_badges/measure?project=com.parallels.poa.platform.bvt%3Aplatform-coverage&metric=alert_status&token=sqb_97bfab629a698f7abf87bc5af7e07efa2764dbda"
                }
            ]
        }
    },
    "BSS": {
        "buildUrl": "https://jenkins.com.int.zone/job/bss/job/unstable/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    url: "https://sonarqube.int.zone/dashboard?id=commerce-bss",
                    image: "https://sonarqube.int.zone/api/project_badges/measure?project=commerce-bss&metric=alert_status&token=sqb_2c3480cdab3ec1f930476a8b6b4712f9459012f8",
                },
                // {
                //     url: "https://sonarqube.int.zone/dashboard?id=commerce-bss-cpp",
                //     image: "https://sonarqube.int.zone/api/project_badges/measure?project=commerce-bss-cpp&metric=alert_status&token=sqb_a7c999459618b42b03379b817d592d54dd0a5857"
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
                    url: "https://sonarqube.int.zone/dashboard?id=com.odin.idp%3Aidp-backend",
                    image: "https://sonarqube.int.zone/api/project_badges/measure?project=com.odin.idp%3Aidp-backend&metric=alert_status&token=sqb_e483fbb106e86c618eec3a4ad7a6df87f0a5ade0"
                }
            ]
        }
    },
    "Rating Engine": {
        "buildUrl": "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    url: "https://sonarqube.int.zone/dashboard?id=com.ingrammicro.bss%3Aratingengine-backend",
                    image: "https://sonarqube.int.zone/api/project_badges/measure?project=com.ingrammicro.bss%3Aratingengine-backend&metric=alert_status&token=sqb_d75c12fcb769db163f2ec1f6072849397f3c1a68"
                }
            ]
        }
    },
    "Discount Manager": {
        "buildUrl": "https://jenkins.com.int.zone/job/discountmanager/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    url: "https://sonarqube.int.zone/dashboard?id=com.odin.marketing%3Adiscountmanager-backend",
                    image: "https://sonarqube.int.zone/api/project_badges/measure?project=com.odin.marketing%3Adiscountmanager-backend&metric=alert_status&token=sqb_2364a2c3973e6d393722f9c1eb8536ddfaf35fe6"
                }
            ]
        }
    },
    "UAM": {
        "buildUrl": "https://jenkins.com.int.zone/job/uam/job/master/job/validate-and-promote/",
        "sonar": {
            badges: [
                {
                    url: "https://sonarqube.int.zone/dashboard?branch=master&id=com.cloudblue.uam%3Auam-backend%3A2.1",
                    image: "https://sonarqube.int.zone/api/project_badges/measure?branch=master&project=com.cloudblue.uam%3Auam-backend%3A2.1&metric=alert_status&token=sqb_c5692665acaa51d145cd33bf000be4250ea93e88"
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
                    {
                        Object.entries(COMPONENTS).map(([name, component]) => {
                            const buildStatus = {
                                "buildUrl": component.buildUrl,
                                "imageUrl": component.buildUrl + 'badge/icon?&subject=${params.BUILD_NAME}'
                            }

                            const sonarBadgesCells = ((component.sonar || {}).badges || [])
                                .map((badge) => {
                                    const data = {
                                        buildUrl: badge.url,
                                        imageUrl: badge.image
                                    }
                                    return <TableCell>
                                        <Status board={data} />
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