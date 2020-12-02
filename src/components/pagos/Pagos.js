import React, { Component } from 'react';
import Tabla from '../Tabla';
import DetalleContrato from '../contratos/ModalDetalle';
import DetalleCliente from '../clientes/ModalDetalle';
import { message, Tooltip, Space, Input, Row, Col, PageHeader, Button } from 'antd';
import { StopOutlined, BarcodeOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';
import firebase from 'firebase';

const { Search } = Input;

class Pagos extends Component
{
    constructor(props) {
        super(props);

        this.refPagos = app.firestore().collection('pagos');
        this.refContratos = app.firestore().collection('contratos');
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
        };

    }

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
            let { cantidad, codigo_contrato, nombre_cliente, numero_cuota, fecha_creacion, ref_cliente } = doc.data();

            if (fecha_creacion)
                fecha_creacion = this.verFecha(fecha_creacion);

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
                        { record.numero_cuota }
                        {
                            record.fecha_pago ? ` - ${record.fecha_pago} ` :  ''
                        }
                    </Space>
                )
            },
            {
                title: 'Fecha',
                key: 'fecha_creacion',
                render: record => (
                    <span>
                        {`${record.fecha_creacion}`}
                    </span>
                )
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Cancelar">
                            <StopOutlined key="cancel" onClick={() => this.cancelarPago(record)} style={{ color: '#f5222d' }} />
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
            .then(contrato => {
                if (contrato.exists) {
                    contrato.ref.collection('cuotas').doc(codigo.substr(-2))
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

    cancelarPago = async record => {
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
