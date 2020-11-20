import React, { Component } from 'react';
import Tabla from '../Tabla';
import { Tooltip, Space, Button, Input, Row, Col, PageHeader } from 'antd';
import { StopOutlined, BarcodeOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';
const { Search } = Input;

class Pagos extends Component
{
    constructor(props) {
        super(props);

        this.ref = app.firestore().collection('pagos');
        this.unsubscribe = null;
        this.state = {
            busqueda: '',
            loading: true,
            pagos: [],
            visible: false,
            registro: null
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
            let { cantidad, codigo_contrato, nombre_cliente, numero_cuota, fecha_creacion } = doc.data();

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
                fecha_creacion
            });
        });

        this.setState({
            pagos,
            loading: false
        });
    }

    componentDidMount() {
        this.ref.onSnapshot(this.obtenerPagos);
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor })
            this.ref
            .get()
            .then(querySnapshot => this.obtenerPagos(querySnapshot));
        }
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Contrato',
                dataIndex: 'codigo_contrato',
            },
            {
                title: 'Cliente',
                dataIndex: 'nombre_cliente'
            },
            {
                title: 'Cuota',
                dataIndex: 'numero_cuota',
            },
            {
                title: 'Fecha',
                dataIndex: 'fecha_creacion',
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Cancelar">
                            <StopOutlined key="cancel" onClick={() => console.log('cancel')} style={{ color: '#f5222d' }} />
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

    handleCancel = () => {
        this.setState({
            visible: false,
            registro: null
        })
    }

    render(){
        const { visible, registro, pagos, loading } = this.state;

        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title="Registrar"
                    extra={
                        [
                            <Input
                                key="1"
                                addonBefore={<BarcodeOutlined />}
                                placeholder="Codigo de barras"
                                style={{ width: 200 }}
                                onPasteCapture={(ev) => {
                                    console.log(ev.clipboardData.getData('Text'));
                                }}
                                onPaste={(ev) => {
                                    console.log(ev.clipboardData.getData('Text'));
                                }}
                            />,
                            <Button key="2" type="primary" ghost>
                                Agregar
                            </Button>
                        ]
                    }
                />
                {/* <ModalDatos
                    visible={visible}
                    title={registro ? 'Editar información' : 'Nuevo pago'}
                    handleCancel={this.handleCancel}
                    record={registro}
                    fireRef={this.ref}
                />
                */}
                <Tabla
                    titulo={
                        <>
                            <Row justify="space-between">
                                <Col span={4}>
                                    <strong>Lista de pagos</strong>
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
                    data={pagos}
                    loading={loading}
                />
            </div>
        );
    }
}

export default Pagos;
