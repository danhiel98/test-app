import React, { Component } from 'react';

import { Card, Row, Col } from 'antd';
import DashboardNavigation from '../components/navigation/DashboardNavigation';

class Dashboard extends Component
{
    // constructor(props){
    //     super(props);
    // }

    render()
    {
        return (
            <>
                <DashboardNavigation />
                <Row style={ { marginTop: "10px" } } gutter={24}>
                    <Col lg={24}>
                        <Card
                            bordered={false}
                            bodyStyle={{
                                padding: '45px 40px',
                            }}
                        >
                        </Card>
                    </Col>
                </Row>
            </>
        );
    }
}

export default Dashboard;
