import React, { useEffect, useState } from 'react';
import { Modal, List, Card, Row, Col } from 'antd';
import app from '../../firebaseConfig';
// import firebase from 'firebase';

const capitalize = s => {
    if (typeof s !== 'string') return s
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const verFecha = fecha => {
    return capitalize(new Date(fecha.seconds * 1000).toLocaleDateString("es-SV", { year: 'numeric', month: 'short' }))
}

const obtenerCuotas = async ref => {
    let auxCuotas = [];
    await ref
    .get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            auxCuotas.push(doc.data());
        })
    })
    return auxCuotas;
}

const ModalDetalle = props => {

    const { record } = props;
    const [loadingCuotas, setLoadingCuotas] = useState(true);
    const [cuotas, setCuotas] = useState([]);

    useEffect(() => {
        setLoadingCuotas(true);
        let ref = app.firestore().collection('contratos').doc(record.key).collection('cuotas');

        obtenerCuotas(ref)
        .then(res => {
            setCuotas(res);
        })
    }, [record]);

    return (
        <Modal
            key="detail-modal"
            visible={props.visible}
            onCancel={props.handleCancel}
            width={800}
            title={(
                <>
                    Detalle de Contrato
                    &nbsp;
                    {
                        <span>
                            <strong>
                                {record.codigo}
                            </strong>
                        </span>
                    }
                </>
            )}
        >
            <Row>
                <Col flex={7}>
                    <Card>
                        Cliente: <strong>{record.cliente}</strong><br />
                        IP: <strong>192.168.{record.red}.{record.ip}</strong><br />
                        Precio de cuota: <strong>$ {record.precio_cuota}</strong><br />
                        Cant. Cuotas: <strong>{record.cant_cuotas}</strong><br />
                        Fecha de inicio: <strong>{record.fecha_inicio}</strong><br />
                        Fecha de fin: <strong>{record.fecha_fin}</strong><br />
                    </Card>
                </Col>
                <Col flex={16} offset={1}>
                    <Card>
                        <h3>Cuotas</h3>

                        <List
                            dataSource={cuotas}
                            renderItem={item => (
                            <List.Item key={item.codigo}>
                                <List.Item.Meta
                                    title={<strong>{verFecha(item.fecha_pago)}</strong>}
                                    description={item.codigo}
                                />
                                <div>{ item.cancelado ? 'Cancelado' : 'Pendiente' }</div>
                            </List.Item>
                            )}
                        >
                            {/* {this.state.loading && this.state.hasMore && (
                            <div className="demo-loading-container">
                                <Spin />
                            </div>
                            )} */}
                        </List>
                    </Card>
                </Col>
            </Row>
        </Modal>
    )
}

export default ModalDetalle;
