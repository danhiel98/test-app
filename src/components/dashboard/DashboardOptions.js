import React, { Component, Fragment } from 'react';

import { Card, Row, Col, Space } from 'antd';
import {
    FileTextOutlined,
    DollarOutlined,
    SmileOutlined,
    ToolOutlined
} from '@ant-design/icons';

const { Meta } = Card;

class DashboardOptions extends Component
{
    render(){
        return (
            <Row gutter={24}>
                <Col lg={6}>
                    <Card
                        bordered={false}
                        bodyStyle={{
                            padding: '45px 40px',
                        }}
                        style={ { cursor: 'pointer' } }
                        onClick={this.props.goContracts}
                    >
                        <Space>
                            <FileTextOutlined style={ { fontSize: "64px" } } />
                            <Meta title={
                                <Fragment>
                                    <span style={ { fontSize: "20px" } }> Contratos </span>
                                </Fragment>
                            }
                            description="Lista de contratos" />
                        </Space>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card
                        bordered={false}
                        bodyStyle={{
                            padding: '45px 40px',
                        }}
                        style={ { cursor: 'pointer' } }
                        onClick={this.props.goPayments}
                    >
                        <Space>
                            <DollarOutlined  style={ { fontSize: "64px" } } />
                            <Meta title={
                                <Fragment>
                                    <span style={ { fontSize: "20px" } }> Pagos </span>
                                </Fragment>
                            }
                            description="Pagos de clientes" />
                        </Space>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card
                        bordered={false}
                        bodyStyle={{
                            padding: '45px 40px',
                        }}
                        style={ { cursor: 'pointer' } }
                        onClick={this.props.goClients}
                    >
                        <Space>
                            <SmileOutlined  style={ { fontSize: "64px" } } />
                            <Meta title={
                                <Fragment>
                                    <span style={ { fontSize: "20px" } }> Clientes </span>
                                </Fragment>
                            }
                            description="Lista de clientes" />
                        </Space>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card
                        bordered={false}
                        bodyStyle={{
                            padding: '45px 40px',
                        }}
                        style={ { cursor: 'pointer' } }
                        onClick={this.props.goMaintenances}
                    >
                        <Space>
                            <ToolOutlined  style={ { fontSize: "64px" } } />
                            <Meta title={
                                <Fragment>
                                    <span style={ { fontSize: "20px" } }> Mantenimientos </span>
                                </Fragment>
                            }
                            description="Mantenimientos realizados" />
                        </Space>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default DashboardOptions;
