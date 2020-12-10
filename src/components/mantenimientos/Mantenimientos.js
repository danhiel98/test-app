import React, { Component } from 'react';
import Tabla from '../Tabla';
import { Space, Button, Input, Row, Col, Popover } from 'antd';
import DetalleCliente from '../clientes/ModalDetalle';
import DetalleContrato from '../contratos/ModalDetalle';
import ModalDatos from './ModalDatos';
import app from '../../firebaseConfig';

const { Search } = Input;

let opcFecha = { year: 'numeric', month: 'numeric', day: 'numeric' };

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
            const { codigo_contrato, nombre_cliente, fecha, direccion, motivo, descripcion } = doc.data();

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
                fecha: fecha.toDate()
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
                title: 'Cliente',
                key: 'nombre_cliente',
                render: record => (
                    <span>
                        { record.nombre_cliente }
                    </span>
                )
            },
            {
                title: 'Contrato',
                key: 'codigo_contrato',
                render: record => (
                    <Button type="link" onClick={() => this.verDetalleContrato(record.codigo_contrato)}>
                        <strong>{ record.codigo_contrato }</strong>
                    </Button>
                )
            },
            {
                title: 'Fecha',
                key: 'fecha',
                render: record => (
                    <strong>{ record.fecha.toLocaleString('es-SV', opcFecha) }</strong>
                )
            },
            {
                title: 'Dirección',
                dataIndex: 'direccion',
                sorter: true
            },
            {
                title: 'Motivo',
                key: 'motivo',
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
                    <Button type="link" onClick={ () => { this.modalData(record); } }>Editar</Button>
                )
            }
        ]
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
