import React, { Component } from 'react';
import { Layout, Menu } from "antd";

import {
    FileTextOutlined,
    DollarOutlined,
    SmileOutlined,
    ToolOutlined,
    HomeOutlined,
    FileAddOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

export default class Sidebar extends Component {
    state = {
        collapsed: false,
    };

    onCollapse = collapsed => {
        this.setState({ collapsed });
    };

    render() {
        return (
            <Sider
                collapsible
                collapsed={this.state.collapsed}
                onCollapse={this.onCollapse}
                style={ { marginTop: "65px" } }
                theme="light"
            >
                <Menu theme="light" defaultSelectedKeys={["1"]} mode="inline">
                    <Menu.Item key="1" icon={<HomeOutlined />} onClick={this.props.goHome}>
                        Inicio
                    </Menu.Item>
                    {/* <Menu.Item key="2" icon={<FileAddOutlined />} onClick={this.props.goNewPayment}>
                        Registrar Pagos
                    </Menu.Item> */}
                    <Menu.Item key="3" icon={<FileTextOutlined />} onClick={this.props.goContracts}>
                        Contratos
                    </Menu.Item>
                    <Menu.Item key="4" icon={<DollarOutlined />} onClick={this.props.goPayments}>
                        Pagos
                    </Menu.Item>
                    <Menu.Item key="5" icon={<SmileOutlined />} onClick={this.props.goClients}>
                        Clientes
                    </Menu.Item>
                    <Menu.Item key="6" icon={<ToolOutlined />} onClick={this.props.goMaintenances}>
                        Mantenimientos
                    </Menu.Item>
                </Menu>
            </Sider>
        );
    }
}
