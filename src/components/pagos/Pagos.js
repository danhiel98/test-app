import React, { Component } from 'react';
import Tabla from '../Tabla';
import DetalleContrato from '../contratos/ModalDetalle';
import DetalleCliente from '../clientes/ModalDetalle';
import { Popover, DatePicker, message, Tooltip, Space, Input, Row, Col, PageHeader, Button } from 'antd';
import { StopOutlined, BarcodeOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import locale from "antd/es/date-picker/locale/es_ES";
import app from '../../firebaseConfig';
import firebase from 'firebase';

const { Search } = Input;
let ref = app.firestore();

const zeroPad = (num, places) => String(num).padStart(places, '0');

let opcFecha = { year: 'numeric', month: 'numeric', day: 'numeric' };

const SelectFecha = (props)  => {
    let { record } = props;
    let fecha = null;

    let selecFechaPago = codigo => {
        ref.collection('pagos').doc(codigo)
        .update({
            fecha_pago: fecha
        })
        .then(() => {
            message.success('¡Fecha establecida correctamente!');
        })
    }

    return (
        <Space>
            <DatePicker
                locale={locale}
                format="DD-MMMM-YYYY"
                size="small"
                onChange={ date => { fecha = date ? new Date(date.get()) : null }}
            />
            <CheckCircleOutlined onClick={() => selecFechaPago(record.key)} style={{ color: '#389e0d' }} />
        </Space>
    );
}

class Pagos extends Component
{
    constructor(props) {
        super(props);

        this.refPagos = ref.collection('pagos');
        this.refContratos = ref.collection('contratos');
        this.unsubscribe = null;
        this.state = {
            busqueda: '',
            loading: true,
            pagos: [],
            barcode: '',
            codigoContrato: '',
            codigoCliente: '',
            detalleContrato: false,
            detalleCliente: false,
            selectFechaVisible: false,
        };

    }

    hide = () => {
        this.setState({
            selectFechaVisible: false,
        });
    };

    handleVisibleChange = selectFechaVisible => {
        this.setState({ selectFechaVisible });
    };

    capitalize = s => {
        if (typeof s !== 'string') return s
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    verFecha = fecha => {
        return this.capitalize(new Date(fecha.seconds * 1000).toLocaleDateString("es-SV", {year: 'numeric', month: 'short'}))
    }

    obtenerPagos = (querySnapshot) => {
        const pagos = [];
        const { busqueda } = this.state;
        this.setState({ loading: true })

        querySnapshot.forEach((doc) => {
            let { cantidad, facturado, codigo_contrato, nombre_cliente, numero_cuota, fecha_creacion, ref_cliente, fecha_cuota, fecha_pago } = doc.data();

            if (fecha_creacion)
                fecha_creacion = this.verFecha(fecha_creacion);

            fecha_cuota = this.verFecha(fecha_cuota);

            if (busqueda &&
                codigo_contrato.toLowerCase().indexOf(busqueda) === -1 &&
                nombre_cliente.toLowerCase().indexOf(busqueda) === -1
            )
            {
                return;
            }

            pagos.push({
                key: doc.id,
                cantidad,
                codigo_contrato,
                nombre_cliente,
                numero_cuota,
                fecha_creacion,
                fecha_cuota,
                fecha_pago,
                facturado,
                ref_cliente
            });
        });

        this.setState({
            pagos,
            loading: false
        });
    }

    componentDidMount() {
        this.refPagos.orderBy('fecha_creacion', 'desc').onSnapshot(this.obtenerPagos);
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor })
            this.refPagos
            .get()
            .then(querySnapshot => this.obtenerPagos(querySnapshot));
        }
    }

    columnas = this.asignarColumnas();

    verDetalleContrato = codigo => {
        this.setState({ codigoContrato: codigo });
        this.setState({ detalleContrato: true });
    }

    verDetalleCliente = codigo => {
        this.setState({ codigoCliente: codigo });
        this.setState({ detalleCliente: true });
    }

    handleCancel = () => {
        this.setState({
            codigoContrato: '',
            detalleContrato: false,
            detalleCliente: false,
        })
    }

    asignarColumnas() {
        return [
            {
                title: 'Contrato',
                key: 'codigo_contrato',
                sorter: {
                    compare: (a, b) => a.codigo - b.codigo,
                    multiple: 2,
                },
                filters: [],
                onFilter: (value, record) => record.codigo.indexOf(value) === 0,
                render: record => (
                    <Button type="link" onClick={() => this.verDetalleContrato(record.codigo_contrato)}>
                        <strong>{ record.codigo_contrato }</strong>
                    </Button>
                )
            },
            {
                title: 'Cliente',
                key: 'nombre_cliente',
                render: record => (
                    <Button type="link" onClick={() => this.verDetalleCliente(record.ref_cliente.id)}>
                        <strong>{ record.nombre_cliente }</strong>
                    </Button>
                )
            },
            {
                title: 'Cuota',
                key: 'numero_cuota',
                render: record => (
                    <Space>
                        { `${record.numero_cuota} - ${record.fecha_cuota}` }
                    </Space>
                )
            },
            {
                title: 'Fecha de pago',
                key: 'fecha_pago',
                render: record => (
                    <span>
                        <Row justify="center">
                            <Col>
                                {
                                    record.fecha_pago
                                    ?
                                    ` ${record.fecha_pago.toDate().toLocaleDateString('es-SV', opcFecha)} `
                                    :
                                    ''
                                }
                                <Popover
                                    content={
                                        <SelectFecha record={record} />
                                    }
                                    title="Seleccione"
                                    trigger="click"
                                >
                                    <CalendarOutlined style={{ color: '#1c86c6' }} />
                                </Popover>
                            </Col>
                        </Row>
                    </span>
                )
            },
            {
                title: 'Facturado',
                key: 'facturado',
                render: record => (
                    <Space>
                        {
                            record.facturado
                            ? <strong style={{ color: '#52c41a' }}>Sí</strong>
                            : <strong style={{ color: '#165473' }}>No</strong>
                        }
                    </Space>
                )
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Cancelar">
                            <StopOutlined key="cancel" onClick={() => this.eliminarPago(record)} style={{ color: '#f5222d' }} />
                        </Tooltip>
                    </Space>
                )
            }
        ]
    }

    agregarPago = async codigo => {
        if (/(R[\d]{1,3})(-|')(\d{1,3})(-|')(\d{4})(-|')(\d{4})(-|')\d{2}/.test(codigo))
        {
            let exist = false;
            let anteriorCancelado = false;
            let codContrato = codigo.substring(0, codigo.length -3);

            await this.refPagos.doc(codigo)
            .get()
            .then(pago => {
                if (pago.exists) {
                    message.error('¡Esta cuota ya fue cancelada!');
                    exist = true;
                }
            })

            if (exist) return;

            this.refContratos.doc(codContrato)
            .get()
            .then(async contrato => {
                if (contrato.exists) {
                    let numCuota = Number.parseInt(codigo.substr(-2));

                    if (numCuota > 1) {
                        await contrato.ref.collection('cuotas').doc(`0${numCuota - 1}`)
                        .get()
                        .then(doc => {
                            let cuota = doc.data();
                            if (cuota.cancelado) anteriorCancelado = true;
                        })

                        // Si la cuota anterior a esta no ha sido cancelada, entonces no se puede agregar el pago
                        if (!anteriorCancelado) {
                            message.error('La cuota anterior no ha sido cancelada aún');
                            return;
                        }
                    }

                    contrato.ref.collection('cuotas').doc(`0${numCuota}`)
                    .get()
                    .then(cuota => {
                        if (cuota.exists) {
                            let d_cuota = cuota.data();
                            let d_contrato = contrato.data();

                            this.refPagos.doc(d_cuota.codigo).set({
                                cantidad: d_cuota.cantidad,
                                codigo_contrato: contrato.id,
                                ref_cliente: d_contrato.ref_cliente,
                                nombre_cliente: d_contrato.cliente,
                                numero_cuota: cuota.id,
                                fecha_cuota: d_cuota.fecha_pago,
                                fecha_pago: null,
                                facturado: false,
                                fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                            }).then(doc => {
                                cuota.ref.update({ cancelado: true })
                                .then(() => {
                                    this.setState({ barcode: '' })
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

    eliminarPago = async record => {
        let siguienteCancelada = false;

        await this.refContratos.doc(record.codigo_contrato)
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

        await this.refPagos.doc(`${record.key}`)
        .delete()
        .then(() => {
            this.refContratos.doc(record.codigo_contrato)
            .get()
            .then(contrato => {
                if (contrato.exists) {
                    contrato.ref.collection('cuotas').doc(record.numero_cuota)
                    .get()
                    .then(cuota => {
                        if (cuota.exists) {
                            cuota.ref.update({ cancelado: false })
                            .then(() => {
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

    render(){
        const { pagos, loading, detalleContrato, detalleCliente, codigoContrato, codigoCliente } = this.state;

        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title="Pagos"
                    subTitle="Agregar pago"
                    onBack={() => null}
                    extra={[
                        <Input
                            key="1"
                            addonBefore={<BarcodeOutlined />}
                            placeholder="Codigo de cuota"
                            style={{ width: 240 }}
                            autoFocus
                            maxLength={20}
                            allowClear
                            value={this.state.barcode}
                            onChange={ev => this.setState({ barcode: ev.target.value })}
                            onKeyUp={ev => {
                                if (ev.keyCode === 13) {
                                    this.agregarPago(ev.target.value);
                                }
                            }}
                        />
                    ]}
                />
                {
                    detalleContrato &&
                    <DetalleContrato
                        visible={detalleContrato}
                        codigoContrato={codigoContrato}
                        handleCancel={this.handleCancel}
                    />
                }
                {
                    detalleCliente &&
                    <DetalleCliente
                        visible={detalleCliente}
                        codigoCliente={codigoCliente}
                        handleCancel={this.handleCancel}
                    />
                }
                <Tabla
                    titulo={
                        <>
                            <Row justify="space-between">
                                <Col span={4}>
                                    <strong>Lista de pagos</strong>
                                </Col>
                                <Col span={4} offset={5}>
                                    <Space>
                                        <Search
                                            placeholder="Buscar"
                                            onSearch={value => this.buscar(value) }
                                            style={{ width: 180 }}
                                        />
                                    </Space>
                                </Col>
                            </Row>
                        </>
                    }
                    columnas={this.columnas}
                    data={pagos}
                    loading={loading}
                />
            </div>
        );
    }
}

export default Pagos;
