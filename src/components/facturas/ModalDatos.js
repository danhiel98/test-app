import React, { useState, useEffect } from "react";
import { Checkbox, Space, List, Avatar, Table, message, Row, Col, DatePicker, Select, Form, Input, Modal, Button, Tooltip, Divider } from "antd";
import { StopOutlined, BarcodeOutlined, DollarOutlined } from '@ant-design/icons';
import moment from 'moment';
import "moment/locale/es";
import locale from "antd/es/date-picker/locale/es_ES";
import app from '../../firebaseConfig';
import firebase from 'firebase';

const NumerosALetras = require('../../NumerosALetras');

const { Option } = Select;

const opcFecha = { year: 'numeric', month: 'long'};
const opcFecha2 = { year: 'numeric', month: 'long', day: 'numeric'};

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const verFecha = (fecha, todo = false) => {
    let opc = todo ? opcFecha2 : opcFecha;
    return fecha.toDate().toLocaleString('es-SV', opc);
}

const fechaMayor = (fecha, fechaComparacion) => {
    let f1 = fecha.toDate();
    let f2 = fechaComparacion.toDate();

    if (f1.getYear() > f2.getYear()) return true; // Verdadero si el año es mayor
    else if (f1.getYear() < f2.getYear()) return false; // Falso si el año es menor

    // En caso que el año sea el mismo:
    if (f1.getMonth() > f2.getMonth()) return true; // Verdadero si el mes es mayor
    else if (f1.getMonth() < f2.getMonth()) return false; // Falso su el mes es menor

    // En caso que también el mes sea el mismo:
    if (f1.getDate() > f2.getDate()) return true; // Verdadero si el día es mayor

    return false; // Falso si es el mismo día o si es menor
}

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { record, clientes } = props;

    const [loading, setLoading] = useState(false);
    const [contrato, setContrato] = useState(null);
    const [contratos, setContratos] = useState([]);
    const [total, setTotal] = useState(0);
    const [mora, setMora] = useState(0);
    const [sumas, setSumas] = useState(0);
    const [pagos, setPagos] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [loadingPagos, setLoadingPagos] = useState(false);
    const [stValidacionContrato, setStValidacionContrato] = useState(null);
    const [msgValidacionContrato, setMsgValidacionContrato] = useState(null);
    const [exonerarMora, setExonerarMora] = useState(false);

    let refFacturas = app.firestore().collection('facturas');
    let refContratos = app.firestore().collection('contratos');
    let refPagos = app.firestore().collection('pagos');

    useEffect(() => {
        if (exonerarMora)
            setTotal(sumas)
        else
            setTotal(sumas + mora);
    }, [exonerarMora]);

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
        let total_pagar = exonerarMora ? total : total + mora;

        if (pagos.length > 1) periodo += ` a ${verFecha(pagos[pagos.length - 1].fecha_cuota)}`

        let factura = {
            fecha: new Date(data.fecha),
            cantidad_pagos: pagos.length,
            periodo,
            detalle: `Servicio de conexión a internet de banda ancha, correspondiente al periodo de ${periodo}`,
            precio_pago: total / pagos.length,
            mora: mora,
            sumas: total,
            mora_exonerada: exonerarMora,
            total: total_pagar,
            total_letras: NumerosALetras.default(total_pagar),
            eliminado: false,
            codigo_contrato: contrato.codigo,
            nombre_cliente: contrato.cliente,
            ref_cliente: contrato.ref_cliente,
            fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
        }

        console.log(factura);
        // Agregar factura y actualizar estado de los pagos a 'facturado'
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
                                codigo_contrato: cont.codigo,
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
        setStValidacionContrato('validating');
        setMsgValidacionContrato(null);
        form.setFieldsValue({
            'id_contrato': null
        });
        setPagos([]);
        setContratos([]);

        if (!codCliente) return;

        let auxContratos = [];
        let cliente = clientes.find(cli => cli.key === codCliente);

        if (!cliente) return;

        await refContratos
        .where('ref_cliente', '==', cliente.ref)
        .where('estado', '==', 'activo')
        .get()
        .then(qs => {
            qs.forEach(doc => {
                auxContratos.push({key: doc.id, ...doc.data()});
            })
            setContratos(auxContratos);
        })

        if (auxContratos.length === 0) {
            setStValidacionContrato('warning');
            setMsgValidacionContrato('No se encontraton contratos');
        } else if (auxContratos.length === 1) {
            form.setFieldsValue({
                'id_contrato': auxContratos[0].codigo
            });
            cargarPagos(auxContratos[0].codigo);
            setStValidacionContrato(null);
        } else {
            setStValidacionContrato(null);
        }

        return true;
    }

    const cargarPagos = async codigoContrato => {
        let auxPagos = [];
        let auxSumas = 0;
        let auxMora = 0;
        // let auxTotal = 0;
        setSumas(0);
        setMora(0);
        setTotal(0);
        setPagos([]);
        setContrato(null);

        if (!codigoContrato) return;

        setLoadingPagos(true);

        await refContratos.doc(codigoContrato)
        .get()
        .then(doc => {
            setContrato(doc.data());
        })

        await refPagos
        .where('codigo_contrato', '==', codigoContrato)
        .where('facturado', '==', false)
        .get()
        .then(qs => {
            qs.forEach(doc => {
                let pago = doc.data();
                pago.key = doc.id;
                auxPagos.push(pago);
                auxSumas += pago.cantidad;
                if (pago.fecha_pago && fechaMayor(pago.fecha_pago, pago.fecha_cuota)) {
                    auxMora += 3;
                }
            })
            setPagos(auxPagos);
            setMora(auxMora);
            setSumas(auxSumas);
            setTotal(auxSumas + auxMora);
            if (exonerarMora) setTotal(auxSumas);
        });

        setLoadingPagos(false);
    }

    const columnas = [
        {
          title: 'No. Cuota',
          dataIndex: 'numero_cuota',
        },
        {
          title: 'Mes',
          dataIndex: 'fecha_cuota',
          render: fecha_cuota => (
              <span>{verFecha(fecha_cuota)}</span>
          )
        },
        {
          title: 'Fecha de pago',
          dataIndex: 'fecha_pago',
          render: fecha_pago => (
              fecha_pago
              ?
              <span>{verFecha(fecha_pago, true)}</span>
              :
              ''
          )
        },
        {
            title: 'Precio de cuota',
            dataIndex: 'cantidad',
            render: cantidad => (
                <strong>{formatoDinero(cantidad)}</strong>
            )
        },
        {
            title: 'Mora',
            key: 'mora',
            render: record => {
                let valor = 0;

                if (record.fecha_pago && fechaMayor(record.fecha_pago, record.fecha_cuota)) valor = 3;

                return <strong>{formatoDinero(valor)}</strong>;
            }
        },
        {
            title: 'Cant. gravada',
            key: 'cantidad_gravada',
            render: record => {
                let cant = record.cantidad;

                if (record.fecha_pago && fechaMayor(record.fecha_pago, record.fecha_cuota)) cant += 3;

                return <strong>{formatoDinero(cant)}</strong>
            }
        }
    ];

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
                            rules={[ { required: true, message: 'Seleccione un contrato' } ]}
                            requiredMark="optional"
                            hasFeedback
                            validateStatus={stValidacionContrato}
                            help={msgValidacionContrato}
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
                <Divider />
                <Row>
                    <Col span={24}>
                        <Table
                            loading={loadingPagos}
                            columns={columnas}
                            dataSource={pagos}
                            footer={() => (
                                <Row>
                                    <Col style={{ textAlign: 'right' }} span={11}>
                                        <strong>{ pagos.length } cuotas</strong>
                                    </Col>
                                    <Col style={{ textAlign: 'right' }} span={13}>
                                        <Space>
                                            <strong style={{ fontSize: '1.1em' }}>Mora: {formatoDinero(mora)}</strong>
                                            <strong style={{ fontSize: '1.1em' }}>Sumas: {formatoDinero(sumas)}</strong>
                                        </Space>
                                    </Col>
                                </Row>
                            )}
                            size="small"
                        />
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={9}>
                        {
                            mora > 0 &&
                            <Checkbox
                                checked={exonerarMora}
                                onChange={e => setExonerarMora(e.target.checked)}
                            >
                                Exonerar mora
                            </Checkbox>
                        }
                    </Col>
                    <Col span={15}>
                        <strong style={{ fontSize: '1.2em' }}>Total a Pagar: {formatoDinero(total)}</strong>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalDatos;
