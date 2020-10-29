import React, { useState, useEffect } from "react";
import { message, Row, Col, DatePicker, Select, Form, Input, Modal, Button, Tooltip, InputNumber } from "antd";
import "moment/locale/es";
import moment from 'moment';
import locale from "antd/es/date-picker/locale/es_ES";
import app from '../../firebaseConfig';
import firebase from 'firebase';

const { Option } = Select;

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { fireRef, record } = props;

    const [loading, setLoading] = useState(false);
    const [red, setRed] = useState(null);
    const [ip, setIP] = useState(null);
    const [stValidacionIP, setStValidacionIP] = useState(null);
    const [msgValidacionIP, setMsgValidacionIP] = useState(null);
    const [cantCuotas, setCantCuotas] = useState(16);
    const [fechaInicio, setFechaInicio] = useState(null);
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

    const zeroPad = (num, places) => String(num).padStart(places, '0');

    const handleOk = async () => {
        setLoading(true);

        if (!validarIP()) {
            setLoading(false);
            return;
        }

        await form.validateFields()
            .then(async val => {
                console.log(val);
                let cliente = '';
                let refCliente = app.firestore().collection('clientes').doc(val.id_cliente);
                let refIP = app.firestore().collection('ips').doc(`${val.red}-${val.ip}`);
                let refContratos = app.firestore().collection('contratos');

                await refCliente
                .get()
                .then(doc => {
                    let data = doc.data();
                    cliente = {
                        id: doc.id,
                        dui: data.dui,
                        nombre: data.nombre,
                        apellido: data.apellido,
                        ref: doc.ref
                    };
                })
                .catch(error => {
                    throw error;
                });

                await refIP
                .update({
                    libre: false
                })
                .catch(error => {
                    throw error;
                })

                let contrato = {
                    activo: true,
                    cliente: `${cliente.nombre} ${cliente.apellido}`,
                    codigo: `R${val.red}-${val.ip}-${fechaInicio.format('MM-YY')}-${fechaFin.format('MM-YY')}`,
                    red: val.red,
                    ip: val.ip,
                    fecha_ingreso: firebase.firestore.FieldValue.serverTimestamp(),
                    fecha_inicio: new Date(fechaInicio),
                    fecha_fin: new Date(fechaFin),
                    cant_cuotas: val.cuotas,
                    precio_cuota: val.precio_cuota,
                    velocidad: val.velocidad,
                    ref_cliente: cliente.ref,
                }

                refContratos.doc(`${contrato.codigo}`).set(contrato)
                .then(() => {
                    let fechaPago = new Date(fechaInicio);
                    for (let i = 1; i <= cantCuotas; i++) {
                        let cuota = {
                            codigo: `${contrato.codigo}-${zeroPad(i, 2)}`,
                            cantidad: contrato.precio_cuota,
                            fecha_pago: new Date(fechaPago.setMonth(fechaPago.getMonth() + i === 1 ? 0 : 1)),
                            cancelado: false
                        }

                        refContratos.doc(`${contrato.codigo}`).collection('cuotas').doc(`${zeroPad(i, 2)}`).set(cuota);
                    }
                    message.success('¡Se agregó el contrato correctamente!');
                    props.handleCancel();

                })
                .catch((error) => {
                    console.log(error);
                });
            })
            .catch((info) => {
                message.success('¡Verifique la información ingresada');
            })
            .finally(() => {
                setLoading(false);
            });
    };

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

            let refIP = app.firestore().collection('ips').doc(`${red}-${ip}`);

            await refIP
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    if (doc.data().libre) {
                        setStValidacionIP('success');
                        setMsgValidacionIP(null);
                        return true;
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
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleOk}
                    >
                        Guardar
                    </Button>
                </div>,
            ]}
        >
            <Form form={form} initialValues={{
                // eslint-disable-next-line
                ['cuotas']: cantCuotas
            }}>
                 <Row>
                    <Col span={17}>
                        <Form.Item
                            name="id_cliente"
                            label="Cliente"
                            rules={[
                                {
                                    required: true,
                                    message: 'Seleccione un cliente',
                                }
                            ]}
                            requiredMark="optional"
                        >
                            <Select
                                placeholder="Seleccione un cliente"
                                style={{ width: 245 }}
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
                        </Form.Item>
                    </Col>
                    <Col span={7}>
                        <Tooltip title="Useful information">
                            <a href="#/clientes" target="_blank" style={{ margin: "0 8px" }}>
                                Registrar cliente
                            </a>
                        </Tooltip>
                    </Col>
                </Row>

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
                            name="precio_cuota"
                            label="$ Cuota"
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
                                formatter={value => `$ ${value} `.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|\s|(,*)/g, '')}
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

                <Form.Item
                    name="cuotas"
                    label="# Cuotas"
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
                        placeholder="Cant. cuotas"
                        onBlur={ev => {
                            let cnt = ev.target.value;
                            setFechaFin(null);
                            setCantCuotas(cnt)

                            if (!fechaInicio || !cnt) return;

                            let fecha = moment(fechaInicio.get());
                            setFechaFin(fecha.add(cnt - 1, 'M'));
                        }}
                    />
                </Form.Item>
                <Row>
                    <Col span={12}>
                        <Form.Item
                            name="fecha_inicio"
                            label="Fecha de inicio"
                            rules={[
                                {
                                    required: true,
                                    message: 'Fecha requerida'
                                }
                            ]}

                            requiredMark="optional"
                        >
                            <DatePicker
                                placeholder="Fecha de inicio"
                                picker="month"
                                format="MMMM-YYYY"
                                locale={locale}
                                disabledDate={current => {
                                    return current && current < moment().subtract(1, 'y')
                                }}
                                onChange={date => {
                                    setFechaInicio(null)
                                    setFechaFin(null);

                                    if (!date || !cantCuotas) return;

                                    date.set('date', 3);
                                    setFechaInicio(date)
                                    let fecha = moment(date.get());
                                    setFechaFin(fecha.add(cantCuotas - 1, 'M'));
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={10} offset={1}>
                        {
                            fechaFin && <span>Fecha fin: <strong >{fechaFin.format('MMMM-YYYY')}</strong></span>
                        }
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalDatos;
