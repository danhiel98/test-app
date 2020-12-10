import React, { Component } from 'react';
import Tabla from '../Tabla';
import { Space, Button, Input, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ModalDatos from './ModalDatos';
import ModalDetalle from './ModalDetalle';
import app from '../../firebaseConfig';
const { Search } = Input;

class Clientes extends Component
{
    constructor(props) {
        super(props);

        this.mainRef = app.firestore();
        this.refCliente = this.mainRef.collection('clientes');
        this.refContrato = this.mainRef.collection('contratos');
        this.refPago = this.mainRef.collection('pagos');
        this.refMantenimiento = this.mainRef.collection('mantenimientos');

        this.state = {
            busqueda: '',
            loading: true,
            clientes: [],
            visible: false,
            registro: null,
            modalDetalle: false
        };
    }

    obtenerClientes = (querySnapshot) => {
        const clientes = [];
        const { busqueda } = this.state;
        this.setState({ loading: true })

        querySnapshot.forEach((doc) => {
            const { dui, nombre, apellido, direccion, telefono } = doc.data();

            if (busqueda &&
                nombre.toLowerCase().indexOf(busqueda) === -1 &&
                apellido.toLowerCase().indexOf(busqueda) === -1 &&
                direccion.toLowerCase().indexOf(busqueda) === -1 &&
                telefono.toLowerCase().indexOf(busqueda) === -1 &&
                dui.indexOf(busqueda) === -1) {
                return;
            }

            clientes.push({
                key: doc.id,
                nombre: `${nombre} ${apellido}`,
                dui: dui,
                direccion,
                telefono
            });
        });

        this.setState({
            clientes,
            loading: false
        });
    }

    componentDidMount() {
        this.refCliente.onSnapshot(this.obtenerClientes);
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor })
            this.refCliente
            .get()
            .then(querySnapshot => this.obtenerClientes(querySnapshot));
        }
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Nombre',
                dataIndex: 'nombre'
            },
            {
                title: 'DUI',
                dataIndex: 'dui',
                sorter: (a, b) => a.dui.length - b.dui.length,
            },
            {
                title: 'Teléfono',
                dataIndex: 'telefono',
                sorter: true
            },
            {
                title: 'Dirección',
                dataIndex: 'direccion',
                sorter: true
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="small">
                        <InfoCircleOutlined onClick={() => this.verDetalle(record)} style={{ color: '#389e0d' }} />
                        <Button type="link" onClick={ () => { this.modalData(record); } }>Editar</Button>
                    </Space>
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
            modalDetalle: false
        })
    }

    verDetalle = record => {
        this.setState({ registro: record });
        this.setState({ modalDetalle: true });
    }

    render(){
        const { visible, registro, clientes, loading, modalDetalle } = this.state;

        return (
            <div>
                <ModalDatos
                    visible={visible}
                    title={registro ? 'Editar información' : 'Agregar cliente'}
                    handleCancel={this.handleCancel}
                    record={registro}
                    refCliente={this.refCliente}
                    refContrato={this.refContrato}
                    refPago={this.refPago}
                    refMantenimiento={this.refMantenimiento}
                />
                <Tabla
                    titulo={
                        <>
                            <Row justify="space-between">
                                <Col span={4}>
                                    <strong>Lista de clientes</strong>
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
                    data={clientes}
                    loading={loading}
                />
                {
                    modalDetalle &&
                    <ModalDetalle
                        visible={modalDetalle}
                        codigoCliente={registro.key}
                        handleCancel={this.handleCancel}
                    />
                }
            </div>
        );
    }
}

export default Clientes;
