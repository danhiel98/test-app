import React, { Component } from 'react';

import { Row, Col } from 'antd';
import DashboardNavigation from '../components/navigation/DashboardNavigation';
import ContratosMora from '../components/contratos/ContratosMora';

class Dashboard extends Component
{
    render()
    {
        return (
            <>
                <DashboardNavigation />
                <Row style={ { marginTop: "10px" } } gutter={24}>
                    <Col lg={24}>
                        <ContratosMora atrasados={true} />
                    </Col>
                </Row>
            </>
        );
    }
}

export default Dashboard;
