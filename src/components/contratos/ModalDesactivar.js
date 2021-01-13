import React, { useEffect, useState } from "react";
import {
    message,
    Modal,
    Row,
    Form,
    Input,
    Space,
    Button
} from "antd";
import TextArea from 'antd/lib/input/TextArea';

import Contrato from "../reportes/Contrato";
import app from "../../firebaseConfig";

const obtenerContrato = async (ref) => {
    let auxRecord = null;
    await ref.get().then((doc) => {
        if (doc.exists) {
            auxRecord = doc.data();
        }
    });
    return auxRecord;
};

const ModalDesactivar = (props) => {
    const [form] = Form.useForm();
    const { codigoContrato } = props;
    const [loadingRecord, setLoadingRecord] = useState(true);
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const ref = app.firestore();

    useEffect(() => {
        setLoadingRecord(true);

        let refContrato = ref.collection("contratos").doc(codigoContrato);

        obtenerContrato(refContrato)
            .then((res) => setRecord(res))
            .finally(() => setLoadingRecord(false));
    }, [codigoContrato]);

    const handleOk = () => {
        setLoading(true);
        form
        .validateFields()
        .then(val => {
            ref.collection('contratos')
            .doc(record.codigo)
            .update({
                estado: 'inactivo',
                motivo_inactivo: val.motivo
            })
            .then(() => {
                message.success(`¡Se inhabilitó el contrato correctamente!`);
                props.handleCancel();
            })
        })
        .catch(info => {
            console.log('Validate Failed:', info);
        })
        .finally(() => {
            setLoading(false)
        });
    }

    return (
        <Modal
            key="detail-modal"
            visible={props.visible}
            onCancel={props.handleCancel}
            title={<div>Dar de baja a contrato <strong>{codigoContrato}</strong></div>}
            bodyStyle={{ paddingBottom: 0 }}
            footer={
                <div key="footer-options">
                    <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                        Aceptar
                    </Button>
                </div>
            }
        >
            {!loadingRecord && (
                <Form form={form}>
                    <Form.Item
                        name="motivo"
                        label="Motivo"
                        requiredMark="optional"
                        rules={[
                            {
                                required: true,
                                message: 'Debe introducir el motivo'
                            }
                        ]}
                        // style={{ width: 300 }}
                    >
                        <TextArea placeholder="Motivo para dar de baja al contrato"></TextArea>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default ModalDesactivar;
