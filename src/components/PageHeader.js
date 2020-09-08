import React, { Component, Fragment } from 'react';

import { Layout, Menu, Avatar } from "antd";
import { Row, Col, Divider } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { SubMenu } = Menu;

export default class PageHeader extends Component
{
    render()
    {
        return (
            <>
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                    <Row>

                        <Col span={2}>
                            <img src={ process.env.PUBLIC_URL + "/logo.png" } alt="Logo" width="40px" />
                        </Col>
                        <Col span={4} offset={18}>
                            <Menu theme="light" style={ { textAlign: "right" } } mode="horizontal">
                                {/* <Menu.Item key="1">
                                    Nombre de usuario &nbsp;
                                    <Avatar icon={<UserOutlined />} />
                                </Menu.Item> */}
                                <SubMenu title={
                                    <Fragment>
                                        <span> Nombre de usuario </span>
                                        <Avatar style={{ marginLeft: 8 }} icon={<UserOutlined />} />
                                    </Fragment>
                                }>
                                    <Menu.Item key="user:1">Cerrar sesión</Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Col>
                    </Row>
                </Header>
            </>
        );
    }
}
