import React, { useEffect, useState } from 'react';
import { Modal, List, Card, Row, Col, Spin, Tooltip, Space } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Talonario from '../reportes/Talonario';
import app from '../../firebaseConfig';

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
            auxCuotas.push({
                id: doc.id,
                ...doc.data() // Well
            });
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
        .then(res => setCuotas(res))
        .finally(() => setLoadingCuotas(false));
    }, [record]);

    return (
        <Modal
            key="detail-modal"
            visible={props.visible}
            onCancel={props.handleCancel}
            width={800}
            title={
                <div>
                    Detalle de Contrato
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
                                <strong> {record.codigo} </strong>
                                <Tooltip title="Descargar documento">
                                    <strong>
                                        <CloudDownloadOutlined key="download" onClick={() => console.log('download')} style={{ color: '#389e0d' }} />
                                    </strong>
                                </Tooltip>
                            </Space>
                        }
                        bodyStyle={{ height: 260 }}
                    >
                        Cliente: <strong>{record.cliente}</strong><br />
                        Dui cliente: <strong>DUI</strong> <br />
                        IP: <strong>192.168.{record.red}.{record.ip}</strong><br />
                        Precio de cuota: <strong>$ {record.precio_cuota}</strong><br />
                        Cant. Cuotas: <strong>{record.cant_cuotas}</strong><br />
                        Fecha de inicio: <strong>{record.fecha_inicio}</strong><br />
                        Fecha de fin: <strong>{record.fecha_fin}</strong><br />
                    </Card>
                </Col>
                <Col flex={16} offset={1}>
                    <Card
                        title={
                            <Space>
                                <strong>Cuotas</strong>
                                {
                                    !loadingCuotas &&
                                    <PDFDownloadLink document={<Talonario contrato={record} cuotas={cuotas} />} fileName={`Talonario ${record.codigo}.pdf`}>
                                        {
                                            ({ blob, url, loading, error }) =>
                                            (
                                                loading ?
                                                '...' :
                                                <CloudDownloadOutlined key="download" style={{ color: '#389e0d' }} />
                                            )
                                        }
                                    </PDFDownloadLink>
                                }
                            </Space>
                        }
                        bodyStyle={{ height: 260, overflowY: 'scroll' }}
                    >

                        <List
                            dataSource={cuotas}
                            renderItem={item => (
                            <List.Item key={item.codigo}>
                                <List.Item.Meta
                                    title={<strong>{item.id} - {verFecha(item.fecha_pago)}</strong>}
                                    description={item.codigo}
                                />
                                <div>
                                    {
                                    item.cancelado
                                    ?
                                        <span style={{ color: '#389e0d' }}>Cancelado</span>
                                    :
                                        <span style={{ color: '#f5222d' }}>Pendiente</span>
                                    }
                                </div>
                            </List.Item>
                            )}
                        >
                            {loadingCuotas && (
                                <div className="loading-container">
                                    <Spin />
                                </div>
                            )}
                        </List>
                    </Card>
                </Col>
            </Row>
        </Modal>
    )
}

export default ModalDetalle;
