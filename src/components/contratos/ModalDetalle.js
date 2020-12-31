import React, { useEffect, useState } from "react";
import {
    message,
    Modal,
    List,
    Card,
    Row,
    Col,
    Spin,
    Tooltip,
    Space,
} from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import Talonario from "../reportes/Talonario";
import Contrato from "../reportes/Contrato";
import app from "../../firebaseConfig";
import { pdf } from "@react-pdf/renderer";

const capitalize = (s) => {
    if (typeof s !== "string") return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatoDinero = (num) =>
    new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD",
    }).format(num);

const verFecha = (fecha) => {
    return capitalize(
        new Date(fecha.seconds * 1000).toLocaleDateString("es-SV", {
            year: "numeric",
            month: "short",
        })
    );
};

const obtenerContrato = async (ref) => {
    let auxRecord = null;
    await ref.get().then((doc) => {
        if (doc.exists) {
            auxRecord = doc.data();
        }
    });
    return auxRecord;
};

const verCodigoCuota = code => {
    return `${code.substr(0, 4)} ${code.substr(4, 4)} ${code.substr(8, 4)} ${code.substr(12, 4)} ${code.substr(16, 4)}`;
}

const obtenerCuotas = async (ref) => {
    let auxCuotas = [];
    let cuota = null;
    let codigo = '';

    await ref.get().then((snapshot) => {
        snapshot.forEach((doc) => {
            cuota = doc.data();

            auxCuotas.push({
                id: doc.id,
                ...doc.data()
            });
        });
    });
    return auxCuotas;
};

const ModalDetalle = (props) => {
    const { codigoContrato } = props;
    const [loadingRecord, setLoadingRecord] = useState(true);
    const [loadingCuotas, setLoadingCuotas] = useState(true);
    const [record, setRecord] = useState({});
    const [cuotas, setCuotas] = useState([]);

    useEffect(() => {
        setLoadingCuotas(true);
        setLoadingRecord(true);

        let ref = app.firestore().collection("contratos").doc(codigoContrato);

        obtenerContrato(ref)
            .then((res) => setRecord(res))
            .finally(() => setLoadingRecord(false));

        obtenerCuotas(ref.collection("cuotas"))
            .then((res) => setCuotas(res))
            .finally(() => setLoadingCuotas(false));
    }, [codigoContrato]);

    const download = (tipo) => {
        pdf(Talonario({ contrato: record, cuotas: cuotas, tipo: tipo }))
            .toBlob()
            .then((file) => {
                var csvURL = window.URL.createObjectURL(file);
                let tempLink = document.createElement("a");
                tempLink.href = csvURL;
                tempLink.setAttribute(
                    "download",
                    `Talonario ${record.codigo} (${tipo}).pdf`
                );
                tempLink.click();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const descargarDocumento = async (record) => {
        let cliente = null;
        await record.ref_cliente
            .get()
            .then((doc) => (cliente = doc.data()))
            .catch((error) => {
                message.error(
                    "¡Ocurrió un error al obtener la información del cliente!"
                );
            });

        if (!cliente) return;

        pdf(Contrato({ contrato: record, cliente: cliente }))
            .toBlob()
            .then((file) => {
                var csvURL = window.URL.createObjectURL(file);
                let tempLink = document.createElement("a");
                tempLink.href = csvURL;
                tempLink.setAttribute(
                    "download",
                    `Contrato ${record.codigo}.pdf`
                );
                tempLink.click();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <Modal
            key="detail-modal"
            visible={props.visible}
            onCancel={props.handleCancel}
            width={800}
            title={<div>Detalle de Contrato</div>}
            footer={<></>}
        >
            <Row>
                <Col flex={7}>
                    <Card
                        title={
                            <Space>
                                <strong> {codigoContrato} </strong>
                                <Tooltip title="Descargar documento">
                                    <strong>
                                        <CloudDownloadOutlined
                                            key="download"
                                            onClick={() =>
                                                descargarDocumento(record)
                                            }
                                            style={{ color: "#389e0d" }}
                                        />
                                    </strong>
                                </Tooltip>
                            </Space>
                        }
                        bodyStyle={{ height: 285 }}
                    >
                        {!loadingRecord && (
                            <div>
                                Cliente: <strong>{record.cliente}</strong>
                                <br />
                                Dui cliente:{" "}
                                <strong>{record.dui_cliente}</strong> <br />
                                IP:{" "}
                                <strong>
                                    192.168.{record.red}.{record.ip}
                                </strong>
                                <br />
                                Precio de cuota:{" "}
                                <strong>
                                    {formatoDinero(record.precio_cuota)}
                                </strong>
                                <br />
                                Cant. Cuotas:{" "}
                                <strong>{record.cant_cuotas}</strong>
                                <br />
                                Fecha de inicio:{" "}
                                <strong>{verFecha(record.fecha_inicio)}</strong>
                                <br />
                                Fecha de fin:{" "}
                                <strong>{verFecha(record.fecha_fin)}</strong>
                                <br />
                            </div>
                        )}
                    </Card>
                </Col>
                <Col flex={16} offset={1}>
                    <Card
                        title={
                            <Space>
                                <strong>Cuotas</strong>
                                {!loadingCuotas && (
                                    <Space>
                                        <Tooltip title="Descargar original">
                                            <CloudDownloadOutlined
                                                key="downloadOriginal"
                                                onClick={() =>
                                                    download("original")
                                                }
                                                style={{ color: "#389e0d" }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Descargar copia">
                                            <CloudDownloadOutlined
                                                key="downloadCopia"
                                                onClick={() =>
                                                    download("copia - cliente")
                                                }
                                                style={{ color: "#e1a61b" }}
                                            />
                                        </Tooltip>
                                    </Space>
                                )}
                            </Space>
                        }
                        bodyStyle={{ height: 285, overflowY: "scroll" }}
                    >
                        <List
                            dataSource={cuotas}
                            renderItem={(item) => (
                                <List.Item key={item.codigo}>
                                    <List.Item.Meta
                                        title={
                                            <strong>
                                                {item.id} -{" "}
                                                {verFecha(item.fecha_pago)}
                                            </strong>
                                        }
                                        description={verCodigoCuota(item.codigo)}
                                    />
                                    <div>
                                        {item.cancelado ? (
                                            <span style={{ color: "#389e0d" }}>
                                                Cancelado
                                            </span>
                                        ) : (
                                            <span style={{ color: "#f5222d" }}>
                                                Pendiente
                                            </span>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        ></List>
                        {loadingCuotas && (
                            <div className="loading-container">
                                <Spin />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
};

export default ModalDetalle;
