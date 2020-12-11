import React, { useState, useEffect } from 'react';
import { DatePicker, Divider, Select, message, Form, Input, Modal, Button } from 'antd';
import moment from 'moment';
import locale from "antd/es/date-picker/locale/es_ES";
import TextArea from 'antd/lib/input/TextArea';
import firebase from 'firebase';

const { Option } = Select;

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { mainRef, record, redes } = props;

    const refContrato = mainRef.collection('contratos');
    const refMantenimiento = mainRef.collection('mantenimientos');

    const [red, setRed] = useState(null);
    const [ip, setIP] = useState(null);
    const [stValidacionIP, setStValidacionIP] = useState(null);
    const [msgValidacionIP, setMsgValidacionIP] = useState(null);
    const [contrato, setContrato] = useState(null);
    const [fecha, setFecha] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!record) {
            form.resetFields();
            return
        }

        refContrato.doc(record.codigo_contrato)
        .get()
        .then(doc => {
            if (doc.exists) {
                let d_contrato = doc.data();

                setRed(d_contrato.red);
                setIP(d_contrato.ip);
                setContrato(d_contrato);
                setFecha(new Date(record.fecha));

                form.setFieldsValue({
                    red: d_contrato.red,
                    ip: d_contrato.ip,
                    fecha: moment(record.fecha),
                    direccion: record.direccion,
                    motivo: record.motivo,
                    descripcion: record.descripcion
                });
            }
        })
        // eslint-disable-next-line
    }, [record, form, mainRef]);

    useEffect(() => {
        if (ip) validarContrato();
        // eslint-disable-next-line
    }, [red]);

    const handleOk = async () => {
        setLoading(true);
        await form
        .validateFields()
        .then(async val => {
            if (!(await validarContrato())) {
                setLoading(false);
                return;
            }

            if (record) { // Si se debe editar
                editarRegistro(val).then(() => {
                    form.resetFields();
                    props.handleCancel()
                })
                .catch(error => {
                    console.log(`Hubo un error al editar el registro: ${error}`)
                })
            } else {
                agregarRegistro(val).then(() => {
                    form.resetFields();
                    props.handleCancel()
                })
                .catch(error => {
                    console.log(`Hubo un error al agregar el registro: ${error}`)
                })
            }
        })
        .catch(info => {
            console.log('Validate Failed:', info);
        })
        .finally(() => {
            setLoading(false)
        });
    }

    // eslint-disable-next-line
    const agregarRegistro = async (val) => {
        refMantenimiento.add({
            eliminado: false,
            fecha: fecha,
            codigo_contrato: contrato.codigo,
            nombre_cliente: contrato.cliente,
            ref_cliente: contrato.ref_cliente,
            direccion: val.direccion,
            motivo: val.motivo,
            descripcion: val.descripcion,
            fecha_creacion: firebase.firestore.Timestamp.now()
        })
        .then((docRef) => {
            message.success('¡Registro insertado correctamente!');
        })
        .catch((error) => {
            message.error('Error al insertar el registro');
            console.error(error);
        });
    }

    // // eslint-disable-next-line
    const editarRegistro = async (val) => {
        refMantenimiento.doc(record.key)
        .update({
            fecha: fecha,
            codigo_contrato: contrato.codigo,
            nombre_cliente: contrato.cliente,
            ref_cliente: contrato.ref_cliente,
            direccion: val.direccion,
            motivo: val.motivo,
            descripcion: val.descripcion,
        }).then(() => {
            message.success('¡Registro actualizado correctamente!');
        })
        .catch((error) => {
            message.error('Error al editar el registro');
            console.error(error);
        });
    }

    const selectRedes = (
        <Form.Item name="red" noStyle>
            <Select
                style={{ width: 70 }}
                placeholder="Red"
                onSelect={val => {
                    setRed(val);
                }}
            >
                {
                redes.map(red =>
                    <Option key={red.key} value={red.numero}>{red.numero}</Option>
                )
                }
            </Select>
        </Form.Item>
    );

    const validarContrato = async () => {
        setStValidacionIP('validating');
        setMsgValidacionIP(null);
        let result = false;

        try {
            if (!red) throw new Error('Seleccione la red')
            if (!ip) throw new Error('Introduzca la direccion IP')
            if (ip <= 0 || ip >= 255 || isNaN(ip)) throw new Error('La IP ingresada no es válida')

            await refContrato.where('red', '==', red).where('ip', '==', ip).where('activo', '==', true)
            .get()
            .then(qs => {
                setContrato(null);
                setStValidacionIP(null);

                if (qs.size === 0) throw new Error('No se encontró un contrato con esos datos');

                qs.forEach(doc => {
                    setContrato(doc.data());
                    setStValidacionIP('success');
                    result = true;
                    return; // Este solo detiene el foreach, no devuelve nada
                })
            })
            .catch(error => {
                throw error;
            })
        } catch (error) {
            setStValidacionIP('error');
            setMsgValidacionIP(error.message);
        }
        return result;
    }

    return (
        <Modal
            key="data-modal"
            visible={props.visible}
            title={props.title}
            onOk={handleOk}
            onCancel={props.handleCancel}
            footer={[
                <div key="footer-options">
                    <Button key="back" onClick={props.handleCancel}>
                        Regresar
                    </Button>
                    <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                        Guardar
                    </Button>
                </div>
            ]}
        >
            <Form form={form}>
                <Form.Item
                    name="ip"
                    label="Red/IP"
                    requiredMark="optional"
                    rules={[{ required: true, message: 'Seleccione la IP' }]}
                    hasFeedback
                    validateStatus={stValidacionIP}
                    help={msgValidacionIP}
                >
                    <Input addonBefore={selectRedes} onChange={ev => setIP(Number(ev.target.value))} style={{ width: 200 }} placeholder="IP" onBlur={validarContrato} />
                </Form.Item>
                <Divider style={{ margin: '7px 0' }} />
                <span style={{ lineHeight: 2.5 }}>
                    Contrato: <strong>{contrato ? contrato.codigo : '[Ninguno]'}</strong>
                </span> <br />
                <span style={{ lineHeight: 2.5 }}>
                    Cliente: <strong>{contrato ? contrato.cliente : '[Ninguno]'}</strong>
                </span> <br />

                <Form.Item
                    name="fecha"
                    label="Fecha"
                    rules={[
                        {
                            required: true,
                            message: 'Fecha requerida'
                        }
                    ]}
                    requiredMark="optional"
                    style={{ marginTop: 15 }}
                >
                    <DatePicker
                        placeholder="Fecha"
                        format="DD-MMMM-YYYY"
                        locale={locale}
                        disabledDate={current => {
                            // eslint-disable-next-line
                            return current && (current < moment().subtract(1, 'y') || current && current > moment().endOf('day'))
                        }}
                        onChange={date => {
                            setFecha(new Date(date));
                        }}
                        style={{ width: 170 }}
                    />
                </Form.Item>

                <Form.Item
                    name="direccion"
                    label="Dirección"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Introduzca la dirección'
                        }
                    ]}
                >
                    <Input placeholder="Dirección donde se hizo la visita" maxLength="80" style={{ width: 300 }} />
                </Form.Item>

                <Form.Item
                    name="motivo"
                    label="Motivo"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Introducir el motivo del mantenimiento'
                        }
                    ]}
                >
                    <Input placeholder="Motivo de la visita" maxLength="50" style={{ width: 300 }} />
                </Form.Item>

                <Form.Item
                    name="descripcion"
                    label="Detalles"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Introduzca los detalles de la visita'
                        }
                    ]}
                >
                    <TextArea style={{ width: 320 }} placeholder="Detalles de la visita" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ModalDatos;
