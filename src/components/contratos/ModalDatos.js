import React, { useState, useEffect } from "react";
import { DatePicker, Select, Form, Input, Modal, Button, Tooltip } from "antd";
import { MinusCircleOutlined } from '@ant-design/icons';
import "moment/locale/es";
import locale from "antd/es/date-picker/locale/es_ES";

const { Option } = Select;

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { fireRef, record } = props;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!record) {
            form.resetFields();
            return;
        }

        const ref = fireRef.doc(record.key);
        ref.get().then((doc) => {
            if (doc.exists) {
                const cli = doc.data();
                form.setFieldsValue({
                    dui: cli.dui,
                    nombre: cli.nombre,
                    apellido: cli.apellido,
                    direccion: cli.direccion,
                });
            } else {
                console.log(`No se puede obtener el registro`);
            }
        });
    }, [record, form, fireRef]);

    const handleOk = () => {
        setLoading(true);
        form.validateFields()
            .then((val) => {
                console.log(val);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const config = {
        rules: [
            {
                type: "object",
                required: true,
                message: "Debe seleccionar una fecha",
            },
        ],
    };

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
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleOk}
                    >
                        Enviar
                    </Button>
                </div>,
            ]}
        >
            <Form form={form}>
                <Form.Item
                    label="Cliente"
                    rules={[{ required: true }]}
                >
                    <Select
                        placeholder="Seleccione un cliente"
                        onChange={(val) => {
                            console.log(val);
                        }}
                        style={{ width: 260 }}
                        allowClear
                    >
                        <Option value="male">male</Option>
                        <Option value="female">female</Option>
                        <Option value="other">other</Option>
                    </Select>
                    <Tooltip title="Useful information">
                        <a href="#API" style={{ margin: "0 8px" }}>
                            Registrar cliente
                        </a>
                    </Tooltip>
                </Form.Item>
                
                <Form.Item label="Red/IP">
                    <Input.Group compact>
                        <Form.Item
                            name={["address", "province"]}
                            noStyle
                            rules={[
                                {
                                    required: true,
                                    message: "Province is required",
                                },
                            ]}
                        >
                            <Select placeholder="Seleccione la red">
                                <Option value="Zhejiang">Zhejiang</Option>
                                <Option value="Jiangsu">Jiangsu</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name={["address", "street"]}
                            noStyle
                            rules={[
                                {
                                    required: true,
                                    message: "Street is required",
                                },
                            ]}
                        >
                            <Select placeholder="Seleccione la IP">
                                <Option value="Zhejiang">Zhejiang</Option>
                                <Option value="Jiangsu">Jiangsu</Option>
                            </Select>
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
                <Form.Item label="Fecha">
                    <Input.Group compact>
                        <Form.Item name="fecha-inicio" {...config}>
                            <DatePicker
                                placeholder="Fecha de inicio"
                                picker="month"
                                format="MMMM-YYYY"
                                locale={locale}
                            />
                        </Form.Item>
                        <Form.Item name="fecha-fin" {...config}>
                            <DatePicker
                                placeholder="Fecha fin (auto)"
                                picker="month"
                                format="MMMM-YYYY"
                                locale={locale}
                            />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalDatos;
