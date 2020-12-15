import React, { Component } from 'react';
import Tabla from '../Tabla';
import { message, Modal, Tooltip, Space, Button, Input, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ModalDatos from './ModalDatos';
import ModalDetalle from './ModalDetalle';
import app from '../../firebaseConfig';

const { Search } = Input;
const { confirm } = Modal;

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
            visibleDelete: false,
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
                ref: doc.ref,
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
        this.refCliente.orderBy('fecha_creacion', 'desc').onSnapshot(this.obtenerClientes);
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor })
            this.refCliente
            .orderBy('fecha_creacion', 'desc')
            .get()
            .then(querySnapshot => this.obtenerClientes(querySnapshot));
        }
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'DUI',
                key: 'dui',
                sorter: (a, b) => a.dui.length - b.dui.length,
                render: record => (
                    <Button type="link" onClick={() => this.verDetalle(record)}>
                        <strong>{record.dui}</strong>
                    </Button>
                )
            },
            {
                title: 'Nombre',
                dataIndex: 'nombre'
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

    modalData = (record) => {
        this.setState({
            visible: true,
            registro: record
        })
    }

    confirmEliminar = cliente => {
        let me = this;
        confirm({
            title: '¿Está seguro que desea eliminar este registro?',
            icon: <ExclamationCircleOutlined />,
            content: 'Eliminar información de cliente',
            okText: 'Sí',
            cancelText: 'No',
            onOk() {
                me.eliminarCliente(cliente);
            }
        });
    }

    contratosCliente = async cliente => {
        return new Promise((resolve, reject) => {
            this.refContrato
            .where('ref_cliente', '==', cliente.ref)
            .limit(1)
            .get()
            .then(qs => resolve(qs.size))
            .catch(err => reject(err));
        })
    }

    eliminarCliente = cliente => {
        this.refCliente.doc(cliente.key).delete()
        .then(() => message.success('Se eliminó el registro'))
        .catch(err => message.error('Ocurrió un error'));
    }

    eliminar = async record => {
        message
        .loading('Verificando...', );
        this.contratosCliente(record)
        .then(size => {
            message.destroy();
            if (size == 0)
                this.confirmEliminar(record);
            else if (size == 1)
                message.error('No se puede eliminar este cliente porque ya tiene contratos');
        });
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
