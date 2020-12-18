import React, { useState, useEffect } from "react";
import { Space, List, Avatar, message, Row, Col, DatePicker, Select, Form, Input, Modal, Button, Tooltip } from "antd";
import { StopOutlined, BarcodeOutlined, DollarOutlined } from '@ant-design/icons';
import moment from 'moment';
import "moment/locale/es";
import locale from "antd/es/date-picker/locale/es_ES";
import app from '../../firebaseConfig';
import firebase from 'firebase';

const NumerosALetras = require('../../NumerosALetras');

const { Option } = Select;

const opcFecha = { year: 'numeric', month: 'long'};

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const verFecha = fecha => fecha.toDate().toLocaleString('es-SV', opcFecha);

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { record, clientes } = props;

    const [loading, setLoading] = useState(false);
    const [contrato, setContrato] = useState(null);
    const [contratos, setContratos] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagos, setPagos] = useState([]);
    const [barcode, setBarcode] = useState('');

    let refFacturas = app.firestore().collection('facturas');
    let refContratos = app.firestore().collection('contratos');
    let refPagos = app.firestore().collection('pagos');

    useEffect(() => {

    }, []);

    const zeroPad = (num, places) => String(num).padStart(places, '0');

    const handleOk = async () => {
        setLoading(true);

        form.validateFields()
        .then(val => {
            if (pagos.length === 0) {
                message.error('¡No hay ningún pago a facturar!')
                return;
            }

            guardarFactura(val);
        })
        .catch(error => {
            console.log(error);
            message.warning('¡Verifique la información ingresada!');
        })
        setLoading(false);
    };

    const guardarFactura = data => {
        let periodo = `${verFecha(pagos[0].fecha_cuota)}`;

        if (pagos.length > 1) periodo += ` a ${verFecha(pagos[pagos.length - 1].fecha_cuota)}`

        let factura = {
            fecha: new Date(data.fecha),
            cantidad_pagos: pagos.length,
            periodo,
            detalle: `Servicio de conexión a internet de banda ancha, correspondiente al periodo de ${periodo}`,
            precio_pago: total / pagos.length,
            total,
            total_letras: NumerosALetras.default(total),
            eliminado: false,
            codigo_contrato: contrato.codigo,
            nombre_cliente: contrato.cliente,
            ref_cliente: contrato.ref_cliente,
            fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
        }

        console.log(factura);
        // Agregar factura y actualizar estado de los pagos a facturado
        // refFacturas.add({

        // });
    }

    const agregarPago = async codigo => {
        if (/(R[\d]{1,3})(-|')(\d{1,3})(-|')(\d{4})(-|')(\d{4})(-|')\d{2}/.test(codigo))
        {
            let exist = false;
            let anteriorCancelado = false;
            let codContrato = codigo.substring(0, codigo.length -3);

            await refPagos.doc(codigo)
            .get()
            .then(pago => {
                if (pago.exists) {
                    message.error('¡Esta cuota ya fue cancelada!');
                    exist = true;
                }
            })

            if (exist) return;

            refContratos.doc(codContrato)
            .get()
            .then(async d_contrato => {
                if (d_contrato.exists) {
                    let numCuota = Number.parseInt(codigo.substr(-2));

                    if (numCuota > 1) {
                        await d_contrato.ref.collection('cuotas').doc(`0${numCuota - 1}`)
                        .get()
                        .then(doc => {
                            let cuota = doc.data();
                            if (cuota.cancelado) {
                                anteriorCancelado = true;
                            }
                        })

                        // Si la cuota anterior a esta no ha sido cancelada, entonces no se puede agregar el pago
                        if (!anteriorCancelado) {
                            message.error('La cuota anterior no ha sido cancelada aún');
                            return;
                        }
                    }

                    d_contrato.ref.collection('cuotas').doc(`0${numCuota}`)
                    .get()
                    .then(d_cuota => {
                        if (d_cuota.exists) {
                            let cuota = d_cuota.data();
                            let cont = d_contrato.data();

                            refPagos.doc(cuota.codigo).set({
                                cantidad: cuota.cantidad,
                                codigo_contrato: contrato.id,
                                ref_cliente: cont.ref_cliente,
                                nombre_cliente: cont.cliente,
                                numero_cuota: cuota.id,
                                fecha_cuota: cuota.fecha_pago,
                                fecha_pago: null,
                                facturado: false,
                                fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                            }).then(doc => {
                                cuota.ref.update({ cancelado: true })
                                .then(async () => {
                                    setBarcode('');
                                    form.setFieldsValue({ 'id_cliente': cont.ref_cliente.id });
                                    await cargarContratos(cont.ref_cliente.id)
                                    form.setFieldsValue({ 'id_contrato': cont.codigo });
                                    cargarPagos(cont.codigo);
                                    message.success('Pago registrado');
                                })
                            })
                        }
                    })
                } else {
                    message.error('La cuota NO existe');
                }
            })
        } else {
            message.warn('El formato del código no es válido')
        }
    }

    const eliminarPago = async record => {
        let siguienteCancelada = false;

        await refContratos.doc(record.codigo_contrato)
        .get()
        .then(async d_contrato => {
            if (d_contrato.exists) {
                let numCuota = Number.parseInt(record.numero_cuota);

                await d_contrato.ref.collection('cuotas').doc(zeroPad(numCuota + 1, 2))
                .get()
                .then(d_cuota => {
                    if (d_cuota.exists) {
                        if (d_cuota.data().cancelado){
                            siguienteCancelada = true;
                        }
                    }
                })
            }
        })

        // Si hay un pago más reciente, se debe eliminar ese primero
        if (siguienteCancelada) {
            message.error('Primero debe eliminar los pagos más recientes');
            return;
        }

        await refPagos.doc(`${record.codigo_contrato}-${record.numero_cuota}`)
        .delete()
        .then(() => {
            refContratos.doc(record.codigo_contrato)
            .get()
            .then(contrato => {
                if (contrato.exists) {
                    contrato.ref.collection('cuotas').doc(record.numero_cuota)
                    .get()
                    .then(cuota => {
                        if (cuota.exists) {
                            cuota.ref.update({ cancelado: false })
                            .then(() => {
                                cargarPagos(contrato.data().codigo);
                                message.success('Pago eliminado');
                            })
                        }
                    })
                } else {
                    message.error('La cuota NO existe');
                }
            })
        })
    }

    const cargarContratos = async codCliente => {
        form.setFieldsValue({
            'id_contrato': null
        });
        setPagos([]);

        setContratos([]);
        let auxContratos = [];
        let cliente = clientes.find(cli => cli.key === codCliente);

        if (!cliente) return;

        await refContratos
        .where('ref_cliente', '==', cliente.ref)
        .get()
        .then(qs => {
            qs.forEach(doc => {
                auxContratos.push(doc.data());
            })
            setContratos(auxContratos);
        })

        return true;
    }

    const cargarPagos = async codigoContrato => {
        let auxPagos = [];
        let auxTotal = 0;
        setTotal(0);
        setPagos([]);
        setContrato(null);

        await refContratos.doc(codigoContrato)
        .get()
        .then(doc => {
            setContrato(doc.data());
        })

        refPagos
        .where('codigo_contrato', '==', codigoContrato)
        .where('facturado', '==', false)
        .get()
        .then(qs => {
            qs.forEach(doc => {
                let pago = doc.data();
                auxPagos.push(pago);
                auxTotal += pago.cantidad;
            })
            setPagos(auxPagos);
            setTotal(auxTotal);
        });
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
            width={800}
        >
            <Form form={form}>
                <Row>
                    <Col span={12}>
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
                                onChange={codigo => cargarContratos(codigo)}
                            >
                                {
                                    clientes.map(cliente =>
                                        <Option key={cliente.key} value={cliente.key}>{ `${cliente.nombre} ${cliente.apellido}` }</Option>
                                    )
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="id_contrato"
                            label="Contrato"
                            rules={[
                                {
                                    required: true,
                                    message: 'Seleccione un contrato',
                                }
                            ]}
                            requiredMark="optional"
                        >
                            <Select
                                placeholder="Seleccione un contrato"
                                style={{ width: 245 }}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={codigo => cargarPagos(codigo)}
                            >
                                {
                                    contratos.map(cont =>
                                        <Option key={cont.codigo} value={cont.codigo}>{ `${cont.codigo}` }</Option>
                                    )
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={20}>
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
                        >
                            <DatePicker
                                placeholder="Fecha"
                                picker="date"
                                format="DD-MMMM-YYYY"
                                locale={locale}
                                // disabledDate={current => {
                                //     return current && current < moment().subtract(1, 'y')
                                // }}
                                onChange={date => {
                                    // setFechaInicio(null)
                                    // setFechaFin(null);

                                    // if (!date || !cantCuotas) return;

                                    // date.set('date', 3);
                                    // setFechaInicio(date)
                                    // let fecha = moment(date.get());
                                    // setFechaFin(fecha.add(cantCuotas - 1, 'M'));
                                }}
                                style={{ width: 170 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={9} style={{ textAlign: 'right' }}>
                        <strong>Pagos</strong>
                    </Col>
                    <Col span={11} offset={1}>
                        <Input
                            addonBefore={<BarcodeOutlined />}
                            placeholder="Codigo de cuota"
                            style={{ width: 240 }}
                            autoFocus
                            maxLength={20}
                            allowClear
                            value={barcode}
                            onChange={ev => setBarcode(ev.target.value)}
                            onKeyUp={ev => {
                                if (ev.keyCode === 13) {
                                    agregarPago(ev.target.value);
                                }
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <List
                            itemLayout="horizontal"
                            dataSource={pagos}
                            style={{ height: 250, overflowY: 'auto' }}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: 'transparent' }} icon={<DollarOutlined style={{ color: '#5595ff' }} />} />}
                                        title={<a href="https://ant.design">{`${item.fecha_cuota.toDate().toLocaleString('es-SV', opcFecha)}`}</a>}
                                        description={`${item.codigo_contrato}-${item.numero_cuota}`}
                                    />
                                    <Space>
                                        <strong>{formatoDinero(item.cantidad)}</strong>
                                        <Tooltip title="Cancelar">
                                            <StopOutlined key="cancel" onClick={() => eliminarPago(item)} style={{ color: '#f5222d' }} />
                                        </Tooltip>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col style={{ textAlign: 'right' }} span={12}>
                        <strong>{ pagos.length } cuotas</strong>
                    </Col>
                    <Col style={{ textAlign: 'right' }} span={12}>
                        <strong style={{ fontSize: '1.5em' }}>Total: {formatoDinero(total)}</strong>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalDatos;
