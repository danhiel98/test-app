import React, { Component } from 'react';
import Tabla from '../Tabla';
import { message, Tooltip, Modal, Space, Button, Input, Row, Col, Popover } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import DetalleCliente from '../clientes/ModalDetalle';
import DetalleContrato from '../contratos/ModalDetalle';
import ModalDatos from './ModalDatos';
import app from '../../firebaseConfig';
import moment from 'moment';

const { confirm } = Modal;
const { Search } = Input;

let opcFecha = { year: 'numeric', month: 'numeric', day: 'numeric' };

const cFecha = (fecha) => {
    if (fecha) return fecha.toDate();
    else return new Date();
}

class Mantenimientos extends Component
{
    constructor(props) {
        super(props);

        this.mainRef = app.firestore();
        this.refMantenimiento = this.mainRef.collection('mantenimientos');
        this.refRedes = this.mainRef.collection('redes');

        this.state = {
            busqueda: '',
            loading: true,
            mantenimientos: [],
            visible: false,
            registro: null,
            redes: [],
            codigoContrato: '',
            codigoCliente: '',
            detalleContrato: false,
            detalleCliente: false,
        };
    }

    obtenerMantenimientos = (qs) => {
        const mantenimientos = [];
        const { busqueda } = this.state;
        this.setState({ loading: true })

        qs.forEach((doc) => {
            const { codigo_contrato, nombre_cliente, fecha, direccion, motivo, descripcion, ref_cliente } = doc.data();

            if (busqueda &&
                codigo_contrato.toLowerCase().indexOf(busqueda) === -1 &&
                nombre_cliente.toLowerCase().indexOf(busqueda) === -1 &&
                direccion.toLowerCase().indexOf(busqueda) === -1 &&
                motivo.toLowerCase().indexOf(busqueda) === -1 &&
                descripcion.toLowerCase().indexOf(busqueda) === -1) {
                return;
            }

            mantenimientos.push({
                key: doc.id, // Necesario para que se agregue automáticamente en cada registro
                nombre_cliente,
                codigo_contrato,
                direccion,
                motivo,
                descripcion,
                fecha,
                ref_cliente
            });
        });

        this.setState({
            mantenimientos, // Establecer la lista de mantenimientos
            loading: false
        });
    }

    componentDidMount() {
        this.refMantenimiento.orderBy('fecha_creacion', 'desc').onSnapshot(this.obtenerMantenimientos);
        this.refRedes.orderBy('numero').onSnapshot(this.obtenerRedes);
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor.toLowerCase() })
            this.refMantenimiento
            .get()
            .then(qs => this.obtenerMantenimientos(qs));
        }
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Contrato',
                key: 'codigo_contrato',
                sorter: (a, b) => a.codigo_contrato.substr(1).localeCompare(b.codigo_contrato.substr(1)),
                render: record => (
                    <Button type="link" onClick={() => this.verDetalleContrato(record.codigo_contrato)}>
                        <strong>{ record.codigo_contrato }</strong>
                    </Button>
                )
            },
            {
                title: 'Cliente',
                key: 'nombre_cliente',
                sorter: (a, b) => a.nombre_cliente.localeCompare(b.nombre_cliente),
                render: record => (
                    <Button type="link" onClick={() => this.verDetalleCliente(record.ref_cliente.id)}>
                        <strong>{ record.nombre_cliente }</strong>
                    </Button>
                )
            },
            {
                title: 'Fecha',
                key: 'fecha',
                sorter: (a, b) => moment(cFecha(a.fecha)).unix() - moment(cFecha(b.fecha)).unix(),
                render: record => (
                    <strong>{ cFecha(record.fecha).toLocaleString('es-SV', opcFecha) }</strong>
                )
            },
            {
                title: 'Dirección',
                key: 'direccion',
                sorter: (a, b) => a.direccion.localeCompare(b.direccion),
                render: (record) => (
                    <span>{record.direccion}</span>
                )
            },
            {
                title: 'Motivo',
                key: 'motivo',
                sorter: (a, b) => a.motivo.localeCompare(b.motivo),
                render: record => (
                    <Popover content={<div style={{ width: 400 }}>{record.descripcion}</div>} title="Detalle">
                        {record.motivo}
                    </Popover>
                )
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space align="center">
                        <Tooltip title="Editar">
                            <EditOutlined onClick={() => this.modalData(record)} style={{ color: '#fa8c16' }} />
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <DeleteOutlined onClick={() => this.eliminar(record)} style={{ color: '#f5222d' }} />
                        </Tooltip>
                    </Space>
                )
            }
        ]
    }

    eliminar = mantenimiento => {
        let me = this;
        confirm({
            title: '¿Está seguro que desea eliminar este registro?',
            icon: <ExclamationCircleOutlined />,
            content: 'Eliminar mantenimiento',
            okText: 'Sí',
            cancelText: 'No',
            onOk() {
                me.eliminarMantenimiento(mantenimiento);
            }
        });
    }

    eliminarMantenimiento = mantenimiento => {
        this.refMantenimiento.doc(mantenimiento.key)
        .delete()
        .then(() => message.success('Se eliminó el registro'))
        .catch(err => message.error('Ocurrió un error'));
    }

    modalData = (record) => {
        this.setState({
            visible: true,
            registro: record
        })
    }

    handleCancel = () => {
        this.setState({
            visible: false,
            registro: null,
            detalleContrato: false,
            detalleCliente: false,
        })
    }

    verDetalleContrato = codigo => {
        this.setState({ codigoContrato: codigo });
        this.setState({ detalleContrato: true });
    }

    verDetalleCliente = codigo => {
        this.setState({ codigoCliente: codigo });
        this.setState({ detalleCliente: true });
    }

    obtenerRedes = qs => {
        const redes = [];

        qs.forEach(doc => {
            let { numero } = doc.data();

            redes.push({
                key: doc.id,
                numero: numero
            });
        });

        this.setState({ redes });
    }

    render(){
        const { visible, registro, mantenimientos, loading, redes, detalleContrato, detalleCliente, codigoContrato, codigoCliente } = this.state;

        return (
            <div>
                <ModalDatos
                    visible={visible}
                    title={registro ? 'Editar información' : 'Agregar mantenimiento'}
                    handleCancel={this.handleCancel}
                    record={registro}
                    mainRef={this.mainRef}
                    redes={redes}
                />
                <Tabla
                    titulo={
                        <>
                            <Row justify="space-between">
                                <Col span={4}>
                                    <strong>Lista de mantenimientos</strong>
                                </Col>
                                <Col span={6} offset={4}>
                                    <Space>
                                        <Search
                                            placeholder="Buscar"
                                            onSearch={value => this.buscar(value) }
                                            style={{ width: 200 }}
                                        />
                                        <Button type="primary" ghost onClick={() => this.modalData()}>Nuevo</Button>
                                    </Space>
                                </Col>
                            </Row>
                        </>
                    }
                    columnas={this.columnas}
                    data={mantenimientos}
                    loading={loading}
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
            </div>
        );
    }
}

export default Mantenimientos;
