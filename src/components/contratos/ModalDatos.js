import React, { useState, useEffect } from "react";
import { message, Row, Col, DatePicker, Select, Form, Input, Modal, Button, Tooltip, InputNumber } from "antd";
import moment from 'moment';
import "moment/locale/es";
import locale from "antd/es/date-picker/locale/es_ES";
import app from '../../firebaseConfig';
import firebase from 'firebase';

const { Option } = Select;

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { fireRef, record, clientes, user } = props;

    const [loading, setLoading] = useState(false);
    const [red, setRed] = useState(null);
    const [ip, setIP] = useState(null);
    const [stValidacionIP, setStValidacionIP] = useState(null);
    const [msgValidacionIP, setMsgValidacionIP] = useState(null);
    const [cantCuotas, setCantCuotas] = useState(18);
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);

    let refContratos = app.firestore().collection('contratos');
    let refCliente = app.firestore().collection('clientes');
    let refIP = app.firestore().collection('ips');

    useEffect(() => {
        if (!record) {
            form.resetFields();
            return;
        }

        const ref = fireRef.doc(record.key);
        ref.get().then(async (doc) => {
            if (doc.exists) {
                let doc_cliente;
                const contrato = doc.data();

                setRed(contrato.red);
                setIP(contrato.ip);
                setFechaInicio(moment(contrato.fecha_inicio.toDate()))
                setFechaFin(moment(contrato.fecha_fin.toDate()))

                await contrato.ref_cliente.get()
                .then(doc => {
                    doc_cliente = doc;
                })

                form.setFieldsValue({
                    id_cliente: doc_cliente.id,
                    velocidad: contrato.velocidad,
                    precio_cuota: contrato.precio_cuota,
                    red: contrato.red,
                    ip: contrato.ip,
                    cuotas: contrato.cant_cuotas,
                    fecha_inicio: moment(contrato.fecha_inicio.toDate())
                });

            } else {
                console.log(`No se puede obtener el registro`);
            }
        });
    }, [record, clientes, form, fireRef]);

    const zeroPad = (num, places) => String(num).padStart(places, '0');

    const statusIP = async (ref_ip, libre) => {
        await refIP.doc(ref_ip)
            .update({ libre })
            .catch(error => {
                throw error;
            })
    }

    const handleOk = async () => {
        setLoading(true);

        await form.validateFields()
            .then(async val => {
                if (!validarIP()) {
                    setLoading(false);
                    return;
                }

                let cliente = '';
                refCliente = refCliente.doc(val.id_cliente);

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

                let contrato = {
                    estado: 'activo',
                    eliminado: false,
                    dui_cliente: cliente.dui,
                    cliente: `${cliente.nombre} ${cliente.apellido}`,
                    cant_cuotas: val.cuotas,
                    precio_cuota: val.precio_cuota,
                    velocidad: val.velocidad,
                    ref_cliente: cliente.ref,
                    ultimo_mes_pagado: null,
                    fecha_ultimo_mes_pagado: null,
                    usuario: user.email
                }

                contrato.codigo = record ? record.codigo : `R${val.red}-${zeroPad(val.ip, 3)}-${fechaInicio.format('MMYY')}-${fechaFin.format('MMYY')}`;

                if (!record) {
                    contrato.fecha_ingreso = firebase.firestore.Timestamp.now();
                    contrato.red = val.red;
                    contrato.ip = Number(val.ip);
                    contrato.fecha_inicio = new Date(fechaInicio);
                    contrato.fecha_fin = new Date(fechaFin);
                }

                if (record) {
                    editarRegistro(contrato, cliente, val)
                    .then(() => {
                        message.success('¡Registro editado correctamente!');
                        form.resetFields();
                        props.handleCancel()
                    })
                    .catch(error => {
                        console.log(`Hubo un error al editar el registro: ${error}`)
                    })
                } else {
                    agregarRegistro(contrato)
                    .then(() => {
                        message.success('¡Se agregó el contrato correctamente!');
                        form.resetFields();
                        props.handleCancel()
                    })
                    .catch(error => {
                        console.log(`Hubo un error al agregar el registro: ${error}`)
                    })
                }
            })
            .catch((info) => {
                console.log(info);
                message.warning('¡Verifique la información ingresada!');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const agregarRegistro = async (contrato) => {
        refContratos.doc(`${contrato.codigo}`).set(contrato)
        .then(() => {
            let fechaPago = new Date(fechaInicio);
            let _codContrato = contrato.codigo.split('-');
            let _red = Number.parseInt(_codContrato[0].substr(1));

            fechaPago.setMonth(fechaPago.getMonth() - 1)

            for (let i = 1; i <= cantCuotas; i++) {
                let cuota = {
                    codigo: `${zeroPad(_red, 4)}0${_codContrato[1]}${contrato.codigo.substr(8, 4)}${contrato.codigo.substr(13, 4)}${zeroPad(i, 4)}`,
                    cantidad: contrato.precio_cuota,
                    fecha_pago: new Date(fechaPago.setMonth(fechaPago.getMonth() + 1)),
                    cancelado: false
                }

                refContratos.doc(`${contrato.codigo}`).collection('cuotas').doc(`${zeroPad(i, 2)}`).set(cuota);
            }
        })
        .then(doc => {
            statusIP(`${contrato.red}-${contrato.ip}`, false);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const editarRegistro = async (contrato, cliente, val) => {
        const ref = fireRef.doc(contrato.codigo);

        await ref
        .update({
            dui_cliente: cliente.dui,
            cliente: `${cliente.nombre} ${cliente.apellido}`,
            precio_cuota: val.precio_cuota,
            velocidad: val.velocidad,
            ref_cliente: cliente.ref,
        })
        .then(async (docRef) => {
            if (contrato.codigo !== record.codigo) await fireRef.doc(record.codigo).delete();

            if (contrato.red !== record.red || contrato.ip !== record.ip) {
                await statusIP(`${record.red}-${record.ip}`, true);
                await statusIP(`${contrato.red}-${contrato.ip}`, false);
            }
            console.log(`El registro fue actualizado`)
        })
        .catch((error) => {
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
                disabled={record}
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
            if (!red) throw new Error('Seleccione la red')
            if (!ip) throw new Error('Introduzca la direccion IP')
            if (ip <= 0 || ip >= 255 || isNaN(ip)) throw new Error('La IP ingresada no es válida')

            await refIP.doc(`${red}-${ip}`)
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    if (doc.data().libre || (record && record.ip === ip)) {
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
            title={(
                <>
                    {props.title}
                    &nbsp;
                    {
                        record &&
                        <span>
                            (
                            <strong>
                                {record.codigo}
                            </strong>
                            )
                        </span>
                    }
                </>
            )}
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
                        <Tooltip title="Nuevo cliente">
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
                    <Input disabled={record} addonBefore={selectRedes} onChange={ev => setIP(ev.target.value)} style={{ width: 200 }} placeholder="IP" onBlur={validarIP} />
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
                        disabled={record}
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
                                disabled={record}
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
