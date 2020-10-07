import React, { Component } from 'react';
import { Skeleton, Card, Space, Row, Col } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';

const { Meta } = Card;

class Contratos extends Component
{
    constructor(props){
        super(props);

        this.ref = app.firestore().collection('contratos');
        this.unsubscribe = null;
        this.state = {
            loading: false,
            contratos: []
        };
    }

    obtenerContratos = (querySnapshot) => {
        const contratos = [];
        this.setState({ loading: true })

        querySnapshot.forEach( async (doc) => {
            const { cliente, activo, codigo, fecha_inicio, fecha_fin, velocidad } = doc.data();

            contratos.push({
                key: doc.id,
                cliente,
                codigo,
                activo,
                fecha_inicio: new Date(fecha_inicio.seconds * 1000).toLocaleDateString("es-SV"),
                fecha_fin: new Date(fecha_fin.seconds * 1000).toLocaleDateString("es-SV"),
                velocidad
            });
        });

        this.setState({
            contratos,
            loading: false
        });
    }

    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.obtenerContratos);
    }

    componentDidUpdate() {

    }

    render(){
        const { loading } = this.state;
        console.log(this.state.contratos);
        return (
            <div>
                <Row gutter={16}>
                    { this.state.contratos.map(contrato =>
                    <Col span={6} key={contrato.key}>
                        <Card
                            style={{ width: 300, marginTop: 16 }}
                            actions={[
                                <SettingOutlined key="setting" />,
                                <EditOutlined key="edit" />,
                                <EllipsisOutlined key="ellipsis" />,
                            ]}
                        >
                        <Skeleton loading={loading} avatar active>
                            <Meta
                            avatar={
                                <FileTextOutlined style={{ fontSize: '32px'}} />
                            }
                            title={
                                <Space size="middle">
                                    <strong>{ contrato.codigo }</strong>
                                    <strong style={{color: 'green'}}>{contrato.velocidad}Mb</strong>
                                </Space>
                            }
                            description={
                                <div>
                                    <strong>Cliente:</strong><br /> {contrato.cliente}
                                    <strong>Fecha inicio:</strong> {contrato.fecha_inicio}<br />
                                    <strong>Fecha fin:</strong> {contrato.fecha_fin}<br />
                                </div>
                            }
                            />
                        </Skeleton>
                    </Card>
                    </Col>
                    )}
                </Row>
            </div>
        );
    }
}

export default Contratos;
