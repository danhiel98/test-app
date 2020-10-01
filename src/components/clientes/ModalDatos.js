import React, { useState } from 'react';
import {Form, Input, Modal, Button } from 'antd';
import TextArea from 'antd/lib/input/TextArea';

const ModalDatos = (props) => {
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);

    const handleOk = () => {
        setLoading(true);
        form
        .validateFields()
        .then(values => {
            form.resetFields();
            props.handleCancel()
            // console.log(values);
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
                    label="Nombre"
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
