import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { Layout, Menu, Avatar } from "antd";
import { Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { SubMenu } = Menu;

class PageHeader extends Component
{
    render()
    {
        return (
            <>
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                    <Row>

                        <Col span={7} style={ { cursor: 'pointer' } } onClick={ this.props.goHome }>
                            <img src={ process.env.PUBLIC_URL + "/logo home.jpg" } alt="Logo" width="200px" />
                        </Col>
                        <Col span={5} offset={17}>
                            <Menu theme="light" style={ { textAlign: "right" } } mode="horizontal">
                                {/* <Menu.Item key="1">
                                    Nombre de usuario &nbsp;
                                    <Avatar icon={<UserOutlined />} />
                                </Menu.Item> */}
                                <SubMenu title={
                                    <Fragment>
                                        <span> { this.props.user.user.displayName ? this.props.user.user.displayName : this.props.user.user.email } </span>
                                        <Avatar style={{ marginLeft: 8 }} icon={<UserOutlined />} />
                                    </Fragment>
                                }>
                                    <Menu.Item onClick={this.props.logOut} key="user:1">Cerrar sesión</Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Col>
                    </Row>
                </Header>
            </>
        );
    }
}

function mapStateToProps(state, ownState){
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(PageHeader);
