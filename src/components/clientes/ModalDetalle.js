import React, { useEffect, useState } from 'react';
import { Tooltip, Modal, List, Card, Row, Col, Spin, Space } from 'antd';
import app from '../../firebaseConfig';

const capitalize = s => {
    if (typeof s !== 'string') return s
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const verFecha = fecha => {
    return capitalize(new Date(fecha.seconds * 1000).toLocaleDateString("es-SV", { year: 'numeric', month: 'short' }))
}

const obtenerCliente = async ref => {
    let auxRecord = null;
    await ref
    .get()
    .then(doc => {
        if (doc.exists) {
            auxRecord = doc.data();
        }
    })
    return auxRecord;
}

const obtenerContratos = async ref => {
    let auxContratos = [];
    await ref
    .get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            auxContratos.push({
                id: doc.id,
                ...doc.data() // Well
            });
        })
    })
    return auxContratos;
}

const ModalDetalle = props => {

    const { codigoCliente } = props;
    const [loadingCliente, setLoadingCliente] = useState(true);
    const [loadingContratos, setLoadingContratos] = useState(true);
    const [cliente, setCliente] = useState({});
    const [contratos, setContratos] = useState([]);

    useEffect(() => {
        setLoadingContratos(true);
        setLoadingCliente(true)

        let refCliente = app.firestore().collection('clientes').doc(codigoCliente);
        let refContratos = app.firestore().collection('contratos').where('ref_cliente', '==', refCliente);

        obtenerCliente(refCliente)
        .then(res => setCliente(res))
        .finally(() => setLoadingCliente(false));

        obtenerContratos(refContratos)
        .then(res => setContratos(res))
        .finally(() => setLoadingContratos(false));
    }, [codigoCliente]);

    return (
        <Modal
            key="detail-modal"
            visible={props.visible}
            onCancel={props.handleCancel}
            width={800}
            title={
                <div>
                    Detalle de Cliente
                </div>
            }
            footer={
                <>
                </>
            }
        >
            <Row>
                <Col flex={7} style={{ maxWidth: 395 }}>
                    <Card
                        title={
                            <Space>
                                <strong> Cliente </strong>
                            </Space>
                        }
                        bodyStyle={{ height: 240 }}
                    >
                        {
                            !loadingCliente &&
                            <div>
                                Nombre: <strong>{`${cliente.nombre} ${cliente.apellido}`}</strong><br />
                                DUI: <strong>{cliente.dui}</strong> <br />
                                Teléfono: <strong>{cliente.telefono}</strong><br />
                                Dirección: <strong>{cliente.direccion}</strong><br />
                            </div>
                        }
                    </Card>
                </Col>
                <Col flex={16} offset={1}>
                    <Card
                        title={
                            <Space>
                                <strong>Contratos</strong>
                                <Tooltip title="Registrar contrato">
                                    <a href="#/contratos" target="_blank" style={{ fontSize: 12, margin: "0 8px" }}>
                                        Nuevo
                                    </a>
                                </Tooltip>
                            </Space>
                        }
                        bodyStyle={{ height: 240, overflowY: 'auto' }}
                    >

                        <List
                            dataSource={contratos}
                            renderItem={item => (
                            <List.Item key={item.id}>
                                <List.Item.Meta
                                    title={<strong>{item.codigo}</strong>}
                                    description={`${verFecha(item.fecha_inicio)} - ${verFecha(item.fecha_fin)}` }
                                />
                                <div>
                                    {
                                    item.activo
                                    ?
                                        <span style={{ color: '#389e0d' }}>Activo</span>
                                    :
                                        <span style={{ color: '#f5222d' }}>Finalizado</span>
                                    }
                                </div>
                            </List.Item>
                            )}
                        >
                        </List>
                        {loadingContratos && (
                            <div className="loading-container">
                                <Spin />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </Modal>
    )
}

export default ModalDetalle;
