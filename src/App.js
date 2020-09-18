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
    // constructor(props) {
    //     super(props);
    // }

    render(){
        return (
            <>
                <Layout style={{ minHeight: "100vh" }}>
                    <HeaderNavigation />
                    <Layout className="site-layout">
                        <SidebarNavigation />
                        <Content style={{ margin: "75px 16px" }}>
                            {/* <Breadcrumb style={{ margin: "10px 0" }}>
                                <Breadcrumb.Item>User</Breadcrumb.Item>
                                <Breadcrumb.Item>Bill</Breadcrumb.Item>
                            </Breadcrumb> */}
                            {/* <div
                                className="site-layout-background"
                                style={{ padding: 24, minHeight: 360 }}
                            >
                                { this.props.children }
                            </div> */}
                            { this.props.children }
                        </Content>
                    </Layout>
                </Layout>
            </>
        );
    }
}

export default App;
