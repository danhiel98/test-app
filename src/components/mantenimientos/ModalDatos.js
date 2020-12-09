import React, { useState, useEffect } from 'react';
import { Select, message, Form, Input, Modal, Button } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import app from '../../firebaseConfig';
import firebase from 'firebase';

const { Option } = Select;

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { refCliente, refContrato, refPago, record } = props;

    let redes = [];
    const refRedes = app.firestore().collection('redes');

    const [red, setRed] = useState(null);
    const [ip, setIP] = useState(null);
    const [stValidacionIP, setStValidacionIP] = useState(null);
    const [msgValidacionIP, setMsgValidacionIP] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        refRedes.get()
        .then(qs => {
            qs.forEach(doc => {
                let red = doc.data();
                redes.push(red);
            })
            console.log(redes);
        })

        if (!record) {
            form.resetFields();
            return
        }

        const ref = refCliente.doc(record.key);
        ref.get().then((doc) => {
            if (doc.exists) {
                const cli = doc.data();
                form.setFieldsValue({
                    dui: cli.dui,
                    nombre: cli.nombre,
                    apellido: cli.apellido,
                    telefono: cli.telefono,
                    direccion: cli.direccion,
                });
            } else {
                console.log(`No se puede obtener el registro`);
            }
        });
    }, [record, form, refCliente]);

    const handleOk = () => {
        setLoading(true);
        form
        .validateFields()
        .then(val => {
            if (record) { // Hace falta modificaciones cuendo cambia DUI de cliente, nombre y apellido
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
        refCliente.add({
            activo: true,
            nombre: val.nombre,
            apellido: val.apellido,
            dui: val.dui,
            telefono: val.telefono,
            direccion: val.direccion,
            fecha_eliminado: null,
            fecha_creacion: firebase.firestore.Timestamp.now()
        })
        .then((docRef) => {
            message.success('¡Registro insertado correctamente!');
        })
        .catch((error) => {
            message.error('Error al insertar el registro');
            console.error(`No se pudo agregar el registro: ${error}}`);
        });
    }

    // eslint-disable-next-line
    const editarRegistro = async (val) => {
        const ref = refCliente.doc(record.key);

        ref.update({
            nombre: val.nombre,
            apellido: val.apellido,
            dui: val.dui,
            telefono: val.telefono,
            direccion: val.direccion
        }).then(() => {
            // Actualizar los nombres en contratos del cliente
            refContrato.where('ref_cliente', '==', ref)
            .get()
            .then(qs => {
                qs.forEach(doc => {
                    doc.ref.update({
                        cliente: `${val.nombre} ${val.apellido}`
                    })
                });
            })

            // Actualizar los nombres en pagos del cliente
            refPago.where('ref_cliente', '==', ref)
            .get()
            .then(qs => {
                qs.forEach(doc => {
                    doc.ref.update({
                        nombre_cliente: `${val.nombre} ${val.apellido}`
                    })
                });
            })
            message.success('¡Registro actualizado correctamente!');
        })
        .catch((error) => {
            message.error('Error al editar el registro');
            console.error(`No se pudo editar el registro: ${error}`);
        });
    }

    const selectRedes = (
        <Form.Item name="red" noStyle>
            <Select
                style={{ width: 70 }}
                placeholder="Red"
                onSelect={val => {
                    setRed(val);
                    if (ip) validarIP();
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

    const validarIP = async () => {
        setStValidacionIP('validating');
        setMsgValidacionIP(null);

        try {
            if (!red) throw new Error('Seleccione la red')
            if (!ip) throw new Error('Introduzca la direccion IP')
            if (ip <= 0 || ip >= 255 || isNaN(ip)) throw new Error('La IP ingresada no es válida')
        } catch (error) {
            setStValidacionIP('error');
            setMsgValidacionIP(error.message);
        }
        return false;
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
                    <Input addonBefore={selectRedes} onChange={ev => setIP(ev.target.value)} style={{ width: 200 }} placeholder="IP" onBlur={validarIP} />
                </Form.Item>
                {/* <Form.Item
                    name="nombre"
                    label="Nombres"
                    rules={[
                        {
                            required: true,
                            message: 'Introducir el nombre del cliente'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="apellido"
                    label="Apellidos"
                    rules={[
                        {
                            required: true,
                            message: 'Introducir el apellido del cliente'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="dui"
                    label="No. DUI"
                    rules={[
                        {
                            required: true,
                            message: 'Introducir el número de DUI'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="telefono"
                    label="Teléfono"
                    rules={[
                        {
                            required: true,
                            message: 'Introducir el número de teléfono'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="direccion"
                    label="Dirección"
                    rules={[
                        {
                            required: true,
                            message: 'Introduzca la dirección del cliente'
                        }
                    ]}
                >
                    <TextArea></TextArea>
                </Form.Item> */}
            </Form>
        </Modal>
    );
}

export default ModalDatos;
