import React, { Component } from 'react';
import { Tooltip, Badge, Pagination, Card, Space, Row, Col, PageHeader, Input, Button, Empty } from 'antd';
import { EditOutlined, StopOutlined, CloudDownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Tabla from '../Tabla';
import ModalDatos from './ModalDatos';

const { Search } = Input;

class Contratos extends Component {
    constructor(props) {
        super(props);

        this.refContratos = app.firestore().collection('contratos');
        this.refClientes = app.firestore().collection('clientes');
        this.refRedes = app.firestore().collection('redes');
        this.opcFecha = { year: 'numeric', month: 'short' };
        this.networks = [];

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

        querySnapshot.forEach(async (doc) => {
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

        this.networks = redes;
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
                filters: [],
                onFilter: (value, record) => record.codigo.indexOf(value) === 0,
                sorter: (a, b) => a.codigo.length - b.codigo.length,
                sortDirections: ['ascend'],
                render: codigo => (
                    <strong>
                        { codigo }
                    </strong>
                )
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
                filters: [],
                onFilter: (value, record) => record.velocidad === value,
                render: velocidad => (
                    <>
                        <Badge count={`${velocidad} Mb`} style={{ backgroundColor: '#52c41a' }} />
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
                    </Space>
                )
            }
        ]
    }

    render() {
        const {
            loading,
            contratosActuales,
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
                    title="Contratos"
                    subTitle="Lista de contratos"
                    extra={
                        [
                            <Search
                                key="1"
                                placeholder="Buscar"
                                onSearch={value => this.buscar(value)}
                                style={{ width: 200 }}
                            />,
                            <Button key="2" type="primary" ghost onClick={() => this.modalData()}>
                                Nuevo
                            </Button>
                        ]
                    }
                />
                {
                    redes.map(red => {
                        this.columnas[0].filters.push(
                            {
                                text: `Red ${red.numero}`,
                                value: `R${red.numero}`,
                            },
                        );
                    })
                }
                {
                    !this.columnas[2].filters.length &&
                    contratosActuales.map(contrato => contrato.velocidad)
                    .filter((value, index, self) => self.indexOf(value) == index)
                    .map(velocidad => {
                        this.columnas[2].filters.push({
                            text: `${velocidad} Mb`,
                            value: velocidad
                        });
                    })
                }
                <Tabla
                    columnas={this.columnas}
                    data={contratosActuales}
                    loading={loading}
                />
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
