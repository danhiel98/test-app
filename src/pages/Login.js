import React, { Component } from 'react';
import { connect } from 'react-redux'; /** Sirve para transferir state de redux a componentes como si fueran props */
import app from "../firebaseConfig";
import * as actions from '../actions/userActions';

import { Form, Input, Button, Checkbox, Row, Col, Card, Layout, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

class Login extends Component
{
    // constructor(props){
    //     super(props);

    //     console.log(app);
    //     console.log(props.user);
    // }

    signIn = async (values) => {
        const { usuario, clave } = values;
        await app
            .auth()
            .signInWithEmailAndPassword(usuario, clave)
            .then(result => {
                this.props.dispatch(actions.login(result.user)); // Asignar el usuario en el state
                this.props.push('/');
            })
            .catch(error => {
                console.log(error.message);
            });
    }

    render(){
        return (
            <>
                <Layout className="layout">
                    <Row justify="space-around" align="middle">
                        <Col span={5} style={ { marginTop: "25vh" } }>
                            <Row>
                                <Col span={24}>
                                    <Title style={ { textAlign: "center" } }>Turbo Mega</Title>
                                </Col>
                            </Row>
                            <Card>
                                <Form
                                    name="normal_login"
                                    className="login-form"
                                    initialValues={{
                                        remember: true,
                                    }}
                                    onFinish={this.signIn}
                                    >
                                    <Form.Item
                                        name="usuario"
                                        rules={[
                                        {
                                            required: true,
                                            message: '¡Introduzca un nombre de usuario!',
                                        },
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Nombre de usuario" />
                                    </Form.Item>
                                    <Form.Item
                                        name="clave"
                                        rules={[
                                        {
                                            required: true,
                                            message: '¡Introduzca una contraseña!',
                                        },
                                        ]}
                                    >
                                        <Input
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        type="password"
                                        placeholder="Contraseña"
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Form.Item name="remember" valuePropName="checked" noStyle>
                                            <Checkbox>No cerrar sesión</Checkbox>
                                        </Form.Item>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" block htmlType="submit" className="login-form-button">
                                            Acceder
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Layout>
            </>
        );
    }

}

function mapStateToProps(state, ownProps){
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Login);
