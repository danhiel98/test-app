import React, { useEffect, useState } from 'react';
import { Modal, List, Card, Row, Col, Spin, Tooltip, Space } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import Factura from "../reportes/Factura";
import app from '../../firebaseConfig';
import { pdf } from '@react-pdf/renderer';

const capitalize = s => {
    if (typeof s !== 'string') return s
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const verFecha = fecha => {
    return capitalize(new Date(fecha.seconds * 1000).toLocaleDateString("es-SV", { year: 'numeric', month: 'short' }))
}

const obtenerFactura = async ref => {
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

const download = (record) => {
    pdf(Factura({ factura: record }))
        .toBlob()
        .then((file) => {
            var csvURL = window.URL.createObjectURL(file);
            let tempLink = document.createElement("a");
            tempLink.href = csvURL;
            tempLink.setAttribute(
                "download",
                `Factura (${record.nombre_cliente}).pdf`
            );
            tempLink.click();
        })
        .catch((error) => {
            console.log(error);
        });
};

const ModalDetalle = props => {

    const { codigoFactura } = props;
    const [record, setRecord] = useState({});
    const [loadingRecord, setLoadingRecord] = useState(true);

    useEffect(() => {
        setLoadingRecord(true)

        let ref = app.firestore().collection('facturas').doc(codigoFactura);

        obtenerFactura(ref)
        .then(res => setRecord(res))
        .finally(() => setLoadingRecord(false));

    }, [codigoFactura]);

    return (
        <Modal
            key="detail-modal"
            visible={props.visible}
            onCancel={props.handleCancel}
            width={700}
            title={
                <div>
                    Detalle de factura
                </div>
            }
            footer={
                <>
                </>
            }
        >
            <Row>
                <Col flex={7}>
                    <Card
                        title={
                            <Space>
                                <strong> {record.codigo_contrato} </strong>
                                <Tooltip title="Descargar documento">
                                    <strong>
                                        <CloudDownloadOutlined key="download" onClick={() => download(record)} style={{ color: '#389e0d' }} />
                                    </strong>
                                </Tooltip>
                            </Space>
                        }
                        bodyStyle={{ height: 285 }}
                    >
                        {
                            !loadingRecord &&
                            <div>
                                Cliente: <strong>{record.nombre_cliente}</strong><br />
                                Contrato: <strong>{record.codigo_contrato}</strong><br />
                                Fecha: <strong>{verFecha(record.fecha)}</strong><br />
                                Cant. cuotas: <strong>{record.cantidad_pagos}</strong><br />
                                Precio de cuota: <strong>{formatoDinero(record.cuotas[0].cantidad)}</strong><br />
                                Mora: <strong>{formatoDinero(record.mora)}</strong><br />
                                Total: <strong>{formatoDinero(record.total)}</strong><br />
                            </div>
                        }
                    </Card>
                </Col>
                <Col flex={16} offset={1}>
                    <Card
                        title={
                            <strong>Cuotas</strong>
                        }
                        bodyStyle={{ height: 285, overflowY: 'scroll' }}
                    >

                        <List
                            dataSource={record.cuotas}
                            renderItem={item => (
                            <List.Item key={item.num_cuota}>
                                <List.Item.Meta
                                    title={<strong>{item.num_cuota} - {verFecha(item.fecha_cuota)}</strong>}
                                    description={
                                        item.mora_exonerada
                                        ?
                                            <span style={{ color: '#389e0d' }}>Mora exonerada</span>
                                        :
                                            <span style={{ color: '#f5222d' }}>Mora {formatoDinero(item.precio_mora)}</span>
                                        }
                                    />
                                <div>
                                    <strong> {formatoDinero(item.cantidad)} </strong>
                                </div>
                            </List.Item>
                            )}
                        >
                        </List>
                    </Card>
                </Col>
            </Row>
        </Modal>
    )
}

export default ModalDetalle;
