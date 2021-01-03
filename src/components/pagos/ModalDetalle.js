import React, { useEffect, useState } from "react";
import { Modal, Card, Row, Col, Space } from "antd";
import app from "../../firebaseConfig";

const opcFecha = { year: "numeric", month: "long" };
const opcFecha2 = { year: "numeric", month: "long", day: "numeric" };

const capitalize = (s) => {
    if (typeof s !== "string") return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const verUsuario = (usr) => capitalize(usr.split('@')[0]);

const formatoDinero = (num) =>
    new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD",
    }).format(num);

const verFecha = (fecha, todo = false) => {
    let opc = todo ? opcFecha2 : opcFecha;

    return capitalize(fecha.toDate().toLocaleDateString("es-SV", opc));
};

const verCodigoCuota = code => {
    return `${code.substr(0, 4)} ${code.substr(4, 4)} ${code.substr(8, 4)} ${code.substr(12, 4)} ${code.substr(16, 4)}`;
}

const obtenerPago = async (ref) => {
    let auxRecord = null;
    await ref.get().then((doc) => {
        if (doc.exists) {
            auxRecord = doc.data();
        }
    });
    return auxRecord;
};

const ModalDetalle = (props) => {
    const { codigoPago } = props;
    const [record, setRecord] = useState({});
    const [loadingRecord, setLoadingRecord] = useState(true);

    useEffect(() => {
        setLoadingRecord(true);

        let ref = app.firestore().collection("pagos").doc(codigoPago);

        obtenerPago(ref)
            .then((res) => setRecord(res))
            .finally(() => setLoadingRecord(false));
    }, [codigoPago]);

    return (
        <Modal
            key="detail-modal"
            visible={props.visible}
            onCancel={props.handleCancel}
            title={<div>Detalle del pago</div>}
            footer={<></>}
        >
            <Row>
                <Col flex={7}>
                    <Card
                        title={
                            <Space>
                                NPE: <strong> {verCodigoCuota(codigoPago)} </strong>
                            </Space>
                        }
                        bodyStyle={{ height: 325 }}
                    >
                        {!loadingRecord && (
                            <div>
                                Contrato:&nbsp;
                                <strong>{record.codigo_contrato}</strong>
                                <br />
                                Cliente:&nbsp;
                                <strong>{record.nombre_cliente}</strong>
                                <br />
                                Cantidad:&nbsp;
                                <strong>
                                    {formatoDinero(record.cantidad)}
                                </strong>
                                <br />
                                Mora:&nbsp;
                                <strong style={record.mora_exonerada ? { textDecoration: 'line-through' } : {textDecoration: 'none'}}>
                                    {formatoDinero(record.mora)}
                                </strong>
                                <br />
                                Cuota:&nbsp;
                                <strong>
                                    {record.numero_cuota} - {verFecha(record.fecha_cuota)}
                                </strong>
                                <br />
                                Fecha de pago:&nbsp;
                                <strong>{verFecha(record.fecha_pago, true)}</strong>
                                <br />
                                Facturado:&nbsp;
                                {record.facturado
                                    ?
                                    <strong style={{ color: "#52c41a" }}>Sí</strong>
                                    :
                                    <strong style={{ color: "#165473" }}>No</strong>
                                }
                                <br/>
                                Registrado por:&nbsp;
                                <strong>{verUsuario(record.usuario)}</strong>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
};

export default ModalDetalle;
