import React, { useState, useEffect } from 'react';
import { message, Form, Input, Modal, Button } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import firebase from 'firebase';

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { refCliente, refContrato, refPago, refMantenimiento, record } = props;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
                    nit: cli.nit,
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
            if (record) { // Hace falta modificaciones cuando cambia DUI de cliente, nombre y apellido
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
            nit: val.nit,
            telefono: val.telefono,
            direccion: val.direccion,
            eliminado: false,
            fecha_creacion: firebase.firestore.Timestamp.now(),
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
            nit: val.nit,
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

            refMantenimiento.where('ref_cliente', '==', ref)
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
            width={480}
        >
            <Form form={form}>
                <Form.Item
                    name="nombre"
                    label="Nombres"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Introducir el nombre del cliente'
                        }
                    ]}
                    style={{ width: 300 }}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="apellido"
                    label="Apellidos"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Introducir el apellido del cliente'
                        }
                    ]}
                    style={{ width: 300 }}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="dui"
                    label="No. DUI"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Número de DUI requerido'
                        }
                    ]}
                >
                    <Input style={{ width: 150 }} />
                </Form.Item>
                <Form.Item
                    name="nit"
                    label="No. NIT"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Número de NIT requerido'
                        }
                    ]}
                >
                    <Input style={{ width: 150 }} />
                </Form.Item>
                <Form.Item
                    name="telefono"
                    label="Teléfono"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Número de teléfono requerido'
                        }
                    ]}
                >
                    <Input style={{ width: 150 }} />
                </Form.Item>
                <Form.Item
                    name="direccion"
                    label="Dirección"
                    requiredMark="optional"
                    rules={[
                        {
                            required: true,
                            message: 'Introduzca la dirección del cliente'
                        }
                    ]}
                    style={{ width: 400 }}
                >
                    <TextArea></TextArea>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ModalDatos;
