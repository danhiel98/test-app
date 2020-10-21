import React, { Component } from 'react';
import Tabla from '../Tabla';
import { Space, Button, Input, Row, Col } from 'antd';
import ModalDatos from './ModalDatos';
import app from '../../firebaseConfig';
const { Search } = Input;

class Clientes extends Component
{
    constructor(props) {
        super(props);

        this.ref = app.firestore().collection('clientes');
        // this.unsubscribe = null;
        this.state = {
            busqueda: '',
            loading: true,
            clientes: [],
            visible: false,
            registro: null
        };
    }

    obtenerClientes = (querySnapshot) => {
        const clientes = [];
        const { busqueda } = this.state;
        this.setState({ loading: true })

        querySnapshot.forEach((doc) => {
            const { dui, nombre, apellido, direccion } = doc.data();

            if (busqueda &&
                nombre.toLowerCase().indexOf(busqueda) === -1 &&
                dui.indexOf(busqueda) === -1) {
                return;
            }

            clientes.push({
                key: doc.id,
                nombre: `${nombre} ${apellido}`,
                dui: dui,
                direccion
            });
        });

        this.setState({
            clientes,
            loading: false
        });
    }

    componentDidMount() {
        this.ref.onSnapshot(this.obtenerClientes);
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor })
            this.ref
            .get()
            .then(querySnapshot => this.obtenerClientes(querySnapshot));
        }
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Nombre',
                dataIndex: 'nombre',
                sorter: (a, b) => a.nombre.length - b.nombre.length,
                sortDirections: ['ascend'],
            },
            {
                title: 'DUI',
                dataIndex: 'dui',
                sorter: (a, b) => a.dui.length - b.dui.length,
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
                    <Space size="middle">
                        {/* <a href="#" onClick={ () => { this.modalInfo(record); } }>Detalle</a> */}
                        <Button type="link" onClick={ () => { this.modalData(record); } }>Editar</Button>
                        {/* <a href="#">Dar de baja</a> */}
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
            registro: null
        })
    }

    render(){
        const { visible, registro, clientes, loading } = this.state;

        return (
            <div>
                <ModalDatos
                    visible={visible}
                    title={registro ? 'Editar información' : 'Agregar cliente'}
                    handleCancel={this.handleCancel}
                    record={registro}
                    fireRef={this.ref}
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
            </div>
        );
    }
}

export default Clientes;
