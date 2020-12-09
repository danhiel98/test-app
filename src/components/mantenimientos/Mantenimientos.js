import React, { Component } from 'react';
import Tabla from '../Tabla';
import { Space, Button, Input, Row, Col, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ModalDatos from './ModalDatos';
import app from '../../firebaseConfig';

const { Search } = Input;

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
            modalDetalle: false,
            redes: []
        };
    }

    obtenerMantenimientos = (querySnapshot) => {
        const mantenimientos = [];
        const { busqueda } = this.state;
        this.setState({ loading: true })

        querySnapshot.forEach((doc) => {
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
                descripcion
            });
        });

        this.setState({
            mantenimientos, // Establecer la lista de mantenimientos
            loading: false
        });
    }

    componentDidMount() {
        this.refMantenimiento.onSnapshot(this.obtenerMantenimientos);
        this.refRedes.orderBy('numero').onSnapshot(this.obtenerRedes);
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor.toLowerCase() })
            this.refMantenimiento
            .get()
            .then(querySnapshot => this.obtenerMantenimientos(querySnapshot));
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
                    <span>
                        { record.codigo_contrato }
                    </span>
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
            modalDetalle: false
        })
    }

    verDetalle = record => {
        this.setState({ registro: record });
        this.setState({ modalDetalle: true });
    }

    obtenerRedes = querySnapshot => {
        const redes = [];

        querySnapshot.forEach(doc => {
            let { numero } = doc.data();

            redes.push({
                key: doc.id,
                numero: numero
            });
        });

        this.setState({ redes });
    }

    render(){
        const { visible, registro, mantenimientos, loading, redes, modalDetalle } = this.state;

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
                    // modalDetalle &&
                    // <ModalDetalle
                    //     visible={modalDetalle}
                    //     codigoCliente={registro.key}
                    //     handleCancel={this.handleCancel}
                    // />
                }
            </div>
        );
    }
}

export default Mantenimientos;
