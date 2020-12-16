import React, { Component } from "react";
import "antd/dist/antd.css";
import "./styles/custom.css";
import "./styles/line-awesome.min.css";
import { Layout } from "antd";


import HeaderNavigation from './components/navigation/HeaderNavigation';
import SidebarNavigation from "./components/navigation/SidebarNavigation";

const { Content } = Layout;

class App extends Component
{
    render(){
        return (
            <>
                <Layout style={{ minHeight: "100vh" }}>
                    <HeaderNavigation />
                    <Layout className="site-layout">
                        <SidebarNavigation selected={this.props.location.pathname.substr(1) || 'inicio'} />
                        <Content style={{ margin: "75px 16px" }}>
                            { this.props.children }
                        </Content>
                    </Layout>
                </Layout>
            </>
        );
    }
}

export default App;
