import React, { useEffect } from 'react';
import { Modal, Divider, Card, Row, Col } from 'antd';
import app from '../../firebaseConfig';
import firebase from 'firebase';

const ModalDetalle = props => {

    const { record } = props;

    const ref = app.firestore().collection('contratos');

    useEffect(() => {
        obtenerContrato();
    }, [record]);

    const obtenerContrato = () => {
        ref.doc(record.key).collection('cuotas')
        .get()
        .then(snapshot => {
            snapshot.forEach(async (doc) => {
                console.log(doc.data());
            })
        })
    }

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
                    </Card>
                </Col>
            </Row>
        </Modal>
    )
}

export default ModalDetalle;
