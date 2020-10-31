import React, { Component } from 'react';
import { Tooltip, Badge, Pagination, Card, Space, Row, Col, PageHeader, Input, Button, Empty } from 'antd';
import { EditOutlined, StopOutlined, CloudDownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Tabla from '../Tabla';
import ModalDatos from './ModalDatos';

const { Search } = Input;

class Contratos extends Component
{
    constructor(props){
        super(props);

        this.refContratos = app.firestore().collection('contratos');
        this.refClientes = app.firestore().collection('clientes');
        this.refRedes = app.firestore().collection('redes');
        this.opcFecha = { year: 'numeric', month: 'short' };

        this.unsubscribe = null;
        this.state = {
            loading: true,
            contratos: [],
            clientes: [],
            redes: [],
            contratosActuales: [],
            totalItems: 0,
            currentPage: 1,
            limit: 8,
            visible: false,
            registro: null
        };
    }

    obtenerContratos = (querySnapshot) => {
        const contratos = [];
        const { busqueda } = this.state;

        let totalItems = querySnapshot.docs.length;

        querySnapshot.forEach( async (doc) => {
            let { cliente, activo, codigo, fecha_inicio, fecha_fin, velocidad, precio_cuota } = doc.data();

            fecha_inicio = this.capitalize(new Date(fecha_inicio.seconds * 1000).toLocaleDateString("es-SV", this.opcFecha));
            fecha_fin = this.capitalize(new Date(fecha_fin.seconds * 1000).toLocaleDateString("es-SV", this.opcFecha));

            if
            (
                busqueda &&
                cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo.toLowerCase().indexOf(busqueda) === -1 &&
                fecha_inicio.toLowerCase().indexOf(busqueda) === -1 &&
                fecha_fin.toLowerCase().indexOf(busqueda) === -1
            )
                return;

            contratos.push({
                key: doc.id,
                cliente,
                codigo,
                activo,
                fecha_inicio,
                fecha_fin,
                velocidad,
                precio_cuota
            });
        });

        this.setState({
            contratos,
            loading: false,
            totalItems
        });

        this.contratosPaginados();
    }

    contratosPaginados(page = 1) {
        let { contratos, limit } = this.state;

        let data = contratos.slice((limit * page) - limit, limit * page);

        this.setState({
            currentPage: page,
            contratosActuales: data
        });
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

        this.setState({
            redes
        });
    }

    obtenerClientes = querySnapshot => {
        const clientes = [];

        querySnapshot.forEach(doc => {
            let { dui, nombre, apellido } = doc.data();

            clientes.push({
                key: doc.id,
                dui,
                nombre,
                apellido
            });
        });

        this.setState({
            clientes
        });
    }

    componentDidMount() {
        this.unsubscribe = this.refContratos.orderBy('fecha_ingreso', 'desc').onSnapshot(this.obtenerContratos);
        this.refClientes.orderBy('fecha_creacion', 'desc').onSnapshot(this.obtenerClientes);
        this.refRedes.orderBy('numero').onSnapshot(this.obtenerRedes);
    }

    componentDidUpdate(prevState, newState) {

    }

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ loading: true })
            this.setState({ busqueda: valor.toLowerCase() })
            this.refContratos
            .get()
            .then(querySnapshot => this.obtenerContratos(querySnapshot));
        }
    }

    changePage(page) {
        if (page === this.state.currentPage) return

        this.contratosPaginados(page);
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

    capitalize = s => {
        if (typeof s !== 'string') return s
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    irA = ruta => {
        this.unsubscribe();
        this.props.dispatch(push(`contratos/${ruta}`));
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Código',
                dataIndex: 'codigo',
                sorter: (a, b) => a.length - b.length,
                sortDirections: ['ascend'],
            },
            {
                title: 'Cliente',
                dataIndex: 'cliente',
                sorter: (a, b) => a.length - b.length,
            },
            {
                title: 'Velocidad',
                dataIndex: 'velocidad',
                sorter: true,
                render: velocidad => (
                    <>
                        <Badge count={`${velocidad} MB`} style={{ backgroundColor: '#52c41a' }} />
                    </>
                )
            },
            {
                title: 'Precio',
                dataIndex: 'precio_cuota',
                sorter: true,
                render: precio_cuota => (
                    <>
                        <strong>
                            <span style={{ color: '#089D6C', fontSize: '1.2em' }}>${precio_cuota}</span>
                        </strong>
                    </>
                )
            },
            {
                title: 'Fecha inicio',
                dataIndex: 'fecha_inicio'
            },
            {
                title: 'Fecha fin',
                dataIndex: 'fecha_fin'
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Descargar">
                            <CloudDownloadOutlined key="download" onClick={() => console.log('download')} style={{ color: '#389e0d' }} />
                        </Tooltip>
                        <Tooltip title="Editar">
                            <EditOutlined key="edit" onClick={() => this.modalData(record)} style={{ color: '#fa8c16' }} />
                        </Tooltip>
                        <Tooltip title="Cancelar">
                            <StopOutlined key="cancel" onClick={() => console.log('cancel')} style={{ color: '#f5222d' }} />
                        </Tooltip>
                        {/* <a href="#" onClick={ () => { this.modalInfo(record); } }>Detalle</a> */}
                        {/* <Button type="link" onClick={ () => { this.modalData(record); } }>Editar</Button> */}
                        {/* <a href="#">Dar de baja</a> */}
                    </Space>
                )
            }
        ]
    }

    render(){
        const {
            loading,
            currentPage,
            totalItems,
            limit,
            contratosActuales,
            busqueda,
            visible,
            registro,
            clientes,
            redes
        } = this.state;

        return (
            <div>
                {
                    visible &&
                    <ModalDatos
                        visible={visible}
                        title={registro ? 'Editar información' : 'Nuevo contrato'}
                        clientes={clientes}
                        redes={redes}
                        handleCancel={this.handleCancel}
                        contrato={registro}
                    />
                }
                <PageHeader
                    className="site-page-header"
                    // onBack={() => null}
                    title="Contratos"
                    subTitle="Lista de contratos"
                    extra={
                        [
                            <Search
                                key="1"
                                placeholder="Buscar"
                                onSearch={value => this.buscar(value) }
                                style={{ width: 200 }}
                            />,
                            <Button key="2" type="primary" ghost onClick={() => this.modalData()}>
                                Nuevo
                            </Button>
                        ]
                    }
                />
                <Tabla
                    // titulo={
                    //     <>
                    //         <Row justify="space-between">
                    //             <Col span={4}>
                    //                 <strong>Lista de clientes</strong>
                    //             </Col>
                    //             <Col span={6} offset={4}>
                    //                 <Space>
                    //                     <Search
                    //                         placeholder="Buscar"
                    //                         onSearch={value => this.buscar(value) }
                    //                         style={{ width: 200 }}
                    //                     />
                    //                     <Button type="primary" ghost onClick={() => this.modalData()}>Nuevo</Button>
                    //                 </Space>
                    //             </Col>
                    //         </Row>
                    //     </>
                    // }
                    columnas={this.columnas}
                    data={contratosActuales}
                    loading={loading}
                />
                {/* <Row style={{ marginTop: 20 }} justify="end">
                    <Col>
                        {
                            !loading && totalItems > 0 &&
                            <Pagination
                                defaultCurrent={currentPage}
                                defaultPageSize={limit}
                                total={totalItems}
                                onChange={value => this.changePage(value)}
                            />
                        }
                    </Col>
                </Row>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24 }} style={{ padding: '5px 15px' }}>
                    {
                        loading &&
                        [1,2,3,4,5,6,7,8].map(n =>
                            <Col span={6} key={n}>
                                <Card style={{ marginTop: 16 }} loading={loading} />
                            </Col>
                        )
                    }

                    { !loading && contratosActuales.map(contrato =>
                    <Col xs={24} sm={12} md={8} lg={6} key={contrato.key}>
                        <Card
                            className="contract-card"
                            style={{
                                marginTop: 16,
                                boxShadow: '',
                                borderRadius: '10px 10px 0px 0px',
                            }}
                            actions={[
                                <Tooltip title="Descargar">
                                    <CloudDownloadOutlined key="download" />
                                </Tooltip>,
                                <Tooltip title="Editar">
                                    <EditOutlined onClick={() => this.modalData(contrato)} key="edit" />
                                </Tooltip>,
                                <Tooltip title="Cancelar">
                                    <StopOutlined key="cancel" />
                                </Tooltip>
                            ]}
                            title={
                                <Space size="middle">
                                    <FileTextOutlined style={{ fontSize: '25px'}} />
                                    <strong>{ contrato.codigo }</strong>
                                </Space>
                            }
                        >
                            <div>
                                <strong>Cliente:</strong> <a href="/">{contrato.cliente}</a> <br />
                                <strong>Inicio:</strong> {contrato.fecha_inicio}<br />
                                <strong>Fin:</strong> {contrato.fecha_fin}<br />
                                <strong>Velocidad:</strong> <Badge count={`${contrato.velocidad} MB`} style={{ backgroundColor: '#52c41a' }} /> <br />
                                <strong>Precio cuota: <span style={{ color: '#089D6C', fontSize: '1.2em' }}>${contrato.precio_cuota}</span></strong> <br />
                                <strong><a href="/">Ver cuotas</a></strong>
                            </div>
                        </Card>
                    </Col>
                    )}
                </Row>
                {
                    (!loading && contratosActuales.length === 0) &&
                        <Empty
                            imageStyle={{
                                height: 100,
                            }}
                            description={
                            <span>
                                No hay datos
                            </span>
                            }
                        >
                            {
                                busqueda
                                ?
                                <Button type="primary" ghost onClick={() => this.buscar('')}>Restablecer búsqueda</Button>
                                :
                                <Button type="primary" ghost onClick={() => this.modalData()}>Registrar un nuevo contrato</Button>
                            }
                        </Empty>
                } */}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Contratos);
