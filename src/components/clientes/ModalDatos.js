import React, { useState, useEffect } from 'react';
import {Form, Input, Modal, Button } from 'antd';
import TextArea from 'antd/lib/input/TextArea';

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { fireRef, record } = props;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!record) {
            form.resetFields();
            return
        }

        const ref = fireRef.doc(record.key);
        ref.get().then((doc) => {
            if (doc.exists) {
                const cli = doc.data();
                form.setFieldsValue({
                    dui: cli.dui,
                    nombre: cli.nombre,
                    apellido: cli.apellido,
                    direccion: cli.direccion
                });
            } else {
                console.log(`No se puede obtener el registro`);
            }
        });
    }, [record, form, fireRef]);

    const handleOk = () => {
        setLoading(true);
        form
        .validateFields()
        .then(val => {
            if (record) {
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
        fireRef.add({
            nombre: val.nombre,
            apellido: val.apellido,
            dui: val.dui,
            // departamento: val.departamento,
            // municipio: val.municipio,
            direccion: val.direccion
        }).then((docRef) => {
            console.log(`¡Todo bien!`)
        })
        .catch((error) => {
            console.error(`No se pudo agregar el registro: ${error}}`);
        });
    }

    // eslint-disable-next-line
    const editarRegistro = async (val) => {
        const ref = fireRef.doc(record.key);

        ref.set({
            nombre: val.nombre,
            apellido: val.apellido,
            dui: val.dui,
            // departamento: val.departamento,
            // municipio: val.municipio,
            direccion: val.direccion
        }).then((docRef) => {
            console.log(`El registro fue actualizado`)
        })
        .catch((error) => {
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
                        Enviar
                    </Button>
                </div>
            ]}
        >
            <Form form={form}>
                <Form.Item
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
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ModalDatos;
