import React, { Component } from 'react';
import { Layout, Menu } from "antd";

import {
    FileTextOutlined,
    DollarOutlined,
    SmileOutlined,
    ToolOutlined,
    HomeOutlined,
    FileDoneOutlined
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
                <Menu theme="light" defaultSelectedKeys={["home"]} selectedKeys={[this.props.selected]} mode="inline">
                    <Menu.Item key="inicio" icon={<HomeOutlined />} onClick={this.props.goHome}>
                        Inicio
                    </Menu.Item>
                    <Menu.Item key="contratos" icon={<FileTextOutlined />} onClick={this.props.goContracts}>
                        Contratos
                    </Menu.Item>
                    <Menu.Item key="pagos" icon={<DollarOutlined />} onClick={this.props.goPayments}>
                        Pagos
                    </Menu.Item>
                    <Menu.Item key="clientes" icon={<SmileOutlined />} onClick={this.props.goClients}>
                        Clientes
                    </Menu.Item>
                    <Menu.Item key="facturas" icon={<FileDoneOutlined />} onClick={this.props.goInvoices}>
                        Facturación
                    </Menu.Item>
                    <Menu.Item key="mantenimientos" icon={<ToolOutlined />} onClick={this.props.goMaintenances}>
                        Mantenimientos
                    </Menu.Item>
                </Menu>
            </Sider>
        );
    }
}
