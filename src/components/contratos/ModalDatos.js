import React, { useState, useEffect } from "react";
import { Row, Col, DatePicker, Select, Form, Input, Modal, Button, Tooltip, InputNumber } from "antd";
import "moment/locale/es";
import moment from 'moment';
import locale from "antd/es/date-picker/locale/es_ES";
import app from '../../firebaseConfig';

const { Option } = Select;

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { fireRef, record } = props;

    const [loading, setLoading] = useState(false);
    const [red, setRed] = useState(null);
    const [ip, setIP] = useState(null);
    const [stValidacionIP, setStValidacionIP] = useState(null);
    const [msgValidacionIP, setMsgValidacionIP] = useState('');
    const [fechaFin, setFechaFin] = useState(null);

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

    const selectRedes = (
        <Form.Item name="prefix" noStyle>
            <Select
                style={{ width: 70 }}
                placeholder="Red"
                onSelect={val => {
                    setRed(val);
                    if (ip) validarIP();
                }}
            >
                {
                props.redes.map(red =>
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
            if (!red) throw new Error('Selecicone la red')
            if (!ip) throw new Error('Introduzca la direccion IP')
            if (ip <= 0 || ip >= 255 || isNaN(ip)) throw new Error('La IP ingresada no es válida')

            let refIPs = app.firestore().collection('ips').doc(`${red}-${ip}`);

            await refIPs
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    if (doc.data().libre) {
                        setStValidacionIP('success');
                        setMsgValidacionIP(null);
                    } else {
                        throw new Error('La IP ya está en uso')
                    }
                } else {
                    throw new Error('La IP ingresada no es válida')
                }
            })
            .catch(error => {
                throw error;
            });
        } catch (error) {
            setStValidacionIP('error');
            setMsgValidacionIP(error.message);
        }
    }

    const selectFechaInicio = date => {
        // if (!date) return;

        // let fecha = date.get();
        // fecha.add(16, 'M');

        // setIP(50);
        // setLoading(true);
        // setFechaFin(fecha);
        // console.log(ip);
        // console.log(loading);
        // console.log(fechaFin);
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
                        style={{ width: 260 }}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {
                            props.clientes.map(cliente =>
                                <Option key={cliente.key} value={cliente.key}>{ `${cliente.nombre} ${cliente.apellido}` }</Option>
                            )
                        }
                    </Select>
                    <Tooltip title="Useful information">
                        <a href="#/clientes" target="_blank" style={{ margin: "0 8px" }}>
                            Registrar cliente
                        </a>
                    </Tooltip>
                </Form.Item>

                <Row>
                    <Col span={10}>
                        <Form.Item
                            name="velocidad"
                            label="Velocidad"
                            rules={[
                                {
                                    required: true,
                                    message: 'Requerido',
                                },
                            ]}
                            requiredMark="optional"
                        >
                            <InputNumber
                                min={1}
                                max={100}
                                step={1}
                                placeholder="Velocidad"
                                formatter={value => `${value}Mb`}
                                parser={value => value.replace(/(M|b)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={10} offset={1}>
                        <Form.Item
                            name="cuota"
                            label="Cuota"
                            rules={[
                                {
                                    required: true,
                                    message: 'Requerido',
                                },
                            ]}
                            requiredMark="optional"
                        >
                            <InputNumber
                                step={0.01}
                                min={15}
                                max={100}
                                placeholder="Cuota"
                                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

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

                <Form.Item label="Fecha">
                    <Input.Group compact>
                        <Form.Item name="fecha_inicio" {...config}>
                            <DatePicker
                                placeholder="Fecha de inicio"
                                picker="month"
                                format="MMMM-YYYY"
                                locale={locale}
                                onChange={(date, dateString) => selectFechaInicio(date)}
                            />
                        </Form.Item>
                        <Form.Item name="fecha_fin" {...config}>
                            <DatePicker
                                placeholder="Fecha fin (auto)"
                                picker="month"
                                format="MMMM-YYYY"
                                locale={locale}
                                value={new Date()}
                                // disabled
                            />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalDatos;
